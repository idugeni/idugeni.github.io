/**
 * Modul untuk mengekspor data resume ke format PDF dan DOCX.
 * @module resume-export
 */

import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { ResumeData } from '@/types/resume';

/**
 * Mengekspor data resume ke format PDF.
 * @param {ResumeData} data - Data resume yang akan diekspor
 * @returns {Promise<Blob>} Blob yang berisi dokumen PDF
 */
export async function exportToPDF(data: ResumeData): Promise<Blob> {
  const doc = new jsPDF();
  let yPos = 20; // Posisi vertikal awal

  // Mengatur header dengan nama dan judul
  doc.setFontSize(24);
  doc.text(data.header.name, 20, yPos);
  yPos += 10;
  doc.setFontSize(16);
  doc.text(data.header.title, 20, yPos);
  yPos += 10;

  // Menambahkan informasi kontak
  doc.setFontSize(12);
  data.header.contact.forEach(contact => {
    doc.text(contact, 20, yPos);
    yPos += 7;
  });
  yPos += 5;

  // Menambahkan bagian ringkasan
  doc.setFontSize(14);
  doc.text('Ringkasan', 20, yPos);
  yPos += 7;
  doc.setFontSize(12);
  doc.text(data.summary, 20, yPos, { maxWidth: 170 }); // Membatasi lebar teks
  yPos += 20;

  // Menambahkan bagian pengalaman
  doc.setFontSize(14);
  doc.text('Pengalaman', 20, yPos);
  yPos += 10;
  data.experience.forEach(exp => {
    doc.setFontSize(12);
    doc.text(`${exp.position} - ${exp.company}`, 20, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(exp.period, 20, yPos);
    yPos += 7;
    exp.responsibilities.forEach(resp => {
      doc.text(`• ${resp}`, 25, yPos);
      yPos += 7;
    });
    yPos += 5;
  });

  return doc.output('blob');
}

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
        // Header dengan nama dan judul
        new Paragraph({
          text: data.header.name,
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          text: data.header.title,
          spacing: { after: 200 },
        }),
        // Informasi kontak
        ...data.header.contact.map(contact => 
          new Paragraph({ text: contact })
        ),
        // Bagian ringkasan
        new Paragraph({
          text: 'Ringkasan',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400 },
        }),
        new Paragraph({ text: data.summary }),
        // Bagian pengalaman
        new Paragraph({
          text: 'Pengalaman',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400 },
        }),
        ...data.experience.flatMap(exp => [
          new Paragraph({
            children: [
              new TextRun({
                text: `${exp.position} - ${exp.company}`,
                bold: true,
              }),
            ],
          }),
          new Paragraph({ text: exp.period }),
          ...exp.responsibilities.map(resp =>
            new Paragraph({
              text: `• ${resp}`,
              indent: { left: 720 },
            })
          ),
        ]),
      ],
    }],
  });

  return await Packer.toBlob(doc);
}