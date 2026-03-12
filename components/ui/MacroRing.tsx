import { View, Text } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { colors } from '@/constants/Colors';

interface MacroRingProps {
  label: string;
  current: number;
  target: number;
  color: string;
  unit?: string;
}

export function MacroRing({ label, current, target, color, unit = 'g' }: MacroRingProps) {
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const progress = Math.min(1, current / (target || 1));
  const over = current > target;
  const offset = circ * (1 - progress);

  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <Svg width={96} height={96} viewBox="0 0 96 96">
        <Circle cx={48} cy={48} r={radius} fill="none" stroke={colors.border} strokeWidth={6} />
        <Circle
          cx={48}
          cy={48}
          r={radius}
          fill="none"
          stroke={over ? colors.accent : color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          strokeDashoffset={offset}
          rotation={-90}
          origin="48, 48"
        />
        <SvgText
          x={48}
          y={44}
          textAnchor="middle"
          fill={colors.text}
          fontSize={18}
          fontWeight="700"
        >
          {current}
        </SvgText>
        <SvgText
          x={48}
          y={60}
          textAnchor="middle"
          fill={colors.textMuted}
          fontSize={11}
        >
          /{target}{unit}
        </SvgText>
      </Svg>
      <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Text>
    </View>
  );
}
