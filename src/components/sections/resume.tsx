/**
 * @module ResumeSection
 * @description Modul yang menampilkan bagian resume dengan informasi profesional dan opsi unduhan
 */

import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail, Phone, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import resumeData from '@/data/resume.json';
import { ResumeData } from '@/types/resume';
import { exportToPDF, exportToDOCX } from '@/lib/resume-export';
import { useViewportAnimation } from '@/hooks/use-viewport-animation';

/**
 * @function ResumeSection
 * @description Komponen yang menampilkan resume lengkap dengan pengalaman, pendidikan, keterampilan, dan opsi unduhan
 * @returns {JSX.Element} Komponen React yang merender bagian resume
 */
export function ResumeSection() {
  const { downloadButton, header, summary, experience, education, skills } = resumeData;
  const { ref: headerRef, style: headerStyle } = useViewportAnimation({type: "fade-in", duration: 700});
  const { ref: summaryRef, style: summaryStyle } = useViewportAnimation({type: "fade-in", duration: 700});
  const { ref: experienceRef, style: experienceStyle } = useViewportAnimation({type: "fade-in", duration: 700});
  const { ref: educationRef, style: educationStyle } = useViewportAnimation({type: "fade-in", duration: 700});
  const { ref: skillsRef, style: skillsStyle } = useViewportAnimation({type: "fade-in", duration: 700});
  
  return (
    <div className="flex flex-col gap-8 py-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
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
      </div>
      
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="space-y-8">
            {/* Header */}
            <div 
              ref={headerRef}
              className="flex flex-col items-center gap-4"
              style={headerStyle}
            >
              <Avatar className="size-24 border-2 border-primary/20">
                <AvatarImage src={header.photo} alt={header.name} />
                <AvatarFallback className="text-lg">{header.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{header.name}</h1>
                <p className="text-xl text-muted-foreground">{header.title}</p>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {header.contact.map((item: string, index: number) => {
                  const icon = item.toLowerCase().includes('@') ? Mail :
                             item.toLowerCase().includes('+') ? Phone :
                             MapPin;
                  return (
                    <Button key={index} variant="ghost" size="sm" className="gap-2 flex items-center">
                      {React.createElement(icon, { size: 16 })}
                      <span className="text-sm">{item}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
            
            <Separator />
            
            {/* Ringkasan */}
            <div 
              ref={summaryRef}
              className=""
              style={summaryStyle}
            >
              <h3 className="text-lg font-semibold mb-2">Ringkasan Profesional</h3>
              <p className="text-muted-foreground">{summary}</p>
            </div>
            
            <Separator />
            
            {/* Pengalaman */}
            <div 
              ref={experienceRef}
              className=""
              style={experienceStyle}
            >
              <h3 className="text-lg font-semibold mb-4">Pengalaman Kerja</h3>
              <Accordion type="single" collapsible className="w-full">
                {experience.map((exp, index) => (
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
            </div>
            
            <Separator />
            
            {/* Pendidikan */}
            <div 
              ref={educationRef}
              className=""
              style={educationStyle}
            >
              <h3 className="text-lg font-semibold mb-4">Pendidikan</h3>
              <Accordion type="single" collapsible className="w-full">
                {education.map((edu, index) => (
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
                            {edu.achievements.map((achievement: string, achievementIndex: number) => (
                              <li key={achievementIndex}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <Separator />
            
            {/* Skills */}
            <div 
              ref={skillsRef}
              className=""
              style={skillsStyle}
            >
              <h3 className="text-lg font-semibold mb-4">Keahlian</h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-6">
                  <h4 className="text-sm text-center font-medium mb-4">Technical Skills</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(skills.technical).map(([category, items], index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="px-6">
                          <CardTitle className="text-base text-center font-semibold mb-4 text-primary border-b pb-2 border-primary/30 bg-gradient-to-r from-transparent via-primary/20 to-transparent">{category}</CardTitle>
                          <div className="flex flex-wrap justify-center gap-2">
                            {items.map((skill: string, skillIndex: number) => (
                              <Badge 
                                key={skillIndex} 
                                variant="outline" 
                                className="bg-primary/5 hover:bg-primary/10 transition-colors duration-200"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm text-center font-medium mb-4">Soft Skills</h4>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="px-6">
                      <div className="flex flex-wrap justify-center gap-2">
                        {skills.soft.map((skill: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="bg-primary/5 hover:bg-primary/10 transition-colors duration-200"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}