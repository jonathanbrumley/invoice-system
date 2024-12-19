import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { InMemoryInvoiceStore } from '../InMemoryInvoiceStore';
import { Invoice, InvoiceStatus } from '../Invoice';

const testInvoices: Invoice[] = [
  {
    id: 'AA1234',
    status: InvoiceStatus.Draft,
    createdAt: '2024-12-01',
    clientName: 'John Doe',
    total: '100.00',
    items: [],
  },
  {
    id: 'BB5678',
    status: InvoiceStatus.Pending,
    createdAt: '2024-12-02',
    clientName: 'Jane Smith',
    total: '200.00',
    items: [],
  },
  {
    id: 'CC9101',
    status: InvoiceStatus.Draft,
    createdAt: '2024-12-03',
    clientName: 'Acme Corp',
    total: '300.00',
    items: [],
  },
];

let store: InMemoryInvoiceStore;

beforeAll(async () => {
  // Initialize the SQLiteInvoiceStore with the test database file
  store = new InMemoryInvoiceStore();
});

describe('InMemoryInvoiceStore', () => {
  it('should reserve unique invoice IDs', async () => {
    const id1 = await store.reserveNewId();
    const id2 = await store.reserveNewId();

    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^[A-Z]{2}\d{4}$/);
    expect(id2).toMatch(/^[A-Z]{2}\d{4}$/);
  });

  it('should upsert and retrieve an invoice by ID', async () => {
    const invoice = testInvoices[0];
    await store.upsert(invoice);

    const fetchedInvoice = await store.get(invoice.id);
    expect(fetchedInvoice).toEqual(invoice);
  });

  it('should overwrite an existing invoice on upsert', async () => {
    const invoice = { ...testInvoices[1] };
    await store.upsert(invoice);

    // Update invoice details
    invoice.clientName = 'Updated Name';
    invoice.total = '150.00';
    await store.upsert(invoice);

    const fetchedInvoice = await store.get(invoice.id);
    expect(fetchedInvoice?.clientName).toBe('Updated Name');
    expect(fetchedInvoice?.total).toBe('150.00');
  });

  it('should list all invoices in descending order of createdAt', async () => {
    for (const invoice of testInvoices) {
      await store.upsert(invoice);
    }

    const invoices = await store.list();
    expect(invoices.length).toBe(testInvoices.length);

    // Verify order
    expect(invoices[0].id).toBe('CC9101');
    expect(invoices[1].id).toBe('BB5678');
    expect(invoices[2].id).toBe('AA1234');
  });

  it('should not list deleted invoices', async () => {
    for (const invoice of testInvoices) {
      await store.upsert(invoice);
    }
    const deletedInvoice = {
      id: 'DD9999',
      status: InvoiceStatus.Deleted,
      createdAt: '2024-12-01',
      clientName: 'John Doe',
      total: '100.00',
      items: [],
    };
    await store.upsert(deletedInvoice);
    const invoices = await store.list();
    expect(invoices.length).toBe(testInvoices.length);

    // Verify order
    expect(invoices[0].id).toBe('CC9101');
    expect(invoices[1].id).toBe('BB5678');
    expect(invoices[2].id).toBe('AA1234');
  });

  it('should filter invoices by status', async () => {
    for (const invoice of testInvoices) {
      await store.upsert(invoice);
    }

    const pendingInvoices = await store.list({ status: InvoiceStatus.Pending });
    expect(pendingInvoices.length).toBe(1);
    expect(pendingInvoices[0].id).toBe('BB5678');
  });

  it('should apply pagination to the list method', async () => {
    for (const invoice of testInvoices) {
      await store.upsert(invoice);
    }

    const firstPage = await store.list({}, 2, 0); // Get first 2 invoices
    expect(firstPage.length).toBe(2);
    expect(firstPage[0].id).toBe('CC9101');
    expect(firstPage[1].id).toBe('BB5678');

    const secondPage = await store.list({}, 2, 2); // Get the next 2 invoices
    expect(secondPage.length).toBe(1);
    expect(secondPage[0].id).toBe('AA1234');
  });

  it('should return an empty list if no invoices match the filter', async () => {
    await store.upsert(testInvoices[0]);
    await store.upsert(testInvoices[1]);

    const paidInvoices = await store.list({ status: InvoiceStatus.Paid });
    expect(paidInvoices.length).toBe(0);
  });
});
