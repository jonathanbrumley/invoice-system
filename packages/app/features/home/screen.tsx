import React, { useState, useEffect } from 'react';
import { XStack, YStack } from 'tamagui';
import { Invoice, InvoiceStore, InvoiceStoreFilterOptions, InvoiceSummary, makeDraftInvoice } from '@my/shared';
import {
  defaultConnectionStatus,
  ConnectionStatusProps,
  ClientInvoiceStore,
  Sidebar,
  InvoiceInventory,
  ViewInvoice,
  EditInvoice,
} from '@my/ui';

export interface HomeScreenProps {
  createInvoiceStore?: (setConnectionStatus: (props: ConnectionStatusProps) => void) => InvoiceStore;
}

export function HomeScreen(props?: HomeScreenProps) {
  const [connectionStatus, setConnectionStatus] = useState(defaultConnectionStatus);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [filter, setFilter] = useState<InvoiceStoreFilterOptions>({});
  const [isEditing, setEditing] = useState(false);

  const client = props?.createInvoiceStore ?
    props.createInvoiceStore(setConnectionStatus) :
    new ClientInvoiceStore(setConnectionStatus);

  const makeInvoice = async () => {
    const id = await client.reserveNewId();
    if (id) {
      setInvoice(makeDraftInvoice(id));
      setEditing(true);
    }
  }

  const showInvoices = async () => {
    setEditing(false);
    setInvoice(null);
    const invoices = await client.list(filter);
    setInvoices(invoices);
  }

  const openInvoice = async (id: string) => {
    const invoice = await client.get(id);
    if (invoice) {
      setInvoice(invoice);
    }
  }

  // Show invoices on the first mount
  useEffect(() => {
    showInvoices();
  }, []);
  return (
      <XStack height="100%" width="100%">
        <Sidebar></Sidebar>
        <YStack alignItems="center" backgroundColor="#0C0E16" padding="$7" flex={1}>
          <YStack width={800} overflow="auto">
            {
              invoice && isEditing ? (<EditInvoice invoice={invoice} setInvoice={setInvoice} />) :
              invoice && !isEditing ? (<ViewInvoice invoice={invoice}/>) :
              (<InvoiceInventory
                invoices={invoices}
                setFilter={setFilter}
                makeInvoice={makeInvoice}
                openInvoice={openInvoice}
              />)
            }
          </YStack>
        </YStack>
      </XStack>
  );
}

