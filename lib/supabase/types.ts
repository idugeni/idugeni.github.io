export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      kategori: {
        Row: {
          id: string;
          nama: string;
          slug: string;
          deskripsi: string | null;
          warna: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          slug: string;
          deskripsi?: string | null;
          warna?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          slug?: string;
          deskripsi?: string | null;
          warna?: string | null;
          created_at?: string;
        };
      };
      blog_artikel: {
        Row: {
          id: string;
          judul: string;
          slug: string;
          ringkasan: string;
          konten: string;
          thumbnail_url: string | null;
          kategori_id: string | null;
          status: "draft" | "published";
          featured: boolean;
          jumlah_like: number;
          jumlah_view: number;
          waktu_baca: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          judul: string;
          slug: string;
          ringkasan: string;
          konten: string;
          thumbnail_url?: string | null;
          kategori_id?: string | null;
          status?: "draft" | "published";
          featured?: boolean;
          jumlah_like?: number;
          jumlah_view?: number;
          waktu_baca?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          judul?: string;
          slug?: string;
          ringkasan?: string;
          konten?: string;
          thumbnail_url?: string | null;
          kategori_id?: string | null;
          status?: "draft" | "published";
          featured?: boolean;
          jumlah_like?: number;
          jumlah_view?: number;
          waktu_baca?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      blog_komentar: {
        Row: {
          id: string;
          artikel_id: string;
          nama_komentator: string;
          email_komentator: string;
          isi_komentar: string;
          approved: boolean;
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          artikel_id: string;
          nama_komentator: string;
          email_komentator: string;
          isi_komentar: string;
          approved?: boolean;
          parent_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          artikel_id?: string;
          nama_komentator?: string;
          email_komentator?: string;
          isi_komentar?: string;
          approved?: boolean;
          parent_id?: string | null;
          created_at?: string;
        };
      };
      blog_like: {
        Row: {
          id: string;
          artikel_id: string;
          ip_address: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          artikel_id: string;
          ip_address: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          artikel_id?: string;
          ip_address?: string;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          nama: string;
          slug: string;
          deskripsi: string;
          thumbnail_url: string | null;
          github_url: string | null;
          live_url: string | null;
          tech_stack: string[];
          kategori: string | null;
          status: "ongoing" | "completed" | "archived";
          featured: boolean;
          urutan: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          slug: string;
          deskripsi: string;
          thumbnail_url?: string | null;
          github_url?: string | null;
          live_url?: string | null;
          tech_stack?: string[];
          kategori?: string | null;
          status?: "ongoing" | "completed" | "archived";
          featured?: boolean;
          urutan?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          slug?: string;
          deskripsi?: string;
          thumbnail_url?: string | null;
          github_url?: string | null;
          live_url?: string | null;
          tech_stack?: string[];
          kategori?: string | null;
          status?: "ongoing" | "completed" | "archived";
          featured?: boolean;
          urutan?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      gallery: {
        Row: {
          id: string;
          judul: string;
          deskripsi: string | null;
          file_url: string;
          tipe: "foto" | "video";
          kategori: string | null;
          thumbnail_url: string | null;
          urutan: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          judul: string;
          deskripsi?: string | null;
          file_url: string;
          tipe: "foto" | "video";
          kategori?: string | null;
          thumbnail_url?: string | null;
          urutan?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          judul?: string;
          deskripsi?: string | null;
          file_url?: string;
          tipe?: "foto" | "video";
          kategori?: string | null;
          thumbnail_url?: string | null;
          urutan?: number;
          created_at?: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          nama: string;
          jabatan: string | null;
          perusahaan: string | null;
          avatar_url: string | null;
          isi: string;
          rating: number;
          featured: boolean;
          tampil: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          jabatan?: string | null;
          perusahaan?: string | null;
          avatar_url?: string | null;
          isi: string;
          rating?: number;
          featured?: boolean;
          tampil?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          jabatan?: string | null;
          perusahaan?: string | null;
          avatar_url?: string | null;
          isi?: string;
          rating?: number;
          featured?: boolean;
          tampil?: boolean;
          created_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          nama: string;
          slug: string;
          deskripsi_pendek: string;
          deskripsi_panjang: string | null;
          icon: string | null;
          harga_mulai: string | null;
          fitur: string[];
          urutan: number;
          aktif: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          slug: string;
          deskripsi_pendek: string;
          deskripsi_panjang?: string | null;
          icon?: string | null;
          harga_mulai?: string | null;
          fitur?: string[];
          urutan?: number;
          aktif?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          slug?: string;
          deskripsi_pendek?: string;
          deskripsi_panjang?: string | null;
          icon?: string | null;
          harga_mulai?: string | null;
          fitur?: string[];
          urutan?: number;
          aktif?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          nama: string;
          email: string;
          subjek: string;
          pesan: string;
          no_wa: string | null;
          layanan: string | null;
          dibaca: boolean;
          dibalas: boolean;
          resend_admin_status: "pending" | "sent" | "skipped" | "failed";
          resend_admin_email_id: string | null;
          resend_admin_error: string | null;
          resend_auto_reply_status: "pending" | "sent" | "skipped" | "failed";
          resend_auto_reply_email_id: string | null;
          resend_auto_reply_error: string | null;
          resend_sent_at: string | null;
          replied_at: string | null;
          created_at: string;
          attachments: Array<{
            url: string;
            filename: string;
            size: number;
            type: string;
          }>;
        };
        Insert: {
          id?: string;
          nama: string;
          email: string;
          subjek: string;
          pesan: string;
          no_wa?: string | null;
          layanan?: string | null;
          dibaca?: boolean;
          dibalas?: boolean;
          resend_admin_status?: "pending" | "sent" | "skipped" | "failed";
          resend_admin_email_id?: string | null;
          resend_admin_error?: string | null;
          resend_auto_reply_status?: "pending" | "sent" | "skipped" | "failed";
          resend_auto_reply_email_id?: string | null;
          resend_auto_reply_error?: string | null;
          resend_sent_at?: string | null;
          replied_at?: string | null;
          created_at?: string;
          attachments?: Array<{
            url: string;
            filename: string;
            size: number;
            type: string;
          }>;
        };
        Update: {
          id?: string;
          nama?: string;
          email?: string;
          subjek?: string;
          pesan?: string;
          no_wa?: string | null;
          layanan?: string | null;
          dibaca?: boolean;
          dibalas?: boolean;
          resend_admin_status?: "pending" | "sent" | "skipped" | "failed";
          resend_admin_email_id?: string | null;
          resend_admin_error?: string | null;
          resend_auto_reply_status?: "pending" | "sent" | "skipped" | "failed";
          resend_auto_reply_email_id?: string | null;
          resend_auto_reply_error?: string | null;
          resend_sent_at?: string | null;
          replied_at?: string | null;
          created_at?: string;
          attachments?: Array<{
            url: string;
            filename: string;
            size: number;
            type: string;
          }>;
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          nama: string | null;
          aktif: boolean;
          token_unsubscribe: string;
          subscribed_at: string;
          unsubscribed_at: string | null;
          confirmation_token: string | null;
          confirmed: boolean;
          confirmed_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          nama?: string | null;
          aktif?: boolean;
          token_unsubscribe: string;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
          confirmation_token?: string | null;
          confirmed?: boolean;
          confirmed_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          nama?: string | null;
          aktif?: boolean;
          token_unsubscribe?: string;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
          confirmation_token?: string | null;
          confirmed?: boolean;
          confirmed_at?: string | null;
        };
      };
      page_views: {
        Row: {
          id: string;
          halaman: string;
          ip_address: string | null;
          user_agent: string | null;
          referrer: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          halaman: string;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          halaman?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_like: {
        Args: { article_id: string };
        Returns: undefined;
      };
      decrement_like: {
        Args: { article_id: string };
        Returns: undefined;
      };
      increment_view: {
        Args: { article_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      blog_artikel_status: "draft" | "published";
      project_status: "ongoing" | "completed" | "archived";
      gallery_tipe: "foto" | "video";
    };
  };
}

export type TablesInsert<
  T extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<
  T extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][T]["Update"];

export type Tables<
  T extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][T]["Row"];
