# ResponCepat Backend (Gin + GORM)

Backend API untuk sistem pelaporan insiden real-time (Kecelakaan dan Kemacetan).

## Stack

- Gin Gonic
- GORM + MySQL (siap untuk AWS RDS)
- JWT Authentication
- Auto Migrate database saat startup

## Struktur

```text
/backend
	/cmd
		main.go
	/config
		database.go
	/controllers
		auth_controller.go
		report_controller.go
		officer_controller.go
	/models
		user.go
		report.go
	/repositories
		user_repository.go
		report_repository.go
	/routes
		api.go
	/middleware
		jwt_auth.go
	/public
		/uploads
	.env
	go.mod
```

## Konfigurasi Environment

Isi file `.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=reportkecelakaan
JWT_SECRET=super-secret-jwt-key
PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

`CORS_ALLOWED_ORIGINS` dipakai agar frontend Next.js (port 3000) bisa mengakses API backend (port 8080).

## Jalankan Aplikasi

1. Masuk folder backend

```bash
cd backend
```

2. Install dependency

```bash
go mod tidy
```

3. Jalankan server

```bash
go run ./cmd
```

Server berjalan di `http://localhost:8080` (atau sesuai `PORT`).

## AutoMigrate

AutoMigrate dijalankan otomatis di `config/database.go` ketika aplikasi start:

- `models.User`
- `models.Report`

ID laporan dibuat otomatis lewat GORM hook `BeforeCreate` dengan format:

- `REP-YYYY-XXX`
- Contoh: `REP-2026-001`

## Ringkasan Endpoint

Base path: `/api`

### Public

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /reports` (submit laporan publik, dukung JSON atau multipart)
- `POST /uploads/presign` (mock presign ke endpoint upload lokal)
- `PUT /uploads/direct/*filePath` (upload file langsung ke `public/uploads`)

### Admin (JWT role: admin)

- `GET /admin/reports?status=&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
- `PUT /admin/reports/:id` (update status dan/atau assign officer)
- `POST /admin/officers`
- `GET /admin/officers`
- `GET /admin/officers/:id`
- `PUT /admin/officers/:id`
- `DELETE /admin/officers/:id`

### Officer (JWT role: officer)

- `GET /officer/reports?status=` (hanya laporan ter-assign ke officer login)
- `PUT /officer/reports/:id/complete` (ubah status jadi `Selesai`)
