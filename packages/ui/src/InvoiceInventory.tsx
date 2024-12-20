import React from 'react';
import { XStack, YStack, Text, Button, Select, ListItem } from 'tamagui';
import { ChevronRight, PlusCircle } from '@tamagui/lucide-icons';
import { InvoiceStatus, InvoiceStoreFilterOptions, InvoiceSummary } from '@my/shared';
import { InvoiceStatusPill } from './InvoiceStatusPill';
import { InvoiceId } from './InvoiceId';

export interface InvoiceInventoryProps {
  invoices: InvoiceSummary[],
  setFilter: (filter: InvoiceStoreFilterOptions) => void,
  makeInvoice: () => void,
  openInvoice: (id: string) => void,
}

export const InvoiceInventoryHeader = (props: InvoiceInventoryProps) => {
  const { invoices, setFilter, makeInvoice } = props;
  const StatusFilterItem = (props: {index: number, status: InvoiceStatus | null}) => {
    const {index, status} = props;
    const setStatus = () => {
      if (status) {
        setFilter({status});
      } else {
        setFilter({});
      }
    }
    return (
      <Select.Item index={index} value={`${status}`} onPress={setStatus}>{`${status}`}</Select.Item>
    )
  };
  return (
    <XStack jc="space-between" width="100%" ai="center">
      {/* Left side of header */}
      <YStack>
        <Text fontSize="$5" fontWeight="bold">Invoices</Text>
        <Text fontSize="$2" color="$gray10">{`There are ${invoices.length} total invoices`}</Text>
      </YStack>
      {/* Right side of header */}
      <XStack alignItems="center" gap="$3">
        {/*
        <Select value={'All'} >
          <Select.Trigger width={50} iconAfter={ChevronDown}>
            <Button size="$4">
              Filter by status
            </Button>
          </Select.Trigger>
          <Select.Content>
            <StatusFilterItem key={0} index={0} status={InvoiceStatus.Draft}></StatusFilterItem>
            <StatusFilterItem key={1} index={1} status={InvoiceStatus.Pending}></StatusFilterItem>
            <StatusFilterItem key={2} index={2} status={InvoiceStatus.Paid}></StatusFilterItem>
            <StatusFilterItem key={3} index={3} status={null}></StatusFilterItem>
          </Select.Content>
        </Select>
        */}
        <Button fontSize="$2" borderRadius="$8" backgroundColor="#7C5DFA" size="$4" icon={PlusCircle} onPress={makeInvoice}>New Invoice</Button>
      </XStack>
    </XStack>
  );
};

export const InvoiceInventory = (props: InvoiceInventoryProps) => {
  const { invoices, openInvoice } = props;
  return (
    <YStack>
      {InvoiceInventoryHeader(props)}
      {/* List of Invoices */}
      <YStack width="100%" marginTop="$6">
        {invoices.map((invoice) => (
          <ListItem
            key={invoice.id}
            borderRadius="$1"
            padding="$4"
            backgroundColor="#1E2139"
            marginBottom="$3"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <XStack>
              <InvoiceId id={invoice.id} />
              <Text color="$gray10">{invoice.clientName || ''}</Text>
              <Text color="$gray10">{`£${invoice.paymentDue || '0.00'}`}</Text>
              <Text color="$gray10">Client: {invoice.clientName || ''}</Text>
            </XStack>
            <XStack alignItems="flex-end">
              <Text fontWeight="bold">{`£${invoice.total}`}</Text>
              <InvoiceStatusPill status={invoice.status} />
              <Button icon={ChevronRight} size="$4" onPress={() => { openInvoice(invoice.id); }} />
            </XStack>
          </ListItem>
        ))}
      </YStack>
    </YStack>
  );
}
