import { CarePlan } from '../types/chikitsak';

function escapePdfText(input: string): string {
  return input
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapLine(text: string, maxChars = 84): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

/**
 * Generates a valid single-page PDF 1.4 document in pure TypeScript
 * so "Download PDF" works offline with zero external dependencies.
 */
export function downloadCarePlanPdf(plan: CarePlan, patientName: string): void {
  const lines: { text: string; bold?: boolean; size?: number; gapAfter?: number }[] = [
    { text: 'CHIKITSAK - Patient Discharge Care Plan', bold: true, size: 16, gapAfter: 6 },
    { text: `Patient: ${patientName}   |   Generated: ${plan.createdAt}`, size: 10, gapAfter: 4 },
    { text: `Hospital: ${plan.hospitalName}`, size: 10, gapAfter: 4 },
    { text: `Doctor: ${plan.doctorName} (${plan.doctorSpecialty})`, size: 10, gapAfter: 12 },
    { text: '1. DIAGNOSIS (SIMPLIFIED)', bold: true, size: 12, gapAfter: 4 },
    ...wrapLine(plan.diagnosisSimple).map((t) => ({ text: t, size: 10, gapAfter: 2 })),
    { text: `Follow-up Date: ${plan.followUpDate}`, bold: true, size: 10, gapAfter: 10 },
    { text: '2. CARE SUMMARY', bold: true, size: 12, gapAfter: 4 },
    ...wrapLine(plan.simplifiedSummary).map((t) => ({ text: t, size: 10, gapAfter: 2 })),
    { text: '', size: 8, gapAfter: 6 },
    { text: '3. MEDICINE SCHEDULE', bold: true, size: 12, gapAfter: 4 },
    ...plan.medicines.map((m) => ({
      text: `- ${m.period} (${m.time}): ${m.name} - ${m.dosage} [${m.timingNote}]`,
      size: 10,
      gapAfter: 3,
    })),
    { text: '', size: 8, gapAfter: 6 },
    { text: '4. DIET & LIFESTYLE', bold: true, size: 12, gapAfter: 4 },
    ...plan.dietAndLifestyle.flatMap((d) =>
      wrapLine(`- ${d}`).map((t) => ({ text: t, size: 10, gapAfter: 2 }))
    ),
    { text: '', size: 8, gapAfter: 6 },
    { text: '5. WARNING SIGNS - SEEK IMMEDIATE CARE IF:', bold: true, size: 12, gapAfter: 4 },
    ...plan.warningSigns.flatMap((w) =>
      wrapLine(`- ${w.title}: ${w.action}`).map((t) => ({ text: t, size: 10, gapAfter: 2 }))
    ),
    { text: '', size: 8, gapAfter: 10 },
    {
      text: 'Note: Simplified patient summary. Always refer to the original hospital discharge summary for clinical decisions.',
      size: 8,
      gapAfter: 2,
    },
  ];

  let y = 785;
  const commands: string[] = ['BT'];
  for (const item of lines) {
    if (y < 48) break;
    const font = item.bold ? '/F2' : '/F1';
    const size = item.size ?? 10;
    commands.push(`${font} ${size} Tf`);
    commands.push(`1 0 0 1 48 ${y} Tm`);
    commands.push(`(${escapePdfText(item.text)}) Tj`);
    y -= size + (item.gapAfter ?? 4);
  }
  commands.push('ET');

  const streamContent = commands.join('\n');

  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = plan.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  link.download = `CHIKITSAK_${safeName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
