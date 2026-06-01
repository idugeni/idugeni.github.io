-- ============================================================
-- IRNK Codes - Seed Data
-- ============================================================

-- ============================================================
-- 1. BLOG KATEGORI
-- ============================================================
INSERT INTO public.kategori (id, nama, slug, deskripsi, warna) VALUES
('a1000000-0000-0000-0000-000000000001', 'Web Development', 'web-development', 'Artikel seputar pengembangan web modern', '#3B82F6'),
('a1000000-0000-0000-0000-000000000002', 'Artificial Intelligence', 'artificial-intelligence', 'Eksplorasi dunia AI dan machine learning', '#8B5CF6'),
('a1000000-0000-0000-0000-000000000003', 'UI/UX Design', 'ui-ux-design', 'Tips dan trik desain antarmuka pengguna', '#EC4899'),
('a1000000-0000-0000-0000-000000000004', 'DevOps & Cloud', 'devops-cloud', 'Infrastructure, CI/CD, dan cloud computing', '#10B981'),
('a1000000-0000-0000-0000-000000000005', 'Mobile Development', 'mobile-development', 'Pengembangan aplikasi mobile cross-platform', '#F59E0B');

-- ============================================================
-- 2. BLOG ARTIKEL
-- ============================================================
INSERT INTO public.blog_artikel (id, judul, slug, ringkasan, konten, kategori_id, status, featured, jumlah_like, jumlah_view, waktu_baca, published_at) VALUES
('b1000000-0000-0000-0000-000000000001',
 'Membangun Aplikasi Full-Stack dengan Next.js 16 dan Supabase',
 'membangun-aplikasi-fullstack-nextjs-16-supabase',
 'Panduan lengkap membangun aplikasi modern menggunakan Next.js 16 App Router dengan Supabase sebagai backend.',
 '## Pendahuluan

Next.js 16 membawa perubahan signifikan dalam cara kita membangun aplikasi web. Dengan pengenalan **proxy.ts** sebagai pengganti middleware.ts, dan peningkatan pada React Server Components, developer kini memiliki tools yang lebih powerful.

## Mengapa Next.js 16 + Supabase?

Kombinasi ini memberikan:
- **Server Components** untuk rendering yang optimal
- **Supabase Auth** dengan SSR cookie handling
- **Real-time subscriptions** untuk data live
- **Edge Functions** untuk logic server-side

## Setup Project

```bash
npx create-next-app@latest my-app
npm install @supabase/ssr @supabase/supabase-js
```

## Konfigurasi Supabase Client

Buat dua file client - satu untuk browser dan satu untuk server:

### Browser Client
```typescript
import { createBrowserClient } from "@supabase/ssr";
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
```

### Server Client
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );
}
```

## Kesimpulan

Dengan setup ini, Anda memiliki fondasi yang solid untuk membangun aplikasi full-stack modern.',
 'a1000000-0000-0000-0000-000000000001', 'published', true, 42, 1250, 8, '2026-04-15T10:00:00Z'),

('b1000000-0000-0000-0000-000000000002',
 'Mengenal Large Language Models: Dari GPT hingga Claude',
 'mengenal-large-language-models-gpt-claude',
 'Eksplorasi mendalam tentang arsitektur dan kemampuan LLM modern serta cara mengintegrasikannya ke dalam aplikasi.',
 '## Apa itu Large Language Models?

Large Language Models (LLM) adalah model AI yang dilatih pada dataset teks yang sangat besar untuk memahami dan menghasilkan bahasa manusia.

## Arsitektur Transformer

Semua LLM modern didasarkan pada arsitektur **Transformer** yang diperkenalkan dalam paper "Attention Is All You Need" (2017).

### Komponen Utama:
1. **Self-Attention Mechanism** - Memungkinkan model memahami konteks
2. **Feed-Forward Networks** - Memproses informasi
3. **Layer Normalization** - Stabilisasi training

## Perbandingan Model

| Model | Parameter | Keunggulan |
|-------|-----------|------------|
| GPT-4o | ~1.8T | Multimodal, reasoning |
| Claude 4 | ~2T | Safety, long context |
| Gemini 2 | ~1.5T | Multimodal native |

## Integrasi ke Aplikasi

```typescript
const response = await fetch("/api/ai/chat", {
  method: "POST",
  body: JSON.stringify({ messages, model: "claude-4-sonnet" })
});
```

## Best Practices
- Gunakan streaming untuk UX yang lebih baik
- Implementasi rate limiting
- Cache responses yang repetitif
- Monitor token usage',
 'a1000000-0000-0000-0000-000000000002', 'published', true, 67, 2100, 10, '2026-04-20T08:00:00Z'),

('b1000000-0000-0000-0000-000000000003',
 'Design System: Membangun Komponen UI yang Konsisten',
 'design-system-membangun-komponen-ui-konsisten',
 'Cara membangun design system yang scalable menggunakan Tailwind CSS, Radix UI, dan shadcn/ui.',
 '## Mengapa Design System?

Design system memastikan konsistensi visual dan pengalaman pengguna di seluruh aplikasi.

## Stack yang Direkomendasikan

- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible components
- **shadcn/ui** - Beautiful components built on Radix

## Membuat Button Component

```tsx
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
  }
);
```

## Tips
- Dokumentasikan setiap komponen
- Gunakan Storybook untuk preview
- Pastikan accessibility (WCAG 2.1 AA)',
 'a1000000-0000-0000-0000-000000000003', 'published', false, 28, 890, 6, '2026-04-25T14:00:00Z'),

('b1000000-0000-0000-0000-000000000004',
 'Kubernetes untuk Developer: Panduan Praktis',
 'kubernetes-untuk-developer-panduan-praktis',
 'Memahami Kubernetes dari perspektif developer - deployment, scaling, dan monitoring aplikasi.',
 '## Kubernetes Basics

Kubernetes (K8s) adalah platform orchestration container yang mengotomatisasi deployment, scaling, dan management aplikasi.

## Konsep Dasar

### Pod
Unit terkecil di Kubernetes. Satu pod bisa berisi satu atau lebih container.

### Deployment
Mengelola replicas dari pod Anda.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    spec:
      containers:
      - name: app
        image: my-app:latest
        ports:
        - containerPort: 3000
```

