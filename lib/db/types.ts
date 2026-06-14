import type {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

// ============================================================
// ENUMS
// ============================================================

export type BlogArtikelStatus = "draft" | "published";
export type ProjectStatus = "ongoing" | "completed" | "archived";
export type GalleryTipe = "foto" | "video";

// ============================================================
// TABLE INTERFACES
// ============================================================

export interface KategoriTable {
  id: Generated<string>;
  nama: string;
  slug: string;
  deskripsi: string | null;
  warna: string | null;
  created_at: Generated<Date>;
}

export interface BlogArtikelTable {
  id: Generated<string>;
  judul: string;
  slug: string;
  ringkasan: string;
  konten: string;
  thumbnail_url: string | null;
  kategori_id: string | null;
  status: Generated<BlogArtikelStatus>;
  featured: Generated<boolean>;
  jumlah_like: Generated<number>;
  jumlah_view: Generated<number>;
  waktu_baca: Generated<number>;
  published_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface BlogKomentarTable {
  id: Generated<string>;
  artikel_id: string;
  nama_komentator: string;
  email_komentator: string;
  isi_komentar: string;
  approved: Generated<boolean>;
  parent_id: string | null;
  created_at: Generated<Date>;
}

export interface BlogLikeTable {
  id: Generated<string>;
  artikel_id: string;
  ip_address: string;
  created_at: Generated<Date>;
}

export interface ProjectsTable {
  id: Generated<string>;
  nama: string;
  slug: string;
  deskripsi: string;
  thumbnail_url: string | null;
  github_url: string | null;
  live_url: string | null;
  tech_stack: Generated<string[]>;
  kategori: string | null;
  status: Generated<ProjectStatus>;
  featured: Generated<boolean>;
  urutan: Generated<number>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface GalleryTable {
  id: Generated<string>;
  judul: string;
  deskripsi: string | null;
  file_url: string;
  tipe: GalleryTipe;
  kategori: string | null;
  thumbnail_url: string | null;
  urutan: Generated<number>;
  created_at: Generated<Date>;
}

export interface TestimonialsTable {
  id: Generated<string>;
  nama: string;
  jabatan: string | null;
  perusahaan: string | null;
  avatar_url: string | null;
  isi: string;
  rating: Generated<number>;
  featured: Generated<boolean>;
  tampil: Generated<boolean>;
  created_at: Generated<Date>;
}

export interface ServicesTable {
  id: Generated<string>;
  nama: string;
  slug: string;
  deskripsi_pendek: string;
  deskripsi_panjang: string | null;
  icon: string | null;
  harga_mulai: string | null;
  fitur: Generated<string[]>;
  urutan: Generated<number>;
  aktif: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface ContactMessagesTable {
  id: Generated<string>;
  nama: string;
  email: string;
  subjek: string;
  pesan: string;
  no_wa: string | null;
  layanan: string | null;
  attachments: string[] | null;
  resend_admin_status: Generated<string>;
  resend_admin_email_id: string | null;
  resend_admin_error: string | null;
  resend_auto_reply_status: Generated<string>;
  resend_auto_reply_email_id: string | null;
  resend_auto_reply_error: string | null;
  resend_sent_at: string | null;
  dibaca: Generated<boolean>;
  dibalas: Generated<boolean>;
  replied_at: string | null;
  created_at: Generated<Date>;
}

export interface NewsletterSubscribersTable {
  id: Generated<string>;
  email: string;
  nama: string | null;
  aktif: Generated<boolean>;
  token_unsubscribe: string;
  subscribed_at: Generated<Date>;
  unsubscribed_at: Date | null;
}

export interface PageViewsTable {
  id: Generated<string>;
  halaman: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  created_at: Generated<Date>;
}

// ============================================================
// DATABASE SCHEMA
// ============================================================

export interface Database {
  kategori: KategoriTable;
  blog_artikel: BlogArtikelTable;
  blog_komentar: BlogKomentarTable;
  blog_like: BlogLikeTable;
  projects: ProjectsTable;
  gallery: GalleryTable;
  testimonials: TestimonialsTable;
  services: ServicesTable;
  contact_messages: ContactMessagesTable;
  newsletter_subscribers: NewsletterSubscribersTable;
  page_views: PageViewsTable;
}

// ============================================================
// HELPER TYPES FOR CRUD OPERATIONS
// ============================================================

export type BlogArtikel = Selectable<BlogArtikelTable>;
export type NewBlogArtikel = Insertable<BlogArtikelTable>;
export type BlogArtikelUpdate = Updateable<BlogArtikelTable>;

export type Kategori = Selectable<KategoriTable>;
export type NewKategori = Insertable<KategoriTable>;
export type KategoriUpdate = Updateable<KategoriTable>;

export type BlogKomentar = Selectable<BlogKomentarTable>;
export type NewBlogKomentar = Insertable<BlogKomentarTable>;
export type BlogKomentarUpdate = Updateable<BlogKomentarTable>;

export type BlogLike = Selectable<BlogLikeTable>;
export type NewBlogLike = Insertable<BlogLikeTable>;

export type Project = Selectable<ProjectsTable>;
export type NewProject = Insertable<ProjectsTable>;
export type ProjectUpdate = Updateable<ProjectsTable>;

export type Gallery = Selectable<GalleryTable>;
export type NewGallery = Insertable<GalleryTable>;
export type GalleryUpdate = Updateable<GalleryTable>;

export type Testimonial = Selectable<TestimonialsTable>;
export type NewTestimonial = Insertable<TestimonialsTable>;
export type TestimonialUpdate = Updateable<TestimonialsTable>;

export type Service = Selectable<ServicesTable>;
export type NewService = Insertable<ServicesTable>;
export type ServiceUpdate = Updateable<ServicesTable>;

export type ContactMessage = Selectable<ContactMessagesTable>;
export type NewContactMessage = Insertable<ContactMessagesTable>;
export type ContactMessageUpdate = Updateable<ContactMessagesTable>;

export type NewsletterSubscriber = Selectable<NewsletterSubscribersTable>;
export type NewNewsletterSubscriber = Insertable<NewsletterSubscribersTable>;
export type NewsletterSubscriberUpdate = Updateable<NewsletterSubscribersTable>;

export type PageView = Selectable<PageViewsTable>;
export type NewPageView = Insertable<PageViewsTable>;
