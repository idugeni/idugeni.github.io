// src/types/github.ts

export type GitHubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics: string[];
  updated_at: string;
  language: string | null;
};

export type FormattedProject = {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  image: string;
  demoUrl?: string;
  repoUrl: string;
};
