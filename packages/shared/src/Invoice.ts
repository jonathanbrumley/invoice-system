
export enum PaymentTerm {
  Net1Day = 1,
  Net7Days = 7,
  Net30Days = 30,
}

export enum InvoiceStatus {
  Deleted = 'Deleted', // This status is for deleted and unsaved invoices
  Draft = 'Draft',
  Paid = 'Paid',
  Pending = 'Pending',
}

/**
 * This type is used for both Draft and Pending/Paid invoice addresses.
 * Pending and Paid invoices require all fields, Draft invoices do not require all fields.
 */
export interface InvoiceAddress {
  street?: string;
  city?: string;
  postCode?: string;
  country?: string;
}

/**
 * This type is used for both Draft and Pending/Paid invoice lines.
 * Pending and Paid invoices require all fields, Draft invoices do not require all fields.
 */
export interface InvoiceItem {
  /**
   *  Name of the item
   */
  name?: string;
  /**
   *  Must be an non-negative integer
   */
  quantity?: number;
  /**
   *  Money format with two digits after the decimal, e.g. 123.00 or 0.50
   */
  price?: string;
  /**
   *  Money format with two digits after the decimal, e.g. 123.00 or 0.50
   */
  total?: string;
}

const makeRandomLetter = (): string =>  {
  const charCodeForA = 'A'.charCodeAt(0);
  return String.fromCharCode(Math.floor(Math.random() * 26) + charCodeForA); // A-Z
}

/**
 * @returns a random invoice ID with two random characters and four random digits
 */
export const makeRandomInvoiceId = (): string => {
  const numericPostfix = Math.floor(Math.random() * 10000);
  return `${makeRandomLetter()}${makeRandomLetter()}${numericPostfix}`;
}

/**
 * This type is used for both Draft and Pending/Paid invoices.
 * Pending and Paid invoices require all fields, Draft invoices do not require all fields.
 */
export interface Invoice {
  /**
   *  Invoice IDs are 2 random uppercased letters followed by 4 random numbers, e.g. RT3080
   */
  id: string;
  status: InvoiceStatus;
  /**
   * date on which invoice was received/created - ISO 8601 format, e.g. 2024-01-01
   */
  createdAt?: string;
  /**
   * date by which invoice must be paid - ISO 8601 format, e.g. 2024-01-01
   * 
   * Note: This field is computed from createdAt and paymentTerms
   */
  paymentDue?: string;
  description?: string;
  paymentTerms?: PaymentTerm;
  clientName?: string;
  clientEmail?: string;
  clientAddress?: InvoiceAddress;
  senderAddress?: InvoiceAddress;
  items: InvoiceItem[];
  /**
   * Money format with two digits after the decimal, e.g. 123.00 or 0.50
   * 
   * Note: this field is computed from the sum of invoice items
   */
  total: string;
}

/**
 * Makes a draft invoice with the minimal required fields
 * 
 * @param id - the id for the invoice, may be generated from makeRandomInvoiceId
 * @returns a draft invoice
 */
export const makeDraftInvoice = (id: string): Invoice => {
  return {
    id,
    status: InvoiceStatus.Draft,
    items: [],
    total: '0.00',
  }
}