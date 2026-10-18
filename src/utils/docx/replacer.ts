/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VariableValues } from '../../types';
import { PLACEHOLDER_REGEX } from './placeholderDetector';
import { parseXmlStringToDoc, serializeDocToXml } from './parser';
import { PreparedImage, createInlineDrawingXml } from './imageManager';

interface TextRunInfo {
  start: number;
  end: number;
  text: string;
  tElement: Element;
  rElement: Element | null;
  rPrElement: Element | null;
}

interface PlaceholderMatch {
  key: string;
  fullMatch: string;
  start: number;
  end: number;
}

/**
 * Replaces placeholders in a single paragraph element (<w:p>).
 * Handles multi-run split placeholders while preserving <w:rPr> formatting.
 * Also supports inline image replacement for {{foto.xxx}}.
 */
function replacePlaceholdersInParagraph(
  pElement: Element,
  values: VariableValues,
  xmlDoc: Document,
  preparedImages?: Map<string, PreparedImage>
): boolean {
  // Find all <w:t> elements in document order
  const tElements = Array.from(pElement.getElementsByTagName('*')).filter(
    (el) => el.localName === 't'
  );

  if (tElements.length === 0) return false;

  // Build character map of all runs in this paragraph
  let paragraphText = '';
  const textRuns: TextRunInfo[] = [];

  for (const tEl of tElements) {
    const rawText = tEl.textContent || '';
    const text = rawText.replace(/[\u200B\uFEFF\u200C\u200D\u2060\u00AD]/g, '');
    if (rawText !== text) {
      tEl.textContent = text;
    }

    const start = paragraphText.length;
    paragraphText += text;
    const end = paragraphText.length;

    // Find parent <w:r>
    let rEl: Element | null = null;
    let curr: Element | null = tEl.parentElement;
    while (curr && curr !== pElement) {
      if (curr.localName === 'r') {
        rEl = curr;
        break;
      }
      curr = curr.parentElement;
    }

    // Find <w:rPr> if any
    let rPrEl: Element | null = null;
    if (rEl) {
      for (let i = 0; i < rEl.children.length; i++) {
        if (rEl.children[i].localName === 'rPr') {
          rPrEl = rEl.children[i];
          break;
        }
      }
    }

    textRuns.push({
      start,
      end,
      text,
      tElement: tEl,
      rElement: rEl,
      rPrElement: rPrEl,
    });
  }

  // Find all placeholder matches
  PLACEHOLDER_REGEX.lastIndex = 0;
  const matches: PlaceholderMatch[] = [];
  let m: RegExpExecArray | null;

  while ((m = PLACEHOLDER_REGEX.exec(paragraphText)) !== null) {
    const cleanKey = m[1].trim().replace(/\s*\.\s*/g, '.');
    matches.push({
      key: cleanKey,
      fullMatch: m[0],
      start: m.index,
      end: m.index + m[0].length,
    });
  }

  if (matches.length === 0) return false;

  // Process matches in descending order (right-to-left)
  // This guarantees character offsets of earlier placeholders are unaffected
  matches.sort((a, b) => b.start - a.start);

  for (const match of matches) {
    const cleanKey = match.key;

    // Check if this variable has a prepared image
    const preparedImg =
      preparedImages?.get(cleanKey) ??
      preparedImages?.get(cleanKey.toLowerCase()) ??
      preparedImages?.get(cleanKey.replace(/-/g, '_'));

    // Get replacement value with resilient fallbacks
    const candidateKeys = [
      cleanKey,
      cleanKey.toLowerCase(),
      cleanKey.replace(/-/g, '_'),
      cleanKey.replace(/_/g, '-'),
    ];
    const rawVal = candidateKeys
      .map((k) => values[k])
      .find((v) => v !== undefined && v !== null && String(v).trim() !== '');

    // Unfilled variable: keep the original {{placeholder}} in the document
    if (rawVal === undefined) continue;
    const replacement = String(rawVal);

    // Find all runs that intersect with this match
    const affectedRuns = textRuns.filter(
      (run) => run.end > match.start && run.start < match.end
    );

    if (affectedRuns.length === 0) continue;

    if (affectedRuns.length === 1) {
      // Single run contains the entire placeholder
      const run = affectedRuns[0];
      const relStart = match.start - run.start;
      const relEnd = match.end - run.start;

      const prefix = run.text.substring(0, relStart);
      const suffix = run.text.substring(relEnd);

      if (preparedImg && run.rElement) {
        applyImageToRun(run.tElement, run.rElement, prefix, suffix, preparedImg, xmlDoc);
      } else {
        applyTextToRun(run.tElement, run.rElement, prefix, replacement, suffix, xmlDoc);
      }
    } else {
      // MULTI-RUN SPLIT: Placeholder spans across 2 or more <w:r> runs
      // Example: run0 has "{{na", run1 has "ma}}"
      const firstRun = affectedRuns[0];
      const lastRun = affectedRuns[affectedRuns.length - 1];

      // Prefix from first run (before placeholder starts)
      const prefix = firstRun.text.substring(0, match.start - firstRun.start);

      // Suffix from last run (after placeholder ends)
      const suffix = lastRun.text.substring(match.end - lastRun.start);

      // Pick the primary run to host the replacement value.
      // Prioritize run that has formatting (rPr) or an inner run that had the variable name.
      let primaryRun = affectedRuns.find(
        (r) => r.rPrElement && r.rPrElement.children.length > 0
      );

      if (!primaryRun) {
        primaryRun = affectedRuns.length > 2 ? affectedRuns[1] : firstRun;
      }

      // Clear or update all affected runs
      for (const run of affectedRuns) {
        if (run === primaryRun) {
          // This run will host the replacement value or image!
          const runPrefix = run === firstRun ? prefix : '';
          const runSuffix = run === lastRun ? suffix : '';

          if (preparedImg && run.rElement) {
            applyImageToRun(
              run.tElement,
              run.rElement,
              runPrefix,
              runSuffix,
              preparedImg,
              xmlDoc
            );
          } else {
            applyTextToRun(
              run.tElement,
              run.rElement,
              runPrefix,
              replacement,
              runSuffix,
              xmlDoc
            );
          }
        } else if (run === firstRun) {
          // First run only retains its prefix
          run.tElement.textContent = prefix;
          if (prefix) {
            run.tElement.setAttribute('xml:space', 'preserve');
          }
        } else if (run === lastRun) {
          // Last run only retains its suffix
          run.tElement.textContent = suffix;
          if (suffix) {
            run.tElement.setAttribute('xml:space', 'preserve');
          }
        } else {
          // Middle runs that were completely inside {{variable}} are emptied
          run.tElement.textContent = '';
        }
      }
    }
  }

  return true;
}

