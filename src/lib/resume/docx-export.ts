/**
 * Modul untuk mengekspor data resume ke format DOCX.
 * @module docx-export
 */

import { Document, Packer, Paragraph, TextRun } from 'docx';
import { ResumeData } from '@/types/resume';

/**
 * Mengekspor data resume ke format DOCX.
 * @param {ResumeData} data - Data resume yang akan diekspor
 * @returns {Promise<Blob>} Blob yang berisi dokumen DOCX
 */
export async function exportToDOCX(data: ResumeData): Promise<Blob> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Header with name and title
        new Paragraph({
          children: [new TextRun({ text: data.header.name, bold: true, size: 32 })],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: data.header.title, size: 24 })],
          spacing: { after: 400 },
        }),
        // Contact information
        ...data.header.contact.map(contact => 
          new Paragraph({
            children: [new TextRun({ text: contact, size: 20 })],
            spacing: { after: 200 },
          })
        ),
        // Summary section
        new Paragraph({
          children: [new TextRun({ text: 'Ringkasan', bold: true, size: 28 })],
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: data.summary, size: 20 })],
          spacing: { after: 400 },
        }),
        // Experience section
        new Paragraph({
          children: [new TextRun({ text: 'Pengalaman', bold: true, size: 28 })],
          spacing: { before: 400, after: 200 },
        }),
        ...data.experience.flatMap(exp => [
          new Paragraph({
            children: [new TextRun({ text: `${exp.position} - ${exp.company}`, bold: true, size: 24 })],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: exp.period, italics: true, size: 20 })],
            spacing: { after: 200 },
          }),
          ...exp.responsibilities.map(resp =>
            new Paragraph({
              children: [new TextRun({ text: `• ${resp}`, size: 20 })],
              indent: { left: 720 },
              spacing: { after: 100 },
            })
          ),
        ]),
        // Education section
        new Paragraph({
          children: [new TextRun({ text: 'Pendidikan', bold: true, size: 28 })],
          spacing: { before: 400, after: 200 },
        }),
        ...data.education.flatMap(edu => [
          new Paragraph({
            children: [new TextRun({ text: edu.degree, bold: true, size: 24 })],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: edu.institution, size: 20 })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: edu.period, italics: true, size: 20 })],
            spacing: { after: 200 },
          }),
        ]),
        // Skills section
        new Paragraph({
          children: [new TextRun({ text: 'Keterampilan', bold: true, size: 28 })],
          spacing: { before: 400, after: 200 },
        }),
        ...Object.entries(data.skills.technical).map(([category, skills]) =>
          new Paragraph({
            children: [
              new TextRun({ text: `${category}: `, bold: true, size: 20 }),
              new TextRun({ text: skills.join(', '), size: 20 }),
            ],
            spacing: { after: 200 },
          })
        ),
        // Languages section
        new Paragraph({
          children: [new TextRun({ text: 'Bahasa', bold: true, size: 28 })],
          spacing: { before: 400, after: 200 },
        }),
        ...data.languages.map(lang =>
          new Paragraph({
            children: [new TextRun({ text: `${lang.name} - ${lang.level}`, size: 20 })],
            spacing: { after: 200 },
          })
        ),
        // Certifications section (if available)
        ...(data.certifications && data.certifications.length > 0 ? [
          new Paragraph({
            children: [new TextRun({ text: 'Sertifikasi', bold: true, size: 28 })],
            spacing: { before: 400, after: 200 },
          }),
          ...data.certifications.flatMap(cert => [
            new Paragraph({
              children: [new TextRun({ text: cert.name, bold: true, size: 24 })],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [new TextRun({ text: cert.issuer, size: 20 })],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [new TextRun({ text: cert.year, italics: true, size: 20 })],
              spacing: { after: 200 },
            }),
          ]),
        ] : []),
      ],
    }],
  });

  return await Packer.toBlob(doc);
}