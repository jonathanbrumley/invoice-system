import { NextApiRequest, NextApiResponse } from 'next';
import { openStore } from '@my/server';

export default async function reserveInvoiceIdHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const store = await openStore();
  if (!store) {
    return res.status(500).json({ error: 'InvoiceStore not initialized' });
  }

  try {
    const newId = await store.reserveNewId();
    res.status(200).json({ id: newId });
  } catch (error) {
    const details = (error as Error)?.message || 'unknown details';    
    res.status(500).json({ error: 'Failed to reserve new ID', details });
  }
}
