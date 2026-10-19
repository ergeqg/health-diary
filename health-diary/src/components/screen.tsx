import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, space } from '../theme';
import { formatDateLabel, fromKey, toKey, today } from '../store';

/** 모든 탭 화면의 공통 틀: 제목 + 스크롤 영역 */
export function Screen({
  title,
  subtitle,
  children,
  contentStyle,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          {
            paddingTop: insets.top + space(3),
            paddingBottom: space(10),
            paddingHorizontal: space(4),
          },
          contentStyle,
        ]}
      >
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
        {children}
      </ScrollView>
    </View>
  );
}

/** 하루 단위로 날짜를 옮기는 바. 오늘 이후로는 넘어가지 않는다. */
export function DateBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  const shift = (days: number) => {
    const d = fromKey(value);
    d.setDate(d.getDate() + days);
    const next = toKey(d);
    if (next > today()) return;
    onChange(next);
  };
  const isToday = value === today();
  return (
    <View style={s.dateBar}>
      <Pressable onPress={() => shift(-1)} style={s.dateBtn} hitSlop={8}>
        <Ionicons name="chevron-back" size={18} color={colors.sub} />
      </Pressable>
      <Pressable onPress={() => onChange(today())} style={{ alignItems: 'center' }}>
        <Text style={s.dateText}>{formatDateLabel(value)}</Text>
        {!isToday ? <Text style={s.dateHint}>눌러서 오늘로</Text> : null}
      </Pressable>
      <Pressable
        onPress={() => shift(1)}
        style={[s.dateBtn, isToday && { opacity: 0.25 }]}
        hitSlop={8}
      >
        <Ionicons name="chevron-forward" size={18} color={colors.sub} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.sub, marginTop: space(1) },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: space(2.5),
    paddingHorizontal: space(3),
    marginTop: space(4),
    ...shadow,
  },
  dateBtn: { padding: space(1) },
  dateText: { fontSize: 15, fontWeight: '700', color: colors.text },
  dateHint: { fontSize: 10, color: colors.primary, marginTop: 1 },
});
