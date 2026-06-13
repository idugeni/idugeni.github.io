import { siteConfig } from "@/lib/config/site";

export function JsonLdAbout() {
  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: siteConfig.owner.name,
      url: `${siteConfig.url}/about`,
      image: `${siteConfig.url}${siteConfig.seo.ogImage}`,
      jobTitle: siteConfig.owner.title,
      description: siteConfig.owner.bio,
      worksFor: { "@id": `${siteConfig.url}/#organization` },
      sameAs: [siteConfig.social.github, siteConfig.social.instagram],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Wonosobo",
        addressRegion: "Jawa Tengah",
        addressCountry: "ID",
      },
      hasOccupation: [
        { "@type": "Occupation", name: "Full Stack Developer" },
        { "@type": "Occupation", name: "UI/UX Designer" },
        { "@type": "Occupation", name: "AI Engineer" },
      ],
      knowsAbout: [
        "Full Stack Development", "UI/UX Design", "Artificial Intelligence",
        "Machine Learning", "Next.js", "React", "TypeScript", "Python",
        "Node.js", "Tailwind CSS", "Docker", "Kubernetes",
      ],
      hasCredential: [
        { "@type": "EducationalOccupationalCredential", name: "Google Cloud Professional Cloud Architect", credentialCategory: "certification" },
        { "@type": "EducationalOccupationalCredential", name: "AWS Certified Solutions Architect", credentialCategory: "certification" },
        { "@type": "EducationalOccupationalCredential", name: "TensorFlow Developer Certificate", credentialCategory: "certification" },
        { "@type": "EducationalOccupationalCredential", name: "Meta Front-End Developer Professional Certificate", credentialCategory: "certification" },
      ],
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "About", item: `${siteConfig.url}/about` },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
    />
  );
}

export function JsonLdContact() {
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${siteConfig.url}/contact`,
    name: "Contact",
    description: "Hubungi IRNK Codes untuk konsultasi, kolaborasi, dan proyek pengembangan digital.",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Contact", item: `${siteConfig.url}/contact` },
      ],
    },
    mainEntity: {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: siteConfig.contact.phone,
        email: siteConfig.contact.email,
        contactType: "customer service",
        availableLanguage: ["Indonesian", "English"],
        areaServed: ["ID", "SG", "MY"],
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
    />
  );
}

export function JsonLdResume() {
  const resumePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${siteConfig.url}/resume`,
    name: "Resume",
    description: "Resume profesional Eliyanto Sarage — Full Stack Developer, UI/UX Designer & AI Engineer.",
    mainEntity: {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: siteConfig.owner.name,
      jobTitle: siteConfig.owner.title,
      url: `${siteConfig.url}/resume`,
      hasOccupation: [
        { "@type": "Occupation", name: "Senior Full Stack Developer & AI Engineer", estimatedSalary: { "@type": "MonetaryAmount", currency: "IDR" } },
      ],
      worksFor: { "@id": `${siteConfig.url}/#organization` },
      knowsLanguage: ["id", "en"],
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Resume", item: `${siteConfig.url}/resume` },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(resumePageSchema) }}
    />
  );
}

export function JsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/irnk.png`,
      width: 512,
      height: 512,
    },
    image: `${siteConfig.url}${siteConfig.seo.ogImage}`,
    description: siteConfig.seo.description,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Wonosobo",
      addressRegion: "Jawa Tengah",
      addressCountry: "ID",
    },
    founder: {
      "@type": "Person",
      name: siteConfig.owner.name,
    },
    sameAs: [
      siteConfig.social.github,
      siteConfig.social.instagram,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.contact.phone,
      contactType: "customer service",
      email: siteConfig.contact.email,
      availableLanguage: ["Indonesian", "English"],
      areaServed: ["ID", "SG", "MY"],
    },
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteConfig.url}/#person`,
    name: siteConfig.owner.name,
    url: siteConfig.url,
    image: `${siteConfig.url}${siteConfig.seo.ogImage}`,
    jobTitle: siteConfig.owner.title,
    description: siteConfig.owner.bio,
    worksFor: {
      "@id": `${siteConfig.url}/#organization`,
    },
    sameAs: [
      siteConfig.social.github,
      siteConfig.social.instagram,
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Wonosobo",
      addressRegion: "Jawa Tengah",
      addressCountry: "ID",
    },
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "Self-taught Developer",
    },
    knowsAbout: [
      "Full Stack Development",
      "UI/UX Design",
      "Artificial Intelligence",
      "Machine Learning",
      "Next.js",
      "React",
      "TypeScript",
      "Python",
      "Node.js",
      "Tailwind CSS",
      "Supabase",
      "PostgreSQL",
      "REST API",
      "Mobile Development",
      "DevOps",
      "Cloud Computing",
    ],
    knowsLanguage: ["id", "en"],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    alternateName: ["IRNK Codes", "irnk.codes", "Eliyanto Sarage Portfolio"],
    url: siteConfig.url,
    description: siteConfig.seo.description,
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
    author: {
      "@id": `${siteConfig.url}/#person`,
    },
    inLanguage: "id-ID",
    potentialAction: [
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteConfig.url}/blog?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      {
        "@type": "ReadAction",
        target: `${siteConfig.url}/blog`,
      },
    ],
  };

  const siteNavigationSchema = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: "Main Navigation",
    hasPart: [
      { "@type": "WebPage", name: "Home", url: siteConfig.url },
      { "@type": "WebPage", name: "About", url: `${siteConfig.url}/about` },
      { "@type": "WebPage", name: "Projects", url: `${siteConfig.url}/projects` },
      { "@type": "WebPage", name: "Services", url: `${siteConfig.url}/services` },
      { "@type": "WebPage", name: "Blog", url: `${siteConfig.url}/blog` },
      { "@type": "WebPage", name: "Gallery", url: `${siteConfig.url}/gallery` },
      { "@type": "WebPage", name: "Contact", url: `${siteConfig.url}/contact` },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "About", item: `${siteConfig.url}/about` },
      { "@type": "ListItem", position: 3, name: "Projects", item: `${siteConfig.url}/projects` },
      { "@type": "ListItem", position: 4, name: "Services", item: `${siteConfig.url}/services` },
      { "@type": "ListItem", position: 5, name: "Blog", item: `${siteConfig.url}/blog` },
      { "@type": "ListItem", position: 6, name: "Gallery", item: `${siteConfig.url}/gallery` },
      { "@type": "ListItem", position: 7, name: "Contact", item: `${siteConfig.url}/contact` },
    ],
  };

  const professionalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteConfig.url}/#service`,
    name: siteConfig.name,
    url: siteConfig.url,
    image: `${siteConfig.url}${siteConfig.seo.ogImage}`,
    description: siteConfig.seo.description,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Wonosobo",
      addressRegion: "Jawa Tengah",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -7.3631,
      longitude: 109.8975,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.contact.phone,
      contactType: "customer service",
      email: siteConfig.contact.email,
      availableLanguage: ["Indonesian", "English"],
    },
    sameAs: [
      siteConfig.social.github,
      siteConfig.social.instagram,
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Digital Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Web Development",
            description: "Aplikasi web modern & scalable dengan Next.js, React, dan TypeScript",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "AI & ML Integration",
            description: "Chatbot, NLP, dan predictive analytics untuk bisnis",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "UI/UX Design",
            description: "Desain antarmuka yang beautiful dan user-friendly",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Mobile Development",
            description: "Cross-platform iOS & Android dengan React Native",
          },
        },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "30",
      bestRating: "5",
      worstRating: "1",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }}
      />
    </>
  );
}
