/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TemplateVariable, PlaceholderOccurrence, VariableType } from '../../types';
import { parseXmlStringToDoc } from './parser';

/**
 * Comprehensive placeholder regex:
 * Supports {{var}}, {{ var }}, { { var } }, ｛｛var｝｝,
 * with leading/trailing spaces, non-breaking spaces (\u00A0), zero-width characters, dots, and hyphens.
 */
export const PLACEHOLDER_REGEX =
  /[｛{][\s\u00A0\u200B\uFEFF]*[｛{][\s\u00A0\u200B\uFEFF]*([a-zA-Z0-9_.-]+)[\s\u00A0\u200B\uFEFF]*[｝}][\s\u00A0\u200B\uFEFF]*[｝}]/g;

export interface DetectionResult {
  variables: TemplateVariable[];
  occurrences: PlaceholderOccurrence[];
  totalOccurrences: number;
}

/**
 * Derives a human-friendly label from variable key.
 * Supports dot notation like "foto.pas_foto" -> "Foto: Pas Foto"
 * or "narasi.sejarah_perusahaan" -> "Narasi: Sejarah Perusahaan"
 */
export function formatFriendlyLabel(key: string): string {
  const acronyms: Record<string, string> = {
    nis: 'NIS',
    nik: 'NIK',
    pkl: 'PKL',
    id: 'ID',
    sk: 'SK',
    ktp: 'KTP',
    npwp: 'NPWP',
    rt: 'RT',
    rw: 'RW',
    ttd: 'TTD',
    hrd: 'HRD',
    ceo: 'CEO',
    pt: 'PT',
    cv: 'CV',
    qr: 'QR',
  };

  const formatSegment = (segment: string) => {
    return segment
      .split('_')
      .filter(Boolean)
      .map((word) => {
        const lower = word.toLowerCase();
        if (acronyms[lower]) return acronyms[lower];
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  if (key.includes('.')) {
    const parts = key.split('.');
    const prefix = parts[0].toLowerCase();
    const rest = parts.slice(1).join('.');

    if (['foto', 'gambar', 'image', 'img'].includes(prefix)) {
      return `Foto: ${formatSegment(rest)}`;
    }
    if (['narasi', 'cerita', 'paragraf', 'kisah', 'sejarah'].includes(prefix)) {
      return `Narasi: ${formatSegment(rest)}`;
    }
    if (['list', 'daftar', 'poin', 'item', 'rincian'].includes(prefix)) {
      return `Daftar: ${formatSegment(rest)}`;
    }

    return `${formatSegment(prefix)} · ${formatSegment(rest)}`;
  }

  return formatSegment(key);
}

/**
 * Infers input type based on variable key naming conventions.
 * Recognizes {{foto.blabla}} as 'image', {{narasi.blabla}} as 'textarea',
 * and {{list.blabla}} as 'list'.
 */
export function inferVariableType(key: string): VariableType {
  const lower = key.toLowerCase();

  // Explicit prefix or dot notation for list items
  if (
    lower.startsWith('list.') ||
    lower.startsWith('daftar.') ||
    lower.startsWith('poin.') ||
    lower.startsWith('item.') ||
    lower.startsWith('rincian.') ||
    lower.endsWith('.list') ||
    lower.endsWith('.daftar') ||
    lower === 'list' ||
    lower === 'daftar'
  ) {
    return 'list';
  }

  // Explicit prefix or dot notation for images
  if (
    lower.startsWith('foto.') ||
    lower.startsWith('gambar.') ||
    lower.startsWith('image.') ||
    lower.startsWith('img.') ||
    lower.endsWith('.foto') ||
    lower.endsWith('.gambar') ||
    lower.endsWith('.image') ||
    lower.includes('foto_') ||
    lower.includes('gambar_') ||
    lower === 'foto' ||
    lower === 'gambar' ||
    lower === 'logo' ||
    lower === 'avatar' ||
    lower === 'tanda_tangan'
  ) {
    return 'image';
  }

  // Explicit prefix or dot notation for long narration / paragraph
  if (
    lower.startsWith('narasi.') ||
    lower.startsWith('cerita.') ||
    lower.startsWith('paragraf.') ||
    lower.startsWith('deskripsi.') ||
    lower.startsWith('kisah.') ||
    lower.startsWith('artikel.') ||
    lower.includes('narasi') ||
    lower.includes('sejarah') ||
    lower.includes('latar_belakang') ||
    lower.includes('visi_misi') ||
    lower.includes('kesimpulan') ||
    lower.includes('ringkasan') ||
    lower.includes('uraian') ||
    lower.includes('alamat') ||
    lower.includes('keterangan') ||
    lower.includes('catatan')
  ) {
    return 'textarea';
  }

  if (
    lower.includes('tanggal') ||
    lower.includes('date') ||
    lower.includes('tgl') ||
    lower.includes('deadline') ||
    lower.includes('periode')
  ) {
    return 'date';
  }

  if (
    lower.includes('nis') ||
    lower.includes('nik') ||
    lower.includes('tahun') ||
    lower.includes('usia') ||
    lower.includes('umur') ||
    lower.includes('gaji') ||
    lower.includes('nominal') ||
    lower.includes('jumlah') ||
    lower.includes('kuota') ||
    lower.includes('harga') ||
    lower.includes('durasi')
  ) {
    return 'number';
  }

  return 'text';
}

/**
 * Determines location type from XML file path and parent elements.
 */
function determineLocationType(
  filePath: string,
  isInsideTable: boolean
): 'body' | 'table' | 'header' | 'footer' | 'other' {
  if (/header\d*\.xml/i.test(filePath)) return 'header';
  if (/footer\d*\.xml/i.test(filePath)) return 'footer';
  if (isInsideTable) return 'table';
  if (/document\.xml/i.test(filePath)) return 'body';
  return 'other';
}

/**
 * Extracts all placeholders from XML files of a DOCX.
 */
export function detectPlaceholders(xmlFiles: Map<string, string>): DetectionResult {
  const variableMap = new Map<string, TemplateVariable>();
  const occurrences: PlaceholderOccurrence[] = [];

  for (const [filePath, xmlContent] of xmlFiles.entries()) {
    try {
      const doc = parseXmlStringToDoc(xmlContent);

      // Find all paragraphs (<w:p>) regardless of namespace prefix
      const paragraphs = Array.from(doc.getElementsByTagName('*')).filter(
        (el) => el.localName === 'p'
      );

      paragraphs.forEach((p, pIndex) => {
        // Check if paragraph is inside a table cell (<w:tc>)
        let isInsideTable = false;
        let parent = p.parentElement;
        while (parent) {
          if (parent.localName === 'tc' || parent.localName === 'tbl') {
            isInsideTable = true;
            break;
          }
          parent = parent.parentElement;
        }

        const locationType = determineLocationType(filePath, isInsideTable);

        // Find all text elements (<w:t>) in this paragraph in document order
        const textElements = Array.from(p.getElementsByTagName('*')).filter(
          (el) => el.localName === 't'
        );

        if (textElements.length === 0) return;

        // Build character map of text elements
        // Each entry: { text: string, start: number, end: number, element: Element, runElement: Element | null }
        let fullParagraphText = '';
        const runMap: {
          start: number;
          end: number;
          element: Element;
          runElement: Element | null;
        }[] = [];

        for (const tEl of textElements) {
          // Sanitize invisible zero-width spaces and soft hyphens that Word might insert
          const rawText = tEl.textContent || '';
          const text = rawText.replace(/[\u200B\uFEFF\u200C\u200D\u2060\u00AD]/g, '');
          if (rawText !== text) {
            tEl.textContent = text;
          }

          const start = fullParagraphText.length;
          fullParagraphText += text;
          const end = fullParagraphText.length;

          // Find parent <w:r>
          let runEl: Element | null = null;
          let curr: Element | null = tEl.parentElement;
          while (curr && curr !== p) {
            if (curr.localName === 'r') {
              runEl = curr;
              break;
            }
            curr = curr.parentElement;
          }

          runMap.push({
            start,
            end,
            element: tEl,
            runElement: runEl,
          });
        }

        // Match regex against full paragraph text
        PLACEHOLDER_REGEX.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = PLACEHOLDER_REGEX.exec(fullParagraphText)) !== null) {
          const fullMatch = match[0]; // e.g. "{{ nama }}"
          const varKey = match[1].trim().replace(/\s*\.\s*/g, '.'); // clean variable key
          const matchStart = match.index;
          const matchEnd = matchStart + fullMatch.length;

          // Check which runs contain this match
          const affectedRuns = runMap.filter(
            (r) => r.end > matchStart && r.start < matchEnd
          );
          const isRunSplit = affectedRuns.length > 1;

          // Extract contextual snippet around the match
          const snippetStart = Math.max(0, matchStart - 25);
          const snippetEnd = Math.min(fullParagraphText.length, matchEnd + 25);
          let snippet = fullParagraphText.substring(snippetStart, snippetEnd).trim();
          if (snippetStart > 0) snippet = '...' + snippet;
          if (snippetEnd < fullParagraphText.length) snippet = snippet + '...';

          occurrences.push({
            key: varKey,
            filePath,
            locationType,
            paragraphIndex: pIndex,
            contextSnippet: snippet,
            isRunSplit,
            runCount: affectedRuns.length,
          });

          // Update variable map
          const existing = variableMap.get(varKey);
          if (existing) {
            existing.occurrences += 1;
            if (!existing.locations.includes(locationType)) {
              existing.locations.push(locationType);
            }
            if (existing.snippets.length < 3 && !existing.snippets.includes(snippet)) {
              existing.snippets.push(snippet);
            }
          } else {
            variableMap.set(varKey, {
              key: varKey,
              label: formatFriendlyLabel(varKey),
              type: inferVariableType(varKey),
              defaultValue: '',
              description: `Placeholder {{${varKey}}} di dokumen`,
              required: true,
              occurrences: 1,
              locations: [locationType],
              snippets: [snippet],
            });
          }
        }
      });
    } catch (e) {
      console.warn(`Failed scanning ${filePath} for placeholders:`, e);
    }
  }

  // Convert map to array sorted alphabetically
  const variables = Array.from(variableMap.values()).sort((a, b) =>
    a.key.localeCompare(b.key)
  );

  return {
    variables,
    occurrences,
    totalOccurrences: occurrences.length,
  };
}