/**
 * Inserts an inline DrawingML image into a Word run (<w:r>).
 */
function applyImageToRun(
  tEl: Element,
  rEl: Element,
  prefix: string,
  suffix: string,
  img: PreparedImage,
  xmlDoc: Document
): void {
  // Update prefix on current text element
  tEl.textContent = prefix;
  if (prefix) {
    tEl.setAttribute('xml:space', 'preserve');
  }

  // Create drawing element
  const drawing = createInlineDrawingXml(xmlDoc, img);

  // Insert drawing element after tEl
  if (tEl.nextSibling) {
    rEl.insertBefore(drawing, tEl.nextSibling);
  } else {
    rEl.appendChild(drawing);
  }

  // If there's a suffix, insert a new <w:t> after the drawing
  if (suffix) {
    const suffixT = xmlDoc.createElementNS(
      'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
      'w:t'
    );
    suffixT.setAttribute('xml:space', 'preserve');
    suffixT.textContent = suffix;

    if (drawing.nextSibling) {
      rEl.insertBefore(suffixT, drawing.nextSibling);
    } else {
      rEl.appendChild(suffixT);
    }
  }
}

/**
 * Sets text content in a run (<w:r>), faithfully supporting:
 * - Line breaks / Enters via <w:br/>
 * - Indentation and Tabs via <w:tab/>
 * - Preserving spacing via xml:space="preserve"
 * This enables both {{narasi.}} and {{list.}} to have authentic Word paragraph indents,
 * bullet lists, numbered points, and tab stops.
 */
