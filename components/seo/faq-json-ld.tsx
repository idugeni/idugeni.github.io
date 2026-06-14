/**
 * FAQ JSON-LD Schema
 *
 * Provides FAQ structured data for contact page
 * to enable FAQ rich snippets in Google search results.
 */

interface FAQItem {
  question: string;
  answer: string;
}

const contactFAQs: FAQItem[] = [
  {
    question: "Berapa lama response time untuk pesan yang dikirim?",
    answer: "Biasanya dalam waktu 24 jam pada hari kerja. Untuk proyek urgent, kami akan merespons lebih cepat melalui WhatsApp jika tersedia.",
  },
  {
    question: "Apakah bisa konsultasi gratis sebelum memulai proyek?",
    answer: "Ya, kami menyediakan sesi konsultasi awal gratis untuk memahami kebutuhan Anda dan memberikan estimasi biaya serta timeline yang transparan.",
  },
  {
    question: "Teknologi apa saja yang digunakan untuk pengembangan?",
    answer: "Kami menggunakan teknologi modern seperti Next.js, React, TypeScript, PostgreSQL, Supabase, dan AI/ML frameworks seperti LangChain dan TensorFlow sesuai kebutuhan proyek.",
  },
  {
    question: "Apakah ada garansi setelah proyek selesai?",
    answer: "Ya, setiap proyek mendapat garansi maintenance selama 30 hari setelah delivery untuk perbaikan bug dan minor adjustments.",
  },
  {
    question: "Bagaimana cara memulai kerja sama?",
    answer: "Cukup kirim pesan melalui form kontak dengan deskripsi kebutuhan Anda. Kami akan menghubungi Anda untuk diskusi lebih lanjut dan memberikan proposal yang sesuai.",
  },
];

export function FAQJsonLd() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": contactFAQs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  );
}
