# Life Responsibility OS — 프로젝트 셋업 가이드

## 1. Firebase 프로젝트 설정

1. https://console.firebase.google.com 에서 새 프로젝트 생성
2. 다음 서비스 활성화:
   - **Firestore Database** (Native mode)
   - **Authentication** → 로그인 방법 → Google + 이메일/비밀번호 활성화
   - **Storage**

3. 웹 앱 등록 → 설정값을 `.env.local`에 복사

## 2. .env.local 설정

```bash
# Firebase Console > 프로젝트 설정 > 웹 앱 > SDK 구성
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc

# Firebase Console > 프로젝트 설정 > 서비스 계정 > 새 비공개 키 생성
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com

# Anthropic Console > API Keys
ANTHROPIC_API_KEY=sk-ant-...

# 임의 문자열 (크론 보안)
CRON_SECRET=your-random-secret
```

## 3. 개발 서버 실행

```bash
npm run dev
# → http://localhost:3000
```

## 4. Firestore 보안 규칙 배포

Firebase Console > Firestore > 규칙 탭에서 아래 규칙 붙여넣기:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      match /items/{itemId} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId)
          && request.resource.data.name is string
          && request.resource.data.name.size() > 0
          && request.resource.data.amount is number;
        allow update, delete: if isOwner(userId);
      }
      match /cards/{cardId} { allow read, write: if isOwner(userId); }
      match /notifications/{notifId} { allow read, write: if isOwner(userId); }
    }
  }
}
```
