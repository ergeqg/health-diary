/** 운동 종류별 MET(대사당량). 소모 칼로리 자동 계산에 쓴다. */
export const WORKOUT_TYPES = [
  { name: '걷기', met: 3.5, icon: 'walk' },
  { name: '달리기', met: 9.8, icon: 'footsteps' },
  { name: '자전거', met: 7.5, icon: 'bicycle' },
  { name: '근력', met: 5.0, icon: 'barbell' },
  { name: '수영', met: 8.3, icon: 'water' },
  { name: '등산', met: 6.5, icon: 'trail-sign' },
  { name: '요가', met: 2.8, icon: 'flower' },
  { name: '기타', met: 4.0, icon: 'ellipsis-horizontal' },
] as const;

export type WorkoutTypeName = (typeof WORKOUT_TYPES)[number]['name'];

export const metOf = (type: string) =>
  WORKOUT_TYPES.find((t) => t.name === type)?.met ?? 4.0;

/** 소모 칼로리 = MET × 체중(kg) × 시간(h) */
export function estimateCalories(
  type: string,
  minutes: number,
  weightKg = 65
) {
  return Math.round(metOf(type) * weightKg * (minutes / 60));
}
