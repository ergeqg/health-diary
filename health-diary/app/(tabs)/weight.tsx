import React, { useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LineChart } from '../../src/components/charts';
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
import {
  bmi,
  bmiLabel,
  fromKey,
  lastDays,
  today,
  useStore,
} from '../../src/store';
import { colors, space } from '../../src/theme';

const RANGES = ['7일', '30일', '90일'] as const;
const RANGE_DAYS: Record<(typeof RANGES)[number], number> = {
  '7일': 7,
  '30일': 30,
  '90일': 90,
};

export default function WeightScreen() {
  const { weights, profile, addWeight, removeWeight } = useStore();
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - space(4) * 4, 240);

  const [date, setDate] = useState(today());
  const [weight, setWeight] = useState('');
  const [fat, setFat] = useState('');
  const [muscle, setMuscle] = useState('');
  const [range, setRange] = useState<(typeof RANGES)[number]>('30일');

  const latest = weights[0];
  const prev = weights[1];
  const diff =
    latest && prev ? latest.weight - prev.weight : undefined;
  const toGoal =
    latest && profile.targetWeight
      ? latest.weight - profile.targetWeight
      : undefined;
  const bmiValue = bmi(latest?.weight, profile.heightCm);

  const series = useMemo(() => {
    const days = lastDays(RANGE_DAYS[range]);
    const map = new Map(weights.map((w) => [w.date, w.weight]));
    return days.map((d) => ({
      label: `${fromKey(d).getMonth() + 1}/${fromKey(d).getDate()}`,
      value: map.get(d) ?? null,
    }));
  }, [weights, range]);

  const save = () => {
    const w = Number(weight);
    if (!w || w <= 0) {
      Alert.alert('체중을 입력해 주세요', '예: 68.5');
      return;
    }
    addWeight({
      date,
      weight: w,
      bodyFat: fat ? Number(fat) : undefined,
      muscle: muscle ? Number(muscle) : undefined,
    });
    setWeight('');
    setFat('');
    setMuscle('');
    Keyboard.dismiss();
  };

  const confirmDelete = (id: string, label: string) =>
    Alert.alert('기록을 삭제할까요?', label, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => removeWeight(id) },
    ]);

  return (
    <Screen title="체중" subtitle="하루 한 번, 같은 시간에 재면 가장 정확합니다">
      <Card style={{ marginTop: space(4) }}>
        <View style={s.statRow}>
          <Stat
            label="현재 체중"
            value={latest ? latest.weight.toFixed(1) : '-'}
            unit="kg"
          />
          <Stat
            label="직전 대비"
            value={
              diff === undefined
                ? '-'
                : `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`
            }
            unit="kg"
            tone={
              diff === undefined
                ? colors.text
                : diff > 0
                  ? colors.danger
                  : colors.primary
            }
          />
          <Stat
            label="BMI"
            value={bmiValue ? bmiValue.toFixed(1) : '-'}
            unit={bmiValue ? bmiLabel(bmiValue) : undefined}
          />
        </View>
        {toGoal !== undefined ? (
          <Text style={s.goalText}>
            목표 {profile.targetWeight}kg 까지{' '}
            <Text style={{ color: colors.primary, fontWeight: '800' }}>
              {Math.abs(toGoal).toFixed(1)}kg
            </Text>{' '}
            {toGoal > 0 ? '남았습니다' : '넘었습니다'}
          </Text>
        ) : (
          <Text style={s.goalText}>
            설정 탭에서 키와 목표 체중을 넣으면 BMI와 남은 거리를 보여줍니다
          </Text>
        )}
      </Card>

      <SectionTitle
        right={
          <View style={{ width: 170 }}>
            <Segmented options={RANGES} value={range} onChange={setRange} />
          </View>
        }
      >
        변화 추이
      </SectionTitle>
      <Card>
        <LineChart
          data={series}
          width={chartWidth}
          goal={profile.targetWeight}
          color={colors.weight}
        />
        {profile.targetWeight ? (
          <Text style={s.legend}>— 점선은 목표 체중</Text>
        ) : null}
      </Card>

      <SectionTitle>기록하기</SectionTitle>
      <Card>
        <DateBar value={date} onChange={setDate} />
        <View style={[s.fieldRow, { marginTop: space(4) }]}>
          <Field
            label="체중"
            unit="kg"
            value={weight}
            onChangeText={setWeight}
            placeholder="68.5"
          />
          <Field
            label="체지방률"
            unit="%"
            value={fat}
            onChangeText={setFat}
            placeholder="선택"
          />
          <Field
            label="근육량"
            unit="kg"
            value={muscle}
            onChangeText={setMuscle}
            placeholder="선택"
          />
        </View>
        <Button label="저장" onPress={save} style={{ marginTop: space(4) }} />
      </Card>

      <SectionTitle>지난 기록</SectionTitle>
      <Card>
        {weights.length === 0 ? (
          <Empty text="아직 기록이 없습니다" />
        ) : (
          weights.slice(0, 30).map((w) => (
            <Row
              key={w.id}
              title={`${w.weight.toFixed(1)} kg`}
              subtitle={[
                w.date,
                w.bodyFat !== undefined ? `체지방 ${w.bodyFat}%` : null,
                w.muscle !== undefined ? `근육 ${w.muscle}kg` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
              onLongPress={() => confirmDelete(w.id, `${w.date} ${w.weight}kg`)}
            />
          ))
        )}
        {weights.length > 0 ? (
          <Text style={s.hint}>기록을 길게 누르면 삭제됩니다</Text>
        ) : null}
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  statRow: { flexDirection: 'row', gap: space(3) },
  goalText: {
    marginTop: space(4),
    fontSize: 13,
    color: colors.sub,
    lineHeight: 19,
  },
  fieldRow: { flexDirection: 'row', gap: space(3) },
  legend: { fontSize: 11, color: colors.workout, marginTop: space(2) },
  hint: {
    fontSize: 11,
    color: colors.sub,
    marginTop: space(3),
    textAlign: 'center',
  },
});
