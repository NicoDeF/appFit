import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Polygon, Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '@/constants/Colors';
import { BodyEntry } from '@/store/useAppStore';

interface WeightChartProps {
  data: BodyEntry[];
  field?: 'weight' | 'waist';
  color?: string;
  unit?: string;
}

export function WeightChart({ data, field = 'weight', color = colors.accent, unit = 'kg' }: WeightChartProps) {
  const validData = data.filter((d) => d[field] != null && !isNaN(d[field]) && d[field] > 0);
  if (validData.length < 2) return null;

  const W = 100;
  const H = 50;
  const values = validData.map((d) => d[field]);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  if (max === min) return null;

  const points = validData.map((d, i) => {
    const x = (i / (validData.length - 1)) * W;
    const y = H - ((d[field] - min) / (max - min)) * H;
    return { x, y, value: d[field] };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints = polylinePoints + ` ${W},${H} 0,${H}`;
  const gradId = `${field}Grad`;

  return (
    <View style={{ width: '100%' }}>
      <Svg viewBox={`-4 -4 ${W + 8} ${H + 12}`} style={{ width: '100%', height: 140 }}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Polygon points={areaPoints} fill={`url(#${gradId})`} />
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <React.Fragment key={i}>
            <Circle cx={p.x} cy={p.y} r={3} fill={color} stroke={colors.bg} strokeWidth={1.5} />
            {(i === 0 || i === points.length - 1) && (
              <SvgText x={p.x} y={p.y - 8} textAnchor="middle" fill={colors.textMuted} fontSize={5}>
                {p.value}{unit}
              </SvgText>
            )}
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}
