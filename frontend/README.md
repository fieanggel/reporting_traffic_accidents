# ResponCepat Frontend (Next.js)

Frontend ini sudah terintegrasi dengan backend Gin + GORM untuk:

- Login JWT (Admin dan Petugas)
- Protected route dashboard berdasarkan role
- Logout dari sidebar/dashboard dan navbar publik
- Submit laporan publik + upload foto
- Admin melihat dan update laporan (status + assign petugas)
- Petugas melihat assignment aktif/riwayat dan update status selesai

## Environment

File `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

## Menjalankan Aplikasi

1. Jalankan backend dulu (port 8080)

```bash
cd ../backend
go run ./cmd
```

2. Jalankan frontend (port 3000)

```bash
cd ../frontend
npm install
npm run dev
```

3. Buka `http://localhost:3000`

## Alur Test Cepat

1. Register user admin/officer dari endpoint backend (`POST /api/auth/register`) via Postman/Insomnia.
2. Login dari halaman `/login` menggunakan user yang sudah dibuat.
3. Cek redirect role:
	- Admin -> `/dashboard`
	- Petugas -> `/dashboard/officer`
4. Coba logout dari sidebar dashboard atau navbar publik.
5. Kirim laporan baru dari halaman `/lapor`, lalu cek data masuk di dashboard admin.
