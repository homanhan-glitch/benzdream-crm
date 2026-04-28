# BenzDream CRM

벤츠드림 영업용 칸반 CRM 웹앱. Notion DB를 백엔드로 쓰는 카드 기반 고객 관리 도구.

**사용자**: 한호만 팀장 (BenzDream / 메르세데스-벤츠 영업)

## 스택

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + 다크 테마
- @dnd-kit (드래그앤드롭)
- @notionhq/client (서버사이드 Notion API)

## 고객 단계 (8단계 + 이탈)

신규리드 → 상담중 → 견적/시승 → 협상 → 계약(배정) → 출고일정 → 출고완료 → 사후관리 (+ 이탈 별도)

## 환경 변수

`.env.example`을 `.env.local`로 복사하고 값 채우기:

```
NOTION_TOKEN=ntn_...     # Notion Internal Integration 토큰
NOTION_DB_ID=...         # Notion 데이터베이스 ID (URL 끝 32자리)
```

`.env.local`은 `.gitignore`로 보호됨 — git에 절대 커밋되지 않음.

## 개발

```
npm install
npm run dev    # http://localhost:3000
```

토큰이 없거나 Notion 연결 실패 시 mock 데이터로 폴백 표시.

## 배포 (Vercel)

1. GitHub repo를 Vercel 프로젝트로 import
2. Settings → Environment Variables 에 `NOTION_TOKEN`, `NOTION_DB_ID` 등록
3. Deploy

## 현재 상태 (v0.1)

- [x] 단계별 칸반 컬럼 + 카드 표시
- [x] 카드 드래그(컬럼 이동, 화면상 이동만)
- [x] 카드 클릭 → 상세 사이드 패널
- [x] 핫리드/위험 색상 자동 계산
- [x] 마지막접촉 D+N, 다음액션 기한 표시
- [x] Mock 폴백 (Notion 연결 안 될 때)
- [ ] **v0.2**: 드래그 → Notion 단계 필드 실시간 쓰기
- [ ] **v0.2**: 카드 편집 → Notion 동기화
- [ ] 골든타임 알림 (시승 후 7일 등)

## 주의

- 고객 정보는 Notion에 있고, 이 앱은 뷰어/조작 레이어
- 토큰/고객 PII는 절대 코드에 박지 말 것
