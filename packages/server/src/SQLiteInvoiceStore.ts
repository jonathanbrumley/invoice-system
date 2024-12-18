import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import {
  Invoice,
  InvoiceStatus,
  InvoiceStore,
  InvoiceSummary,
  InvoiceStoreFilterOptions,
  makeRandomInvoiceId,
  makeDraftInvoice
} from '@my/shared';

export class SQLiteInvoiceStore implements InvoiceStore {
  private db: Database<sqlite3.Database, sqlite3.Statement> | null;

  constructor(db: Database<sqlite3.Database, sqlite3.Statement>) {
    this.db = db;
  }

  close() {
    this.db?.close();
    this.db = null;
  }

  private getDb(): Database<sqlite3.Database, sqlite3.Statement> {
    if (!this.db) {
      throw new Error('Database connection is closed')
    }
    return this.db as Database<sqlite3.Database, sqlite3.Statement>;
  }

  static async initialize(dbFilePath: string): Promise<SQLiteInvoiceStore> {
    const db = await open({
      filename: dbFilePath,
      driver: sqlite3.Database,
    });

    // Ensure the invoice table and index are created
    await db.exec(`
      CREATE TABLE IF NOT EXISTS invoice (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        payment_due TEXT,
        client_name TEXT,
        total DECIMAL,
        status TEXT NOT NULL,
        invoice_json TEXT NOT NULL
      );
    `);

    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_created_at
      ON invoice (created_at);
    `);

    return new SQLiteInvoiceStore(db);
  }

  async reserveNewId(): Promise<string | undefined> {
    let newId: string | undefined = undefined;
    for (let i = 0; i < 100; ++i) {
      newId = makeRandomInvoiceId();
      const reservedInvoice = makeDraftInvoice(newId);
      reservedInvoice.status = InvoiceStatus.Deleted;
      try {
        await this.upsert(reservedInvoice);
        break;
      } catch {
        // This ID must already be in use, try again
      }
    }
    if (!newId) {
      throw new Error("Could not reserve an invoice ID after 100 tries");
    }
    return newId;
  }

  async upsert(invoice: Invoice): Promise<void> {
    const invoiceJson = JSON.stringify(invoice);
    await this.getDb().run(
      `
      INSERT INTO invoice (id, created_at, payment_due, client_name, total, status, invoice_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        created_at = excluded.created_at,
        payment_due = excluded.payment_due,
        client_name = excluded.client_name,
        total = excluded.total,
        status = excluded.status,
        invoice_json = excluded.invoice_json
      `,
      invoice.id,
      invoice.createdAt,
      invoice.paymentDue || null,
      invoice.clientName || null,
      invoice.total,
      invoice.status as string,
      invoiceJson,
    );
  }

  async get(id: string): Promise<Invoice | undefined> {
    const row = await this.getDb().get("SELECT invoice_json FROM invoice WHERE id = ?", id);
    return row?.invoice_json ? JSON.parse(row.invoice_json) : undefined;
  }

  async list(
    filterOptions: InvoiceStoreFilterOptions = {},
    limit?: number,
    offset?: number
  ): Promise<InvoiceSummary[]> {
    const { status } = filterOptions;
    const queryParams: (string | number)[] = [];
    let query = `SELECT id, created_at, payment_due, client_name, total, status FROM invoice WHERE status != 'Deleted'`;

    if (status) {
      query += ` AND status = ?`;
      queryParams.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    if (limit) {
      query += ` LIMIT ?`;
      queryParams.push(limit);
    }

    if (offset) {
      query += ` OFFSET ?`;
      queryParams.push(offset);
    }

    return this.getDb().all(query, queryParams);
  }
}
