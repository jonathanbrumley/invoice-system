import axios, {AxiosResponse} from 'axios';
import {
  Invoice,
  InvoiceStore,
  InvoiceStoreFilterOptions,
  InvoiceSummary,
} from '@my/shared';
import { ConnectionStatusProps } from './ConnectionStatusProps';

/**
 * Implements InvoiceStore on client by making server API requests
 * @param setConnectionStatus allows the client to observe loading and request status
 */
export class ClientInvoiceStore implements InvoiceStore {
  private setConnectionStatus = (props: ConnectionStatusProps) => {};

  constructor(setConnectionStatus?: (_props: ConnectionStatusProps) => void) {
    if (setConnectionStatus) {
      this.setConnectionStatus = setConnectionStatus;
    }
  }

  private async handleRequest(
    request: () => Promise<AxiosResponse>
  ): Promise<AxiosResponse | undefined> {
    this.setConnectionStatus({
      status: 200,
      error: '',
      errorDetails: '',
      isLoading: true,
    });
    try {
      const result = await request();
      console.log(result);
      this.setConnectionStatus({
        status: result.status,
        error: '',
        errorDetails: '',
        isLoading: false,
      });
      return result;
    } catch (err: any) {
      console.log(err);
      this.setConnectionStatus({
        status: err?.response?.status || 500,
        error: err?.message || 'Unknown error',
        errorDetails: err?.response?.data?.details || '',
        isLoading: false
      });
    }
    return undefined;
  }

  async reserveNewId(): Promise<string | undefined> {
    const response = await this.handleRequest(async () => {
      return axios.post('/api/reserveInvoiceId');
    });
    return response?.data?.id;
  }

  async upsert(invoice: Invoice): Promise<void> {
    await this.handleRequest(async () => {
      return axios.post('/api/upsertInvoice', invoice);
    });
  }

  async get(id: string): Promise<Invoice | undefined> {
    const response = await this.handleRequest(async () => {
      return axios.get('/api/invoice', { params: { id } });
    });
    return response?.data?.id ? response?.data as Invoice : undefined;
  }

  async list(
    filterOptions?: InvoiceStoreFilterOptions,
    limit?: number,
    offset?: number
  ): Promise<InvoiceSummary[]> {
    const response = await this.handleRequest(async () => {
      const params: Record<string, any> = { ...filterOptions };
      if (filterOptions?.status) {
        params.status = filterOptions.status;
      }
      if (limit) {
        params.limit = limit;
      }
      if (offset) {
        params.offset = offset;
      }
      return axios.get('/api/invoices', { params });
    });
    return Array.isArray(response?.data) ? (response?.data as InvoiceSummary[]) : [];
  }
}
