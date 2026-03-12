import React from 'react';
import { Pressable } from 'react-native';

interface BtnProps {
  onPress: () => void;
  style?: any;
  children: React.ReactNode;
  key?: string | number;
}

export function Btn({ onPress, style, children }: BtnProps) {
  return (
    <Pressable onPress={onPress} style={style}>
      {children}
    </Pressable>
  );
}
