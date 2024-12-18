import { Invoice, InvoiceStatus, makeRandomInvoiceId, makeDraftInvoice } from './Invoice';
import { InvoiceStore, InvoiceStoreFilterOptions, InvoiceSummary } from './InvoiceStore';

/**
 * An in-memory InvoiceStore for use in tests
 */
export class InMemoryInvoiceStore implements InvoiceStore {
  private invoices: Map<string, Invoice>;

  constructor() {
    this.invoices = new Map();
  }

  async reserveNewId(): Promise<string> {
    let newId: string | undefined;
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
    this.invoices.set(invoice.id, invoice);
  }

  async get(id: string): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async list(
    filterOptions?: InvoiceStoreFilterOptions,
    limit?: number,
    offset?: number
  ): Promise<InvoiceSummary[]> {
    let filteredInvoices = Array.from(this.invoices.values());

    // Apply filters if provided
    if (filterOptions?.status) {
      filteredInvoices = filteredInvoices.filter(
        (invoice) => invoice.status === filterOptions.status
      );
    } else {
      filteredInvoices = filteredInvoices.filter(
        (invoice) => invoice.status !== InvoiceStatus.Deleted
      );
    }

    // Sort invoices by `createdAt` in descending order
    filteredInvoices.sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return 1;
      }
      if (a.createdAt > b.createdAt) {
        return -1;
      }
      return 0;
    });

    // Apply pagination
    if (offset) {
      filteredInvoices = filteredInvoices.slice(offset);
    }
    if (limit) {
      filteredInvoices = filteredInvoices.slice(0, limit);
    }

    // Map to InvoiceSummary
    return filteredInvoices.map((invoice) => ({
      id: invoice.id,
      createdAt: invoice.createdAt,
      paymentDue: invoice.paymentDue,
      clientName: invoice.clientName,
      total: invoice.total,
      status: invoice.status,
    }));
  }
}
