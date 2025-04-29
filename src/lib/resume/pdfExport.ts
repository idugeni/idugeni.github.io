/**
 * Modul untuk mengekspor data resume ke format PDF.
 * @module pdf-export
 */

import { jsPDF } from 'jspdf';
import { ResumeData } from '@/types/resume';

/**
 * Mengekspor data resume ke format PDF.
 * @param {ResumeData} data - Data resume yang akan diekspor
 * @returns {Promise<Blob>} Blob yang berisi dokumen PDF
 */
export async function exportToPDF(data: ResumeData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margin = 20;
  let yPos = margin;
  const pageHeight = doc.internal.pageSize.height;
  const maxWidth = doc.internal.pageSize.width - (margin * 2);

  function checkAndAddPage() {
    if (yPos > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  }

  // Header dengan nama dan judul
  doc.setFontSize(24);
  doc.text(data.header.name, margin, yPos);
  yPos += 12;

  doc.setFontSize(16);
  doc.text(data.header.title, margin, yPos);
  yPos += 12;

  // Informasi kontak
  doc.setFontSize(11);
  data.header.contact.forEach(contact => {
    doc.text(contact, margin, yPos);
    yPos += 8;
  });
  yPos += 8;

  checkAndAddPage();

  // Bagian ringkasan
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan', margin, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const splitSummary = doc.splitTextToSize(data.summary, maxWidth - margin);
  doc.text(splitSummary, margin, yPos);
  yPos += (splitSummary.length * 6) + 10;

  checkAndAddPage();

  // Bagian pengalaman
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Pengalaman', margin, yPos);
  yPos += 10;

  data.experience.forEach(exp => {
    checkAndAddPage();

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const position = `${exp.position} - ${exp.company}`;
    doc.text(position, margin, yPos);
    yPos += 7;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.text(exp.period, margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    exp.responsibilities.forEach(resp => {
      checkAndAddPage();
      const bulletPoint = '• ';
      const respText = doc.splitTextToSize(resp, maxWidth - margin - 8);
      doc.text(bulletPoint, margin, yPos);
      doc.text(respText, margin + 5, yPos);
      yPos += (respText.length * 6) + 2;
    });
    yPos += 8;
  });

  // Bagian pendidikan
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Pendidikan', margin, yPos);
  yPos += 10;

  data.education.forEach(edu => {
    checkAndAddPage();
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(edu.degree, margin, yPos);
    yPos += 7;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(edu.institution, margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'italic');
    doc.text(edu.period, margin, yPos);
    yPos += 10;
  });

  checkAndAddPage();

  // Bagian keterampilan
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Keterampilan', margin, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const skillGroups = Object.entries(data.skills.technical);
  skillGroups.forEach(([category, skills]) => {
    checkAndAddPage();
    doc.setFont('helvetica', 'bold');
    doc.text(category + ':', margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    const skillText = skills.join(', ');
    const splitSkills = doc.splitTextToSize(skillText, maxWidth - margin);
    doc.text(splitSkills, margin, yPos);
    yPos += (splitSkills.length * 6) + 8;
  });

  checkAndAddPage();

  // Bagian bahasa
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Bahasa', margin, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  data.languages.forEach(lang => {
    checkAndAddPage();
    const langText = `${lang.name} - ${lang.level}`;
    doc.text(langText, margin, yPos);
    yPos += 7;
  });

  if (data.certifications && data.certifications.length > 0) {
    yPos += 3;
    checkAndAddPage();

    // Bagian sertifikasi
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Sertifikasi', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    data.certifications.forEach(cert => {
      checkAndAddPage();
      doc.setFont('helvetica', 'bold');
      doc.text(cert.name, margin, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      doc.text(cert.issuer, margin, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'italic');
      doc.text(cert.year, margin, yPos);
      yPos += 10;
    });
  }

  return doc.output('blob');
}