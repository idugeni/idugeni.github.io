import { PublicLayout } from "@/components/layout/public-layout";
import { ServicesListClient } from "@/components/pages/services/services-list-client";
import { getServicesIndexData } from "@/lib/data/public-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description: "Layanan pengembangan web, AI integration, UI/UX design, mobile development, dan DevOps. Solusi digital premium untuk bisnis Anda.",
};

export default async function ServicesPage() {
  const { services, error } = await getServicesIndexData();

  if (error) {
    return (
      <PublicLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Failed to load services.</p>
        </div>
      </PublicLayout>
    );
  }


  return (
    <PublicLayout>
      <ServicesListClient services={services} />
    </PublicLayout>
  );
}