### Service
Expose pod ke network.

## Monitoring dengan Prometheus

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: my-app-monitor
spec:
  endpoints:
  - port: metrics
    interval: 30s
```

## Tips Production
- Selalu set resource limits
- Gunakan health checks (liveness + readiness)
- Implementasi graceful shutdown',
 'a1000000-0000-0000-0000-000000000004', 'published', false, 35, 1450, 12, '2026-05-01T09:00:00Z'),

('b1000000-0000-0000-0000-000000000005',
 'React Native vs Flutter di 2026: Mana yang Lebih Baik?',
 'react-native-vs-flutter-2026',
 'Perbandingan mendalam antara React Native dan Flutter untuk pengembangan mobile cross-platform di tahun 2026.',
 '## Pendahuluan

Perdebatan React Native vs Flutter masih berlanjut di 2026, namun kedua framework telah berkembang signifikan.

## React Native (New Architecture)

React Native dengan arsitektur baru (Fabric + TurboModules) memberikan:
- **Concurrent rendering** via React 19
- **Native performance** tanpa bridge
- **Shared code** hingga 95% dengan web

## Flutter 4

Flutter 4 membawa:
- **Impeller engine** untuk rendering 120fps
- **Hot reload** yang lebih cepat
- **Web support** yang production-ready

## Perbandingan

| Aspek | React Native | Flutter |
|-------|-------------|---------|
| Bahasa | TypeScript/JS | Dart |
| Performance | Near-native | Near-native |
| UI | Native widgets | Custom widgets |
| Ecosystem | NPM (massive) | pub.dev (growing) |
| Learning curve | Mudah (jika tahu React) | Sedang |

## Rekomendasi

- **Pilih React Native** jika tim sudah familiar dengan React/TypeScript
- **Pilih Flutter** jika butuh UI custom yang pixel-perfect

## Kesimpulan

Keduanya excellent. Pilihan tergantung pada kebutuhan tim dan project.',
 'a1000000-0000-0000-0000-000000000005', 'published', true, 53, 1800, 7, '2026-05-05T11:00:00Z'),

('b1000000-0000-0000-0000-000000000006',
 'Optimasi Performance Web: Core Web Vitals 2026',
 'optimasi-performance-web-core-web-vitals-2026',
 'Strategi terbaru untuk mencapai skor sempurna pada Core Web Vitals dan meningkatkan SEO.',
 '## Core Web Vitals Update 2026

Google terus memperbarui metrik performance. Di 2026, fokus utama:

### INP (Interaction to Next Paint)
Menggantikan FID sebagai metrik responsiveness utama.

### LCP (Largest Contentful Paint)
Target: < 2.5 detik

### CLS (Cumulative Layout Shift)
Target: < 0.1

## Strategi Optimasi

### 1. Image Optimization
```tsx
import Image from "next/image";
<Image
  src="/hero.webp"
  width={1200}
  height={630}
  priority
  placeholder="blur"
