
export enum PaymentTerm {
  Net1Day = 1,
  Net7Days = 7,
  Net30Days = 30,
}

export enum InvoiceStatus {
  Draft = "Draft",
  Paid = "Paid",
  Pending = "Pending",
}

export interface InvoiceAddress {
  street?: string;
  city?: string;
  postCode?: string;
  country?: string;
}

export interface InvoiceItem {
  name?: string;
  quantity?: number; // Must be an non-negative integer
  price?: string;    // Decimal format with two digits after the decimal, e.g. 123.00 or 0.50
  total?: string;    // Decimal format with two digits after the decimal, e.g. 123.00 or 0.50
}

const makeRandomLetter = (): string =>  {
  const charCodeForA = 'A'.charCodeAt(0);
  return String.fromCharCode(Math.floor(Math.random() * 26) + charCodeForA); // A-Z
}

export const makeRandomInvoiceId = (): string => {
  const numericPostfix = Math.floor(Math.random() * 10000);
  return `${makeRandomLetter()}${makeRandomLetter()}${numericPostfix}`;
}

export interface Invoice {
  id: string;          // 2 random uppercased letters followed by 4 random numbers.
  status: InvoiceStatus;

  createdAt?: string;  // ISO 8601 format, e.g. 2024-01-01
  paymentDue?: string; // ISO 8601 format, e.g. 2024-01-01
  description?: string;
  paymentTerms?: PaymentTerm;
  clientName?: string;
  clientEmail?: string;
  clientAddress?: InvoiceAddress;
  senderAddress?: InvoiceAddress;
  items: InvoiceItem[];
  total: string; // Decimal format with two digits after the decimal, e.g. 123.00 or 0.50
}

export const makeDraftInvoice = (): Invoice => {
  return {
    id: makeRandomInvoiceId(),
    status: InvoiceStatus.Draft,
    items: [],
    total: "0.00",
  }
}