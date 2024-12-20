import React from 'react';
import { View, Text, styled, Circle, XStack } from 'tamagui';
import { InvoiceStatus } from '@my/shared';

export const InvoiceStatusPillBase = styled(XStack, {
  borderRadius: '$4',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  alignItems: 'center',
  gap: '$2',
  backgroundColor: '$gray9'
});

export const InvoiceStatusCircle = styled(Circle, {
  width: '$2',
  height: '$2',
});

export const InvoiceStatusText = styled(Text, {
  fontSize: '$3',
});

export interface InvoiceStatusPillProps {
  status: InvoiceStatus;
}

export const InvoiceStatusPill = (props: InvoiceStatusPillProps) => {
  const textColor = 
    props.status === InvoiceStatus.Paid ? '$green3' :
    props.status === InvoiceStatus.Pending ? '$orange7' :
    '$gray9';

  return (
    <InvoiceStatusPillBase>
      <InvoiceStatusCircle backgroundColor={textColor} />
      <InvoiceStatusText color={textColor}>{`${props.status}`}</InvoiceStatusText>
    </InvoiceStatusPillBase>
  );
}
