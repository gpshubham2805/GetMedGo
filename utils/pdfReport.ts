
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { PrescriptionResult } from '@/types/prescription';
import * as FileSystem from 'expo-file-system/legacy';

function escapeHtml(value: string = ''): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(value?: string): string {
  if (!value) return 'Not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value?: string): string {
  if (!value) return 'Not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildMedicineHtml(
  medicine: PrescriptionResult['medicines'][number],
  index: number
): string {
  const listSection = (
    title: string,
    items?: string[],
    className = 'safety'
  ) => {
    if (!items?.length) return '';

    return `
      <div class="${className}">
        <strong>${escapeHtml(title)}</strong>
        <ul>
          ${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </div>
    `;
  };

  return `
    <div class="medicine">
      <h3>${index + 1}. ${escapeHtml(medicine.name)}</h3>

      ${medicine.genericName
        ? `<p><strong>Generic:</strong> ${escapeHtml(medicine.genericName)}</p>`
        : ''}

      ${medicine.brandName
        ? `<p><strong>Brand:</strong> ${escapeHtml(medicine.brandName)}</p>`
        : ''}

      ${medicine.purpose
        ? `<p><strong>Purpose:</strong> ${escapeHtml(medicine.purpose)}</p>`
        : ''}

      <table class="schedule">
        <tr>
          <th>Dose</th>
          <th>Frequency</th>
          <th>Timing</th>
          <th>Duration</th>
        </tr>
        <tr>
          <td>${escapeHtml(medicine.dosage || 'Not specified')}</td>
          <td>${escapeHtml(medicine.frequency || 'Not specified')}</td>
          <td>${escapeHtml(medicine.timing || 'Not specified')}</td>
          <td>${escapeHtml(medicine.duration || 'Not specified')}</td>
        </tr>
      </table>

      ${listSection('Allergy Warnings', medicine.allergyWarnings, 'alert allergy')}
      ${listSection('Precautions', medicine.precautions)}
      ${listSection('Possible Side Effects', medicine.sideEffects)}
      ${listSection('Drug Interactions', medicine.interactions, 'safety interaction')}
      ${listSection('Generic Alternatives', medicine.replacements, 'safety alternative')}
    </div>
  `;
}

function buildTestHtml(
  test: PrescriptionResult['testsAndExaminations'][number],
  index: number
): string {
  return `
    <div class="test">
      <h3>${index + 1}. ${escapeHtml(test.name)}</h3>
      <p><strong>Details:</strong> ${escapeHtml(test.details || 'Not specified')}</p>
      <p><strong>When:</strong> ${escapeHtml(test.timing || 'Not specified')}</p>
    </div>
  `;
}

