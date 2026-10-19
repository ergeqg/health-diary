import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { BarChart, LineChart, Ring } from '../../src/components/charts';
import { Screen } from '../../src/components/screen';
import { Card, Empty, SectionTitle, Stat } from '../../src/components/ui';
import {
  bmi,
  bmiLabel,
  formatDateLabel,
  fromKey,
  lastDays,
  sum,
  today,
  useStore,
} from '../../src/store';
import { colors, radius, space } from '../../src/theme';

export default function HomeScreen() {
  const { ready, weights, workouts, meals, profile } = useStore();
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - space(4) * 4, 240);
  const router = useRouter();
  const day = today();

  const week = useMemo(() => lastDays(7), []);

  const todayMeals = meals.filter((m) => m.date === day);
  const todayWorkouts = workouts.filter((w) => w.date === day);
  const intake = sum(todayMeals.map((m) => m.calories));
  const burned = sum(todayWorkouts.map((w) => w.calories));
  const net = intake - burned;
  const remain = profile.calorieGoal - net;

  const latest = weights[0];
  const weekAgo = weights.find((w) => w.date <= week[0]);
  const weightDiff =
    latest && weekAgo ? latest.weight - weekAgo.weight : undefined;
  const bmiValue = bmi(latest?.weight, profile.heightCm);

  const weightSeries = useMemo(() => {
    const days = lastDays(14);
    const map = new Map(weights.map((w) => [w.date, w.weight]));
    return days.map((d) => ({
      label: `${fromKey(d).getMonth() + 1}/${fromKey(d).getDate()}`,
      value: map.get(d) ?? null,
    }));
  }, [weights]);

  const calorieSeries = week.map((d) => ({
    label: `${fromKey(d).getDate()}`,
    value: sum(meals.filter((m) => m.date === d).map((m) => m.calories)),
  }));

  const weekMinutes = sum(
    workouts.filter((w) => week.includes(w.date)).map((w) => w.minutes)
  );

  if (!ready) {
    return (
      <Screen title="건강일기">
        <Empty text="불러오는 중…" />
      </Screen>
    );
  }

  const isEmpty =
    weights.length === 0 && workouts.length === 0 && meals.length === 0;

  return (
    <Screen title="건강일기" subtitle={formatDateLabel(day)}>
      <Card style={{ marginTop: space(4) }}>
        <View style={s.topRow}>
          <Ring
            progress={profile.calorieGoal ? net / profile.calorieGoal : 0}
            color={remain >= 0 ? colors.primary : colors.danger}
            size={116}
          >
            <Text style={s.ringValue}>{Math.max(net, 0)}</Text>
            <Text style={s.ringLabel}>kcal</Text>
          </Ring>
          <View style={{ flex: 1, gap: space(3.5) }}>
            <Stat label="먹은 칼로리" value={`${intake}`} unit="kcal" tone={colors.meal} />
            <Stat
              label="운동 소모"
              value={`${burned}`}
              unit="kcal"
              tone={colors.workout}
            />
            <Stat
              label={remain >= 0 ? '목표까지 남음' : '목표 초과'}
              value={`${Math.abs(remain)}`}
              unit="kcal"
              tone={remain >= 0 ? colors.primary : colors.danger}
            />
          </View>
        </View>
      </Card>

      <View style={s.quickRow}>
        <Quick
          label="체중 재기"
          icon="body"
          color={colors.weight}
          onPress={() => router.push('/weight')}
        />
        <Quick
          label="운동 추가"
          icon="barbell"
          color={colors.workout}
          onPress={() => router.push('/workout')}
        />
        <Quick
          label="식사 추가"
          icon="restaurant"
          color={colors.meal}
          onPress={() => router.push('/meal')}
        />
      </View>

      {isEmpty ? (
        <Card style={{ marginTop: space(5) }}>
          <Text style={s.welcomeTitle}>처음이신가요?</Text>
          <Text style={s.welcomeText}>
            위의 세 버튼으로 오늘의 체중·운동·식사를 기록해 보세요. 기록이
            쌓이면 아래에 변화 그래프가 그려집니다. 설정 탭에서 키와 목표
            체중을 넣으면 BMI와 목표까지 남은 거리도 함께 보여 줍니다.
          </Text>
        </Card>
      ) : null}

      <SectionTitle>체중 변화 (2주)</SectionTitle>
      <Card>
        <LineChart
          data={weightSeries}
          width={chartWidth}
          color={colors.weight}
          goal={profile.targetWeight}
        />
        <View style={[s.statRow, { marginTop: space(3) }]}>
          <Stat
            label="현재"
            value={latest ? latest.weight.toFixed(1) : '-'}
            unit="kg"
          />
          <Stat
            label="1주 변화"
            value={
              weightDiff === undefined
                ? '-'
                : `${weightDiff > 0 ? '+' : ''}${weightDiff.toFixed(1)}`
            }
            unit="kg"
            tone={
              weightDiff === undefined
                ? colors.text
                : weightDiff > 0
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
      </Card>

      <SectionTitle>최근 7일 섭취</SectionTitle>
      <Card>
        <BarChart
          data={calorieSeries}
          width={chartWidth}
          color={colors.meal}
          goal={profile.calorieGoal}
        />
        <Text style={s.legend}>점선은 하루 목표 {profile.calorieGoal}kcal</Text>
      </Card>

      <SectionTitle>이번 주 운동</SectionTitle>
      <Card>
        <View style={s.statRow}>
          <Stat
            label="운동 시간"
            value={`${weekMinutes}`}
            unit={`/ ${profile.workoutGoalMin}분`}
            tone={colors.workout}
          />
          <Stat
            label="운동 횟수"
            value={`${workouts.filter((w) => week.includes(w.date)).length}`}
            unit="회"
          />
          <Stat
            label="오늘 운동"
            value={`${sum(todayWorkouts.map((w) => w.minutes))}`}
            unit="분"
          />
        </View>
      </Card>
    </Screen>
  );
}

function Quick({
  label,
  icon,
  color,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.quick, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={[s.quickIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={18} color="#fff" />
      </View>
      <Text style={s.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', gap: space(5) },
  ringValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  ringLabel: { fontSize: 11, color: colors.sub },
  quickRow: { flexDirection: 'row', gap: space(3), marginTop: space(3) },
  quick: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: space(3.5),
    alignItems: 'center',
    gap: space(2),
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { fontSize: 12, fontWeight: '700', color: colors.text },
  statRow: { flexDirection: 'row', gap: space(3) },
  legend: { fontSize: 11, color: colors.workout, marginTop: space(2) },
  welcomeTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  welcomeText: {
    fontSize: 13,
    color: colors.sub,
    lineHeight: 20,
    marginTop: space(2),
  },
});
