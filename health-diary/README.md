# 건강일기 (Health Diary)

체중·체성분, 운동, 식사 칼로리를 한 곳에서 기록하는 모바일 앱입니다.
iOS·안드로이드에서 같은 코드로 돌아가고, 기록은 휴대폰 안에만 저장됩니다.

## 화면 구성

| 탭 | 하는 일 |
|---|---|
| **홈** | 오늘의 순 칼로리(먹은 양 − 운동 소모), 2주 체중 그래프, 7일 섭취 막대, 주간 운동 요약 |
| **체중** | 체중·체지방률·근육량 기록, 7/30/90일 추이 그래프, BMI와 목표까지 남은 거리 |
| **운동** | 8가지 종목 선택 → 시간 입력, 소모 칼로리 자동 계산, 주간 목표 달성률 |
| **식사** | 끼니별(아침/점심/저녁/간식) 기록, 음식 프리셋 18종 빠른 입력, 탄·단·지 비율 |
| **설정** | 키·목표 체중·하루 목표 칼로리·주간 운동 목표, 기록 건수, 전체 삭제 |

기록을 **길게 누르면** 삭제 확인창이 뜹니다.

## 실행하기

### 1. 휴대폰에서 보기 (가장 쉬움)

휴대폰에 **Expo Go** 앱을 설치한 뒤(앱스토어/플레이스토어에서 무료), 아래 명령을 실행합니다.

```bash
npm start
```

터미널에 QR코드가 나옵니다. 안드로이드는 Expo Go 앱으로 QR을 스캔하고,
iPhone은 기본 카메라로 QR을 찍으면 앱이 열립니다.
PC와 휴대폰이 **같은 와이파이**에 있어야 합니다.

### 2. PC 브라우저에서 보기

```bash
npm run web
```

브라우저에서 바로 확인할 수 있습니다. 레이아웃 확인용이며, 실제 느낌은 휴대폰이 정확합니다.

### 3. GitHub에 올려서 APK 받기 (권장)

이 저장소에는 `.github/workflows/build-apk.yml`이 들어 있습니다.
코드를 GitHub에 올리면 **GitHub 서버가 알아서 APK를 만들어 줍니다.**
내 PC에 안드로이드 스튜디오나 JDK를 설치할 필요가 없습니다.

#### 3-1. 처음 한 번만: 내 이름 등록

```bash
git config --global user.name "look360"
git config --global user.email "look360.kr@gmail.com"
```

#### 3-2. 코드 커밋

```bash
git add -A && git commit -m "건강일기 앱 첫 버전"
```

#### 3-3. GitHub에 저장소 만들기