function buildReportHtml(result: PrescriptionResult): string {
  const medicines = (result.medicines || [])
    .map((medicine, index) => buildMedicineHtml(medicine, index))
    .join('');

  const tests = (result.testsAndExaminations || [])
    .map((test, index) => buildTestHtml(test, index))
    .join('');

  const listSection = (title: string, items?: string[]) => {
    if (!items?.length) return '';

    return `
      <section>
        <h2>${escapeHtml(title)}</h2>
        <ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </section>
    `;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          @page { size: A4; margin: 24px; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #1F2937;
            font-size: 12px;
            line-height: 1.5;
          }
          .header {
            border-bottom: 3px solid #2563EB;
            padding-bottom: 14px;
            margin-bottom: 18px;
          }
          .brand { font-size: 24px; font-weight: bold; color: #2563EB; margin: 0; }
          .subtitle { color: #6B7280; margin-top: 3px; }
          h2 {
            font-size: 16px;
            color: #111827;
            margin-top: 22px;
            margin-bottom: 10px;
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 5px;
          }
          h3 { font-size: 14px; color: #111827; margin: 0 0 6px; }
          p { margin: 4px 0; }
          ul { margin-top: 5px; padding-left: 20px; }
          li { margin-bottom: 4px; }
          .info, .schedule { width: 100%; border-collapse: collapse; }
          .info { margin-bottom: 10px; }
          .info td { padding: 6px 8px; border-bottom: 1px solid #E5E7EB; }
          .info .label { width: 30%; color: #6B7280; font-weight: bold; }
          .medicine, .test {
            border: 1px solid #D1D5DB;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          .schedule { margin: 10px 0; }
          .schedule th, .schedule td {
            border: 1px solid #D1D5DB;
            padding: 7px;
            text-align: left;
            vertical-align: top;
            overflow-wrap: anywhere;
          }
          .schedule th { background: #EFF6FF; color: #1E40AF; }
          .alert, .safety { padding: 9px 11px; border-radius: 6px; margin-top: 8px; }
          .alert ul, .safety ul { margin-bottom: 0; }
          .allergy { background: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; }
          .safety { background: #FFFBEB; border: 1px solid #FDE68A; }
          .interaction { background: #F5F3FF; border-color: #DDD6FE; color: #5B21B6; }
          .alternative { background: #F0FDF4; border-color: #BBF7D0; color: #166534; }
          .summary {
            background: #EFF6FF;
            border-left: 4px solid #2563EB;
            padding: 10px 12px;
            border-radius: 5px;
          }
          .footer {
            margin-top: 28px;
            padding-top: 10px;
            border-top: 1px solid #E5E7EB;
            color: #6B7280;
            font-size: 10px;
          }
          .disclaimer {
            margin-top: 12px;
            padding: 10px;
            background: #F9FAFB;
            border-radius: 6px;
            color: #6B7280;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="brand">GetMedGo</h1>
          <div class="subtitle">Prescription Analysis Report</div>
        </div>

        <section>
          <h2>Prescription Information</h2>
          <table class="info">
            <tr><td class="label">Patient Name</td><td>${escapeHtml(result.patientName || 'Not available')}</td></tr>
            <tr><td class="label">Doctor Name</td><td>${escapeHtml(result.doctorName || 'Not available')}</td></tr>
            <tr><td class="label">Prescription Date</td><td>${escapeHtml(formatDate(result.date))}</td></tr>
            <tr><td class="label">Scanned On</td><td>${escapeHtml(formatDateTime(result.analyzedAt))}</td></tr>
            ${result.diagnosis
              ? `<tr><td class="label">Diagnosis</td><td>${escapeHtml(result.diagnosis)}</td></tr>`
              : ''}
          </table>
        </section>

        ${result.summary
          ? `<section><h2>Summary</h2><div class="summary">${escapeHtml(result.summary)}</div></section>`
          : ''}

        <section>
          <h2>Medicines</h2>
          ${medicines || '<p>No medicines were identified.</p>'}
        </section>

        ${(result.testsAndExaminations || []).length
          ? `<section><h2>Tests &amp; Examinations</h2>${tests}</section>`
          : ''}

        ${listSection('Instructions', result.instructions)}
        ${listSection('Warnings', result.warnings)}

        <div class="disclaimer">
          <strong>Important:</strong>
          This report is generated from the prescription information available
          in GetMedGo. It is for reference only and does not replace advice
          from a qualified healthcare professional.
        </div>

        <div class="footer">
          Generated by GetMedGo<br />
          Scanned on ${escapeHtml(formatDateTime(result.analyzedAt))}
        </div>
      </body>
    </html>
  `;
}


export async function generatePrescriptionPdf(
  result: PrescriptionResult
): Promise<string> {
  const html = buildReportHtml(result);

  const { uri, base64 } = await Print.printToFileAsync({
    html,
    base64: true,
  });

  if (!base64) {
    throw new Error('Expo Print did not return PDF data.');
  }

  if (!FileSystem.documentDirectory) {
    throw new Error('App document directory is unavailable.');
  }

  const pdfUri =
    `${FileSystem.documentDirectory}GetMedGo-Prescription-${Date.now()}.pdf`;

  await FileSystem.writeAsStringAsync(pdfUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const info = await FileSystem.getInfoAsync(pdfUri);

  if (!info.exists || !info.size) {
    throw new Error('The PDF file was not saved correctly.');
  }

  console.log('Saved shareable PDF:', pdfUri, 'Size:', info.size);

  return pdfUri;
}

export async function sharePrescriptionPdf(
  result: PrescriptionResult
): Promise<void> {
  const pdfUri = await generatePrescriptionPdf(result);

  const available = await Sharing.isAvailableAsync();

  if (!available) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(pdfUri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share GetMedGo Prescription Report',
  });
}
