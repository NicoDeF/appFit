import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { View } from 'react-native';
import { colors } from '@/constants/Colors';

interface AppLogoProps {
  size?: number;
}

/**
 * appFIT logo mark — horizontal dumbbell inside a rounded square.
 * Scales via the `size` prop.
 */
export function AppLogo({ size = 100 }: AppLogoProps) {
  const s = size;

  // All values relative to viewBox 100×100
  // Horizontal dumbbell: left plate | bar | right plate
  const plate_w = 18;   // width of each plate
  const plate_h = 44;   // height of each plate (tall)
  const plate_r = 6;
  const plate_y = (100 - plate_h) / 2;  // centred vertically

  const bar_h   = 18;   // thickness of the connecting bar
  const bar_y   = (100 - bar_h) / 2;
  const bar_x   = 18 + plate_w;         // starts right after left plate
  const bar_w   = 100 - 2 * (18 + plate_w); // spans between plates

  const left_plate_x  = 18;
  const right_plate_x = 100 - 18 - plate_w;

  return (
    <View style={{ width: s, height: s }}>
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#ff6152" stopOpacity="1" />
            <Stop offset="1" stopColor={colors.accent} stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="plateGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="1" />
            <Stop offset="1" stopColor="#ffe8e6" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Background rounded square */}
        <Rect x="2" y="2" width="96" height="96" rx={22} ry={22} fill="url(#bgGrad)" />

        {/* Subtle inner border */}
        <Rect x="2" y="2" width="96" height="96" rx={22} ry={22}
          fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.12" />

        {/* Left weight plate */}
        <Rect x={left_plate_x} y={plate_y} width={plate_w} height={plate_h}
          rx={plate_r} ry={plate_r} fill="url(#plateGrad)" />

        {/* Connecting bar */}
        <Rect x={bar_x} y={bar_y} width={bar_w} height={bar_h}
          rx={4} ry={4} fill="#ffffff" fillOpacity={0.85} />

        {/* Right weight plate */}
        <Rect x={right_plate_x} y={plate_y} width={plate_w} height={plate_h}
          rx={plate_r} ry={plate_r} fill="url(#plateGrad)" />

        {/* Knurling detail lines on bar */}
        <Rect x={bar_x + 6}  y={bar_y + 2} width={2} height={bar_h - 4} rx={1} fill={colors.accent} fillOpacity={0.5} />
        <Rect x={bar_x + 12} y={bar_y + 2} width={2} height={bar_h - 4} rx={1} fill={colors.accent} fillOpacity={0.5} />
        <Rect x={bar_x + 18} y={bar_y + 2} width={2} height={bar_h - 4} rx={1} fill={colors.accent} fillOpacity={0.5} />

        {/* Shine on left plate */}
        <Rect x={left_plate_x + 3} y={plate_y + 5} width={4} height={plate_h - 10}
          rx={2} fill="#ffffff" fillOpacity={0.35} />
      </Svg>
    </View>
  );
}
