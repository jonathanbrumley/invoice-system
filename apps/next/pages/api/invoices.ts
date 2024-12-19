import { NextApiRequest, NextApiResponse } from 'next';
import { InvoiceStatus } from '@my/shared';
import { openStore } from '@my/server';

/**
 * GET invoices
 * 
 * @param req method should be 'GET', query may contain status (Pending, Draft, Paid), limit (e.g 100) and offset (e.g. 10)
 * @param res will contain an array of InvoiceSummary in the json body, otherwise an error message and details
 */
export default async function invoicesHandler(req: NextApiRequest, res: NextApiResponse) {
  const { status, limit, offset } = req?.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const store = await openStore();
  if (!store) {
    return res.status(500).json({ error: 'InvoiceStore not initialized' });
  }

  try {
    const invoices = await store.list(
      { status: status && typeof status === 'string'? status as InvoiceStatus: undefined },
      limit? parseInt(limit as string, 10) : undefined,
      offset? parseInt(offset as string, 10) : undefined,
    );
    res.status(200).json(invoices);
  } catch (error) {
    const details = (error as Error)?.message || 'unknown details';    
    res.status(500).json({ error: 'Failed to fetch invoices', details });
  }
}