function applyTextToRun(
  tEl: Element,
  rEl: Element | null,
  prefix: string,
  replacement: string,
  suffix: string,
  xmlDoc: Document
): void {
  const fullText = prefix + replacement + suffix;
  const NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

  // Fast path for simple single-line text without tabs or enters
  if (!fullText.includes('\n') && !fullText.includes('\t') && !fullText.includes('\r')) {
    tEl.textContent = fullText;
    if (fullText.startsWith(' ') || fullText.endsWith(' ') || fullText.includes('  ')) {
      tEl.setAttribute('xml:space', 'preserve');
    }
    return;
  }

  if (!rEl) {
    tEl.textContent = fullText;
    return;
  }

  // Parse lines and tabs into OpenXML elements (<w:t>, <w:br/>, <w:tab/>)
  const lines = fullText.split(/\r?\n/);
  const elements: Element[] = [];

  for (let lIdx = 0; lIdx < lines.length; lIdx++) {
    // If not first line, insert line break <w:br/>
    if (lIdx > 0) {
      elements.push(xmlDoc.createElementNS(NS, 'w:br'));
    }

    const line = lines[lIdx];
    if (line.length === 0) {
      // Empty line for paragraph gap: add empty preserved <w:t>
      const emptyT = xmlDoc.createElementNS(NS, 'w:t');
      emptyT.setAttribute('xml:space', 'preserve');
      emptyT.textContent = '';
      elements.push(emptyT);
      continue;
    }

    if (line.includes('\t')) {
      // Line contains tab characters: split and emit <w:tab/> elements
      const segments = line.split(/(\t)/);
      for (const seg of segments) {
        if (seg === '\t') {
          elements.push(xmlDoc.createElementNS(NS, 'w:tab'));
        } else if (seg.length > 0) {
          const t = xmlDoc.createElementNS(NS, 'w:t');
          t.setAttribute('xml:space', 'preserve');
          t.textContent = seg;
          elements.push(t);
        }
      }
    } else {
      const t = xmlDoc.createElementNS(NS, 'w:t');
      t.setAttribute('xml:space', 'preserve');
      t.textContent = line;
      elements.push(t);
    }
  }

  if (elements.length === 0) {
    tEl.textContent = '';
    return;
  }

  // Replace tEl in rEl with our generated sequence of elements
  let refNode: Node = tEl;
  for (let i = 0; i < elements.length; i++) {
    if (i === 0) {
      rEl.replaceChild(elements[0], tEl);
      refNode = elements[0];
    } else {
      if (refNode.nextSibling) {
        rEl.insertBefore(elements[i], refNode.nextSibling);
      } else {
        rEl.appendChild(elements[i]);
      }
      refNode = elements[i];
    }
  }
}

/**
 * Replaces placeholders across all specified XML document strings.
 * Returns a new Map of modified XML strings.
 */
export function replacePlaceholdersInXmlFiles(
  xmlFiles: Map<string, string>,
  values: VariableValues,
  preparedImages?: Map<string, PreparedImage>
): Map<string, string> {
  const modifiedXmlFiles = new Map<string, string>();

  for (const [filePath, xmlContent] of xmlFiles.entries()) {
    try {
      const doc = parseXmlStringToDoc(xmlContent);

      // If document.xml and has images, ensure necessary namespaces exist on root
      if (filePath === 'word/document.xml' && preparedImages && preparedImages.size > 0) {
        const root = doc.documentElement;
        if (!root.getAttribute('xmlns:r')) {
          root.setAttribute(
            'xmlns:r',
            'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
          );
        }
        if (!root.getAttribute('xmlns:wp')) {
          root.setAttribute(
            'xmlns:wp',
            'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
          );
        }
        if (!root.getAttribute('xmlns:a')) {
          root.setAttribute(
            'xmlns:a',
            'http://schemas.openxmlformats.org/drawingml/2006/main'
          );
        }
        if (!root.getAttribute('xmlns:pic')) {
          root.setAttribute(
            'xmlns:pic',
            'http://schemas.openxmlformats.org/drawingml/2006/picture'
          );
        }
      }

      // Find all paragraphs (<w:p>)
      const paragraphs = Array.from(doc.getElementsByTagName('*')).filter(
        (el) => el.localName === 'p'
      );

      let hasModifications = false;
      for (const p of paragraphs) {
        const modified = replacePlaceholdersInParagraph(
          p,
          values,
          doc,
          preparedImages
        );
        if (modified) {
          hasModifications = true;
        }
      }

      if (hasModifications) {
        modifiedXmlFiles.set(filePath, serializeDocToXml(doc));
      } else {
        // Unmodified, keep original
        modifiedXmlFiles.set(filePath, xmlContent);
      }
    } catch (e) {
      console.warn(`Error replacing placeholders in ${filePath}:`, e);
      modifiedXmlFiles.set(filePath, xmlContent);
    }
  }

  return modifiedXmlFiles;
}
