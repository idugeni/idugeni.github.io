/**
 * @module NavigationTabs
 * @description Komponen navigasi tab yang dapat digunakan kembali untuk mengelola navigasi antar halaman
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomeSection } from '@/components/sections/home';
import { AboutSection } from '@/components/sections/about';
import { ProjectsSection } from '@/components/sections/projects';
import { ContactSection } from '@/components/sections/contact';
import { ResumeSection } from '@/components/sections/resume';

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

/**
 * @function NavigationTabs
 * @description Komponen yang mengelola navigasi tab dan konten
 * @param {NavigationTabsProps} props - Props komponen
 * @returns {JSX.Element} Komponen React yang merender navigasi tab
 */
export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center pt-8">
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={onTabChange}
        className="w-full max-w-screen-xl mx-auto px-4"
      >
        <TabsList className="mb-4 flex justify-center w-full">
          <TabsTrigger value="home" className="flex items-center gap-1">
            Beranda
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-1">
            Tentang
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-1">
            Proyek
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-1">
            Kontak
          </TabsTrigger>
          <TabsTrigger value="resume" className="flex items-center gap-1">
            Resume
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center justify-center">
          <TabsContent value="home" className="mt-0 w-full">
            <HomeSection onTabChange={onTabChange} />
          </TabsContent>
          <TabsContent value="about" className="mt-0 w-full">
            <AboutSection />
          </TabsContent>
          <TabsContent value="projects" className="mt-0 w-full">
            <ProjectsSection />
          </TabsContent>
          <TabsContent value="contact" className="mt-0 w-full">
            <ContactSection />
          </TabsContent>
          <TabsContent value="resume" className="mt-0 w-full">
            <ResumeSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}