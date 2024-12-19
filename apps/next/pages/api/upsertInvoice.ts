import { NextApiRequest, NextApiResponse } from 'next';
import { Invoice, InvoiceStatus, validatePendingInvoice, validateDraftInvoice } from '@my/shared';
import { openStore } from '@my/server';

/**
 * POST upsertInvoice
 * 
 * Inserts or overwrites the Invoice according to the specified Invoice id.
 * @param req method should be 'POST' and the body should be an Invoice in any state
 * @param res will contain the resulting status, error message and details
 */
export default async function upsertInvoiceHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const store = await openStore();
  if (!store) {
    return res.status(500).json({ error: 'InvoiceStore not initialized' });
  }

  const invoice: Invoice = req.body;

  if (!invoice?.status) {
    return res.status(400).json({ error: 'Invalid invoice or invoice status' });
  }

  if ((invoice.status === InvoiceStatus.Pending || invoice.status === InvoiceStatus.Paid)
      && !validatePendingInvoice(invoice)) {
    return res.status(400).json({
      error: 'Invalid pending or paid invoice',
      details: validatePendingInvoice.errors
    });
  } else if (!validateDraftInvoice(invoice)) {
    return res.status(400).json({
      error: 'Invalid draft invoice',
      details: validateDraftInvoice.errors,
    });
  } else {
    try {
      // Upsert the valid invoice
      await store.upsert(invoice);
      res.status(200).json({ message: 'Invoice upserted successfully' });
    } catch (error) {
      const details = (error as Error)?.message || 'unknown details';
      res.status(500).json({ error: 'Failed to save invoice', details });
    }
  }
}
