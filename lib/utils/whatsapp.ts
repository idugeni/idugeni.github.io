/**
 * Parse nomor telepon ke format WhatsApp link.
 * Handles berbagai format input:
 * - +62 858-0064-4055
 * - +62 812 3456 7890
 * - 08580064055
 * - 62858-0064-4055
 * - +628580064055
 */
export function parseWhatsAppNumber(phone: string): string {
  // Remove semua karakter non-digit
  let digits = phone.replace(/\D/g, "");

  // Jika dimulai dengan 0, ganti dengan 62
  if (digits.startsWith("0")) {
    digits = "62" + digits.slice(1);
  }

  // Jika tidak dimulai dengan 62, tambahkan
  if (!digits.startsWith("62")) {
    digits = "62" + digits;
  }

  return digits;
}

/**
 * Generate WhatsApp chat link dari nomor telepon.
 * @param phone - Nomor dalam format apapun
 * @param message - Pesan awal (opsional)
 */
export function getWhatsAppLink(phone: string, message?: string): string {
  const number = parseWhatsAppNumber(phone);
  const base = `https://wa.me/${number}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}
