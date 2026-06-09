# moneyplan — TODO

> 기준일: 2026-06-08  
> 코드 위치: `C:\Users\funjeju\Desktop\aiproject\moneyplan`

---

## ✅ 완료된 것들

### Phase 1 — MVP
- [x] Firebase Auth (Google + Email 로그인)
- [x] 항목 CRUD (수동 입력 폼)
- [x] 메인 대시보드 (총합 + 납부일 임박 + 만료 임박)
- [x] 카테고리별 뷰 (`/categories/[slug]`)
- [x] AI 텍스트 파싱 입력 (`/api/ai/parse`)

### Phase 2 — 확장
- [x] 이미지 업로드 + Claude Vision OCR 파싱
- [x] 신용카드 등록 + 혜택 달성률 계산
- [x] 카드별 대시보드 (`/cards`, `/cards/[id]`)
- [x] 해지·갱신 관리 전용 화면 (`/expiry`)
- [x] D-day 알림 — FCM 푸시 + 브라우저 알림
- [x] Vercel Cron (`/api/cron/notify`, 매일 오전 9시) — 90/30/7일 전 알림 Firestore 기록

### Phase 3 — 고도화 (일부)
- [x] AI 대화형 채팅 (`/api/ai/chat`)
- [x] 지출 분석 페이지 (`/stats`) — 카테고리별 월/연간 합계, Top5 항목

### 데모 & SEO
- [x] 30개 더미 데이터 (`lib/demo-data.ts`) — 전 카테고리, SEO 키워드 포함
- [x] 전체 데모 모드 (`/demo/*`) — 실제 앱 레이아웃 그대로 사용
  - `/demo` 대시보드, `/demo/items`, `/demo/items/[id]` (SSG)
  - `/demo/stats`, `/demo/expiry`, `/demo/notifications`, `/demo/cards`
  - `/demo/categories/[slug]` (SSG)
- [x] DemoSidebar + DemoBottomNav (실제 앱과 동일한 UI)
- [x] 빠른 미리보기 모달 (`DemoPreviewModal`) — 랜딩페이지에서 접근
- [x] 랜딩페이지 CTA: "로그인 없이 무료 체험" 버튼
- [x] sitemap.ts, robots.ts (Next.js 자동 생성)
- [x] JSON-LD SoftwareApplication 스키마
- [x] app/layout.tsx 전체 메타데이터 (OG, Twitter, keywords)

---

## 🔴 미완료 — 우선순위 높음

### 1. Cron 알림 — FCM 실제 발송 미연결
- **현황**: `/api/cron/notify`는 Firestore에 알림 기록만 저장함. FCM으로 실제 푸시 발송은 안 함
- **필요**: `/api/push` 엔드포인트 또는 cron 내부에서 FCM `sendMulticast` 호출
- **파일**: `app/api/cron/notify/route.ts` 수정 + `lib/firebase-admin.ts`의 FCM 초기화 확인

### 2. 보관함(Trash) / 아카이브 기능
- **현황**: 항목 삭제 Dialog에 "보관함으로 이동" 문구가 있지만 실제 보관함 페이지 없음
- **필요**: `isArchived: true`로 상태 변경 + `/archived` 페이지 (복원/영구삭제)
- **파일**: 삭제 핸들러 수정 + `app/(dashboard)/archived/page.tsx` 신규 생성

---

## 🟡 미완료 — 우선순위 보통

### 3. 월간·연간 리포트 페이지
- **현황**: `1_core.md.md` Phase 3에 있음. `app/(dashboard)/stats/page.tsx`는 단순 집계만
- **필요**: 월별 추이 차트, 전월 대비 증감, 연간 예측 금액
- **의존**: Recharts 또는 shadcn Chart 컴포넌트

### 4. 절약 분석
- **현황**: 미구현
- **내용**: 중복 구독 탐지 (같은 카테고리 유사 항목), 재약정 시 절약 예상액 계산
- **위치**: `/stats` 페이지 내 탭 또는 별도 섹션으로 추가

### 5. 데모 AI 채팅 페이지 (`/demo/chat`)
- **현황**: sitemap에는 있으나 실제 페이지 파일 없음
- **필요**: `app/demo/chat/page.tsx` + `components/demo/DemoChatPage.tsx`
- **내용**: DEMO_CHAT 더미 데이터로 채팅 UI 표시, 입력창은 잠금 상태

---

## 🟢 미완료 — 우선순위 낮음 (Phase 3 고도화)

### 6. 가족 그룹 관리
- `ownerType: 'spouse' | 'parent' | 'child'` 타입은 이미 정의됨
- 실제 UI/로직 없음 — 복잡도 높음, 나중에

### 7. 사업자 전용 대시보드
- `business` 카테고리는 있지만 사업자 특화 뷰 없음

### 8. OG 이미지 커스텀
- 현재 `/icons/icon-512x512.png` 사용 중 (정사각형 앱 아이콘)
- 실제 SNS 공유용 1200×630 OG 이미지 필요
