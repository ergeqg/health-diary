/**
 * 자주 먹는 음식의 1인분 기준 영양 정보(대략값).
 * 빠른 입력용 프리셋이며, 정확한 수치는 직접 수정해서 쓰면 된다.
 */
export type FoodPreset = {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
};

export const FOOD_PRESETS: FoodPreset[] = [
  { name: '밥 1공기', calories: 300, carbs: 68, protein: 6, fat: 1 },
  { name: '현미밥 1공기', calories: 290, carbs: 64, protein: 6, fat: 2 },
  { name: '김치찌개', calories: 250, carbs: 12, protein: 15, fat: 15 },
  { name: '된장찌개', calories: 180, carbs: 11, protein: 12, fat: 9 },
  { name: '삼겹살 200g', calories: 660, carbs: 0, protein: 34, fat: 58 },
  { name: '닭가슴살 100g', calories: 110, carbs: 0, protein: 23, fat: 2 },
  { name: '계란 1개', calories: 78, carbs: 1, protein: 6, fat: 5 },
  { name: '라면 1개', calories: 500, carbs: 79, protein: 10, fat: 16 },
  { name: '김밥 1줄', calories: 480, carbs: 76, protein: 13, fat: 12 },
  { name: '비빔밥', calories: 580, carbs: 90, protein: 18, fat: 14 },
  { name: '아메리카노', calories: 10, carbs: 2, protein: 0, fat: 0 },
  { name: '라떼', calories: 180, carbs: 16, protein: 9, fat: 9 },
  { name: '바나나 1개', calories: 95, carbs: 24, protein: 1, fat: 0 },
  { name: '사과 1개', calories: 95, carbs: 25, protein: 0, fat: 0 },
  { name: '그릭요거트', calories: 120, carbs: 7, protein: 15, fat: 3 },
  { name: '프로틴 셰이크', calories: 150, carbs: 6, protein: 25, fat: 2 },
  { name: '고구마 1개', calories: 130, carbs: 30, protein: 2, fat: 0 },
  { name: '샐러드', calories: 150, carbs: 10, protein: 5, fat: 9 },
];
