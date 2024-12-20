import {nanoid} from 'nanoid';
import _ from 'lodash';

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
   * unique id of the item
   */
  id: string;
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
  const numericPostfix = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `${makeRandomLetter()}${makeRandomLetter()}${numericPostfix}`;
}

/**
 * This type is used for both Draft and Pending/Paid invoices.
 * Pending and Paid invoices require all fields, Draft invoices do not require all fields.
 */
export interface Invoice {
  /**
   *  Invoice IDs are automatically assigned by the system to be 2 random uppercased letters
   *  followed by 4 random numbers, e.g. RT3080
   */
  id: string;
  status: InvoiceStatus;
  /**
   * date on which invoice was received/created - ISO 8601 format, e.g. 2024-01-01
   */
  createdAt: string;
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
    createdAt: new Date().toISOString().split('T')[0], // Today's date
    status: InvoiceStatus.Draft,
    items: [],
    total: '0.00',
  }
}

/**
 * Takes an ajv instance name and path and creates a lodash path
 * @param field top level field name or field within the specified instance
 * @param instance optional ajv instancePath i.e. '/items/0' or '/clientAddress' 
 * @returns a lodash path such as 'items[0].total" or "clientAddress.street"
 */
const makeInvoiceLodashPath = (field: string, instance?: string): string => {
  if (instance) {
    const path = instance.split('/');
    if (path.length == 0) {
      return field;
    }
    if (path.length == 1 || path[0] !== '') {
      throw new Error('path must start with forward slash')
    }
    if (path.length == 2) {
      return `${path[1]}.${field}`;
    }
    if (path.length == 3) {
      if (isNaN(parseInt(path[2]))) {
        throw new Error('second element of invoice path must be an index');
      }
       // e.g. /items/0 => items[0].field
       return `${path[1]}[${path[2]}].${field}`;
    }
    throw new Error('not a valid invoice path');
  }
  return field;
}

/**
 * Creates a setter for a field of an invoice using an ajv instance and field name
 * @param invoice original invoice to copy
 * @param field the field to change
 * @param setInvoice a setter which will change the invoice to the new value
 * @param instance optional path to the object containing the field to be set, in ajv format, e.g. /items/0
 * @returns a setter which can be passed to an onChange method
 */
export const makeSetInvoiceField = 
  (invoice: Invoice, field: string, setInvoice: (newInvoice: Invoice) => void, instance?: string): 
  (value: string) => void => {
  const lodashPath = makeInvoiceLodashPath(field, instance);
  const setter = (value: string) => {
    const copiedInvoice = _.cloneDeep(invoice);
    _.set(copiedInvoice, lodashPath, value);
    setInvoice(copiedInvoice);
  };
  return setter;
}

/**
 * Creates a command which will copy and set a copy of an invoice but with an added item
 * @param invoice the original invoice tp copy
 * @param setInvoice a setter which will change the invoice to the new value
 * @returns a command which can be used as a parameter to onClick
 */
export const makeAddInvoiceItem = (invoice: Invoice, setInvoice: (newInvoice: Invoice) => void): () => void => {
  const command = () => {
    const newItem: InvoiceItem = {id: nanoid()};
    const newItems = [...invoice.items, newItem];
    setInvoice({...invoice, items: newItems});
  };
  return command;
}