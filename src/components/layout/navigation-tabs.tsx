'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { HomeSection } from '@/components/sections/home';
import { AboutSection } from '@/components/sections/about';
import { ProjectsSection } from '@/components/sections/projects';
import { ContactSection } from '@/components/sections/contact';
import { ResumeSection } from '@/components/sections/resume';

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const tabTriggerClass = `
  inline-flex items-center justify-center
  px-4 py-2 rounded-full text-sm font-medium
  transition-all duration-200 ease-in-out
  data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-inner
  data-[state=inactive]:opacity-60 data-[state=inactive]:hover:opacity-80
  leading-none
`;

const animateClass = "animate__animated animate__fadeIn animate__slideInUp";

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="w-full border-b">
        <div className="max-w-screen-xl mx-auto px-4">
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={onTabChange}
            className="w-full"
          >
            <TabsList
  className="w-full flex justify-center items-center gap-2 bg-muted/40 rounded-xl px-2 py-1 my-4"
>
              <TabsTrigger value="home" className={tabTriggerClass}>Home</TabsTrigger>
              <TabsTrigger value="about" className={tabTriggerClass}>About</TabsTrigger>
              <TabsTrigger value="projects" className={tabTriggerClass}>Projetcs</TabsTrigger>
              <TabsTrigger value="contact" className={tabTriggerClass}>Contact</TabsTrigger>
              <TabsTrigger value="resume" className={tabTriggerClass}>Resume</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-screen-xl">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsContent value="home" className={`w-full ${animateClass}`}>
              <HomeSection onTabChange={onTabChange} />
            </TabsContent>
            <TabsContent value="about" className={`w-full ${animateClass}`}>
              <AboutSection />
            </TabsContent>
            <TabsContent value="projects" className={`w-full ${animateClass}`}>
              <ProjectsSection />
            </TabsContent>
            <TabsContent value="contact" className={`w-full ${animateClass}`}>
              <ContactSection />
            </TabsContent>
            <TabsContent value="resume" className={`w-full ${animateClass}`}>
              <ResumeSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
