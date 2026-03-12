import { View } from 'react-native';
import { colors } from '@/constants/Colors';

interface MiniBarProps {
  value: number;
  max: number;
  color: string;
  height?: number;
}

export function MiniBar({ value, max, color, height = 6 }: MiniBarProps) {
  const width = Math.min(100, (value / max) * 100);
  return (
    <View
      style={{
        width: '100%',
        height,
        backgroundColor: colors.border,
        borderRadius: height / 2,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${width}%`,
          height: '100%',
          backgroundColor: width >= 100 ? colors.accent : color,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}
