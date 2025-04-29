import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail, Phone, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import resumeData from '@/data/resumeData.json';
import { ResumeData } from '@/types/resume';
import { exportToPDF, exportToDOCX } from '@/lib/resumeExport';
import { useViewportAnimation } from '@/hooks/use-viewport-animation';

/**
 * Komponen ResumeSection
 * @module ResumeSection
 * @description Menampilkan bagian resume dengan informasi profesional dan opsi unduhan.
 */
export function ResumeSection() {
  const { downloadButton, header, summary, experience, education, skills } = resumeData;
  const { ref: headerRef, style: headerStyle } = useViewportAnimation({ type: 'fade-in', duration: 700 });
  const { ref: summaryRef, style: summaryStyle } = useViewportAnimation({ type: 'fade-in', duration: 700 });
  const { ref: experienceRef, style: experienceStyle } = useViewportAnimation({ type: 'fade-in', duration: 700 });
  const { ref: educationRef, style: educationStyle } = useViewportAnimation({ type: 'fade-in', duration: 700 });
  const { ref: skillsRef, style: skillsStyle } = useViewportAnimation({ type: 'fade-in', duration: 700 });

  return (
    <section className="flex flex-col gap-8 py-8 max-w-4xl mx-auto">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resume</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2">
              <Download />
              {downloadButton}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={async () => {
              const blob = await exportToPDF(resumeData as ResumeData);
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'resume.pdf';
              a.click();
              URL.revokeObjectURL(url);
            }}>
              Unduh PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={async () => {
              const blob = await exportToDOCX(resumeData as ResumeData);
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'resume.docx';
              a.click();
              URL.revokeObjectURL(url);
            }}>
              Unduh DOCX
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="space-y-8">
            {/* Header */}
            <section ref={headerRef} className="flex flex-col items-center gap-4" style={headerStyle}>
              <Avatar className="size-24 border-2 border-primary/20">
                <AvatarImage src={header.photo} alt={header.name} />
                <AvatarFallback className="text-lg">{header.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{header.name}</h1>
                <p className="text-xl text-muted-foreground">{header.title}</p>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 mt-2 px-2">
                {header.contact.map((item: string, index: number) => {
                  const icon = item.toLowerCase().includes('@') ? Mail :
                    item.toLowerCase().includes('+') ? Phone :
                      MapPin;
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full sm:w-auto gap-1 sm:gap-2 flex items-center text-xs sm:text-sm"
                    >
                      {React.createElement(icon, {
                        size: typeof window !== 'undefined' && window.innerWidth < 640 ? 14 : 16
                      })}
                      <span className="sm:max-w-none">{item}</span>
                    </Button>
                  );
                })}
              </div>
            </section>
            <Separator />
            {/* Ringkasan */}
            <section ref={summaryRef} style={summaryStyle}>
              <h3 className="text-lg font-semibold mb-2">Ringkasan Profesional</h3>
              <p className="text-muted-foreground">{summary}</p>
            </section>
            <Separator />
            {/* Pengalaman */}
            <section ref={experienceRef} style={experienceStyle}>
              <h3 className="text-lg font-semibold mb-4">Pengalaman Kerja</h3>
              <Accordion type="single" collapsible className="w-full">
                {experience.map((exp: ResumeData["experience"][number], index: number) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-col items-start gap-1 w-full">
                        <div className="flex items-center gap-2 w-full justify-between">
                          <span className="font-medium text-lg">{exp.position}</span>
                          <Badge variant="secondary" className="text-xs">{exp.period}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">{exp.company}</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {exp.technologies.map((tech: string, techIndex: number) => (
                            <Badge key={techIndex} variant="outline" className="text-xs bg-primary/5">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Tanggung Jawab & Proyek</h4>
                          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                            {exp.responsibilities.map((resp: string, respIndex: number) => (
                              <li key={respIndex}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Pencapaian Utama</h4>
                          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                            {exp.achievements.map((achievement: string, achievementIndex: number) => (
                              <li key={achievementIndex}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
            <Separator />
            {/* Pendidikan */}
            <section ref={educationRef} style={educationStyle}>
              <h3 className="text-lg font-semibold mb-4">Pendidikan</h3>
              <Accordion type="single" collapsible className="w-full">
                {education.map((edu: ResumeData["education"][number], index: number) => (
                  <AccordionItem key={index} value={`edu-${index}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-col items-start gap-1 w-full">
                        <div className="flex items-center gap-2 w-full justify-between">
                          <span className="font-medium text-lg">{edu.degree}</span>
                          <Badge variant="secondary" className="text-xs">{edu.period}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">{edu.institution}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Pencapaian Akademik</h4>
                          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                            {edu.achievements.map((ach: string, achIndex: number) => (
                              <li key={achIndex}>{ach}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
            <Separator />
            {/* Keterampilan */}
            <section ref={skillsRef} style={skillsStyle}>
              <h3 className="text-lg font-semibold mb-4">Keterampilan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Teknis</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {Object.entries(skills.technical).map(([category, items]: [string, string[]]) => (
                      <li key={category}>
                        <span className="font-semibold">{category}: </span>
                        {items.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Soft Skills</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {skills.soft.map((soft: string, idx: number) => (
                      <li key={idx}>{soft}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}