/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { parseXmlStringToDoc } from './parser';

export interface PreviewBlock {
  id: string;
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'table';
  align?: 'left' | 'center' | 'right' | 'justify';
  runs?: {
    text: string;
    isBold?: boolean;
    isItalic?: boolean;
    isUnderline?: boolean;
    color?: string;
  }[];
  tableData?: {
    rows: {
      cells: {
        text: string;
        isHeader?: boolean;
        runs: {
          text: string;
          isBold?: boolean;
          isItalic?: boolean;
          color?: string;
        }[];
      }[];
    }[];
  };
}

export function extractDocumentPreviewBlocks(documentXml: string): PreviewBlock[] {
  const blocks: PreviewBlock[] = [];
  try {
    const doc = parseXmlStringToDoc(documentXml);
    const body = doc.getElementsByTagNameNS('*', 'body')[0] || doc.getElementsByTagName('w:body')[0];

    if (!body) return blocks;

    let blockCounter = 0;

    for (let i = 0; i < body.children.length; i++) {
      const child = body.children[i];

      if (child.localName === 'p') {
        const pBlock = parseParagraphToPreviewBlock(child, `p-${blockCounter++}`);
        if (pBlock) blocks.push(pBlock);
      } else if (child.localName === 'tbl') {
        const tblBlock = parseTableToPreviewBlock(child, `tbl-${blockCounter++}`);
        if (tblBlock) blocks.push(tblBlock);
      }
    }
  } catch (e) {
    console.warn('Failed to extract document preview blocks:', e);
  }

  return blocks;
}

function parseParagraphToPreviewBlock(
  p: Element,
  id: string
): PreviewBlock | null {
  // Determine alignment
  let align: 'left' | 'center' | 'right' | 'justify' = 'left';
  const jc = Array.from(p.getElementsByTagName('*')).find((el) => el.localName === 'jc');
  if (jc) {
    const val = jc.getAttribute('w:val') || jc.getAttribute('val');
    if (val === 'center') align = 'center';
    else if (val === 'right') align = 'right';
    else if (val === 'both') align = 'justify';
  }

  // Determine heading style if any
  let type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' = 'paragraph';
  const pStyle = Array.from(p.getElementsByTagName('*')).find((el) => el.localName === 'pStyle');
  if (pStyle) {
    const val = (pStyle.getAttribute('w:val') || '').toLowerCase();
    if (val.includes('heading1') || val.includes('judul1')) type = 'heading1';
    else if (val.includes('heading2') || val.includes('judul2')) type = 'heading2';
    else if (val.includes('heading3') || val.includes('judul3')) type = 'heading3';
  }

  // Extract runs
  const runs: {
    text: string;
    isBold?: boolean;
    isItalic?: boolean;
    isUnderline?: boolean;
    color?: string;
  }[] = [];

  const runElements = Array.from(p.children).filter((el) => el.localName === 'r');

  for (const r of runElements) {
    const t = Array.from(r.children).find((el) => el.localName === 't');
    if (!t) continue;

    const text = t.textContent || '';
    if (!text) continue;

    const rPr = Array.from(r.children).find((el) => el.localName === 'rPr');
    let isBold = false;
    let isItalic = false;
    let isUnderline = false;
    let color: string | undefined = undefined;

    if (rPr) {
      isBold = Array.from(rPr.children).some((el) => el.localName === 'b');
      isItalic = Array.from(rPr.children).some((el) => el.localName === 'i');
      isUnderline = Array.from(rPr.children).some((el) => el.localName === 'u');
      const colorEl = Array.from(rPr.children).find((el) => el.localName === 'color');
      if (colorEl) {
        const hex = colorEl.getAttribute('w:val') || colorEl.getAttribute('val');
        if (hex && hex !== 'auto') {
          color = `#${hex}`;
        }
      }
    }

    runs.push({
      text,
      isBold,
      isItalic,
      isUnderline,
      color,
    });
  }

  if (runs.length === 0) {
    // Empty paragraph spacer
    return {
      id,
      type: 'paragraph',
      align,
      runs: [{ text: '' }],
    };
  }

  return {
    id,
    type,
    align,
    runs,
  };
}

function parseTableToPreviewBlock(tbl: Element, id: string): PreviewBlock | null {
  const rows: {
    cells: {
      text: string;
      isHeader?: boolean;
      runs: {
        text: string;
        isBold?: boolean;
        isItalic?: boolean;
        color?: string;
      }[];
    }[];
  }[] = [];

  const trElements = Array.from(tbl.children).filter((el) => el.localName === 'tr');

  for (let rowIndex = 0; rowIndex < trElements.length; rowIndex++) {
    const tr = trElements[rowIndex];
    const tcElements = Array.from(tr.children).filter((el) => el.localName === 'tc');
    const cells: {
      text: string;
      isHeader?: boolean;
      runs: {
        text: string;
        isBold?: boolean;
        isItalic?: boolean;
        color?: string;
      }[];
    }[] = [];

    for (const tc of tcElements) {
      // Gather paragraphs inside table cell
      const pElements = Array.from(tc.children).filter((el) => el.localName === 'p');
      const cellRuns: {
        text: string;
        isBold?: boolean;
        isItalic?: boolean;
        color?: string;
      }[] = [];

      let cellText = '';
      for (const p of pElements) {
        const parsedP = parseParagraphToPreviewBlock(p, 'cell-p');
        if (parsedP && parsedP.runs) {
          for (const run of parsedP.runs) {
            cellRuns.push(run);
            cellText += run.text;
          }
        }
      }

      cells.push({
        text: cellText,
        isHeader: rowIndex === 0,
        runs: cellRuns,
      });
    }

    if (cells.length > 0) {
      rows.push({ cells });
    }
  }

  if (rows.length === 0) return null;

  return {
    id,
    type: 'table',
    tableData: { rows },
  };
}
