import { createMocks } from 'node-mocks-http';
import { vi, beforeEach, expect, describe, it } from 'vitest';
import invoiceHandler from '../invoice';
import invoicesHandler from '../invoices';
import reserveInvoiceIdHandler from '../reserveInvoiceId';
import upsertHandler from '../upsertInvoice';
import {
  Invoice,
  InMemoryInvoiceStore,
  InvoiceStatus,
} from '@my/shared';

let mockInvoiceStore: InMemoryInvoiceStore | undefined;
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
  }
];

vi.mock('@my/server', () => ({
  openStore: async () => { return mockInvoiceStore; },
}));

beforeEach(() => {
  mockInvoiceStore = new InMemoryInvoiceStore();
});

describe('Invoice API Endpoints', () => {
  describe('/api/invoice', () => {
    it('returns an invoice when found', async () => {
      mockInvoiceStore?.upsert(testInvoices[0]);

      const { req, res } = createMocks({
        method: 'GET',
        query: { id: testInvoices[0].id },
      });

      await invoiceHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(testInvoices[0]);
    });

    it('returns 404 if the invoice is not found', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'INVALID' },
      });

      await invoiceHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({ error: 'Invoice not found' });
    });
  });

  describe('/api/invoices', () => {
    it('returns a list of invoices', async () => {
      mockInvoiceStore?.upsert(testInvoices[0]);
      mockInvoiceStore?.upsert(testInvoices[1]);

      const { req, res } = createMocks({
        method: 'GET',
        query: {},
      });

      await invoicesHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toHaveLength(2);
    });

    it('filters invoices by status', async () => {
      mockInvoiceStore?.upsert(testInvoices[0]);
      mockInvoiceStore?.upsert(testInvoices[1]);

      const { req, res } = createMocks({
        method: 'GET',
        query: { status: InvoiceStatus.Pending },
      });

      await invoicesHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toHaveLength(1);
    });
  });

  describe('/api/reserveInvoiceId', () => {
    it('reserves a new unique ID', async () => {
      const { req, res } = createMocks({
        method: 'POST',
      });

      await reserveInvoiceIdHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(typeof res._getJSONData().id).toBe('string');
    });
  });

  describe('/api/upsert', () => {
    it('validates and upserts a valid draft invoice', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: testInvoices[0],
      });
      req.context = { invoiceStore: mockInvoiceStore };

      await upsertHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'Invoice upserted successfully' });
    });

    it('validates and rejects an invalid pending invoice', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: testInvoices[1],
      });

      await upsertHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('handles missing store', async () => {
      mockInvoiceStore = undefined;
      const { req, res } = createMocks({
        method: 'POST',
        body: testInvoices[0],
      });

      await upsertHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });
  });
});
