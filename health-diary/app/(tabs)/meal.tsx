import React, { useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { MacroBar, Ring } from '../../src/components/charts';
import { DateBar, Screen } from '../../src/components/screen';
import {
  Button,
  Card,
  Empty,
  Field,
  Row,
  SectionTitle,
  Segmented,
  Stat,
} from '../../src/components/ui';
import { FOOD_PRESETS, type FoodPreset } from '../../src/foods';
import { sum, today, useStore } from '../../src/store';
import { colors, radius, space } from '../../src/theme';
import type { MealSlot } from '../../src/types';

const SLOTS = ['아침', '점심', '저녁', '간식'] as const;

export default function MealScreen() {
  const { meals, workouts, profile, addMeal, removeMeal } = useStore();
  const { width } = useWindowDimensions();
  const barWidth = Math.max(width - space(4) * 4, 240);

  const [date, setDate] = useState(today());
  const [slot, setSlot] = useState<MealSlot>(guessSlot());
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [carbs, setCarbs] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');

  const dayMeals = useMemo(
    () => meals.filter((m) => m.date === date),
    [meals, date]
  );
  const intake = sum(dayMeals.map((m) => m.calories));
  const burned = sum(
    workouts.filter((w) => w.date === date).map((w) => w.calories)
  );
  const net = intake - burned;
  const progress = intake / Math.max(profile.calorieGoal, 1);
  const remain = profile.calorieGoal - net;

  const macro = {
    carbs: sum(dayMeals.map((m) => m.carbs ?? 0)),
    protein: sum(dayMeals.map((m) => m.protein ?? 0)),
    fat: sum(dayMeals.map((m) => m.fat ?? 0)),
  };

  const applyPreset = (p: FoodPreset) => {
    setName(p.name);
    setCalories(`${p.calories}`);
    setCarbs(`${p.carbs}`);
    setProtein(`${p.protein}`);
    setFat(`${p.fat}`);
  };

  const save = () => {
    const kcal = Number(calories);
    if (!name.trim()) {
      Alert.alert('음식 이름을 입력해 주세요');
      return;
    }
    if (!kcal || kcal <= 0) {
      Alert.alert('칼로리를 입력해 주세요', '아래 프리셋을 누르면 자동으로 채워집니다');
      return;
    }
    addMeal({
      date,
      slot,
      name: name.trim(),
      calories: kcal,
      carbs: carbs ? Number(carbs) : undefined,
      protein: protein ? Number(protein) : undefined,
      fat: fat ? Number(fat) : undefined,
    });
    setName('');
    setCalories('');
    setCarbs('');
    setProtein('');
    setFat('');
    Keyboard.dismiss();
  };

  const confirmDelete = (id: string, label: string) =>
    Alert.alert('기록을 삭제할까요?', label, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => removeMeal(id) },
    ]);

  return (
    <Screen title="식사" subtitle="먹은 직후에 바로 적는 편이 가장 정확합니다">
      <DateBar value={date} onChange={setDate} />

      <Card style={{ marginTop: space(4) }}>
        <View style={s.topRow}>
          <Ring progress={progress} color={colors.meal}>
            <Text style={s.ringValue}>{intake}</Text>
            <Text style={s.ringLabel}>kcal 섭취</Text>
          </Ring>
          <View style={{ flex: 1, gap: space(4) }}>
            <Stat
              label="목표"
              value={`${profile.calorieGoal}`}
              unit="kcal"
            />
            <Stat
              label="운동으로 소모"
              value={`-${burned}`}
              unit="kcal"
              tone={colors.workout}
            />
            <Stat
              label={remain >= 0 ? '남은 양' : '초과'}
              value={`${Math.abs(remain)}`}
              unit="kcal"
              tone={remain >= 0 ? colors.primary : colors.danger}
            />
          </View>
        </View>
        {macro.carbs + macro.protein + macro.fat > 0 ? (
          <View style={{ marginTop: space(4) }}>
            <MacroBar {...macro} width={barWidth} />
            <View style={s.macroLegend}>
              <Legend color="#3B82F6" text={`탄수 ${macro.carbs}g`} />
              <Legend color="#1F9D63" text={`단백 ${macro.protein}g`} />
              <Legend color="#F08A24" text={`지방 ${macro.fat}g`} />
            </View>
          </View>
        ) : null}
      </Card>

      <SectionTitle>기록하기</SectionTitle>
      <Card>
        <Segmented options={SLOTS} value={slot} onChange={setSlot} />
        <View style={{ marginTop: space(4) }}>
          <Field
            label="음식"
            value={name}
            onChangeText={setName}
            placeholder="예: 닭가슴살 샐러드"
            keyboardType="default"
          />
        </View>
        <View style={[s.fieldRow, { marginTop: space(3) }]}>
          <Field
            label="칼로리"
            unit="kcal"
            value={calories}
            onChangeText={setCalories}
            placeholder="320"
            keyboardType="number-pad"
          />
          <Field
            label="탄수"
            unit="g"
            value={carbs}
            onChangeText={setCarbs}
            placeholder="선택"
          />
          <Field
            label="단백"
            unit="g"
            value={protein}
            onChangeText={setProtein}
            placeholder="선택"
          />
          <Field
            label="지방"
            unit="g"
            value={fat}
            onChangeText={setFat}
            placeholder="선택"
          />
        </View>

        <Text style={s.presetTitle}>빠른 입력</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space(2) }}
        >
          {FOOD_PRESETS.map((p) => (
            <Pressable
              key={p.name}
              onPress={() => applyPreset(p)}
              style={s.preset}
            >
              <Text style={s.presetName}>{p.name}</Text>
              <Text style={s.presetKcal}>{p.calories} kcal</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Button label="저장" onPress={save} style={{ marginTop: space(4) }} />
      </Card>

      <SectionTitle>{date === today() ? '오늘' : date} 먹은 것</SectionTitle>
      <Card>
        {dayMeals.length === 0 ? (
          <Empty text="아직 기록이 없습니다" />
        ) : (
          SLOTS.filter((sl) => dayMeals.some((m) => m.slot === sl)).map((sl) => {
            const items = dayMeals.filter((m) => m.slot === sl);
            return (
              <View key={sl} style={{ marginBottom: space(3) }}>
                <View style={s.slotHeader}>
                  <Text style={s.slotName}>{sl}</Text>
                  <Text style={s.slotKcal}>
                    {sum(items.map((i) => i.calories))} kcal
                  </Text>
                </View>
                {items.map((m) => (
                  <Row
                    key={m.id}
                    title={m.name}
                    subtitle={
                      m.carbs !== undefined ||
                      m.protein !== undefined ||
                      m.fat !== undefined
                        ? `탄 ${m.carbs ?? 0} · 단 ${m.protein ?? 0} · 지 ${m.fat ?? 0} (g)`
                        : undefined
                    }
                    right={<Text style={s.rowKcal}>{m.calories} kcal</Text>}
                    onLongPress={() => confirmDelete(m.id, m.name)}
                  />
                ))}
              </View>
            );
          })
        )}
      </Card>
    </Screen>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <View style={s.legendItem}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={s.legendText}>{text}</Text>
    </View>
  );
}

/** 지금 시간대에 맞는 끼니를 기본값으로 고른다 */
function guessSlot(): MealSlot {
  const h = new Date().getHours();
  if (h < 10) return '아침';
  if (h < 15) return '점심';
  if (h < 21) return '저녁';
  return '간식';
}

const s = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', gap: space(5) },
  ringValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  ringLabel: { fontSize: 10, color: colors.sub, marginTop: 1 },
  fieldRow: { flexDirection: 'row', gap: space(2) },
  macroLegend: { flexDirection: 'row', gap: space(4), marginTop: space(2) },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space(1.5) },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: colors.sub, fontWeight: '600' },
  presetTitle: {
    fontSize: 12,
    color: colors.sub,
    fontWeight: '600',
    marginTop: space(4),
    marginBottom: space(2),
  },
  preset: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingVertical: space(2),
    paddingHorizontal: space(3),
  },
  presetName: { fontSize: 13, fontWeight: '700', color: colors.text },
  presetKcal: { fontSize: 11, color: colors.sub, marginTop: 1 },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space(2),
  },
  slotName: { fontSize: 13, fontWeight: '800', color: colors.meal },
  slotKcal: { fontSize: 12, color: colors.sub, fontWeight: '600' },
  rowKcal: { fontSize: 13, fontWeight: '700', color: colors.text },
});
