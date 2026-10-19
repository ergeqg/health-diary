export type WeightEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  bodyFat?: number; // %
  muscle?: number; // kg
  memo?: string;
};

export type WorkoutSet = { name: string; weight?: number; reps?: number };

export type WorkoutEntry = {
  id: string;
  date: string;
  type: string; // 걷기, 달리기, 근력 ...
  minutes: number;
  calories: number;
  sets?: WorkoutSet[];
  memo?: string;
};

export type MealSlot = '아침' | '점심' | '저녁' | '간식';

export type MealEntry = {
  id: string;
  date: string;
  slot: MealSlot;
  name: string;
  calories: number;
  carbs?: number;
  protein?: number;
  fat?: number;
};

export type Profile = {
  heightCm?: number;
  targetWeight?: number;
  calorieGoal: number;
  workoutGoalMin: number; // 주간 목표 운동 시간(분)
};
