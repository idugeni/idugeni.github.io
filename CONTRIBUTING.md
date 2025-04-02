# Panduan Kontribusi

Terima kasih telah mempertimbangkan untuk berkontribusi pada proyek ini! Setiap kontribusi sangat dihargai dan akan membantu membuat proyek ini menjadi lebih baik.

## Proses Kontribusi

1. Fork repository ini
2. Clone fork Anda ke local machine
3. Buat branch baru untuk fitur atau perbaikan Anda:
   ```bash
   git checkout -b feature/NamaFitur
   ```
   atau
   ```bash
   git checkout -b fix/NamaPerbaikan
   ```
4. Lakukan perubahan yang diperlukan
5. Commit perubahan Anda menggunakan conventional commits:
   ```bash
   git commit -m "feat: menambahkan fitur baru"
   ```
6. Push ke branch Anda:
   ```bash
   git push origin feature/NamaFitur
   ```
7. Buat Pull Request ke repository utama

## Conventional Commits

Kami menggunakan format Conventional Commits untuk pesan commit:

```
<type>[optional scope]: <description>

[optional body]
[optional footer]
```

Tipe yang tersedia:
- `feat`: Fitur baru
- `fix`: Perbaikan bug
- `docs`: Perubahan dokumentasi
- `style`: Perubahan formatting
- `refactor`: Refactoring kode
- `test`: Menambah/update test
- `chore`: Maintenance

## Standar Kode

- Gunakan TypeScript untuk semua file JavaScript
- Ikuti ESLint configuration yang ada
- Pastikan kode ter-format dengan Prettier
- Tulis komentar yang jelas dan dokumentasi yang baik
- Tambahkan unit test untuk fitur baru

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Jalankan development server:
   ```bash
   npm run dev
   ```

3. Pastikan semua test passed:
   ```bash
   npm run test
   ```

## Pull Request Guidelines

- Update CHANGELOG.md dengan perubahan yang Anda buat
- Pastikan semua test passed
- Review kode Anda sendiri sebelum submit
- Tambahkan deskripsi yang jelas tentang perubahan
- Link ke issue terkait jika ada

## Pelaporan Bug

Gunakan GitHub Issues untuk melaporkan bug. Sertakan:
- Deskripsi bug yang jelas
- Langkah-langkah untuk mereproduksi
- Expected behavior
- Screenshots jika diperlukan
- Informasi environment

## Feature Requests

Untuk mengusulkan fitur baru:
- Gunakan GitHub Issues
- Jelaskan fitur dengan detail
- Jelaskan kenapa fitur ini diperlukan
- Berikan contoh use case

## Pertanyaan

Untuk pertanyaan umum:
- Buka diskusi di GitHub Discussions
- Kirim email ke support@oldsoul.id
- Bergabung dengan Discord community

## Code of Conduct

Proyek ini mengadopsi Contributor Covenant sebagai code of conduct. Kami berharap semua kontributor mematuhinya. Silakan baca [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) untuk detail.

## License

Dengan berkontribusi pada proyek ini, Anda setuju bahwa kontribusi Anda akan dilisensikan di bawah MIT License.