[github.com/new](https://github.com/new) 에서

- **Repository name**: `health-diary`
- **Public** 선택 (휴대폰에서 로그인 없이 APK를 받으려면 Public이 편합니다)
- "Add a README file" 등 아래 체크박스는 **모두 해제**

→ **Create repository**

#### 3-4. 코드 올리기

만들어진 화면에 나오는 주소로 바꿔서(아래 `내아이디` 부분) 실행합니다.

```bash
git remote add origin https://github.com/내아이디/health-diary.git
git branch -M main
git push -u origin main
```

처음 push할 때 GitHub 로그인 창이 뜹니다. 비밀번호 대신 브라우저 로그인을 선택하면 됩니다.

#### 3-5. APK 만들기

버전 태그를 올리면 빌드가 시작됩니다.

```bash
git tag v1.0.0 && git push origin v1.0.0
```

저장소의 **Actions** 탭에서 진행 상황이 보이고, 5~10분 뒤 끝납니다.
완료되면 **Releases** 메뉴에 `health-diary-v1.0.0.apk` 가 붙습니다.

> 태그 없이 테스트만 해보고 싶으면 Actions 탭 → 왼쪽 "Build APK" → 오른쪽 **Run workflow** 버튼.
> 이 경우 결과는 실행 화면 맨 아래 **Artifacts** 에 zip으로 들어갑니다(PC에서 받기 편한 방식).

다음 버전은 `package.json`의 `version`을 올리고 태그만 새로 붙이면 됩니다.

```bash
git tag v1.0.1 && git push origin v1.0.1
```

#### 3-6. 휴대폰에 설치

안드로이드 폰 브라우저로 Releases 페이지를 열고 `.apk` 파일을 누릅니다.
"출처를 알 수 없는 앱" 설치를 한 번 허용해 주면 설치됩니다.

이 APK는 테스트용 키로 서명돼 있어 **본인 폰에 직접 설치하는 용도**로 충분합니다.
플레이스토어에 올리려면 별도의 서명 키(keystore)를 만들어야 합니다.

### 4. iOS는?

아이폰은 APK 같은 방식의 설치가 막혀 있어서, 실기기에 넣으려면
애플 개발자 계정(연 $99)과 TestFlight가 필요합니다.
그 전까지는 **Expo Go**(위 1번 방법)로 아이폰에서도 그대로 쓸 수 있습니다.

### 참고: GitHub 없이 빌드하기

Expo 계정만 있으면 명령 한 줄로도 됩니다(빌드는 Expo 서버에서 진행).

```bash
npx eas build --platform android --profile preview
```

## 데이터가 저장되는 곳

`AsyncStorage`(휴대폰 내부 저장소)에 JSON으로 들어갑니다. 서버로 보내는 것은 없습니다.

| 키 | 내용 |
|---|---|
| `hd.weights.v1` | 체중 기록 (하루 한 건, 같은 날 다시 넣으면 대체) |
| `hd.workouts.v1` | 운동 기록 (하루 여러 건) |
| `hd.meals.v1` | 식사 기록 (하루 여러 건) |
| `hd.profile.v1` | 키, 목표 체중, 목표 칼로리, 주간 운동 목표 |

앱을 삭제하면 기록도 사라집니다. 기기 간 동기화나 백업이 필요하면 Supabase 같은
서버 저장소를 붙이는 작업이 따로 필요합니다.

## 소모 칼로리 계산식

운동 칼로리는 MET(대사당량) 방식으로 추정합니다.

```
소모 칼로리 = MET × 체중(kg) × 시간(h)
```

체중은 가장 최근 기록을 쓰고, 기록이 없으면 65kg으로 가정합니다.
직접 입력한 값이 있으면 그 값이 우선합니다. MET 표는 `src/workouts.ts`에 있습니다.

## 파일 구조

```
.github/workflows/
  build-apk.yml         GitHub에서 APK를 자동으로 만드는 설정
app/
  _layout.tsx           루트 (저장소 Provider + 네비게이션)
  (tabs)/_layout.tsx    하단 탭 5개 정의
  (tabs)/index.tsx      홈 대시보드
  (tabs)/weight.tsx     체중
  (tabs)/workout.tsx    운동
  (tabs)/meal.tsx       식사
  (tabs)/settings.tsx   설정
src/
  store.tsx             저장·불러오기, 날짜 헬퍼, BMI 계산
  types.ts              기록 데이터 모양
  theme.ts              색·여백·그림자
  workouts.ts           운동 종목과 MET 표
  foods.ts              음식 프리셋 18종
  components/ui.tsx     카드·버튼·입력칸 등 공용 부품
  components/charts.tsx 꺾은선·막대·원형 그래프 (SVG 직접 구현)
  components/screen.tsx 화면 공통 틀, 날짜 이동 바
```

## 바꾸고 싶을 때

- **색 바꾸기** → `src/theme.ts`의 `colors`
- **운동 종목 추가** → `src/workouts.ts`의 `WORKOUT_TYPES`에 한 줄 추가 (아이콘 이름은 Ionicons 기준)
- **음식 프리셋 추가** → `src/foods.ts`의 `FOOD_PRESETS`에 한 줄 추가
- **앱 이름·아이콘** → `app.json`의 `name`, `icon`

## 참고

여기 쓰인 BMI 기준과 칼로리 추정값은 일반적인 참고용 수치입니다.
질병 관리나 치료 목적의 판단에는 쓰지 마시고, 필요하면 의료진과 상의하세요.
