import { NextResponse } from 'next/server';
import { isRateLimited } from '@/lib/rate-limit';
import { env } from '@/lib/env';
import { createHash } from 'crypto';

// Konfigurasi rate limiting
const RATE_LIMIT = 10; // 10 permintaan per menit
const RATE_LIMIT_WINDOW = 60000; // 1 menit

// Tipe data untuk respons GitHub API
type GitHubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics: string[];
  updated_at: string;
  language: string | null;
};

// Tipe data untuk proyek yang diformat
type FormattedProject = {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  image: string; // URL thumbnail dari GitHub
  demoUrl?: string;
  repoUrl: string;
};

/**
 * Handler untuk GET request ke /api/github-projects
 * Mengambil data repositori dari GitHub API dan memformatnya sesuai dengan struktur yang dibutuhkan
 */
export async function GET() {
  try {
    // Menerapkan rate limiting
    // Karena kita tidak memiliki akses ke IP dalam API route, kita gunakan string tetap
    // Dalam implementasi nyata, Anda harus menggunakan IP pengguna atau token unik
    const clientIdentifier = 'api-client';
    if (isRateLimited(clientIdentifier, RATE_LIMIT, RATE_LIMIT_WINDOW)) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { status: 429 }
      );
    }

    // Username GitHub yang akan diambil repositorinya
    // Gunakan username dari environment variable jika tersedia, atau gunakan default
    const username = env.GITHUB_USERNAME || 'idugeni';
    
    // Mengambil data dari GitHub API
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=6&sort=updated&type=owner`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // Tambahkan token GitHub jika tersedia untuk menghindari rate limiting
          ...(env.GITHUB_TOKEN ? { 'Authorization': `token ${env.GITHUB_TOKEN}` } : {}),
        },
        next: { revalidate: 3600 }, // Cache selama 1 jam
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`);
    }

    const repos: GitHubRepo[] = await response.json();

    // Fungsi untuk membuat hash SHA1 dari nama repositori
    const createSHA1Hash = (repoName: string): string => {
      return createHash('sha1').update(repoName).digest('hex');
    };
    
    // Memformat data repositori sesuai dengan struktur yang dibutuhkan oleh komponen ProjectCard
    const formattedProjects: FormattedProject[] = repos.map((repo) => {
      const hashSHA1 = createSHA1Hash(repo.name);
      return {
        id: repo.id,
        title: repo.name.replace(/-/g, ' ').replace(/_/g, ' '),
        description: repo.description || 'No description provided',
        technologies: repo.topics.length > 0 ? repo.topics : [repo.language || 'Unknown'],
        imageUrl: '/illustration-depicts-a-cartoon-cat.webp', // Gambar default
        image: `https://opengraph.githubassets.com/${hashSHA1}/${username}/${repo.name}`,
        demoUrl: repo.homepage || undefined,
        repoUrl: repo.html_url,
      };
    });


    // Mengembalikan data yang sudah diformat
    return NextResponse.json({
      intro: "Kumpulan proyek terbaru dari GitHub yang menunjukkan keahlian dan pengalaman saya dalam pengembangan perangkat lunak.",
      projects: formattedProjects,
    });
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub repositories' },
      { status: 500 }
    );
  }
}