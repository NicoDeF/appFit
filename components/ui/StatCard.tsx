import { View, Text } from 'react-native';
import { colors } from '@/constants/Colors';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: string;
}

export function StatCard({ label, value, sub, color, icon }: StatCardProps) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 18,
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
        <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>
          {label}
        </Text>
      </View>
      <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text }}>{value}</Text>
      {sub && <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>{sub}</Text>}
    </View>
  );
}
