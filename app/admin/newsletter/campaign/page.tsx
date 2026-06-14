import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { AdminRuntimeFallback } from "@/components/admin/AdminRuntimeFallback";
import NewsletterCampaignPage from "./newsletter-campaign-client";

export const metadata: Metadata = { title: "Newsletter Campaign" };

async function NewsletterCampaignRuntimeContent() {
  await connection();

  return <NewsletterCampaignPage />;
}

export default function NewsletterCampaignRoute() {
  return (
    <Suspense fallback={<AdminRuntimeFallback label="LOADING_CAMPAIGN_DISPATCHER" />}>
      <NewsletterCampaignRuntimeContent />
    </Suspense>
  );
}
