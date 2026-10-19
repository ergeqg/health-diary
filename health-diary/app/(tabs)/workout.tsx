import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { BarChart, Ring } from '../../src/components/charts';
import { DateBar, Screen } from '../../src/components/screen';
import {
  Button,
  Card,
  Empty,
  Field,
  Row,
  SectionTitle,
  Stat,
} from '../../src/components/ui';
import { fromKey, lastDays, sum, today, useStore } from '../../src/store';
import { colors, radius, space } from '../../src/theme';
import { WORKOUT_TYPES, estimateCalories } from '../../src/workouts';

export default function WorkoutScreen() {
  const { workouts, weights, profile, addWorkout, removeWorkout } = useStore();
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - space(4) * 4, 240);

  const [date, setDate] = useState(today());
  const [type, setType] = useState<string>('걷기');
  const [minutes, setMinutes] = useState('');
  const [calories, setCalories] = useState('');
  const [memo, setMemo] = useState('');

  const bodyWeight = weights[0]?.weight ?? 65;
  const week = useMemo(() => lastDays(7), []);
  const weekItems = workouts.filter((w) => week.includes(w.date));
  const weekMinutes = sum(weekItems.map((w) => w.minutes));
  const weekCalories = sum(weekItems.map((w) => w.calories));
  const progress = weekMinutes / Math.max(profile.workoutGoalMin, 1);

  const barData = week.map((d) => ({
    label: `${fromKey(d).getDate()}`,
    value: sum(workouts.filter((w) => w.date === d).map((w) => w.minutes)),
  }));

  const dayItems = workouts.filter((w) => w.date === date);

  const estimated = minutes
    ? estimateCalories(type, Number(minutes) || 0, bodyWeight)
    : 0;

  const save = () => {
    const m = Number(minutes);
    if (!m || m <= 0) {
      Alert.alert('운동 시간을 입력해 주세요', '예: 30');
      return;
    }
    addWorkout({
      date,
      type,
      minutes: m,
      calories: calories ? Number(calories) : estimated,
      memo: memo || undefined,
    });
    setMinutes('');
    setCalories('');
    setMemo('');
    Keyboard.dismiss();
  };

  const confirmDelete = (id: string, label: string) =>
    Alert.alert('기록을 삭제할까요?', label, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => removeWorkout(id) },
    ]);

  return (
    <Screen title="운동" subtitle="주간 목표를 채우는 쪽이 꾸준함에 좋습니다">
      <Card style={{ marginTop: space(4) }}>
        <View style={s.weekRow}>
          <Ring progress={progress} color={colors.workout}>
            <Text style={s.ringValue}>{Math.round(progress * 100)}%</Text>
            <Text style={s.ringLabel}>주간 목표</Text>
          </Ring>
          <View style={{ flex: 1, gap: space(4) }}>
            <Stat
              label="최근 7일 운동"
              value={`${weekMinutes}`}
              unit={`/ ${profile.workoutGoalMin}분`}
              tone={colors.workout}
            />
            <Stat label="소모 칼로리" value={`${weekCalories}`} unit="kcal" />
            <Stat label="운동 횟수" value={`${weekItems.length}`} unit="회" />
          </View>
        </View>
      </Card>

      <SectionTitle>최근 7일</SectionTitle>
      <Card>
        <BarChart data={barData} width={chartWidth} color={colors.workout} />
        <Text style={s.legend}>막대는 하루 운동 시간(분)</Text>
      </Card>

      <SectionTitle>기록하기</SectionTitle>
      <Card>
        <DateBar value={date} onChange={setDate} />
        <View style={s.typeGrid}>
          {WORKOUT_TYPES.map((t) => {
            const active = t.name === type;
            return (
              <Pressable
                key={t.name}
                onPress={() => setType(t.name)}
                style={[s.typeChip, active && s.typeChipActive]}
              >
                <Ionicons
                  name={t.icon as React.ComponentProps<typeof Ionicons>['name']}
                  size={16}
                  color={active ? '#fff' : colors.sub}
                />
                <Text style={[s.typeText, active && s.typeTextActive]}>
                  {t.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={[s.fieldRow, { marginTop: space(4) }]}>
          <Field
            label="시간"
            unit="분"
            value={minutes}
            onChangeText={setMinutes}
            placeholder="30"
            keyboardType="number-pad"
          />
          <Field
            label="소모 칼로리"
            unit="kcal"
            value={calories}
            onChangeText={setCalories}
            placeholder={estimated ? `${estimated}` : '자동'}
            keyboardType="number-pad"
          />
        </View>
        {estimated && !calories ? (
          <Text style={s.autoHint}>
            비워 두면 체중 {bodyWeight.toFixed(0)}kg 기준 약 {estimated}kcal로
            저장됩니다
          </Text>
        ) : null}
        <View style={{ marginTop: space(3) }}>
          <Field
            label="메모"
            value={memo}
            onChangeText={setMemo}
            placeholder="선택 · 예: 벤치프레스 50kg 5세트"
            keyboardType="default"
          />
        </View>
        <Button label="저장" onPress={save} style={{ marginTop: space(4) }} />
      </Card>

      <SectionTitle>{date === today() ? '오늘' : date} 기록</SectionTitle>
      <Card>
        {dayItems.length === 0 ? (
          <Empty text="이 날은 기록이 없습니다" />
        ) : (
          dayItems.map((w) => (
            <Row
              key={w.id}
              title={`${w.type} ${w.minutes}분`}
              subtitle={[`${w.calories} kcal`, w.memo]
                .filter(Boolean)
                .join(' · ')}
              onLongPress={() => confirmDelete(w.id, `${w.type} ${w.minutes}분`)}
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: space(5) },
  ringValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  ringLabel: { fontSize: 10, color: colors.sub, marginTop: 1 },
  legend: { fontSize: 11, color: colors.sub, marginTop: space(2) },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space(2),
    marginTop: space(4),
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(1.5),
    paddingVertical: space(2),
    paddingHorizontal: space(3),
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  typeChipActive: { backgroundColor: colors.workout },
  typeText: { fontSize: 13, color: colors.sub, fontWeight: '600' },
  typeTextActive: { color: '#fff', fontWeight: '700' },
  fieldRow: { flexDirection: 'row', gap: space(3) },
  autoHint: { fontSize: 11, color: colors.sub, marginTop: space(2) },
});
