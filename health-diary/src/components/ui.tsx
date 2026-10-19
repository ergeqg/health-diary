import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, shadow, space } from '../theme';

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionTitle({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.sectionTitle}>
      <Text style={s.sectionTitleText}>{children}</Text>
      {right}
    </View>
  );
}

export function Button({
  label,
  onPress,
  tone = 'primary',
  style,
}: {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    tone === 'primary'
      ? colors.primary
      : tone === 'danger'
        ? colors.danger
        : 'transparent';
  const fg = tone === 'ghost' ? colors.sub : '#fff';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        { backgroundColor: bg, opacity: pressed ? 0.75 : 1 },
        tone === 'ghost' && s.buttonGhost,
        style,
      ]}
    >
      <Text style={[s.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  unit,
  placeholder,
  keyboardType = 'decimal-pad',
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  unit?: string;
  placeholder?: string;
  keyboardType?: 'decimal-pad' | 'number-pad' | 'default';
}) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.fieldBox}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.sub}
          keyboardType={keyboardType}
          style={s.input}
        />
        {unit ? <Text style={s.unit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={s.segmented}>
      {options.map((o) => {
        const active = o === value;
        return (
          <Pressable
            key={o}
            onPress={() => onChange(o)}
            style={[s.segment, active && s.segmentActive]}
          >
            <Text style={[s.segmentText, active && s.segmentTextActive]}>
              {o}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Stat({
  label,
  value,
  unit,
  tone = colors.text,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: string;
}) {
  return (
    <View style={s.stat}>
      <Text style={s.statLabel}>{label}</Text>
      <View style={s.statValueRow}>
        <Text style={[s.statValue, { color: tone }]}>{value}</Text>
        {unit ? <Text style={s.statUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <View style={s.empty}>
      <Text style={s.emptyText}>{text}</Text>
    </View>
  );
}

export function Row({
  title,
  subtitle,
  right,
  onLongPress,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onLongPress?: () => void;
}) {
  return (
    <Pressable
      onLongPress={onLongPress}
      style={({ pressed }) => [s.row, pressed && onLongPress ? { opacity: 0.6 } : null]}
    >
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{title}</Text>
        {subtitle ? <Text style={s.rowSub}>{subtitle}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: space(4),
    ...shadow,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space(2),
    marginTop: space(5),
  },
  sectionTitleText: { fontSize: 15, fontWeight: '700', color: colors.text },
  button: {
    paddingVertical: space(3.5),
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buttonGhost: { borderWidth: 1, borderColor: colors.line },
  buttonText: { fontSize: 15, fontWeight: '700' },
  field: { flex: 1 },
  fieldLabel: {
    fontSize: 12,
    color: colors.sub,
    marginBottom: space(1.5),
    fontWeight: '600',
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: space(3),
  },
  input: {
    flex: 1,
    paddingVertical: space(3),
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  unit: { fontSize: 13, color: colors.sub, marginLeft: space(1) },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: space(1),
    gap: space(1),
  },
  segment: {
    flex: 1,
    paddingVertical: space(2.5),
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: colors.card, ...shadow },
  segmentText: { fontSize: 13, color: colors.sub, fontWeight: '600' },
  segmentTextActive: { color: colors.text, fontWeight: '700' },
  stat: { flex: 1 },
  statLabel: { fontSize: 12, color: colors.sub, fontWeight: '600' },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statUnit: { fontSize: 12, color: colors.sub, marginLeft: 3 },
  empty: { paddingVertical: space(6), alignItems: 'center' },
  emptyText: { color: colors.sub, fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space(3),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  rowSub: { fontSize: 12, color: colors.sub, marginTop: 2 },
});
