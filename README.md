# hanseo-lost-found-frontend
Frontend for Hanseo University Lost &amp; Found Management System

## 프로젝트 소개

한서대학교 교내 분실물과 습득물을 통합 관리하고 수령 여부를 확인하는 웹 서비스의 프론트엔드입니다. 현재는 로컬 개발 환경과 시작 화면을 제공합니다.

## 기술 스택

- React, Vite, TypeScript
- npm, CSS
- 코드 검사: Oxlint

## 폴더 구조

```text
src/
├── app/          앱 구성 및 라우팅을 추가할 위치
├── components/   공통 UI 컴포넌트
├── pages/        화면 컴포넌트
├── services/     백엔드 API 설정 및 통신 코드
├── types/        TypeScript 타입 정의
├── styles/       전역 스타일
└── assets/       이미지와 정적 리소스
```

## 설치

Node.js 24 LTS를 권장합니다. Node.js 24.18.0과 npm 11.16.0에서 검증했습니다.
저장소 루트에서 잠금 파일 기준으로 의존성을 설치합니다.

```sh
npm ci
```

## 로컬 개발 서버

```sh
npm run dev
```

터미널에 표시되는 주소를 브라우저에서 엽니다. 기본 주소는 `http://localhost:5173`입니다.

## 빌드와 코드 검사

```sh
npm run build
npm run lint
```

빌드 명령은 TypeScript를 검사한 뒤 결과물을 `dist/`에 생성합니다.

## 백엔드 연동 예정

별도 저장소에서 개발하는 Java와 Spring Boot REST API는 명세 확정 후 `src/services/`에서 연동합니다.
연동할 때는 루트의 `.env.example`을 `.env.local`로 복사하고 `VITE_API_BASE_URL`에 백엔드 기본 주소를 입력한 뒤 개발 서버를 다시 시작합니다. 시작 화면은 이 값 없이 실행할 수 있습니다.

`.env.local`은 Git에서 제외됩니다. `VITE_`로 시작하는 값은 브라우저에 공개될 수 있으므로 비밀번호나 API 키는 서버에서 관리합니다.
