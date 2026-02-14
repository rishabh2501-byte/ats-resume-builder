import { Router, Response, NextFunction } from 'express';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import fs from 'fs';
import path from 'path';
import { getDb } from '../database/sqlite';
import { ApiError } from '../middleware/errorHandler';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Ensure exports directory exists
const exportsDir = path.join(__dirname, '../../exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// Export resume to PDF
router.post('/pdf', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { resumeData, options } = req.body;

    if (!resumeData) {
      throw ApiError.badRequest('Resume data is required');
    }

    const pdfBytes = await generatePDF(resumeData, options);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resumeData.name || 'resume'}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    next(error);
  }
});

// Export resume to DOCX
router.post('/docx', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { resumeData, options } = req.body;

    if (!resumeData) {
      throw ApiError.badRequest('Resume data is required');
    }

    const docxBuffer = await generateDOCX(resumeData, options);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${resumeData.name || 'resume'}.docx"`);
    res.send(docxBuffer);
  } catch (error) {
    next(error);
  }
});

// Export resume to TXT
router.post('/txt', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { resumeData } = req.body;

    if (!resumeData) {
      throw ApiError.badRequest('Resume data is required');
    }

    const txtContent = generateTXT(resumeData);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${resumeData.name || 'resume'}.txt"`);
    res.send(txtContent);
  } catch (error) {
    next(error);
  }
});

// Export resume to JSON
router.post('/json', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { resumeData } = req.body;

    if (!resumeData) {
      throw ApiError.badRequest('Resume data is required');
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${resumeData.name || 'resume'}.json"`);
    res.json(resumeData);
  } catch (error) {
    next(error);
  }
});

