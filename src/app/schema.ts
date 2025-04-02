export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Eliyanto Sarage",
  "url": "https://oldsoul.id",
  "sameAs": ["https://oldsoul.id"],
  "jobTitle": "Full Stack Web Developer",
  "worksFor": {
    "@type": "Organization",
    "name": "Freelance"
  },
  "description": "Pengembang web full stack dengan keahlian dalam React, Node.js, dan teknologi modern",
  "knowsAbout": [
    "Web Development",
    "React",
    "Node.js",
    "TypeScript",
    "Next.js",
    "Full Stack Development"
  ],
  "hasOccupation": {
    "@type": "Occupation",
    "occupationName": "Full Stack Web Developer",
    "skills": "React, Node.js, TypeScript, Next.js, MongoDB, Docker"
  }
};

export const portfolioSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Portfolio Eliyanto Sarage",
  "description": "Koleksi proyek dan karya terbaik",
  "url": "https://oldsoul.id/projects",
  "sameAs": ["https://oldsoul.id/projects"],
  "about": {
    "@type": "Thing",
    "name": "Web Development Projects"
  }
};