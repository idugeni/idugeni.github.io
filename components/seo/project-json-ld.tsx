import { siteConfig } from "@/lib/config/site";
import type { Project } from "@/types/pages";

interface ProjectJsonLdProps {
  project: Project;
}

export function ProjectJsonLd({ project }: ProjectJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.nama,
    description: project.deskripsi,
    url: project.liveUrl || `${siteConfig.url}/projects/${project.slug}`,
    image: project.thumbnailUrl || `${siteConfig.url}${siteConfig.seo.ogImage}`,
    author: {
      "@type": "Person",
      name: siteConfig.owner.name,
      url: siteConfig.url,
    },
    applicationCategory: project.kategori || "WebApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
    ...(project.githubUrl && {
      codeRepository: project.githubUrl,
    }),
    programmingLanguage: project.techStack,
    dateCreated: project.createdAt,
    dateModified: project.updatedAt,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
