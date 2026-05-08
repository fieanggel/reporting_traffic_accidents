# reporting_traffic_accidents

Repository ini disusun sebagai monorepo sederhana:

- frontend/: aplikasi Next.js untuk pelaporan kecelakaan
- backend/: placeholder service API (siap diisi)

## Menjalankan Frontend

1. Masuk ke folder frontend:
   cd frontend
2. Install dependency:
   npm install
3. Jalankan development server:
   npm run dev

Aplikasi berjalan di http://localhost:3000.

```
reporting_traffic_accidents
├─ AGENTS.md
├─ backend
│  ├─ cmd
│  │  └─ main.go
│  ├─ config
│  │  └─ database.go
│  ├─ controllers
│  │  ├─ auth_controller.go
│  │  ├─ officer_controller.go
│  │  ├─ report_controller.go
│  │  └─ stats_controller.go
│  ├─ dockerfile
│  ├─ go.mod
│  ├─ go.sum
│  ├─ middleware
│  │  └─ jwt_auth.go
│  ├─ models
│  │  ├─ report.go
│  │  └─ user.go
│  ├─ public
│  │  └─ uploads
│  │     └─ reports
│  │        ├─ 1776949947821-099efc9h.png
│  │        └─ 1776950104834-totutlv5.png
│  ├─ README.md
│  ├─ repositories
│  │  ├─ report_repository.go
│  │  ├─ stats_repository.go
│  │  └─ user_repository.go
│  └─ routes
│     └─ api.go
├─ CLAUDE.md
├─ docker-compose.yml
├─ frontend
│  ├─ app
│  │  ├─ dashboard
│  │  │  ├─ layout.tsx
│  │  │  ├─ map
│  │  │  │  └─ page.tsx
│  │  │  ├─ officer
│  │  │  │  ├─ history
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ map
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ ReportDetailModal.tsx
│  │  │  └─ reports
│  │  │     └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ lapor
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ login
│  │  │  └─ page.tsx
│  │  └─ page.tsx
│  ├─ components
│  │  ├─ dashboard
│  │  │  ├─ OfficerSidebar.tsx
│  │  │  └─ Sidebar.tsx
│  │  ├─ Navbar.tsx
│  │  ├─ report
│  │  │  └─ LocationPickerMap.tsx
│  │  └─ ReportForm.tsx
│  ├─ dockerfile
│  ├─ eslint.config.mjs
│  ├─ lib
│  │  ├─ api
│  │  │  ├─ auth-service.ts
│  │  │  ├─ client.ts
│  │  │  ├─ officer-service.ts
│  │  │  ├─ report-service.ts
│  │  │  └─ stats-service.ts
│  │  ├─ auth
│  │  │  └─ session.ts
│  │  └─ s3
│  │     └─ upload-service.ts
│  ├─ next.config.ts
│  ├─ nginx.conf
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.mjs
│  ├─ public
│  │  ├─ file.svg
│  │  ├─ globe.svg
│  │  ├─ next.svg
│  │  ├─ vercel.svg
│  │  └─ window.svg
│  ├─ README.md
│  └─ tsconfig.json
├─ README.md
└─ tsconfig.json

```