/**
 * @module Home
 * @description Komponen halaman utama yang menampilkan navigasi tab dan konten untuk setiap bagian website
 */

'use client';

import { useState } from 'react';
import { NavigationTabs } from '@/components/layout/NavigationTabs';

/**
 * @function Home
 * @description Komponen utama yang mengelola tampilan dan navigasi website
 * @returns Komponen React yang merender layout utama dengan navigasi tab
 */
export default function Home() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <main>
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {/* TODO: Tambahkan konten sesuai tab aktif di sini */}
    </main>
  );
}