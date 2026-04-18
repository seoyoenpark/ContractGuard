# Contract Guard — Frontend

NLP 기술을 이용한 계약서 독소조항 검토 서비스의 웹 클라이언트입니다.
---

## 1. 기술 스택

- **React 18** + React Router v6
- **axios** — HTTP 클라이언트, 요청 인터셉터로 Bearer 토큰 자동 첨부
- **CSS Modules** — 페이지별 스타일 격리
- **react-pdf** — 계약서 PDF 렌더링 및 bbox 오버레이
- **recharts** — 관리자 통계 차트

---

## 2. 디렉터리 구조

```
src/
├── api/                     # axios 기반 API 모듈
│   ├── auth.js              # 인증/사용자 (/api/auth/*, /api/users/me)
│   ├── contract.js          # 계약서 (/api/contracts/*)
│   ├── admin.js             # 관리자 (/api/admin/*)
│   └── contract.mock.js     # 개발용 목 API (백엔드 미구현 기간 대체)
├── components/              # 공통 컴포넌트 (Header, Sidebar 등)
├── pages/
│   ├── user/                # 로그인, 회원가입, 마이페이지, 검사 기록 등
│   └── admin/               # 대시보드, 사용자 목록, 통계
├── utils/                   # 토큰 관리, 포맷 헬퍼
└── assets/                  # 이미지
```

### 4.1 응답 포맷 전제

프론트는 설계서 7.3절에 따라 모든 응답이 아래 형태라고 가정하고 파싱합니다.

```json
{
  "success": true,
  "message": "...",
  "result_code": 200,
  "data": { ... }
}
```

**예외 두 건** — 설계서에 `data` 래핑 없이 top-level 키로 명시된 엔드포인트입니다.

- `GET /api/users/me` → top-level `user` 객체 (설계서 p.77)
- `GET /api/contracts` → top-level `contracts` 배열 (설계서 p.99)
- `GET /api/contracts/:id/analyze-status` → top-level `analyze_status` 객체 (설계서)
- `GET /api/contracts/:id/result` → top-level `contract_id`, `clause_summaries`, `toxic_assessment` 등

### 4.2 사용 중인 엔드포인트 목록

#### 인증 / 사용자 (`src/api/auth.js`)

| Method | URI | 설명 | 사용 페이지 |
|---|---|---|---|
| POST | `/api/auth/signup/request` | 이메일 인증 코드 발송 | Signup |
| POST | `/api/auth/signup/verify` | 이메일 인증 코드 검증 | Signup |
| POST | `/api/auth/signup/confirm` | 최종 회원가입 | Signup |
| POST | `/api/auth/login` | 로그인 | Login |
| POST | `/api/auth/logout` | 로그아웃 | (Header 메뉴) |
| POST | `/api/auth/find-id` | 아이디 찾기 | FindId |
| POST | `/api/auth/password-reset/request` | 비밀번호 재설정 메일 발송 | ResetPassword |
| POST | `/api/auth/password-reset/confirm` | 비밀번호 변경 | ResetPassword |
| GET | `/api/users/me` | 내 정보 조회 | Mypage |
| PATCH | `/api/users/me` | 내 정보 수정 (name, gender만 허용) | Mypage |
| DELETE | `/api/users/me` | 회원 탈퇴 (body: `{password}`) | Withdraw |

#### 계약서 (`src/api/contract.js`)

| Method | URI | 설명 | 사용 페이지 |
|---|---|---|---|
| POST | `/api/contracts` | 계약서 업로드 (multipart) | ContractInspect |
| POST | `/api/contracts/:id/analyze` | 분석 시작 | ContractInspect |
| GET | `/api/contracts/:id/analyze-status` | 분석 진행 상태 조회 (폴링) | ContractInspect |
| GET | `/api/contracts/:id/result` | 분석 결과 조회 | ContractInspect |
| GET | `/api/contracts` | 검사 기록 목록 | InspectionHistory |
| GET | `/api/contracts/:id` | 검사 기록 상세 | InspectionDetail |
| DELETE | `/api/contracts/:id` | 검사 기록 삭제 | InspectionHistory |

#### 관리자 (`src/api/admin.js`)

| Method | URI | 설명 | 사용 페이지 |
|---|---|---|---|
| GET | `/api/admin/status/summary` | 핵심 지표 요약 | AdminHome, Stats |
| GET | `/api/admin/status/usage` | AI 사용량 추이 | Stats |
| GET | `/api/admin/users` | 전체 회원 목록 | UserList |
| GET | `/api/admin/users/:id` | 회원 상세 조회 | - |
| PATCH | `/api/admin/users/:id/role` | 회원 권한 변경 | UserList |
| DELETE | `/api/admin/users/:id` | 회원 강제 탈퇴 | UserList |
| GET | `/api/admin/contracts/errors` | 에러 로그 조회 | Stats |

### 4.3 목(Mock) API 사용 방법

백엔드 미구현 기간에는 `contract.mock.js`가 axios와 동일한 `{status, data}` 형태의 응답을 반환합니다. 아래 파일의 import 경로만 교체하면 바로 동작합니다.

```diff
- import { getContractList } from '../../api/contract';
+ import { getContractList } from '../../api/contract.mock';
```

대상 파일:
- `src/pages/user/ContractInspect.jsx`
- `src/pages/user/InspectionHistory.jsx`
- `src/pages/user/InspectionDetail.jsx`

실서버 연동 복귀 시 import 경로만 되돌리면 됩니다.

---

## 5. 라우트 구성

| 경로 | 페이지 | 권한 |
|---|---|---|
| `/` | 메인 (계약서 업로드) | USER |
| `/login` | 로그인 | 공개 |
| `/signup` | 회원가입 | 공개 |
| `/find-id` | 아이디 찾기 | 공개 |
| `/reset-password` | 비밀번호 재설정 | 공개 |
| `/mypage` | 회원 정보 수정 | USER |
| `/history` | 검사 기록 목록 | USER |
| `/history/:contractId` | 검사 기록 상세 | USER |
| `/withdraw` | 회원 탈퇴 | USER |
| `/admin` | 관리자 대시보드 | ADMIN |
| `/admin/users` | 사용자 목록 관리 | ADMIN |
| `/admin/stats` | 통계 및 분석 | ADMIN |
| `/admin/stats/ai` | AI 모델 사용량 추이 | ADMIN |
