# Vercel 배포 가이드 (5분)

이 앱을 Vercel에 올리면 어디서든 (전화·태블릿·다른 PC) 인터넷만 있으면 접속 가능합니다.
배포는 무료(Hobby plan), 코드 푸시할 때마다 자동 재배포됩니다.

## 사전 준비

- GitHub 계정: `homanhan-glitch` (이미 있음)
- Vercel 계정: 없으면 GitHub로 1분 안에 가입

---

## 단계

### 1) Vercel 가입 (이미 있으면 건너뛰기)

https://vercel.com/signup → **"Continue with GitHub"** 클릭 → 권한 승인.

### 2) 새 프로젝트 만들기

https://vercel.com/new

1. 좌측 **"Import Git Repository"** 검색창에 `benzdream-crm` 입력
2. `homanhan-glitch/benzdream-crm` 옆 **"Import"** 클릭

만약 repo가 안 보이면 **"Adjust GitHub App Permissions"** 클릭 → benzdream-crm 추가.

### 3) 환경 변수 추가 (이게 제일 중요)

Configure Project 화면에서 **"Environment Variables"** 섹션 펼치기.
아래 2개를 추가:

| Name | Value |
|---|---|
| `NOTION_TOKEN` | `ntn_Z4715081597blj1NZBVujMWOEMBdgrxwnHsFqCfgi8o32L` |
| `NOTION_DB_ID` | `7bd45b37-6434-4ed2-8703-477c5a3fb7ce` |

**Production / Preview / Development 모두 체크.**

> ⚠️ 토큰 노출 방지: 이 두 값은 Vercel 환경변수에만. git에 커밋 절대 X (이미 .gitignore로 보호됨).

### 4) Deploy

**"Deploy"** 버튼 클릭. 1~2분 기다리면 빌드 완료.

성공하면 `benzdream-crm-xxx.vercel.app` 같은 URL이 나옵니다. 이게 영구 주소.

### 5) 도메인 (선택)

기본 `*.vercel.app` 주소가 마음에 안 들면:
- Vercel Project → Settings → Domains
- 본인 도메인 있으면 붙이기, 없으면 무료 `.vercel.app` 그대로 사용

---

## 이후 코드 수정 시

```bash
git add .
git commit -m "..."
git push
```

Vercel이 자동으로 재빌드 + 재배포. 보통 1분 안에 반영됨.

---

## 문제 발생 시 체크

| 증상 | 해결 |
|---|---|
| 페이지에 "Mock 데이터" 라벨 | Vercel 환경변수에 `NOTION_TOKEN` / `NOTION_DB_ID` 누락. Settings → Environment Variables 확인 |
| 빌드 실패 | Deployment 화면 로그 확인. 보통 의존성 문제 — 로컬 `npm install` 다시 |
| 카드 드래그해도 Notion에 반영 안 됨 | Notion Integration이 `🚗 BenzDream 영업 홈` 페이지에 공유돼있는지 확인 (Notion DB → ⋯ → Connections) |

---

## 보안 노트

- 이 사이트 URL을 알게 되면 누구나 고객 데이터를 볼 수 있습니다 (인증 없음)
- v0.3에 Vercel Authentication (Vercel Pro 기능) 또는 비밀번호 보호 추가 예정
- 그 전까지는 URL을 외부에 공유하지 마세요
