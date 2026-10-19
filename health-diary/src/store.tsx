import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  MealEntry,
  Profile,
  WeightEntry,
  WorkoutEntry,
} from './types';

const KEYS = {
  weights: 'hd.weights.v1',
  workouts: 'hd.workouts.v1',
  meals: 'hd.meals.v1',
  profile: 'hd.profile.v1',
};

const DEFAULT_PROFILE: Profile = { calorieGoal: 2000, workoutGoalMin: 150 };

export const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const today = () => toKey(new Date());

export function toKey(d: Date) {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 오늘을 포함해 과거 n일의 날짜 키를 오래된 순으로 반환 */
export function lastDays(n: number) {
  const out: string[] = [];
  const base = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    out.push(toKey(d));
  }
  return out;
}

export function formatDateLabel(key: string) {
  const d = fromKey(key);
  const week = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${week})`;
}

type Ctx = {
  ready: boolean;
  weights: WeightEntry[];
  workouts: WorkoutEntry[];
  meals: MealEntry[];
  profile: Profile;
  addWeight: (e: Omit<WeightEntry, 'id'>) => Promise<void>;
  removeWeight: (id: string) => Promise<void>;
  addWorkout: (e: Omit<WorkoutEntry, 'id'>) => Promise<void>;
  removeWorkout: (id: string) => Promise<void>;
  addMeal: (e: Omit<MealEntry, 'id'>) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  saveProfile: (p: Profile) => Promise<void>;
  clearAll: () => Promise<void>;
};

const StoreContext = createContext<Ctx | null>(null);

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const byDateDesc = (a: { date: string }, b: { date: string }) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : 0;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    (async () => {
      const [w, o, m, p] = await Promise.all([
        read<WeightEntry[]>(KEYS.weights, []),
        read<WorkoutEntry[]>(KEYS.workouts, []),
        read<MealEntry[]>(KEYS.meals, []),
        read<Profile>(KEYS.profile, DEFAULT_PROFILE),
      ]);
      setWeights(w.sort(byDateDesc));
      setWorkouts(o.sort(byDateDesc));
      setMeals(m.sort(byDateDesc));
      setProfile({ ...DEFAULT_PROFILE, ...p });
      setReady(true);
    })();
  }, []);

  const persist = useCallback(async (key: string, value: unknown) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }, []);

  const addWeight = useCallback(
    async (e: Omit<WeightEntry, 'id'>) => {
      setWeights((prev) => {
        // 같은 날짜 기록은 새 값으로 대체한다
        const rest = prev.filter((x) => x.date !== e.date);
        const next = [{ ...e, id: newId() }, ...rest].sort(byDateDesc);
        persist(KEYS.weights, next);
        return next;
      });
    },
    [persist]
  );

  const removeWeight = useCallback(
    async (id: string) => {
      setWeights((prev) => {
        const next = prev.filter((x) => x.id !== id);
        persist(KEYS.weights, next);
        return next;
      });
    },
    [persist]
  );

  const addWorkout = useCallback(
    async (e: Omit<WorkoutEntry, 'id'>) => {
      setWorkouts((prev) => {
        const next = [{ ...e, id: newId() }, ...prev].sort(byDateDesc);
        persist(KEYS.workouts, next);
        return next;
      });
    },
    [persist]
  );

  const removeWorkout = useCallback(
    async (id: string) => {
      setWorkouts((prev) => {
        const next = prev.filter((x) => x.id !== id);
        persist(KEYS.workouts, next);
        return next;
      });
    },
    [persist]
  );

  const addMeal = useCallback(
    async (e: Omit<MealEntry, 'id'>) => {
      setMeals((prev) => {
        const next = [{ ...e, id: newId() }, ...prev].sort(byDateDesc);
        persist(KEYS.meals, next);
        return next;
      });
    },
    [persist]
  );

  const removeMeal = useCallback(
    async (id: string) => {
      setMeals((prev) => {
        const next = prev.filter((x) => x.id !== id);
        persist(KEYS.meals, next);
        return next;
      });
    },
    [persist]
  );

  const saveProfile = useCallback(
    async (p: Profile) => {
      setProfile(p);
      await persist(KEYS.profile, p);
    },
    [persist]
  );

  const clearAll = useCallback(async () => {
    setWeights([]);
    setWorkouts([]);
    setMeals([]);
    setProfile(DEFAULT_PROFILE);
    await AsyncStorage.multiRemove(Object.values(KEYS));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      weights,
      workouts,
      meals,
      profile,
      addWeight,
      removeWeight,
      addWorkout,
      removeWorkout,
      addMeal,
      removeMeal,
      saveProfile,
      clearAll,
    }),
    [
      ready,
      weights,
      workouts,
      meals,
      profile,
      addWeight,
      removeWeight,
      addWorkout,
      removeWorkout,
      addMeal,
      removeMeal,
      saveProfile,
      clearAll,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('StoreProvider 안에서만 사용할 수 있습니다.');
  return ctx;
}

/* ---------- 계산 헬퍼 ---------- */

export function sum(ns: number[]) {
  return ns.reduce((a, b) => a + b, 0);
}

export function bmi(weightKg?: number, heightCm?: number) {
  if (!weightKg || !heightCm) return undefined;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function bmiLabel(v?: number) {
  if (v === undefined) return '-';
  if (v < 18.5) return '저체중';
  if (v < 23) return '정상';
  if (v < 25) return '과체중';
  return '비만';
}
