import { PublicLayout } from "@/components/layout/public-layout";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { TableOfContents, type TocItem } from "@/components/ui/table-of-contents";
import { FileText, Scale, Shield, Briefcase, XCircle, Clock } from "@/lib/icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Syarat dan Ketentuan Layanan IRNK Codes — Ketentuan penggunaan website, hak kekayaan intelektual, layanan, dan batasan tanggung jawab.",
  robots: {
    index: false,
    follow: true,
  },
};

const termsToc: TocItem[] = [
  { id: "acceptance", label: "Ketentuan Penggunaan", number: "01" },
  { id: "intellectual-property", label: "Hak Kekayaan Intelektual", number: "02" },
  { id: "services", label: "Layanan", number: "03" },
  { id: "user-obligations", label: "Batasan Tanggung Jawab", number: "04" },
  { id: "limitation", label: "Pembatalan dan Refund", number: "05" },
  { id: "governing-law", label: "Hukum yang Berlaku", number: "06" },
  { id: "changes", label: "Perubahan Ketentuan", number: "07" },
];

export default function Terms() {
  return (
    <PublicLayout>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Terms of Service", url: "/terms" },
        ]}
      />
      <div className="pt-4 pb-16 min-h-screen relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TableOfContents items={termsToc} title="TABLE_OF_CONTENTS" />
          {/* Header */}
          <ScrollReveal>
            <div className="mb-12 max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-primary" />
                <h1 className="text-4xl md:text-5xl font-orbitron font-bold neon-text">
                  TERMS_OF_SERVICE
                </h1>
              </div>
              <p className="font-mono text-sm text-muted-foreground">
                Syarat dan Ketentuan Layanan // Service Agreement
              </p>
              <div className="flex items-center gap-2 mt-4 font-mono text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>LAST_UPDATED: Mei 2026</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Introduction */}
          <ScrollReveal delay={100}>
            <div className="glass-card p-8 mb-8">
              <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                Dengan mengakses dan menggunakan website ini, Anda menyetujui untuk terikat oleh
                Syarat dan Ketentuan berikut. Jika Anda tidak menyetujui salah satu ketentuan ini,
                mohon untuk tidak menggunakan website ini. Dokumen ini merupakan perjanjian yang
                mengikat secara hukum antara Anda dan pemilik website.
              </p>
            </div>
          </ScrollReveal>

          {/* Section 1 */}
          <ScrollReveal delay={150}>
            <div id="acceptance" className="glass-card p-8 mb-8 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6 border-b border-primary/20 pb-4">
                <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center font-orbitron text-primary text-sm font-bold">
                  01
                </div>
                <h2 className="text-xl font-orbitron font-bold text-primary">
                  USAGE_TERMS // Ketentuan Penggunaan Website
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-muted-foreground">
                <p>Dengan menggunakan website ini, Anda menyetujui bahwa:</p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.1</span>
                    <span>Anda berusia minimal 17 tahun atau memiliki persetujuan dari orang tua/wali untuk menggunakan layanan ini</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.2</span>
                    <span>Anda tidak akan menggunakan website ini untuk tujuan yang melanggar hukum atau peraturan yang berlaku di Republik Indonesia</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.3</span>
                    <span>Anda tidak akan mencoba mengakses area yang tidak diotorisasi atau mengganggu sistem keamanan website</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.4</span>
                    <span>Anda tidak akan melakukan scraping, crawling, atau pengambilan data secara otomatis tanpa izin tertulis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.5</span>
                    <span>Anda bertanggung jawab penuh atas aktivitas yang dilakukan melalui akun atau koneksi Anda</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.6</span>
                    <span>Informasi yang Anda berikan melalui formulir kontak adalah akurat dan tidak menyesatkan</span>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollReveal>

          {/* Section 2 */}
          <ScrollReveal delay={200}>
            <div id="intellectual-property" className="glass-card p-8 mb-8 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6 border-b border-primary/20 pb-4">
                <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center font-orbitron text-primary text-sm font-bold">
                  02
                </div>
                <h2 className="text-xl font-orbitron font-bold text-primary">
                  <Shield className="w-5 h-5 inline mr-2" />
                  IP_RIGHTS // Hak Kekayaan Intelektual
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-muted-foreground">
                <p>Seluruh konten pada website ini dilindungi oleh hak kekayaan intelektual:</p>
                <div className="space-y-4">
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">2.1 KEPEMILIKAN KONTEN</span>
                    <p className="mt-2">
                      Semua teks, grafik, logo, ikon, gambar, klip audio, unduhan digital, kompilasi data,
                      dan perangkat lunak yang terdapat di website ini adalah milik pemilik website atau
                      pemberi lisensinya dan dilindungi oleh undang-undang hak cipta Indonesia dan internasional.
                    </p>
                  </div>
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">2.2 PENGGUNAAN TERBATAS</span>
                    <p className="mt-2">
                      Anda diperbolehkan melihat, mengunduh, dan mencetak konten dari website ini hanya untuk
                      penggunaan pribadi dan non-komersial. Reproduksi, distribusi, modifikasi, atau penggunaan
                      komersial tanpa izin tertulis dilarang keras.
                    </p>
                  </div>
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">2.3 KODE SUMBER</span>
                    <p className="mt-2">
                      Kode sumber yang dibagikan melalui repositori publik tunduk pada lisensi yang tercantum
                      dalam masing-masing repositori. Penggunaan kode harus sesuai dengan ketentuan lisensi tersebut.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Section 3 */}
          <ScrollReveal delay={250}>
            <div id="services" className="glass-card p-8 mb-8 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6 border-b border-primary/20 pb-4">
                <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center font-orbitron text-primary text-sm font-bold">
                  03
                </div>
                <h2 className="text-xl font-orbitron font-bold text-primary">
                  <Briefcase className="w-5 h-5 inline mr-2" />
                  SERVICES // Layanan yang Ditawarkan
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-muted-foreground">
                <p>Website ini menyediakan informasi mengenai layanan profesional berikut:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">WEB DEVELOPMENT</span>
                    <p className="mt-2">Pengembangan website dan aplikasi web menggunakan teknologi modern</p>
                  </div>
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">UI/UX DESIGN</span>
                    <p className="mt-2">Perancangan antarmuka dan pengalaman pengguna yang optimal</p>
                  </div>
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">CONSULTING</span>
                    <p className="mt-2">Konsultasi teknologi dan strategi digital untuk bisnis</p>
                  </div>
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">AI INTEGRATION</span>
                    <p className="mt-2">Integrasi solusi kecerdasan buatan ke dalam sistem yang ada</p>
                  </div>
                </div>
                <p className="text-xs border-l-2 border-primary/30 pl-4 mt-4">
                  Detail spesifik mengenai cakupan, timeline, dan biaya layanan akan dibahas dan
                  disepakati secara terpisah melalui kontrak individual untuk setiap proyek.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Section 4 */}
          <ScrollReveal delay={300}>
            <div id="user-obligations" className="glass-card p-8 mb-8 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6 border-b border-primary/20 pb-4">
                <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center font-orbitron text-primary text-sm font-bold">
                  04
                </div>
                <h2 className="text-xl font-orbitron font-bold text-primary">
                  <Scale className="w-5 h-5 inline mr-2" />
                  LIABILITY // Batasan Tanggung Jawab
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-muted-foreground">
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.1</span>
                    <span>
                      Website ini disediakan &ldquo;sebagaimana adanya&rdquo; (as is) tanpa jaminan dalam bentuk
                      apapun, baik tersurat maupun tersirat, termasuk namun tidak terbatas pada jaminan
                      kelayakan untuk tujuan tertentu.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.2</span>
                    <span>
                      Kami tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental,
                      konsekuensial, atau khusus yang timbul dari penggunaan atau ketidakmampuan menggunakan
                      website ini.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.3</span>
                    <span>
                      Kami tidak menjamin bahwa website akan selalu tersedia, bebas dari error, atau bebas
                      dari virus dan komponen berbahaya lainnya.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.4</span>
                    <span>
                      Tautan ke website pihak ketiga disediakan hanya untuk kemudahan. Kami tidak bertanggung
                      jawab atas konten atau praktik privasi website pihak ketiga tersebut.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.5</span>
                    <span>
                      Total tanggung jawab kami dalam keadaan apapun tidak akan melebihi jumlah yang Anda
                      bayarkan kepada kami untuk layanan terkait dalam 12 bulan terakhir.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollReveal>

          {/* Section 5 */}
          <ScrollReveal delay={350}>
            <div id="limitation" className="glass-card p-8 mb-8 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6 border-b border-primary/20 pb-4">
                <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center font-orbitron text-primary text-sm font-bold">
                  05
                </div>
                <h2 className="text-xl font-orbitron font-bold text-primary">
                  <XCircle className="w-5 h-5 inline mr-2" />
                  CANCELLATION // Pembatalan dan Refund
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-muted-foreground">
                <p>Ketentuan pembatalan dan pengembalian dana untuk layanan profesional:</p>
                <div className="space-y-4">
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">5.1 PEMBATALAN OLEH KLIEN</span>
                    <p className="mt-2">
                      Klien dapat membatalkan proyek dengan pemberitahuan tertulis minimal 14 hari sebelumnya.
                      Biaya untuk pekerjaan yang telah diselesaikan hingga tanggal pembatalan tetap berlaku
                      dan tidak dapat dikembalikan.
                    </p>
                  </div>
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">5.2 KEBIJAKAN REFUND</span>
                    <p className="mt-2">
                      Pengembalian dana hanya berlaku untuk bagian layanan yang belum dilaksanakan.
                      Deposit awal bersifat non-refundable kecuali pembatalan dilakukan dalam 48 jam
                      setelah pembayaran dan belum ada pekerjaan yang dimulai.
                    </p>
                  </div>
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">5.3 PEMBATALAN OLEH PENYEDIA</span>
                    <p className="mt-2">
                      Kami berhak membatalkan atau menolak proyek jika terdapat pelanggaran ketentuan,
                      ketidaksesuaian informasi, atau alasan lain yang wajar. Dalam hal ini, dana yang
                      belum digunakan akan dikembalikan sepenuhnya.
                    </p>
                  </div>
                  <div className="bg-secondary/30 border border-primary/10 p-4">
                    <span className="text-primary font-bold text-xs">5.4 PROSES REFUND</span>
                    <p className="mt-2">
                      Pengembalian dana akan diproses dalam waktu 14 hari kerja melalui metode pembayaran
                      yang sama dengan yang digunakan saat transaksi awal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Section 6 */}
          <ScrollReveal delay={400}>
            <div id="governing-law" className="glass-card p-8 mb-8 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6 border-b border-primary/20 pb-4">
                <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center font-orbitron text-primary text-sm font-bold">
                  06
                </div>
                <h2 className="text-xl font-orbitron font-bold text-primary">
                  GOVERNING_LAW // Hukum yang Berlaku
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-muted-foreground">
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">6.1</span>
                    <span>
                      Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">6.2</span>
                    <span>
                      Setiap sengketa yang timbul dari atau terkait dengan ketentuan ini akan diselesaikan
                      terlebih dahulu melalui musyawarah untuk mufakat.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">6.3</span>
                    <span>
                      Apabila musyawarah tidak mencapai kesepakatan, sengketa akan diselesaikan melalui
                      Pengadilan Negeri yang berwenang di wilayah hukum Indonesia.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollReveal>

          {/* Section 7 */}
          <ScrollReveal delay={450}>
            <div id="changes" className="glass-card p-8 border-primary/30 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6 border-b border-primary/20 pb-4">
                <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center font-orbitron text-primary text-sm font-bold">
                  07
                </div>
                <h2 className="text-xl font-orbitron font-bold text-primary">
                  AMENDMENTS // Perubahan Ketentuan
                </h2>
              </div>
              <div className="space-y-4 font-mono text-sm text-muted-foreground">
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">7.1</span>
                    <span>
                      Kami berhak mengubah Syarat dan Ketentuan ini kapan saja tanpa pemberitahuan sebelumnya.
                      Perubahan akan berlaku segera setelah dipublikasikan di website ini.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">7.2</span>
                    <span>
                      Penggunaan berkelanjutan atas website ini setelah perubahan dipublikasikan dianggap
                      sebagai persetujuan Anda terhadap ketentuan yang diperbarui.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">7.3</span>
                    <span>
                      Anda disarankan untuk meninjau halaman ini secara berkala untuk mengetahui perubahan terbaru.
                    </span>
                  </li>
                </ul>
                <div className="bg-secondary/30 border border-primary/10 p-6 mt-6">
                  <p className="text-xs text-muted-foreground">
                    Dengan menggunakan website ini, Anda menyatakan telah membaca, memahami, dan menyetujui
                    seluruh Syarat dan Ketentuan yang tercantum di atas. Jika Anda memiliki pertanyaan
                    mengenai ketentuan ini, silakan hubungi kami melalui halaman kontak.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </PublicLayout>
  );
}
