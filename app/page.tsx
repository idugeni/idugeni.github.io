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

export default async function Home() {
  const { projects, services, testimonials, articles, galleryItems } = await getHomeData();

  return (
    <PublicLayout>
      <JsonLd />
      <HeroSection />
      <StatsSection />
      {projects.length > 0 && <FeaturedProjects projects={projects} />}
      {services.length > 0 && <ServicesSection services={services} />}
      <TechStackSection />
      {testimonials.length > 0 && <TestimonialsCarousel testimonials={testimonials} />}
      {galleryItems.length > 0 && <GalleryPreview items={galleryItems} />}
      {articles.length > 0 && <LatestArticles articles={articles} />}
      <NewsletterForm />
    </PublicLayout>
  );
}
