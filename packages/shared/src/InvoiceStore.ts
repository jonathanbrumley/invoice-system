import {Invoice, InvoiceStatus} from './Invoice';

export interface InvoiceStoreFilterOptions {
  status?: InvoiceStatus;
}

/**
 * This summary of an invoice is returned by InvoiceStore.list()
 */
export interface InvoiceSummary {
  id: string;
  createdAt?: string;
  paymentDue?: string;
  clientName?: string;
  total?: string;
  status: InvoiceStatus;
}

export interface InvoiceStore {
  /**
   * Generates and reserves a random invoice ID that is currently unused in the database
   * Note: this function will use makeRandomInvoiceId() until it finds an unused invoice ID
   */
  reserveNewId(): Promise<string | undefined>;

  /**
   * Upserts the specified invoice, inserting or overwriting any invoice with the specified invoice ID
   * @param invoice: a draft, pending, or paid invoice
   */
  upsert(invoice: Invoice): Promise<void>;

  /**
   * Gets the specified invoice by ID
   * @param id: the ID of the invoice to return
   */
  get(id: string): Promise<Invoice | undefined>;

  /**
   * Lists invoices in the order from most recent createdAt to least recent createdAt
   * @param filterOptions - if provided, this will filter invoices any supported filter field
   * @param limit - for scrolling/pagination - if provided, limits the number of invoices returned, otherwise all
   * @param offset - for scrolling/pagination - if provided, return invoices starting at offset, otherwise offset 0
   */
  list(filterOptions?: InvoiceStoreFilterOptions, limit?: number, offset?: number): Promise<InvoiceSummary[]>;
}
