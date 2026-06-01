// Aspect ratio enum matching database
export type AspectRatio = "1:1" | "4:3" | "3:4" | "16:9" | "9:16" | "21:9" | "3:2" | "2:3";

// Base database row types (matching Supabase schema after camelCase transform)

export interface BlogArticle {
  id: string;
  judul: string;
  slug: string;
  konten: string;
  ringkasan: string;
  thumbnailUrl: string | null;
  thumbnailAspectRatio: AspectRatio;
  kategoriId: string | null;
  status: "draft" | "published";
  featured: boolean;
  publishedAt: string | null;
  jumlahLike: number;
  jumlahView: number;
  waktuBaca: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: string;
  nama: string;
  slug: string;
  createdAt: string;
}

export interface BlogComment {
  id: string;
  artikelId: string;
  namaKomentator: string;
  emailKomentator: string;
  isiKomentar: string;
  approved: boolean;
  parentId: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string;
  kategori: string | null;
  status: "ongoing" | "completed" | "archived";
  featured: boolean;
  thumbnailUrl: string | null;
  thumbnailAspectRatio: AspectRatio;
  githubUrl: string | null;
  liveUrl: string | null;
  techStack: string[];
  urutan: number;
  createdAt: string;
  updatedAt: string;
  // Phase 1 enhancements - optional fields
  tanggalMulai?: string | null;
  tanggalSelesai?: string | null;
  klien?: string | null;
  timSize?: string | null;
  peran?: string | null;
}

export interface Service {
  id: string;
  nama: string;
  slug: string;
  deskripsiPendek: string;
  deskripsiPanjang: string | null;
  icon: string | null;
  hargaMulai: string | null;
  fitur: string[];
  aktif: boolean;
  urutan: number;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  nama: string;
  jabatan: string;
  perusahaan: string | null;
  isi: string;
  rating: number;
  avatarUrl: string | null;
  avatarAspectRatio: AspectRatio;
  featured: boolean;
  tampil: boolean;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
  tipe: "foto" | "video";
  kategori: string | null;
  aspectRatio: AspectRatio;
  urutan: number;
  createdAt: string;
}

// Component Props Interfaces

export interface FeaturedProjectsProps {
  projects: Project[];
}

export interface ServicesSectionProps {
  services: Service[];
}

export interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export interface LatestArticlesProps {
  articles: BlogArticle[];
}

export interface BlogListClientProps {
  articles: BlogArticle[];
  categories: BlogCategory[];
  activeCategory?: string;
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface BlogDetailClientProps {
  article: BlogArticle;
  comments: BlogComment[];
  relatedArticles: BlogArticle[];
  processedContent: string;
}

export interface ProjectsListClientProps {
  projects: Project[];
  filters?: {
    categories: string[];
    statuses: string[];
    techStack: string[];
  };
  activeFilters?: {
    category?: string;
    status?: string;
    tech?: string;
  };
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface ProjectDetailClientProps {
  project: Project;
  processedDescription: string;
}

export interface ServicesListClientProps {
  services: Service[];
}

export interface GalleryClientProps {
  items: GalleryItem[];
}
