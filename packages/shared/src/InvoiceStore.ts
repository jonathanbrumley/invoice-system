import {Invoice, InvoiceStatus} from './Invoice';

interface InvoiceStoreFilterOptions {
  status?: InvoiceStatus;
}

/**
 * This summary of an invoice is returned by InvoiceStore.list()
 */
interface InvoiceSummary {
  id: string;
  paymentDue?: string;
  clientName?: string;
  total?: string;
  status: InvoiceStatus;
}

interface InvoiceStore {
  /**
   * Generates and reserves a random invoice ID that is currently unused in the database
   * Note: this function will use makeRandomInvoiceId() until it finds an unused invoice ID
   */
  reserveNewId(): string;

  /**
   * Upserts the specified invoice, inserting or overwriting any invoice with the specified invoice ID
   * @param invoice: a draft, pending, or paid invoice
   */
  upsert(invoice: Invoice): void;

  /**
   * Gets the specified invoice by ID
   * @param id: the ID of the invoice to return
   */
  get(id: string): Invoice | undefined;

  /**
   * Lists invoices in the order from most recent createdAt to least recent createdAt
   * @param filterOptions - if provided, this will filter invoices any supported filter field
   * @param limit - for scrolling/pagination - if provided, limits the number of invoices returned, otherwise all
   * @param start - for scrolling/pagination - if provided, return invoices at the start position, otherwise start at position 0
   */
  list(filterOptions?: InvoiceStoreFilterOptions, limit?: number, start?: number): InvoiceSummary[];
}