/>
```

### 2. Code Splitting
```tsx
const HeavyComponent = dynamic(() => import("./Heavy"), {
  loading: () => <Skeleton />,
  ssr: false
});
```

### 3. Font Optimization
```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], display: "swap" });
```

## Tools
- Lighthouse CI
- WebPageTest
- Chrome DevTools Performance tab',
 'a1000000-0000-0000-0000-000000000001', 'published', false, 19, 670, 5, '2026-05-08T16:00:00Z'),

('b1000000-0000-0000-0000-000000000007',
 'Masa Depan AI Agents: Autonomous Coding Assistants',
 'masa-depan-ai-agents-autonomous-coding',
 'Draft artikel tentang perkembangan AI coding agents dan dampaknya terhadap industri software development.',
 '## Draft - Work in Progress

Artikel ini membahas tentang evolusi AI coding assistants menuju autonomous agents yang dapat menyelesaikan task kompleks secara mandiri.

### Outline:
1. Sejarah singkat AI coding tools
2. Dari autocomplete ke autonomous agents
3. Kiro, Cursor, dan era baru development
4. Implikasi untuk developer

*Artikel ini masih dalam tahap penulisan.*',
 'a1000000-0000-0000-0000-000000000002', 'draft', false, 0, 0, 15, NULL);


-- ============================================================
-- 3. BLOG KOMENTAR
-- ============================================================
INSERT INTO public.blog_komentar (id, artikel_id, nama_komentator, email_komentator, isi_komentar, approved, created_at) VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Budi Santoso', 'budi@example.com', 'Artikel yang sangat membantu! Saya berhasil setup Supabase dengan Next.js berkat panduan ini.', true, '2026-04-16T08:30:00Z'),
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Siti Rahayu', 'siti@example.com', 'Apakah ada rencana untuk membuat tutorial tentang Supabase Realtime juga?', true, '2026-04-17T14:20:00Z'),
('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'Ahmad Fauzi', 'ahmad@example.com', 'Perbandingan LLM-nya sangat informatif. Terima kasih sudah menyertakan code example!', true, '2026-04-21T09:15:00Z'),
('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'Dewi Lestari', 'dewi@example.com', 'Bagaimana dengan biaya API untuk production? Apakah ada tips untuk menghemat token?', true, '2026-04-22T11:45:00Z'),
('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000003', 'Rizky Pratama', 'rizky@example.com', 'shadcn/ui memang game changer. Sudah pakai di 3 project dan hasilnya konsisten.', true, '2026-04-26T16:00:00Z'),
('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000005', 'Andi Wijaya', 'andi@example.com', 'Saya masih prefer React Native karena ecosystem NPM yang lebih mature.', true, '2026-05-06T10:30:00Z'),
('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000004', 'Spam Bot', 'spam@spam.com', 'Buy cheap products at www.spam-link.com!!!', false, '2026-05-02T03:00:00Z'),
('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000001', 'Maya Putri', 'maya@example.com', 'Keren banget artikelnya! Kapan bikin tutorial video juga?', true, '2026-04-18T20:10:00Z');

-- ============================================================
-- 4. BLOG LIKE
-- ============================================================
INSERT INTO public.blog_like (artikel_id, ip_address) VALUES
('b1000000-0000-0000-0000-000000000001', '192.168.1.10'),
('b1000000-0000-0000-0000-000000000001', '10.0.0.25'),
('b1000000-0000-0000-0000-000000000001', '172.16.0.5'),
('b1000000-0000-0000-0000-000000000002', '192.168.1.10'),
('b1000000-0000-0000-0000-000000000002', '10.0.0.30'),
('b1000000-0000-0000-0000-000000000002', '172.16.0.8'),
('b1000000-0000-0000-0000-000000000002', '192.168.2.15'),
('b1000000-0000-0000-0000-000000000003', '10.0.0.25'),
('b1000000-0000-0000-0000-000000000003', '172.16.0.5'),
('b1000000-0000-0000-0000-000000000005', '192.168.1.10'),
('b1000000-0000-0000-0000-000000000005', '10.0.0.25'),
('b1000000-0000-0000-0000-000000000005', '172.16.0.5');

-- ============================================================
-- 5. PROJECTS
-- ============================================================
INSERT INTO public.projects (id, nama, slug, deskripsi, thumbnail_url, github_url, live_url, tech_stack, kategori, status, featured, urutan) VALUES
('d1000000-0000-0000-0000-000000000001',
 'IRNK Codes',
 'irnk-codes',
 'Personal portfolio dan blog platform dengan tema cyberpunk/futuristik. Dibangun dengan Next.js 16, Supabase, dan Tailwind CSS. Fitur termasuk admin dashboard, blog system, analytics, dan newsletter management.',
 NULL, 'https://github.com/idugeni/idugeni.github.io', 'https://irnk.codes',
 ARRAY['Next.js 16', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Framer Motion', 'shadcn/ui'],
 'Web App', 'ongoing', true, 1),

('d1000000-0000-0000-0000-000000000002',
 'NeuraScan AI',
 'neurascan-ai',
 'Platform analisis dokumen berbasis AI yang menggunakan OCR dan NLP untuk mengekstrak informasi dari dokumen tidak terstruktur. Mendukung bahasa Indonesia dan Inggris.',
 NULL, 'https://github.com/idugeni/neurascan-ai', 'https://neurascan.vercel.app',
 ARRAY['Python', 'FastAPI', 'React', 'TensorFlow', 'PostgreSQL', 'Docker'],
 'AI/ML', 'completed', true, 2),

('d1000000-0000-0000-0000-000000000003',
 'CloudForge CLI',
 'cloudforge-cli',
 'Command-line tool untuk automasi deployment ke multiple cloud providers (AWS, GCP, Azure). Mendukung infrastructure-as-code dengan template YAML.',
 NULL, 'https://github.com/idugeni/cloudforge-cli', NULL,
 ARRAY['Go', 'Cobra', 'Terraform', 'Docker', 'GitHub Actions'],
 'DevOps', 'completed', false, 3),

('d1000000-0000-0000-0000-000000000004',
 'Tokoku - E-Commerce Platform',
 'tokoku-ecommerce',
 'Platform e-commerce full-featured dengan payment gateway integration (Midtrans), inventory management, dan real-time order tracking.',
 NULL, 'https://github.com/idugeni/tokoku', 'https://tokoku-demo.vercel.app',
 ARRAY['Next.js', 'Prisma', 'PostgreSQL', 'Redis', 'Midtrans', 'Tailwind CSS'],
 'Web App', 'completed', true, 4),

('d1000000-0000-0000-0000-000000000005',
 'MediConnect',
 'mediconnect',
 'Aplikasi telemedicine yang menghubungkan pasien dengan dokter. Fitur video call, chat, e-prescription, dan medical records management.',
 NULL, 'https://github.com/idugeni/mediconnect', NULL,
 ARRAY['React Native', 'Node.js', 'Socket.io', 'MongoDB', 'WebRTC'],
 'Mobile', 'archived', false, 5),

('d1000000-0000-0000-0000-000000000006',
 'DataPulse Analytics',
 'datapulse-analytics',
 'Dashboard analytics real-time untuk monitoring business metrics. Integrasi dengan berbagai data source dan visualisasi interaktif.',
 NULL, 'https://github.com/idugeni/datapulse', 'https://datapulse-demo.vercel.app',
 ARRAY['Vue.js', 'D3.js', 'Python', 'Apache Kafka', 'ClickHouse', 'Docker'],
 'Data', 'ongoing', false, 6),

('d1000000-0000-0000-0000-000000000007',
 'SecureVault',
 'securevault',
 'Password manager dengan end-to-end encryption. Zero-knowledge architecture memastikan hanya user yang bisa mengakses data mereka.',
 NULL, 'https://github.com/idugeni/securevault', NULL,
 ARRAY['Rust', 'Tauri', 'React', 'SQLite', 'AES-256-GCM'],
 'Security', 'ongoing', true, 7),

('d1000000-0000-0000-0000-000000000008',
 'EduFlow LMS',
 'eduflow-lms',
 'Learning Management System dengan fitur adaptive learning, quiz generator berbasis AI, dan progress tracking untuk institusi pendidikan.',
 NULL, 'https://github.com/idugeni/eduflow', 'https://eduflow-demo.vercel.app',
 ARRAY['Next.js', 'tRPC', 'Prisma', 'PostgreSQL', 'OpenAI API', 'Stripe'],
 'Web App', 'completed', false, 8);


-- ============================================================
-- 6. GALLERY
-- ============================================================
INSERT INTO public.gallery (id, judul, deskripsi, file_url, tipe, kategori, urutan) VALUES
('e1000000-0000-0000-0000-000000000001', 'Workspace Setup 2026', 'Setup workspace development dengan triple monitor dan mechanical keyboard', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', 'foto', 'Workspace', 1),
('e1000000-0000-0000-0000-000000000002', 'Tech Conference Jakarta', 'Presentasi tentang AI Engineering di DevFest Jakarta 2026', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'foto', 'Event', 2),
('e1000000-0000-0000-0000-000000000003', 'Code Review Session', 'Pair programming session dengan tim development', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800', 'foto', 'Team', 3),
('e1000000-0000-0000-0000-000000000004', 'Server Room Tour', 'Behind the scenes - data center yang menjalankan infrastruktur kami', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800', 'foto', 'Infrastructure', 4),
('e1000000-0000-0000-0000-000000000005', 'Hackathon Winner', 'Juara 1 Hackathon Nasional 2025 - kategori AI Innovation', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800', 'foto', 'Achievement', 5),
('e1000000-0000-0000-0000-000000000006', 'Workshop Flutter', 'Mengajar workshop Flutter development untuk komunitas GDG', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', 'foto', 'Event', 6),
('e1000000-0000-0000-0000-000000000007', 'Night Coding Session', 'Late night coding session - building the next big thing', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800', 'foto', 'Workspace', 7),
('e1000000-0000-0000-0000-000000000008', 'Team Building', 'Outing tim development ke Bandung', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800', 'foto', 'Team', 8),
('e1000000-0000-0000-0000-000000000009', 'Product Launch Demo', 'Demo video produk NeuraScan AI', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'video', 'Product', 9),
('e1000000-0000-0000-0000-000000000010', 'Open Source Contribution', 'Contributing to major open source projects', 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800', 'foto', 'Achievement', 10);

-- ============================================================
-- 7. TESTIMONIALS
-- ============================================================
INSERT INTO public.testimonials (id, nama, jabatan, perusahaan, avatar_url, isi, rating, featured, tampil) VALUES
('f1000000-0000-0000-0000-000000000001', 'Dr. Hendra Wijaya', 'CTO', 'TechNusa Indonesia', NULL, 'Kolaborasi yang luar biasa! Sistem yang dibangun sangat scalable dan well-documented. Tim kami bisa melanjutkan development dengan mudah berkat arsitektur yang clean.', 5, true, true),
('f1000000-0000-0000-0000-000000000002', 'Sarah Amelia', 'Product Manager', 'StartupHub', NULL, 'Delivery tepat waktu dengan kualitas yang melebihi ekspektasi. Komunikasi selama project sangat baik dan selalu memberikan solusi kreatif untuk setiap challenge.', 5, true, true),
('f1000000-0000-0000-0000-000000000003', 'Raka Aditya', 'Founder', 'EduTech Solutions', NULL, 'Platform LMS yang dibangun berhasil meningkatkan engagement siswa sebesar 40%. Fitur adaptive learning-nya benar-benar membuat perbedaan.', 5, true, true),
('f1000000-0000-0000-0000-000000000004', 'Indah Permata', 'Head of Engineering', 'FinanceApp', NULL, 'Refactoring codebase legacy kami menjadi arsitektur microservices berjalan smooth tanpa downtime. Sangat impressed dengan expertise di area DevOps.', 4, false, true),
('f1000000-0000-0000-0000-000000000005', 'Tommy Kurniawan', 'CEO', 'Digital Agency XYZ', NULL, 'Sudah 3 project bersama dan selalu puas dengan hasilnya. Kemampuan full-stack yang solid dari frontend hingga infrastructure.', 5, true, true),
('f1000000-0000-0000-0000-000000000006', 'Lina Hartono', 'UX Lead', 'DesignStudio', NULL, 'Implementasi design system yang sangat rapi. Setiap komponen accessible dan performant. Rare to find developer yang benar-benar peduli dengan UX.', 5, false, true),
('f1000000-0000-0000-0000-000000000007', 'Fajar Nugroho', 'VP Engineering', 'LogiTech Corp', NULL, 'Konsultasi arsitektur yang diberikan sangat valuable. Berhasil mengurangi cloud cost kami sebesar 35% dengan optimasi infrastructure.', 4, false, true),
('f1000000-0000-0000-0000-000000000008', 'Anisa Rahman', 'Startup Founder', 'HealthTech ID', NULL, 'MVP yang dibangun dalam 6 minggu berhasil mendapatkan seed funding. Kecepatan development tanpa mengorbankan kualitas code.', 5, true, true);

-- ============================================================
-- 8. SERVICES
-- ============================================================
INSERT INTO public.services (id, nama, slug, deskripsi_pendek, deskripsi_panjang, icon, harga_mulai, fitur, urutan, aktif) VALUES
('a7000000-0000-0000-0000-000000000001',
 'Full-Stack Web Development',
 'fullstack-web-development',
 'Pengembangan aplikasi web end-to-end dengan teknologi modern dan best practices.',
 'Saya membangun aplikasi web dari konsep hingga deployment menggunakan stack modern seperti Next.js, React, Node.js, dan berbagai database. Setiap project dibangun dengan fokus pada performance, security, dan maintainability.',
 'Globe', 'Rp 15.000.000',
 ARRAY['Custom web application', 'Responsive design', 'API development', 'Database design', 'Authentication & authorization', 'Deployment & CI/CD', 'Performance optimization', '3 bulan support gratis'],
 1, true),

('a7000000-0000-0000-0000-000000000002',
 'AI & Machine Learning Integration',
 'ai-ml-integration',
 'Integrasi solusi AI/ML ke dalam aplikasi existing atau pembangunan sistem AI baru.',
 'Dari chatbot cerdas hingga sistem rekomendasi, saya membantu bisnis memanfaatkan kekuatan AI. Termasuk fine-tuning LLM, computer vision, NLP, dan predictive analytics.',
 'Brain', 'Rp 25.000.000',
 ARRAY['LLM integration (GPT, Claude, Gemini)', 'Custom AI chatbot', 'Document processing & OCR', 'Recommendation system', 'Predictive analytics', 'Model training & fine-tuning', 'RAG implementation', 'AI-powered automation'],
 2, true),

('a7000000-0000-0000-0000-000000000003',
 'UI/UX Design & Prototyping',
 'ui-ux-design',
 'Desain antarmuka yang beautiful, accessible, dan user-centered.',
 'Proses desain yang dimulai dari research, wireframing, hingga high-fidelity prototype. Fokus pada usability, accessibility (WCAG 2.1), dan conversion optimization.',
 'Palette', 'Rp 8.000.000',
 ARRAY['User research & persona', 'Wireframing & prototyping', 'High-fidelity UI design', 'Design system creation', 'Usability testing', 'Responsive design', 'Accessibility audit', 'Figma deliverables'],
 3, true),

('a7000000-0000-0000-0000-000000000004',
 'DevOps & Cloud Infrastructure',
 'devops-cloud-infrastructure',
 'Setup dan optimasi infrastructure cloud dengan fokus pada reliability dan cost efficiency.',
 'Dari containerization hingga Kubernetes orchestration, saya membantu tim Anda mengadopsi DevOps practices yang meningkatkan velocity dan reliability.',
 'Cloud', 'Rp 12.000.000',
 ARRAY['Cloud architecture (AWS/GCP/Azure)', 'Docker & Kubernetes', 'CI/CD pipeline setup', 'Infrastructure as Code', 'Monitoring & alerting', 'Cost optimization', 'Security hardening', 'Disaster recovery planning'],
 4, true),

('a7000000-0000-0000-0000-000000000005',
 'Mobile App Development',
 'mobile-app-development',
 'Pengembangan aplikasi mobile cross-platform dengan React Native atau Flutter.',
 'Membangun aplikasi mobile yang performant dan beautiful untuk iOS dan Android dari satu codebase. Termasuk integrasi native features, push notifications, dan app store deployment.',
 'Smartphone', 'Rp 20.000.000',
 ARRAY['Cross-platform (iOS & Android)', 'Native performance', 'Offline-first architecture', 'Push notifications', 'In-app purchases', 'Analytics integration', 'App Store optimization', 'Post-launch support'],
 5, true),

('a7000000-0000-0000-0000-000000000006',
 'Technical Consulting',
 'technical-consulting',
 'Konsultasi arsitektur, code review, dan technical strategy untuk tim engineering.',
 'Membantu tim Anda membuat keputusan teknis yang tepat. Termasuk architecture review, technology selection, performance audit, dan mentoring untuk junior developers.',
 'MessageSquare', 'Rp 5.000.000',
 ARRAY['Architecture review', 'Technology selection', 'Performance audit', 'Security assessment', 'Code review', 'Team mentoring', 'Technical roadmap', 'Best practices workshop'],
 6, true);


-- ============================================================
-- 9. CONTACT MESSAGES
-- ============================================================
INSERT INTO public.contact_messages (id, nama, email, subjek, pesan, no_wa, layanan, dibaca, dibalas, created_at) VALUES
('a8000000-0000-0000-0000-000000000001', 'Bambang Suryanto', 'bambang@techcorp.id', 'Inquiry: Web Development Project', 'Halo, kami sedang mencari developer untuk membangun platform internal perusahaan. Apakah bisa diskusi lebih lanjut tentang timeline dan budget? Kami butuh sistem inventory management yang terintegrasi dengan ERP existing.', '081234567890', 'fullstack-web-development', true, true, '2026-04-10T09:00:00Z'),
('a8000000-0000-0000-0000-000000000002', 'Putri Handayani', 'putri@startup.io', 'Butuh AI Chatbot untuk Customer Service', 'Hi! Startup kami sedang scale up dan butuh AI chatbot untuk handle customer inquiries. Volume chat kami sekitar 500/hari. Bisa bantu implementasi?', '087654321098', 'ai-ml-integration', true, false, '2026-04-25T14:30:00Z'),
('a8000000-0000-0000-0000-000000000003', 'Kevin Tanaka', 'kevin@agency.com', 'Collaboration Opportunity', 'Saya dari digital agency dan tertarik untuk kolaborasi di beberapa project client kami. Apakah available untuk freelance partnership?', NULL, NULL, true, true, '2026-05-01T11:00:00Z'),
('a8000000-0000-0000-0000-000000000004', 'Rina Wulandari', 'rina@edu.ac.id', 'Workshop Request', 'Kami dari universitas ingin mengundang Anda sebagai pembicara workshop tentang AI dan Web Development untuk mahasiswa semester akhir. Apakah berkenan?', '089876543210', NULL, false, false, '2026-05-05T08:15:00Z'),
('a8000000-0000-0000-0000-000000000005', 'David Chen', 'david@fintech.co', 'Mobile App Development Quote', 'We need a fintech mobile app with biometric auth, real-time transaction tracking, and integration with local payment gateways. Can you provide a rough estimate?', '081122334455', 'mobile-app-development', false, false, '2026-05-08T16:45:00Z'),
('a8000000-0000-0000-0000-000000000006', 'Mega Sari', 'mega@umkm.id', 'Tanya Harga Website UMKM', 'Saya punya usaha kecil dan butuh website sederhana untuk katalog produk. Budget terbatas, apakah ada paket yang cocok?', '085566778899', 'fullstack-web-development', false, false, '2026-05-09T10:20:00Z'),
('a8000000-0000-0000-0000-000000000007', 'Arief Budiman', 'arief@enterprise.co.id', 'Cloud Migration Consultation', 'Perusahaan kami ingin migrasi dari on-premise ke cloud. Saat ini menggunakan 15 server physical. Butuh konsultasi untuk planning dan execution.', '081234509876', 'devops-cloud-infrastructure', false, false, '2026-05-10T13:00:00Z');

-- ============================================================
-- 10. NEWSLETTER SUBSCRIBERS
-- ============================================================
INSERT INTO public.newsletter_subscribers (id, email, nama, aktif, token_unsubscribe, subscribed_at) VALUES
('a9000000-0000-0000-0000-000000000001', 'subscriber1@gmail.com', 'Andi Pratama', true, 'tok-unsub-001-andi', '2026-03-15T10:00:00Z'),
('a9000000-0000-0000-0000-000000000002', 'subscriber2@yahoo.com', 'Bella Safitri', true, 'tok-unsub-002-bella', '2026-03-20T14:30:00Z'),
('a9000000-0000-0000-0000-000000000003', 'dev.carlos@outlook.com', 'Carlos Wijaya', true, 'tok-unsub-003-carlos', '2026-03-25T09:15:00Z'),
('a9000000-0000-0000-0000-000000000004', 'diana.tech@gmail.com', 'Diana Kusuma', true, 'tok-unsub-004-diana', '2026-04-01T11:00:00Z'),
('a9000000-0000-0000-0000-000000000005', 'eko.dev@proton.me', 'Eko Saputra', true, 'tok-unsub-005-eko', '2026-04-05T16:45:00Z'),
('a9000000-0000-0000-0000-000000000006', 'fani.code@gmail.com', 'Fani Rahmawati', true, 'tok-unsub-006-fani', '2026-04-10T08:30:00Z'),
('a9000000-0000-0000-0000-000000000007', 'gunawan@techmail.id', 'Gunawan Setiawan', true, 'tok-unsub-007-gunawan', '2026-04-12T13:20:00Z'),
('a9000000-0000-0000-0000-000000000008', 'hana.ui@gmail.com', 'Hana Permata', true, 'tok-unsub-008-hana', '2026-04-15T10:10:00Z'),
('a9000000-0000-0000-0000-000000000009', 'irfan.backend@yahoo.com', 'Irfan Hakim', true, 'tok-unsub-009-irfan', '2026-04-18T15:00:00Z'),
('a9000000-0000-0000-0000-000000000010', 'joko.cloud@gmail.com', 'Joko Susilo', true, 'tok-unsub-010-joko', '2026-04-20T09:45:00Z'),
('a9000000-0000-0000-0000-000000000011', 'kartika@devmail.com', 'Kartika Sari', true, 'tok-unsub-011-kartika', '2026-04-22T11:30:00Z'),
('a9000000-0000-0000-0000-000000000012', 'lukman.ai@gmail.com', 'Lukman Hakim', true, 'tok-unsub-012-lukman', '2026-04-25T14:00:00Z'),
('a9000000-0000-0000-0000-000000000013', 'maria.fullstack@outlook.com', 'Maria Gonzales', true, 'tok-unsub-013-maria', '2026-04-28T08:00:00Z'),
('a9000000-0000-0000-0000-000000000014', 'nadia.design@gmail.com', 'Nadia Putri', true, 'tok-unsub-014-nadia', '2026-05-01T10:30:00Z'),
('a9000000-0000-0000-0000-000000000015', 'oscar.mobile@proton.me', 'Oscar Tan', true, 'tok-unsub-015-oscar', '2026-05-03T16:15:00Z'),
('a9000000-0000-0000-0000-000000000016', 'unsubscribed@example.com', 'Former Reader', false, 'tok-unsub-016-former', '2026-03-10T10:00:00Z'),
('a9000000-0000-0000-0000-000000000017', 'inactive@example.com', 'Inactive User', false, 'tok-unsub-017-inactive', '2026-02-20T10:00:00Z');

-- ============================================================
-- 11. PAGE VIEWS (simulated traffic over 30 days)
-- ============================================================
INSERT INTO public.page_views (halaman, referrer, created_at) VALUES
('/', 'https://google.com', '2026-04-12T08:30:00Z'),
('/', 'https://google.com', '2026-04-12T10:15:00Z'),
('/', NULL, '2026-04-12T14:20:00Z'),
('/blog', 'https://google.com', '2026-04-13T09:00:00Z'),
('/blog/membangun-aplikasi-fullstack-nextjs-16-supabase', 'https://google.com', '2026-04-13T09:05:00Z'),
('/projects', NULL, '2026-04-13T11:30:00Z'),
('/', 'https://twitter.com', '2026-04-14T08:00:00Z'),
('/services', '/', '2026-04-14T08:05:00Z'),
('/contact', '/services', '2026-04-14T08:10:00Z'),
('/', NULL, '2026-04-15T10:00:00Z'),
('/blog', '/', '2026-04-15T10:02:00Z'),
('/blog/mengenal-large-language-models-gpt-claude', '/blog', '2026-04-15T10:05:00Z'),
('/', 'https://linkedin.com', '2026-04-16T09:30:00Z'),
('/resume', '/', '2026-04-16T09:35:00Z'),
('/projects', '/', '2026-04-16T09:40:00Z'),
('/', NULL, '2026-04-17T14:00:00Z'),
('/gallery', '/', '2026-04-17T14:05:00Z'),
('/blog', 'https://google.com', '2026-04-18T08:00:00Z'),
('/blog/design-system-membangun-komponen-ui-konsisten', '/blog', '2026-04-18T08:05:00Z'),
('/', 'https://dev.to', '2026-04-19T11:00:00Z'),
('/services', '/', '2026-04-19T11:05:00Z'),
('/', NULL, '2026-04-20T09:00:00Z'),
('/blog', '/', '2026-04-20T09:05:00Z'),
('/blog/mengenal-large-language-models-gpt-claude', 'https://google.com', '2026-04-20T15:30:00Z'),
('/', 'https://google.com', '2026-04-21T08:00:00Z'),
('/projects', '/', '2026-04-21T08:10:00Z'),
('/contact', '/projects', '2026-04-21T08:15:00Z'),
('/', NULL, '2026-04-22T10:00:00Z'),
('/blog/kubernetes-untuk-developer-panduan-praktis', 'https://google.com', '2026-04-22T10:30:00Z'),
('/', 'https://github.com', '2026-04-23T09:00:00Z'),
('/projects', '/', '2026-04-23T09:05:00Z'),
('/services', NULL, '2026-04-24T14:00:00Z'),
('/contact', '/services', '2026-04-24T14:10:00Z'),
('/', 'https://google.com', '2026-04-25T08:30:00Z'),
('/blog', '/', '2026-04-25T08:35:00Z'),
('/blog/react-native-vs-flutter-2026', '/blog', '2026-04-25T08:40:00Z'),
('/', NULL, '2026-04-26T11:00:00Z'),
('/gallery', '/', '2026-04-26T11:05:00Z'),
('/resume', 'https://linkedin.com', '2026-04-27T09:00:00Z'),
('/', 'https://google.com', '2026-04-28T08:00:00Z'),
('/blog', '/', '2026-04-28T08:05:00Z'),
('/services', NULL, '2026-04-29T10:00:00Z'),
('/', 'https://twitter.com', '2026-04-30T09:30:00Z'),
('/projects', '/', '2026-04-30T09:35:00Z'),
('/blog/membangun-aplikasi-fullstack-nextjs-16-supabase', 'https://google.com', '2026-05-01T08:00:00Z'),
('/', NULL, '2026-05-01T14:00:00Z'),
('/contact', '/', '2026-05-01T14:05:00Z'),
('/', 'https://google.com', '2026-05-02T09:00:00Z'),
('/blog', '/', '2026-05-02T09:05:00Z'),
('/blog/optimasi-performance-web-core-web-vitals-2026', '/blog', '2026-05-02T09:10:00Z'),
('/', NULL, '2026-05-03T10:30:00Z'),
('/services', '/', '2026-05-03T10:35:00Z'),
('/projects', 'https://github.com', '2026-05-04T08:00:00Z'),
('/', 'https://google.com', '2026-05-04T11:00:00Z'),
('/blog', '/', '2026-05-04T11:05:00Z'),
('/', NULL, '2026-05-05T09:00:00Z'),
('/blog/react-native-vs-flutter-2026', 'https://google.com', '2026-05-05T12:00:00Z'),
('/gallery', NULL, '2026-05-05T15:00:00Z'),
('/', 'https://linkedin.com', '2026-05-06T08:30:00Z'),
('/resume', '/', '2026-05-06T08:35:00Z'),
('/services', '/', '2026-05-06T08:40:00Z'),
('/contact', '/services', '2026-05-06T08:45:00Z'),
('/', 'https://google.com', '2026-05-07T09:00:00Z'),
('/blog', '/', '2026-05-07T09:05:00Z'),
('/projects', NULL, '2026-05-07T14:00:00Z'),
('/', NULL, '2026-05-08T08:00:00Z'),
('/blog/mengenal-large-language-models-gpt-claude', 'https://google.com', '2026-05-08T10:00:00Z'),
('/services', '/', '2026-05-08T11:00:00Z'),
('/', 'https://dev.to', '2026-05-09T09:30:00Z'),
('/blog', '/', '2026-05-09T09:35:00Z'),
('/blog/membangun-aplikasi-fullstack-nextjs-16-supabase', '/blog', '2026-05-09T09:40:00Z'),
('/', 'https://google.com', '2026-05-10T08:00:00Z'),
('/projects', '/', '2026-05-10T08:10:00Z'),
('/gallery', NULL, '2026-05-10T14:00:00Z'),
('/contact', 'https://google.com', '2026-05-10T16:00:00Z'),
('/', NULL, '2026-05-11T08:00:00Z'),
('/blog', '/', '2026-05-11T08:05:00Z'),
('/services', '/', '2026-05-11T10:00:00Z'),
('/resume', 'https://linkedin.com', '2026-05-11T11:30:00Z');
