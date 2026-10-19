# 다른 컴퓨터에서 GitHub에 올리는 방법

이 폴더는 **건강일기 앱의 소스 전체**입니다. (`node_modules` 같은 설치 파일은 빠져 있습니다.
GitHub에 올릴 때도 그 폴더는 필요 없습니다. 빌드할 때 서버가 알아서 받습니다.)

올리고 나면 GitHub가 **APK 파일을 자동으로 만들어 줍니다.**
올리는 컴퓨터에는 아무 개발 도구도 설치할 필요가 없습니다 (아래 **방법 A** 기준).

---

## 먼저: GitHub에 빈 저장소 만들기

1. [github.com/new](https://github.com/new) 접속 (계정이 없으면 먼저 가입)
2. **Repository name**: `health-diary`
3. **Public** 선택
   - 휴대폰에서 로그인 없이 APK를 받으려면 Public이 편합니다.
   - Private으로 해도 되지만, 폰에서 받을 때 GitHub 로그인을 해야 합니다.
4. 아래 체크박스(**Add a README file**, **Add .gitignore**, **Choose a license**)는 **모두 해제**
5. **Create repository** 클릭

---

## 방법 A. 브라우저로 올리기 (설치할 것 없음, 권장)

1. 방금 만든 저장소 첫 화면에서 **uploading an existing file** 링크 클릭
   (이미 지나갔다면 **Add file → Upload files**)
2. 이 폴더 안의 **내용물 전체**를 끌어다 놓기
   - 폴더 자체가 아니라 **안에 있는 파일과 폴더들**을 선택해서 끌어 놓습니다.
   - `app`, `src`, `assets`, `.github`, `package.json`, `app.json` 등이 모두 포함되어야 합니다.
3. 아래 **Commit changes** 클릭

### ⚠️ `.github` 폴더가 안 올라갔다면

점(`.`)으로 시작하는 폴더는 브라우저가 숨겨서 빠지는 경우가 있습니다.
올린 뒤 저장소 목록에 `.github`가 보이지 않으면 이렇게 직접 만들어 주세요.

1. **Add file → Create new file**
2. 파일 이름 칸에 그대로 입력: `.github/workflows/build-apk.yml`
   (슬래시를 치면 폴더가 자동으로 만들어집니다)
3. 이 폴더의 `.github/workflows/build-apk.yml` 파일을 **메모장으로 열어**
   내용을 전부 복사해서 붙여넣기
4. **Commit changes**

`.gitignore` 파일도 같은 방식으로 확인해 주세요. 없으면 동작에는 지장 없습니다.

---

## 방법 B. git 명령으로 올리기 (그 컴퓨터에 git이 깔려 있는 경우)

이 폴더에서 터미널(명령 프롬프트)을 열고 차례대로 실행합니다.
`내아이디` 부분만 본인 GitHub 아이디로 바꾸세요.

```bash
git config --global user.name "look360"
git config --global user.email "look360.kr@gmail.com"
git init
git add -A
git commit -m "건강일기 앱 첫 버전"
git branch -M main
git remote add origin https://github.com/내아이디/health-diary.git
git push -u origin main
```

push할 때 로그인 창이 뜨면 브라우저 로그인을 선택하면 됩니다.

---

## APK 만들기

올리기가 끝났으면 저장소 화면에서:

1. **Actions** 탭 클릭
2. 워크플로우를 처음 보는 경우 **I understand my workflows, go ahead and enable them** 버튼이 보이면 클릭
3. 왼쪽 목록에서 **Build APK** 선택
4. 오른쪽 **Run workflow** 버튼 → 다시 **Run workflow**
5. 5~10분 기다리기 (노란 점 → 초록 체크)
6. 끝난 실행을 클릭하고 맨 아래 **Artifacts** 의 `health-diary-apk` 를 받으면 zip 안에 APK가 들어 있습니다

### 휴대폰에서 바로 받고 싶다면 (Release 방식)

위 Artifacts는 zip이라 폰에서 열기 번거롭습니다.
**Releases**에 APK를 바로 붙이려면 태그를 만들면 됩니다.

브라우저만으로 하는 방법:

1. 저장소 첫 화면 오른쪽 **Releases** → **Create a new release**
2. **Choose a tag** 칸에 `v1.0.0` 입력 → **Create new tag: v1.0.0 on publish** 클릭
3. **Publish release**
4. Actions가 다시 돌고, 끝나면 그 Release 아래에 `health-diary-v1.0.0.apk` 가 붙습니다

안드로이드 폰 브라우저로 그 Release 페이지를 열고 APK를 누르면 설치됩니다.
설치할 때 "출처를 알 수 없는 앱" 허용을 한 번 물어봅니다.

---

## 참고

- 이 APK는 테스트용 키로 서명돼 있어 **본인 폰에 직접 설치하는 용도**로 충분합니다.
  플레이스토어 등록에는 별도의 서명 키(keystore)가 필요합니다.
- 아이폰은 이런 방식의 설치가 막혀 있습니다. **Expo Go** 앱으로는 그대로 쓸 수 있습니다
  (자세한 내용은 `README.md`).
- 앱을 고친 뒤 새 버전을 만들려면 `package.json`의 `version`을 올리고
  태그를 `v1.0.1`처럼 새로 붙이면 됩니다.
