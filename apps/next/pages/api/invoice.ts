import { NextApiRequest, NextApiResponse } from 'next';
import { openStore } from '@my/server';

/**
 * GET invoice
 * 
 * @param req method should be 'GET', query must contain id={desired invoice id}
 * @param res will contain an Invoice in the json body, otherwise an error message and details
 */
export default async function invoiceHandler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: "Missing or invalid 'id' parameter" });
  }

  const store = await openStore();
  if (!store) {
    return res.status(500).json({ error: 'InvoiceStore not initialized' });
  }

  try {
    const invoice = await store.get(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.status(200).json(invoice);
  } catch (error) {
    const details = (error as Error)?.message || 'unknown details';
    res.status(500).json({ error: 'Failed to fetch invoice', details });
  }
}
