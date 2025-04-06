/**
 * Menetapkan (membuat atau memperbarui) cookie.
 *
 * @param name Nama cookie.
 * @param value Nilai cookie.
 * @param days Jumlah hari hingga cookie kedaluwarsa. Jika 0 atau tidak ditentukan,
 * cookie akan menjadi session cookie (kedaluwarsa saat browser ditutup).
 * @param path Path di mana cookie valid (default: '/').
 * @param domain Domain di mana cookie valid (default: domain saat ini).
 * @param secure Jika true, cookie hanya akan dikirim melalui koneksi HTTPS.
 * @param sameSite Mengontrol kapan cookie dikirim dengan permintaan lintas situs ('Strict', 'Lax', 'None').
 * 'None' memerlukan atribut 'secure'.
 */
export function setCookie(
  name: string,
  value: string,
  days?: number,
  path: string = '/',
  domain?: string,
  secure?: boolean,
  sameSite: 'Strict' | 'Lax' | 'None' = 'Lax'
): void {
  let expires = "";
  if (days) {
    const date = new Date();
    // Konversi hari ke milidetik dan tambahkan ke waktu saat ini
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=${path}`;

  if (domain) {
    cookieString += `; domain=${domain}`;
  }
  if (secure) {
    cookieString += `; secure`;
  }
  // Pastikan sameSite='None' hanya digunakan dengan secure=true
  if (sameSite) {
      if (sameSite === 'None' && !secure) {
          console.warn("SameSite='None' requires the 'secure' attribute to be set.");
          // Secara default ke 'Lax' jika tidak aman
          cookieString += `; SameSite=Lax`;
      } else {
          cookieString += `; SameSite=${sameSite}`;
      }
  }


  // Pastikan ini dijalankan di lingkungan browser
  if (typeof document !== 'undefined') {
    document.cookie = cookieString;
  } else {
    console.warn("document.cookie is not available. Make sure this code runs in a browser environment.");
  }
}

/**
 * Mendapatkan nilai cookie berdasarkan namanya.
 *
 * @param name Nama cookie yang ingin diambil.
 * @returns Nilai cookie sebagai string, atau null jika cookie tidak ditemukan.
 */
export function getCookie(name: string): string | null {
  // Pastikan ini dijalankan di lingkungan browser
  if (typeof document === 'undefined') {
     console.warn("document.cookie is not available. Make sure this code runs in a browser environment.");
     return null;
  }

  const nameEQ = encodeURIComponent(name) + "=";
  // Pisahkan semua cookie menjadi array
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    // Hapus spasi di awal
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    // Jika cookie ditemukan berdasarkan nama
    if (c.indexOf(nameEQ) === 0) {
      // Kembalikan nilai cookie setelah mendekode
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  // Jika tidak ada cookie yang cocok ditemukan
  return null;
}

/**
 * Menghapus cookie berdasarkan namanya.
 * Ini dilakukan dengan menetapkan tanggal kedaluwarsa di masa lalu.
 *
 * @param name Nama cookie yang ingin dihapus.
 * @param path Path cookie (harus sama dengan saat di-set, default: '/').
 * @param domain Domain cookie (harus sama dengan saat di-set).
 */
export function deleteCookie(name: string, path: string = '/', domain?: string): void {
  // Untuk menghapus cookie, set nilainya menjadi kosong dan tanggal kedaluwarsanya di masa lalu (-1 hari)
  // Pastikan path dan domain (jika ada) cocok dengan cookie yang asli.
  setCookie(name, '', -1, path, domain);
}