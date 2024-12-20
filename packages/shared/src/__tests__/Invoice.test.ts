import { describe, it, expect, vi } from 'vitest';
import { makeSetInvoiceField, makeAddInvoiceItem, makeDraftInvoice } from '../Invoice';
import _ from 'lodash';

describe('makeSetInvoiceField', () => {
  it('updates a top-level field without modifying the original invoice', () => {
    const invoice = makeDraftInvoice('RT3080');
    const setInvoice = vi.fn();

    const setField = makeSetInvoiceField(invoice, 'description', setInvoice);
    setField('New Description');

    expect(setInvoice).toHaveBeenCalledWith({ ...invoice, description: 'New Description' });
    expect(invoice.description).toBeUndefined(); // Ensure original invoice is unchanged
  });

  it('updates a nested field without modifying the original invoice', () => {
    const invoice = makeDraftInvoice('RT3080');
    invoice.clientAddress = { street: '123 Main St', city: 'Townsville' };
    const setInvoice = vi.fn();

    const setField = makeSetInvoiceField(invoice, 'city', setInvoice, '/clientAddress');
    setField('New City');

    expect(setInvoice).toHaveBeenCalledWith({
      ...invoice,
      clientAddress: { ...invoice.clientAddress, city: 'New City' },
    });
    expect(invoice.clientAddress?.city).toBe('Townsville'); // Ensure original invoice is unchanged
  });

  it('updates a field in an item array without modifying the original invoice', () => {
    const invoice = makeDraftInvoice('RT3080');
    invoice.items = [{ id: '1', name: 'Item 1', quantity: 2 }];
    const setInvoice = vi.fn();

    const setField = makeSetInvoiceField(invoice, 'name', setInvoice, '/items/0');
    setField('Updated Item Name');

    expect(setInvoice).toHaveBeenCalledWith({
      ...invoice,
      items: [{ ...invoice.items[0], name: 'Updated Item Name' }],
    });
    expect(invoice.items[0].name).toBe('Item 1'); // Ensure original invoice is unchanged
  });

  it('throws an error for an invalid instance path', () => {
    const invoice = makeDraftInvoice('RT3080');
    const setInvoice = vi.fn();

    expect(() => makeSetInvoiceField(invoice, 'quantity', setInvoice, 'apple')).toThrow(
      'path must start with forward slash'
    );

    expect(() => makeSetInvoiceField(invoice, 'quantity', setInvoice, '/items/apple')).toThrow(
      'second element of invoice path must be an index'
    );

    expect(() => makeSetInvoiceField(invoice, 'quantity', setInvoice, '/items/apple/big')).toThrow(
      'not a valid invoice path'
    );
  });
});

describe('makeAddInvoiceItem', () => {
  it('adds a new item to an empty items array without modifying the original invoice', () => {
    const invoice = makeDraftInvoice('RT3080');
    const setInvoice = vi.fn();

    const addItem = makeAddInvoiceItem(invoice, setInvoice);
    addItem();

    expect(setInvoice).toHaveBeenCalledWith({
      ...invoice,
      items: [{ id: expect.any(String) }],
    });
    expect(invoice.items.length).toBe(0); // Ensure original invoice is unchanged
  });

  it('adds a new item to a non-empty items array without modifying the original invoice', () => {
    const invoice = makeDraftInvoice('RT3080');
    invoice.items = [{ id: '1', name: 'Existing Item' }];
    const setInvoice = vi.fn();

    const addItem = makeAddInvoiceItem(invoice, setInvoice);
    addItem();

    expect(setInvoice).toHaveBeenCalledWith({
      ...invoice,
      items: [
        { id: '1', name: 'Existing Item' },
        { id: expect.any(String) },
      ],
    });
    expect(invoice.items.length).toBe(1); // Ensure original invoice is unchanged
  });
});