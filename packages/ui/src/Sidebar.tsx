import React from 'react';
import { Image, YStack, Separator, Avatar } from 'tamagui';

export const Sidebar = () => {
  return (
    <YStack
      maxWidth={100}
      minHeight={800}
      backgroundColor="#1E2139"
      justifyContent="space-between"
      alignItems="center"
      gap="$4"
      flex={1}
    >
      <YStack
        width={100}
        minHeight={100}
        backgroundColor="#7C5DFA"
        paddingVertical="$6"
        alignItems="center"
        >
          <Image source={{ uri: 'assets/logo.svg'}} width='$3' height='$3' />
        </YStack>
      {/* Bottom Section */}
      <YStack alignItems="center" justifyContent="flex-end" gap="$5" paddingVertical="$5" flex={1}>
        <Image source={{ uri: 'assets/icon-sun.svg'}} width='$1' height='$1'/>
        <Separator backgroundColor="#7E88C3" minWidth={100} />
        <Avatar circular size="$3">
          <Avatar.Image source={{ uri: 'assets/image-avatar.jpg' }} />
        </Avatar>
      </YStack>
  </YStack>
  );
}
