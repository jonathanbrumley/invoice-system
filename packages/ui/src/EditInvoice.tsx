import React from 'react';
import { Invoice } from '@my/shared';
import { InvoiceId } from './InvoiceId';
// import { Form, Field } from 'react-final-form';
import { validatePendingInvoice } from '@my/shared';
import {
  Input,
  Button,
  Label,
  Text,
  XStack,
  YStack,
} from 'tamagui';

/*
interface InvoiceFormInputProps {
  id: string;
  label: string;
}

const InvoiceFormInput = (props: InvoiceFormInputProps) => {
  const {id, label} = props;
  return (
    <YStack gap={4}>
      <Label color="#DFE3FA" htmlFor={id}>{label}</Label>
      <Field name={id}>
        {({ input, meta }) => (
          <YStack gap={4}>
            <Input value={input.value || ''} onChange={input.onChange} id={id} placeholder={label} />
            {meta.touched && meta.error && (
              <Text color="#EC5757">{meta.error}</Text>
            )}
          </YStack>
        )}
      </Field>
    </YStack>
  );
}

interface InvoiceFormAddressInput {
  id: string;
}

const InvoiceFormAddressInput = (props: {id: string}) => {
  return (
    <YStack gap={16}>
      <InvoiceFormInput id={`${props.id}.street`} label="Street Address"/>
      <XStack>
        <InvoiceFormInput id={`${props.id}.city`} label="City"/>
        <InvoiceFormInput id={`${props.id}.postCode`} label="Post Code"/>
        <InvoiceFormInput id={`${props.id}.country`} label="Country"/>
      </XStack>
    </YStack>
  );
}
*/
export interface EditInvoiceProps {
  invoice: Invoice;
  setInvoice: (_: Invoice) => void;
}

export const EditInvoice = (props: EditInvoiceProps) => {
  const {invoice, setInvoice} = props;
  const onSubmit = (_form: any) => {};
  return (
    <>
    <InvoiceId fontSize="$8" prefix="Edit " id={invoice.id} />
    {
/*
    <Form
      initialValues={invoice}
      validate={validatePendingInvoice}
      onSubmit={onSubmit}
      render={({ handleSubmit, values,  form}) => (
        <form onSubmit={handleSubmit}>
          <YStack gap={24}>

            <Text fontSize="$2" color="#7C5DFA">Bill From</Text>
            <InvoiceFormAddressInput id="senderAddress" />
            <Text fontSize="$2" color="#7C5DFA">Bill To</Text>
            <InvoiceFormInput id="clientName" label="Client's Name"/>
            <InvoiceFormInput id="clientEmail" label="Client's Email"/>
            <InvoiceFormAddressInput id="clientAddress" />
            <InvoiceFormInput id="createdAt" label="Invoice Date" />
            <InvoiceFormInput id="description" label="Project Description" />
            <Text fontSize="$5" color="#888EB0">Item List</Text>
          </YStack>
        </form>
      )}>
    </Form>
*/
    }</>
  );
}
