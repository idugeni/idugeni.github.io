import { PublicLayout } from "@/components/layout/public-layout";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { TableOfContents, type TocItem } from "@/components/ui/table-of-contents";
import { Shield, Database, Cookie, UserCheck, Mail, Clock } from "@/lib/icons";
import { siteConfig } from "@/lib/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Kebijakan Privasi IRNK Codes — Informasi tentang pengumpulan, penggunaan, dan perlindungan data pribadi Anda sesuai peraturan perlindungan data Indonesia.",
  robots: {
    index: false,
    follow: true,
  },
};

const privacyToc: TocItem[] = [
  { id: "data-collection", label: "Data yang Dikumpulkan", number: "01" },
  { id: "data-usage", label: "Penggunaan Data", number: "02" },
  { id: "cookies", label: "Cookies", number: "03" },
  { id: "data-security", label: "Keamanan Data", number: "04" },
  { id: "user-rights", label: "Hak Pengguna", number: "05" },
  { id: "data-retention", label: "Penyimpanan Data", number: "06" },
  { id: "contact-privacy", label: "Kontak Privasi", number: "07" },
];

export default function Privacy() {
  return (
    <PublicLayout>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Privacy Policy", url: "/privacy" },
        ]}
      />
      <div className="pt-4 pb-16 min-h-screen relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TableOfContents items={privacyToc} title="TABLE_OF_CONTENTS" />
          {/* Header */}
          <ScrollReveal>
            <div className="mb-12 max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-primary" />
                <h1 className="text-4xl md:text-5xl font-orbitron font-bold neon-text">
                  PRIVACY_POLICY
                </h1>
              </div>
              <p className="font-mono text-sm text-muted-foreground">
                Kebijakan Privasi // Data Protection Framework
              </p>
              <div className="flex items-center gap-2 mt-4 font-mono text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>LAST_UPDATED: Mei 2026</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Introduction */}
          <ScrollReveal delay={100}>
            <div className="glass-card p-8 mb-8 max-w-4xl">
              <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi
                informasi pribadi Anda saat menggunakan website ini. Kami berkomitmen untuk menjaga
                kerahasiaan dan keamanan data Anda sesuai dengan peraturan perlindungan data yang berlaku
                di Indonesia.
              </p>
            </div>
          </ScrollReveal>

          {/* Section 1 */}
          <ScrollReveal delay={150}>
            <div id="data-collection" className="glass-card p-8 mb-8 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6 border-b border-primary/20 pb-4">
                <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center font-orbitron text-primary text-sm font-bold">
                  01
                </div>
                <h2 className="text-xl font-orbitron font-bold text-primary">
                  DATA_COLLECTION // Data yang Dikumpulkan
                </h2>
              </div>
              <div className="space-y-6 font-mono text-sm text-muted-foreground">
                <div>
                  <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    1.1 Data yang Anda Berikan Secara Langsung
                  </h3>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">▸</span>
                      <span><span className="text-foreground">Nama lengkap</span> — diberikan melalui formulir kontak</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">▸</span>
                      <span><span className="text-foreground">Alamat email</span> — untuk keperluan komunikasi dan respons</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">▸</span>
                      <span><span className="text-foreground">Pesan kontak</span> — isi pesan yang Anda kirimkan melalui formulir</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">▸</span>
                      <span><span className="text-foreground">Nomor WhatsApp</span> — jika Anda memilih untuk memberikannya (opsional)</span>
                    </li>
                  </ul>
                </div>
                <div className="border-t border-primary/10 pt-4">
                  <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    1.2 Data yang Dikumpulkan Secara Otomatis
                  </h3>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">▸</span>
                      <span><span className="text-foreground">Page views</span> — halaman yang Anda kunjungi di website ini</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">▸</span>
                      <span><span className="text-foreground">Alamat IP</span> — dikumpulkan untuk keperluan analytics dan keamanan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">▸</span>
                      <span><span className="text-foreground">Referrer URL</span> — sumber dari mana Anda mengakses website</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">▸</span>
                      <span><span className="text-foreground">User agent</span> — informasi browser dan perangkat</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Section 2 */}
          <ScrollReveal delay={200}>
            <div id="data-usage" className="glass-card p-8 mb-8 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6 border-b border-primary/20 pb-4">
                <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center font-orbitron text-primary text-sm font-bold">
                  02
                </div>
                <h2 className="text-xl font-orbitron font-bold text-primary">
                  DATA_USAGE // Penggunaan Data
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-muted-foreground">
                <p>Data yang kami kumpulkan digunakan untuk tujuan berikut:</p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.1</span>
                    <span>Merespons pertanyaan dan pesan yang Anda kirimkan melalui formulir kontak</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.2</span>
                    <span>Menganalisis traffic website untuk meningkatkan pengalaman pengguna</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.3</span>
                    <span>Menjaga keamanan website dan mencegah penyalahgunaan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.4</span>
                    <span>Memenuhi kewajiban hukum yang berlaku</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.5</span>
                    <span>Mengirimkan informasi terkait layanan jika Anda telah memberikan persetujuan</span>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollReveal>

          {/* Section 3 */}
          <ScrollReveal delay={250}>
            <div id="cookies" className="glass-card p-8 mb-8 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6 border-b border-primary/20 pb-4">
                <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center font-orbitron text-primary text-sm font-bold">
                  03
                </div>
                <h2 className="text-xl font-orbitron font-bold text-primary">
                  <Cookie className="w-5 h-5 inline mr-2" />
                  COOKIES // Penggunaan Cookies
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-muted-foreground">
                <p>Website ini menggunakan cookies untuk keperluan berikut:</p>
                <div className="bg-secondary/30 border border-primary/10 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-primary font-bold shrink-0">▸</span>
                    <div>
                      <span className="text-foreground font-bold">Supabase Authentication Cookies</span>
                      <p className="mt-1">Digunakan untuk mengelola sesi autentikasi pengguna yang login ke sistem admin. Cookies ini bersifat esensial untuk fungsi autentikasi.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary font-bold shrink-0">▸</span>
                    <div>
                      <span className="text-foreground font-bold">Session Cookies</span>
                      <p className="mt-1">Cookies sesi yang diperlukan untuk menjaga keamanan dan integritas website selama kunjungan Anda.</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs border-l-2 border-primary/30 pl-4 mt-4">
                  Kami tidak menggunakan cookies pelacakan pihak ketiga (third-party tracking cookies) atau cookies untuk keperluan iklan.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Section 4 */}
          <ScrollReveal delay={300}>
            <div id="data-security" className="glass-card p-8 mb-8 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6 border-b border-primary/20 pb-4">
                <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center font-orbitron text-primary text-sm font-bold">
                  04
                </div>
                <h2 className="text-xl font-orbitron font-bold text-primary">
                  DATA_SECURITY // Keamanan Data
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-muted-foreground">
                <p>Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai untuk melindungi data Anda, termasuk:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">◆</span>
                    <span>Enkripsi data dalam transit menggunakan protokol HTTPS/TLS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">◆</span>
                    <span>Penyimpanan data pada infrastruktur Supabase yang terenkripsi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">◆</span>
                    <span>Akses terbatas hanya untuk personel yang berwenang</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">◆</span>
                    <span>Pemantauan keamanan secara berkala</span>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollReveal>

          {/* Section 5 */}
          <ScrollReveal delay={350}>
            <div id="user-rights" className="glass-card p-8 mb-8 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6 border-b border-primary/20 pb-4">
                <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center font-orbitron text-primary text-sm font-bold">
                  05
                </div>
                <h2 className="text-xl font-orbitron font-bold text-primary">
                  <UserCheck className="w-5 h-5 inline mr-2" />
                  USER_RIGHTS // Hak Pengguna
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-muted-foreground">
                <p>Anda memiliki hak-hak berikut terkait data pribadi Anda:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">HAK AKSES</span>
                    <p className="mt-2">Meminta salinan data pribadi yang kami simpan tentang Anda</p>
                  </div>
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">HAK KOREKSI</span>
                    <p className="mt-2">Meminta perbaikan data yang tidak akurat atau tidak lengkap</p>
                  </div>
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">HAK PENGHAPUSAN</span>
                    <p className="mt-2">Meminta penghapusan data pribadi Anda dari sistem kami</p>
                  </div>
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">HAK PEMBATASAN</span>
                    <p className="mt-2">Meminta pembatasan pemrosesan data pribadi Anda</p>
                  </div>
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">HAK PORTABILITAS</span>
                    <p className="mt-2">Meminta transfer data Anda dalam format yang dapat dibaca mesin</p>
                  </div>
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">HAK KEBERATAN</span>
                    <p className="mt-2">Mengajukan keberatan atas pemrosesan data untuk tujuan tertentu</p>
                  </div>
                </div>
                <p className="text-xs border-l-2 border-primary/30 pl-4 mt-4">
                  Untuk menggunakan hak-hak di atas, silakan hubungi kami melalui informasi kontak yang tersedia di bagian bawah halaman ini.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Section 6 */}
          <ScrollReveal delay={400}>
            <div id="data-retention" className="glass-card p-8 mb-8 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6 border-b border-primary/20 pb-4">
                <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center font-orbitron text-primary text-sm font-bold">
                  06
                </div>
                <h2 className="text-xl font-orbitron font-bold text-primary">
                  DATA_RETENTION // Penyimpanan Data
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-muted-foreground">
                <p>Kami menyimpan data pribadi Anda selama diperlukan untuk memenuhi tujuan pengumpulannya:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">▸</span>
                    <span><span className="text-foreground">Data kontak</span> — disimpan selama 2 tahun sejak komunikasi terakhir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">▸</span>
                    <span><span className="text-foreground">Data analytics</span> — disimpan selama 12 bulan secara agregat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">▸</span>
                    <span><span className="text-foreground">Log keamanan</span> — disimpan selama 6 bulan</span>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollReveal>

          {/* Section 7 - Contact */}
          <ScrollReveal delay={450}>
            <div id="contact-privacy" className="glass-card p-8 border-primary/30 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6 border-b border-primary/20 pb-4">
                <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center font-orbitron text-primary text-sm font-bold">
                  07
                </div>
                <h2 className="text-xl font-orbitron font-bold text-primary">
                  <Mail className="w-5 h-5 inline mr-2" />
                  CONTACT_PRIVACY // Kontak Privasi
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-muted-foreground">
                <p>
                  Jika Anda memiliki pertanyaan, keluhan, atau permintaan terkait kebijakan privasi ini
                  atau pemrosesan data pribadi Anda, silakan hubungi kami melalui:
                </p>
                <div className="bg-secondary/30 border border-primary/10 p-6">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-foreground">Email: {siteConfig.contact.email}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">
                      Kami akan merespons permintaan Anda dalam waktu maksimal 30 hari kerja.
                    </p>
                  </div>
                </div>
                <p className="text-xs border-l-2 border-primary/30 pl-4 mt-4">
                  Kebijakan privasi ini dapat diperbarui sewaktu-waktu. Perubahan signifikan akan
                  diinformasikan melalui website ini. Penggunaan berkelanjutan atas website ini setelah
                  perubahan dianggap sebagai persetujuan Anda terhadap kebijakan yang diperbarui.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </PublicLayout>
  );
}
