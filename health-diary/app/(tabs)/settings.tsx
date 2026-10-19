import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/screen';
import {
  Button,
  Card,
  Field,
  Row,
  SectionTitle,
} from '../../src/components/ui';
import { useStore } from '../../src/store';
import { colors, space } from '../../src/theme';

export default function SettingsScreen() {
  const { profile, saveProfile, weights, workouts, meals, clearAll } =
    useStore();

  const [height, setHeight] = useState('');
  const [target, setTarget] = useState('');
  const [calorieGoal, setCalorieGoal] = useState('');
  const [workoutGoal, setWorkoutGoal] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setHeight(profile.heightCm ? `${profile.heightCm}` : '');
    setTarget(profile.targetWeight ? `${profile.targetWeight}` : '');
    setCalorieGoal(`${profile.calorieGoal}`);
    setWorkoutGoal(`${profile.workoutGoalMin}`);
  }, [profile]);

  const save = async () => {
    await saveProfile({
      heightCm: height ? Number(height) : undefined,
      targetWeight: target ? Number(target) : undefined,
      calorieGoal: Number(calorieGoal) || 2000,
      workoutGoalMin: Number(workoutGoal) || 150,
    });
    Keyboard.dismiss();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const confirmClear = () =>
    Alert.alert(
      '모든 기록을 지울까요?',
      '체중·운동·식사 기록과 목표 설정이 모두 삭제되며, 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '전체 삭제',
          style: 'destructive',
          onPress: () => clearAll(),
        },
      ]
    );

  return (
    <Screen title="설정" subtitle="목표를 넣으면 홈 화면 계산이 정확해집니다">
      <SectionTitle>내 정보</SectionTitle>
      <Card>
        <View style={s.fieldRow}>
          <Field
            label="키"
            unit="cm"
            value={height}
            onChangeText={setHeight}
            placeholder="172"
          />
          <Field
            label="목표 체중"
            unit="kg"
            value={target}
            onChangeText={setTarget}
            placeholder="65"
          />
        </View>
        <View style={[s.fieldRow, { marginTop: space(3) }]}>
          <Field
            label="하루 목표 칼로리"
            unit="kcal"
            value={calorieGoal}
            onChangeText={setCalorieGoal}
            placeholder="2000"
            keyboardType="number-pad"
          />
          <Field
            label="주간 목표 운동"
            unit="분"
            value={workoutGoal}
            onChangeText={setWorkoutGoal}
            placeholder="150"
            keyboardType="number-pad"
          />
        </View>
        <Button label="저장" onPress={save} style={{ marginTop: space(4) }} />
        {saved ? <Text style={s.savedText}>저장했습니다</Text> : null}
        <Text style={s.help}>
          세계보건기구 권고는 주 150분 이상의 중강도 운동입니다. 체중 감량이
          목표라면 하루 목표 칼로리를 평소보다 300~500kcal 낮게 잡는 편이
          일반적입니다.
        </Text>
      </Card>

      <SectionTitle>저장된 기록</SectionTitle>
      <Card>
        <Row title="체중 기록" right={<Count n={weights.length} />} />
        <Row title="운동 기록" right={<Count n={workouts.length} />} />
        <Row title="식사 기록" right={<Count n={meals.length} />} />
        <Text style={s.help}>
          기록은 이 휴대폰 안에만 저장되고 서버로 보내지 않습니다. 앱을 삭제하면
          기록도 함께 지워집니다.
        </Text>
      </Card>

      <SectionTitle>데이터</SectionTitle>
      <Card>
        <Button label="모든 기록 삭제" tone="danger" onPress={confirmClear} />
      </Card>

      <Text style={s.version}>건강일기 v1.0.0</Text>
    </Screen>
  );
}

function Count({ n }: { n: number }) {
  return <Text style={s.count}>{n}건</Text>;
}

const s = StyleSheet.create({
  fieldRow: { flexDirection: 'row', gap: space(3) },
  savedText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: space(2),
  },
  help: {
    fontSize: 12,
    color: colors.sub,
    lineHeight: 19,
    marginTop: space(4),
  },
  count: { fontSize: 14, fontWeight: '700', color: colors.text },
  version: {
    fontSize: 11,
    color: colors.sub,
    textAlign: 'center',
    marginTop: space(8),
  },
});
