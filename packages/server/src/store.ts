import {InvoiceStore} from '@my/shared';
import {openSharedSQLiteInvoiceStore} from './SQLiteInvoiceStore';

const dbPath = './invoice.db';

export const openStore = (): Promise<InvoiceStore | undefined> => {
  return openSharedSQLiteInvoiceStore(dbPath);
}
