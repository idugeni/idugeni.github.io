'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DynamicRedirectPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(7);
  const path = params.slug.join('/');

  const hasHyphen = path.includes('-');

  useEffect(() => {
    if (!hasHyphen) {
      router.push('/404');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = `https://blog.oldsoul.id/${path}`;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasHyphen, path, router]);

  if (!hasHyphen) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-3xl w-full text-center space-y-6 bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800">Pembaruan Lokasi Konten</h1>
        
        <div className="space-y-4 text-gray-600">
          <p className="text-lg">
            Terima kasih telah mengunjungi halaman ini. Sebagai bagian dari upaya kami untuk meningkatkan pengalaman membaca dan menyajikan konten yang lebih terorganisir, kami telah memindahkan artikel ini ke platform blog yang baru.
          </p>
          
          <p className="text-lg">
            Platform blog baru kami menawarkan pengalaman membaca yang lebih baik dengan fitur-fitur tambahan seperti navigasi yang lebih mudah, kategori konten yang terstruktur, dan tampilan yang lebih modern.
          </p>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-lg">
              Anda akan dialihkan secara otomatis ke lokasi baru dalam <span className="font-semibold text-blue-600">{countdown} detik</span>.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href={`https://blog.oldsoul.id/${path}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            Kunjungi Sekarang
          </Link>
          
          <Link 
            href="/"
            className="px-6 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}