// PDF Generation
async function generatePDF(resumeData: any, options: any = {}): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = options.fontSize || 11;
  const margin = options.margins?.left || 50;
  const pageWidth = 612;
  const pageHeight = 792;
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const { personalInfo, experience, education, skills, projects, certifications } = resumeData;

  // Helper function to add text
  const addText = (text: string, size: number, isBold: boolean = false, color = rgb(0, 0, 0)) => {
    if (y < margin + 50) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: isBold ? boldFont : font,
      color,
    });
    y -= size + 4;
  };

  const addSection = (title: string) => {
    y -= 10;
    addText(title.toUpperCase(), fontSize + 2, true);
    page.drawLine({
      start: { x: margin, y: y + 2 },
      end: { x: pageWidth - margin, y: y + 2 },
      thickness: 1,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 5;
  };

  // Personal Info / Header
  if (personalInfo) {
    const fullName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim();
    if (fullName) {
      addText(fullName, fontSize + 8, true);
    }

    const contactLine = [
      personalInfo.email,
      personalInfo.phone,
      personalInfo.location,
    ].filter(Boolean).join(' | ');
    
    if (contactLine) {
      addText(contactLine, fontSize - 1);
    }

    const linksLine = [
      personalInfo.linkedIn,
      personalInfo.github,
      personalInfo.portfolio,
    ].filter(Boolean).join(' | ');
    
    if (linksLine) {
      addText(linksLine, fontSize - 1, false, rgb(0, 0, 0.7));
    }

    // Summary
    if (personalInfo.summary) {
      addSection('Professional Summary');
      const summaryLines = wrapText(personalInfo.summary, font, fontSize, pageWidth - 2 * margin);
      summaryLines.forEach(line => addText(line, fontSize));
    }
  }

  // Experience
  if (experience && experience.length > 0) {
    addSection('Experience');
    for (const exp of experience) {
      addText(`${exp.position} - ${exp.company}`, fontSize, true);
      const dateRange = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || ''}`;
      addText(`${exp.location || ''} | ${dateRange}`, fontSize - 1, false, rgb(0.4, 0.4, 0.4));
      
      if (exp.bullets && exp.bullets.length > 0) {
        for (const bullet of exp.bullets) {
          const bulletLines = wrapText(`• ${bullet}`, font, fontSize, pageWidth - 2 * margin - 10);
          bulletLines.forEach(line => addText(line, fontSize));
        }
      }
      y -= 5;
    }
  }

  // Education
  if (education && education.length > 0) {
    addSection('Education');
    for (const edu of education) {
      addText(`${edu.degree} in ${edu.field}`, fontSize, true);
      addText(`${edu.institution} | ${edu.startDate} - ${edu.endDate}`, fontSize - 1);
      if (edu.gpa) {
        addText(`GPA: ${edu.gpa}`, fontSize - 1);
      }
      y -= 5;
    }
  }

  // Skills
  if (skills && skills.length > 0) {
    addSection('Skills');
    const skillNames = skills.map((s: any) => s.name).join(', ');
    const skillLines = wrapText(skillNames, font, fontSize, pageWidth - 2 * margin);
    skillLines.forEach(line => addText(line, fontSize));
  }

  // Projects
  if (projects && projects.length > 0) {
    addSection('Projects');
    for (const proj of projects) {
      addText(proj.name, fontSize, true);
      if (proj.technologies && proj.technologies.length > 0) {
        addText(`Technologies: ${proj.technologies.join(', ')}`, fontSize - 1, false, rgb(0.4, 0.4, 0.4));
      }
      if (proj.bullets && proj.bullets.length > 0) {
        for (const bullet of proj.bullets) {
          const bulletLines = wrapText(`• ${bullet}`, font, fontSize, pageWidth - 2 * margin - 10);
          bulletLines.forEach(line => addText(line, fontSize));
        }
      }
      y -= 5;
    }
  }

  // Certifications
  if (certifications && certifications.length > 0) {
    addSection('Certifications');
    for (const cert of certifications) {
      addText(`${cert.name} - ${cert.issuer}`, fontSize);
      addText(`Issued: ${cert.issueDate}`, fontSize - 1, false, rgb(0.4, 0.4, 0.4));
    }
  }

  return pdfDoc.save();
}

// DOCX Generation
async function generateDOCX(resumeData: any, options: any = {}): Promise<Buffer> {
  const { personalInfo, experience, education, skills, projects, certifications } = resumeData;
  const children: Paragraph[] = [];

  // Header / Personal Info
  if (personalInfo) {
    const fullName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim();
    if (fullName) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: fullName, bold: true, size: 32 })],
          alignment: AlignmentType.CENTER,
        })
      );
    }

    const contactInfo = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(' | ');
    if (contactInfo) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: contactInfo, size: 20 })],
          alignment: AlignmentType.CENTER,
        })
      );
    }

    if (personalInfo.summary) {
      children.push(
        new Paragraph({ text: 'PROFESSIONAL SUMMARY', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: personalInfo.summary })
      );
    }
  }

  // Experience
  if (experience && experience.length > 0) {
    children.push(new Paragraph({ text: 'EXPERIENCE', heading: HeadingLevel.HEADING_2 }));
    for (const exp of experience) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${exp.position}`, bold: true }),
            new TextRun({ text: ` - ${exp.company}` }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.location || ''} | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || ''}`,
              italics: true,
              size: 20,
            }),
          ],
        })
      );
      if (exp.bullets) {
        for (const bullet of exp.bullets) {
          children.push(new Paragraph({ text: `• ${bullet}`, indent: { left: 360 } }));
        }
      }
    }
  }

  // Education
  if (education && education.length > 0) {
    children.push(new Paragraph({ text: 'EDUCATION', heading: HeadingLevel.HEADING_2 }));
    for (const edu of education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${edu.degree} in ${edu.field}`, bold: true }),
          ],
        }),
        new Paragraph({
          text: `${edu.institution} | ${edu.startDate} - ${edu.endDate}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`,
        })
      );
    }
  }

  // Skills
  if (skills && skills.length > 0) {
    children.push(
      new Paragraph({ text: 'SKILLS', heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: skills.map((s: any) => s.name).join(', ') })
    );
  }

  // Projects
  if (projects && projects.length > 0) {
    children.push(new Paragraph({ text: 'PROJECTS', heading: HeadingLevel.HEADING_2 }));
    for (const proj of projects) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: proj.name, bold: true })],
        })
      );
      if (proj.technologies?.length > 0) {
        children.push(new Paragraph({ text: `Technologies: ${proj.technologies.join(', ')}`, indent: { left: 360 } }));
      }
      if (proj.bullets) {
        for (const bullet of proj.bullets) {
          children.push(new Paragraph({ text: `• ${bullet}`, indent: { left: 360 } }));
        }
      }
    }
  }

  // Certifications
  if (certifications && certifications.length > 0) {
    children.push(new Paragraph({ text: 'CERTIFICATIONS', heading: HeadingLevel.HEADING_2 }));
    for (const cert of certifications) {
      children.push(new Paragraph({ text: `${cert.name} - ${cert.issuer} (${cert.issueDate})` }));
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return await Packer.toBuffer(doc);
}

// TXT Generation
function generateTXT(resumeData: any): string {
  const { personalInfo, experience, education, skills, projects, certifications } = resumeData;
  const lines: string[] = [];

  // Personal Info
  if (personalInfo) {
    const fullName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim();
    if (fullName) lines.push(fullName, '='.repeat(fullName.length));
    
    const contact = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean);
    if (contact.length) lines.push(contact.join(' | '));
    
    const links = [personalInfo.linkedIn, personalInfo.github, personalInfo.portfolio].filter(Boolean);
    if (links.length) lines.push(links.join(' | '));
    
    if (personalInfo.summary) {
      lines.push('', 'PROFESSIONAL SUMMARY', '-'.repeat(20), personalInfo.summary);
    }
  }

  // Experience
  if (experience?.length > 0) {
    lines.push('', 'EXPERIENCE', '-'.repeat(20));
    for (const exp of experience) {
      lines.push(`${exp.position} - ${exp.company}`);
      lines.push(`${exp.location || ''} | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || ''}`);
      if (exp.bullets) {
        for (const bullet of exp.bullets) {
          lines.push(`  • ${bullet}`);
        }
      }
      lines.push('');
    }
  }

  // Education
  if (education?.length > 0) {
    lines.push('EDUCATION', '-'.repeat(20));
    for (const edu of education) {
      lines.push(`${edu.degree} in ${edu.field}`);
      lines.push(`${edu.institution} | ${edu.startDate} - ${edu.endDate}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`);
      lines.push('');
    }
  }

  // Skills
  if (skills?.length > 0) {
    lines.push('SKILLS', '-'.repeat(20));
    lines.push(skills.map((s: any) => s.name).join(', '));
    lines.push('');
  }

  // Projects
  if (projects?.length > 0) {
    lines.push('PROJECTS', '-'.repeat(20));
    for (const proj of projects) {
      lines.push(proj.name);
      if (proj.technologies?.length > 0) {
        lines.push(`Technologies: ${proj.technologies.join(', ')}`);
      }
      if (proj.bullets) {
        for (const bullet of proj.bullets) {
          lines.push(`  • ${bullet}`);
        }
      }
      lines.push('');
    }
  }

  // Certifications
  if (certifications?.length > 0) {
    lines.push('CERTIFICATIONS', '-'.repeat(20));
    for (const cert of certifications) {
      lines.push(`${cert.name} - ${cert.issuer} (${cert.issueDate})`);
    }
  }

  return lines.join('\n');
}

// Helper: Wrap text to fit width
function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export default router;
