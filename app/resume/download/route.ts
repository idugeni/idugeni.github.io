import { resumeData } from "@/lib/data/resume";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 48;
const START_Y = 792;
const LINE_HEIGHT = 15;
const MAX_CHARS = 92;

function pdfEscape(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function wrapText(text: string, maxChars = MAX_CHARS) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

type PdfLine = {
  text: string;
  size?: number;
  font?: "regular" | "bold";
  gapAfter?: number;
  indent?: number;
};

function buildLines(): PdfLine[] {
  const lines: PdfLine[] = [
    { text: resumeData.owner, size: 24, font: "bold", gapAfter: 4 },
    { text: resumeData.headline, size: 11, font: "bold", gapAfter: 4 },
    {
      text: `${resumeData.location} · ${resumeData.email} · ${resumeData.phone} · ${resumeData.website} · ${resumeData.github}`,
      size: 9,
      gapAfter: 14,
    },
    { text: "PROFESSIONAL SUMMARY", size: 12, font: "bold", gapAfter: 4 },
    ...wrapText(resumeData.summary).map((text) => ({ text, size: 10 } satisfies PdfLine)),
    { text: "", gapAfter: 8 },
    { text: "METRICS", size: 12, font: "bold", gapAfter: 4 },
    {
      text: resumeData.metrics.map((metric) => `${metric.value} ${metric.label}`).join(" · "),
      size: 10,
      gapAfter: 12,
    },
    { text: "EXPERIENCE", size: 12, font: "bold", gapAfter: 4 },
  ];

  for (const item of resumeData.experience) {
    lines.push({ text: `${item.role} — ${item.company}`, size: 11, font: "bold", gapAfter: 1 });
    lines.push({ text: `${item.period} · ${item.location}`, size: 9, font: "bold", gapAfter: 2 });
    lines.push(...wrapText(item.description).map((text) => ({ text, size: 10 } satisfies PdfLine)));
    for (const highlight of item.highlights) {
      lines.push(...wrapText(`• ${highlight}`, 88).map((text) => ({ text, size: 9, indent: 10 } satisfies PdfLine)));
    }
    lines.push({ text: "", gapAfter: 6 });
  }

  lines.push({ text: "SELECTED PROJECT IMPACT", size: 12, font: "bold", gapAfter: 4 });
  for (const project of resumeData.projects) {
    lines.push({ text: `${project.name} — ${project.category}`, size: 10, font: "bold", gapAfter: 1 });
    lines.push(...wrapText(project.impact).map((text) => ({ text, size: 9 } satisfies PdfLine)));
    lines.push({ text: "", gapAfter: 4 });
  }

  lines.push({ text: "TECHNICAL SKILLS", size: 12, font: "bold", gapAfter: 4 });
  for (const group of resumeData.skillGroups) {
    lines.push({ text: `${group.label}: ${group.skills.join(", ")}`, size: 9 });
  }

  lines.push({ text: "", gapAfter: 8 });
  lines.push({ text: "CORE FOCUS", size: 12, font: "bold", gapAfter: 4 });
  for (const focus of resumeData.focusAreas) {
    lines.push(...wrapText(`• ${focus}`, 88).map((text) => ({ text, size: 9, indent: 10 } satisfies PdfLine)));
  }

  lines.push({ text: "", gapAfter: 8 });
  lines.push({ text: "EDUCATION & LANGUAGES", size: 12, font: "bold", gapAfter: 4 });
  for (const item of resumeData.education) {
    lines.push({ text: `${item.title} — ${item.institution} (${item.period})`, size: 9, font: "bold" });
    lines.push(...wrapText(item.description).map((text) => ({ text, size: 9 } satisfies PdfLine)));
  }
  lines.push({ text: resumeData.languages.join(" · "), size: 9 });

  return lines;
}

function paginate(lines: PdfLine[]) {
  const pages: PdfLine[][] = [[]];
  let y = START_Y;

  for (const line of lines) {
    const height = line.text ? LINE_HEIGHT : 0;
    const gap = line.gapAfter ?? 0;
    if (y - height - gap < 48 && pages[pages.length - 1].length > 0) {
      pages.push([]);
      y = START_Y;
    }
    pages[pages.length - 1].push(line);
    y -= height + gap;
  }

  return pages;
}

function contentStream(lines: PdfLine[]) {
  let y = START_Y;
  const commands = ["BT", "1 0 0 1 0 0 Tm"];

  for (const line of lines) {
    if (!line.text) {
      y -= line.gapAfter ?? 0;
      continue;
    }

    const font = line.font === "bold" ? "F2" : "F1";
    const size = line.size ?? 10;
    const x = MARGIN_X + (line.indent ?? 0);
    commands.push(`/${font} ${size} Tf`);
    commands.push(`${x} ${y} Td (${pdfEscape(line.text)}) Tj`);
    commands.push(`${-x} ${-y} Td`);
    y -= LINE_HEIGHT + (line.gapAfter ?? 0);
  }

  commands.push("ET");
  return commands.join("\n");
}

function buildPdf() {
  const pages = paginate(buildLines());
  const objects: string[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(`<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`);

  pages.forEach((pageLines, index) => {
    const pageObject = 3 + index * 2;
    const contentObject = pageObject + 1;
    const stream = contentStream(pageLines);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> /Contents ${contentObject} 0 R >>`);
    objects.push(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

export function GET() {
  return new Response(buildPdf(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="eliyanto-sarage-resume.pdf"',
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
