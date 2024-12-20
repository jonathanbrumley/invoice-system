import React from 'react';
import { XStack, Text } from 'tamagui';

export interface InvoiceIdProps {
  prefix?: string;
  id: string;
  fontSize?: string;
}

export const InvoiceId = (props: InvoiceIdProps) => {
  const {prefix, id, fontSize} = props;
  return (
    <XStack>
      {prefix && (<Text fontSize={fontSize as any}>{prefix}</Text>)}
      <Text fontSize={fontSize as any} color="#7E88C3">{`#`}</Text>
      <Text fontSize={fontSize as any}>{id}</Text>
    </XStack>
  );
}
