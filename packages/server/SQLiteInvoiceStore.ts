import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

// Helper function to initialize the database
async function initializeDatabase(dbFilePath: string): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  const db = await open({
    filename: dbFilePath,
    driver: sqlite3.Database,
  });

  // Create the table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS invoice (
      id TEXT PRIMARY KEY,                     -- Primary key constraint
      createdAt TEXT NOT NULL,                 -- ISO 8601 date format ("YYYY-MM-DD")
      clientName TEXT,                         -- Nullable string
      total DECIMAL,                           -- Nullable decimal value
      status TEXT NOT NULL,                    -- Required string
      invoice_json TEXT NOT NULL               -- Required string for full invoice data
    );
  `);

  // Create the index on createdAt if it doesn't exist
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_createdAt
    ON invoice (createdAt);
  `);

  return db;
}

// Example usage
async function main() {
  try {
    const dbPath = "./invoices.db"; // Path to the SQLite database file
    const db = await initializeDatabase(dbPath);

    console.log("Database initialized successfully.");

    // Insert an example record (replace with your actual logic)
    const exampleInvoice = {
      id: "XY9876",
      createdAt: "2024-12-16",
      clientName: "John Doe",
      total: 500.0,
      status: "Pending",
      invoice_json: JSON.stringify({
        id: "XY9876",
        createdAt: "2024-12-16",
        clientName: "John Doe",
        total: 500.0,
        status: "Pending",
      }),
    };

    await db.run(
      `INSERT OR IGNORE INTO invoice (id, createdAt, clientName, total, status, invoice_json) VALUES (?, ?, ?, ?, ?, ?)`,
      exampleInvoice.id,
      exampleInvoice.createdAt,
      exampleInvoice.clientName,
      exampleInvoice.total,
      exampleInvoice.status,
      exampleInvoice.invoice_json
    );

    console.log("Example invoice inserted.");

    await db.close();
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

main();
