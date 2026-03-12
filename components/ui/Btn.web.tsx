import React from 'react';
import { StyleSheet } from 'react-native';

interface BtnProps {
  onPress: () => void;
  style?: any;
  children: React.ReactNode;
  key?: string | number;
}

export function Btn({ onPress, style, children }: BtnProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  const btnStyle: React.CSSProperties = {
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    padding: 0,
    margin: 0,
    background: 'transparent',
    textAlign: 'left',
    ...(flat as React.CSSProperties),
  };

  return (
    <button onClick={onPress} style={btnStyle}>
      {children}
    </button>
  );
}
