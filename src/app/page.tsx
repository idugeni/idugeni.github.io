/**
 * @module Home
 * @description Komponen halaman utama yang menampilkan navigasi tab dan konten untuk setiap bagian website
 */

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomeSection } from '@/components/sections/home';
import { AboutSection } from '@/components/sections/about';
import { ProjectsSection } from '@/components/sections/projects';
import { ContactSection } from '@/components/sections/contact';
import { ResumeSection } from '@/components/sections/resume';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { HomeIcon, PersonIcon, BackpackIcon, EnvelopeClosedIcon, FileTextIcon } from '@radix-ui/react-icons';

/**
 * @function Home
 * @description Komponen utama yang mengelola tampilan dan navigasi website
 * @returns {JSX.Element} Komponen React yang merender layout utama dengan navigasi tab
 */
export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const isMobile = useIsMobile();

  /**
   * @function handleTabChange
   * @description Mengubah tab yang aktif saat ini
   * @param {string} value - Nilai tab yang akan diaktifkan
   */
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 w-full">
      <Tabs 
        defaultValue="home" 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="flex-1 flex flex-col"
      >
        <div className="flex justify-center mb-8 w-full">
          <TabsList 
            className={`${isMobile ? "w-full" : "w-auto max-w-4xl"} w-full`}
          >
            <TabsTrigger value="home" className="flex items-center gap-1">
              <HomeIcon className="size-4" />
              <span className={isMobile ? "hidden" : "inline"}>Home</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-1">
              <PersonIcon className="size-4" />
              <span className={isMobile ? "hidden" : "inline"}>About</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-1">
              <BackpackIcon className="size-4" />
              <span className={isMobile ? "hidden" : "inline"}>Project</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-1">
              <EnvelopeClosedIcon className="size-4" />
              <span className={isMobile ? "hidden" : "inline"}>Contact</span>
            </TabsTrigger>
            <TabsTrigger value="resume" className="flex items-center gap-1">
              <FileTextIcon className="size-4" />
              <span className={isMobile ? "hidden" : "inline"}>Resume</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto pb-8 w-full">
          <TabsContent value="home" className="mt-0">
            <HomeSection />
          </TabsContent>
          <TabsContent value="about" className="mt-0">
            <AboutSection />
          </TabsContent>
          <TabsContent value="projects" className="mt-0">
            <ProjectsSection />
          </TabsContent>
          <TabsContent value="contact" className="mt-0">
            <ContactSection />
          </TabsContent>
          <TabsContent value="resume" className="mt-0">
            <ResumeSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
