import { Suspense } from "react";
import { PublicLayout } from "@/components/layout/public-layout";
import { JsonLd } from "@/components/seo/json-ld";
import { HeroSection } from "@/components/pages/home/hero-section";
import { StatsSection } from "@/components/pages/home/stats-section";
import { FeaturedProjects } from "@/components/pages/home/featured-projects";
import { ServicesSection } from "@/components/pages/home/services-section";
import { TechStackSection } from "@/components/pages/home/tech-stack-section";
import { TestimonialsCarousel } from "@/components/pages/home/testimonials-carousel";
import { GalleryPreview } from "@/components/pages/home/gallery-preview";
import { LatestArticles } from "@/components/pages/home/latest-articles";
import { NewsletterForm } from "@/components/pages/home/newsletter-form";
import { getHomeData } from "@/lib/data/public-content";

function HomeSectionsFallback() {
  return (
    <div className="border-y border-primary/10 bg-background/40 py-16" aria-hidden="true">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="h-32 animate-pulse rounded-none border border-primary/10 bg-primary/5" />
        <div className="h-32 animate-pulse rounded-none border border-primary/10 bg-primary/5 md:delay-75" />
        <div className="h-32 animate-pulse rounded-none border border-primary/10 bg-primary/5 md:delay-150" />
      </div>
    </div>
  );
}

async function HomeContentSections() {
  const { projects, services, testimonials, articles, galleryItems } = await getHomeData();

  return (
    <>
      <StatsSection />
      <FeaturedProjects projects={projects} />
      <ServicesSection services={services} />
      <TechStackSection />
      <TestimonialsCarousel testimonials={testimonials} />
      <GalleryPreview items={galleryItems} />
      <LatestArticles articles={articles} />
      <NewsletterForm />
    </>
  );
}

export default function Home() {
  return (
    <PublicLayout>
      <JsonLd />
      <HeroSection />
      <Suspense fallback={<HomeSectionsFallback />}>
        <HomeContentSections />
      </Suspense>
    </PublicLayout>
  );
}
