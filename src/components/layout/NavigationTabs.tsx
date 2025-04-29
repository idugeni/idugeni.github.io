'use client';

import { useEffect } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

import { Home, User, Briefcase, Mail, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

import { HomeSection } from '@/components/sections/HomeSections';
import { AboutSection } from '@/components/sections/AboutSections';
import { ProjectsSection } from '@/components/sections/ProjectsSections';
import { ContactSection } from '@/components/contact/ContactSection';
import { ResumeSection } from '@/components/sections/ResumeSections';

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const tabs = [
  { value: 'home', icon: Home, label: 'Home' },
  { value: 'about', icon: User, label: 'About' },
  { value: 'projects', icon: Briefcase, label: 'Projects' },
  { value: 'contact', icon: Mail, label: 'Contact' },
  { value: 'resume', icon: FileText, label: 'Resume' },
];

const animateClass = 'animate__animated animate__fadeIn animate__slideInUp';

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  useEffect(() => {
    const pageTitles = {
      home: 'Home',
      about: 'About',
      projects: 'Projects',
      contact: 'Contact',
      resume: 'Resume'
    };
    document.title = `${pageTitles[activeTab as keyof typeof pageTitles]} | Eliyanto Sarage`;
  }, [activeTab]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="w-full border-b border-border">
        <div className="max-w-4xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TooltipProvider delayDuration={200}>
              <TabsList className="relative w-full flex bg-muted/40 rounded-full py-1 my-4 overflow-hidden">
                {/* Active Indicator */}
                <div
                  className="absolute inset-y-0 left-0 w-1/5 bg-primary rounded-full z-0 transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(${tabs.findIndex((t) => t.value === activeTab) * 100}%)`,
                  }}
                />

                {tabs.map(({ value, icon: Icon, label }) => {
                  const isActive = activeTab === value;
                  return (
                    <Tooltip key={value}>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value={value}
                          className={cn(
                            'relative flex-1 z-10 min-w-0 px-2 py-2 transition-colors duration-300',
                            'flex flex-col md:flex-row items-center justify-center gap-0 md:gap-1',
                            isActive
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <Icon
                            size={18}
                            className={cn(
                              'transition-colors duration-300',
                              isActive
                                ? 'text-primary-foreground'
                                : 'text-muted-foreground'
                            )}
                          />
                          <span
                            className={cn(
                              'hidden md:inline transition-colors duration-300',
                              isActive
                                ? 'text-primary-foreground'
                                : 'text-muted-foreground'
                            )}
                          >
                            {label}
                          </span>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="md:hidden">
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TabsList>
            </TooltipProvider>
          </Tabs>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsContent value="home" className={cn('w-full', animateClass)}>
              <HomeSection onTabChange={onTabChange} />
            </TabsContent>
            <TabsContent value="about" className={cn('w-full', animateClass)}>
              <AboutSection />
            </TabsContent>
            <TabsContent value="projects" className={cn('w-full', animateClass)}>
              <ProjectsSection />
            </TabsContent>
            <TabsContent value="contact" className={cn('w-full', animateClass)}>
              <ContactSection />
            </TabsContent>
            <TabsContent value="resume" className={cn('w-full', animateClass)}>
              <ResumeSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
