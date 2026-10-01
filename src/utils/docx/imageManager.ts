/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';
import { parseXmlStringToDoc, serializeDocToXml } from './parser';

export interface PreparedImage {
  key: string;
  relationshipId: string;
  mediaPath: string; // e.g. "word/media/image_foto_pas_foto.png"
  zipPath: string;   // e.g. "media/image_foto_pas_foto.png"
  extension: 'png' | 'jpeg' | 'jpg' | 'gif' | 'webp';
  binaryData: Uint8Array;
  widthEmu: number;
  heightEmu: number;
  docPrId: number;
}

/**
 * Converts a base64 or Data URL string to Uint8Array and detects extension.
 */
export function parseImageDataUrl(dataUrl: string): {
  data: Uint8Array;
  extension: 'png' | 'jpeg' | 'jpg' | 'gif' | 'webp';
} {
  let base64 = dataUrl;
  let extension: 'png' | 'jpeg' | 'jpg' | 'gif' | 'webp' = 'png';

  if (dataUrl.includes(';base64,')) {
    const parts = dataUrl.split(';base64,');
    base64 = parts[1];
    const mimeMatch = parts[0].match(/data:image\/([a-zA-Z0-9+.-]+)/);
    if (mimeMatch) {
      const mime = mimeMatch[1].toLowerCase();
      if (mime === 'jpeg' || mime === 'jpg') extension = 'jpeg';
      else if (mime === 'png') extension = 'png';
      else if (mime === 'gif') extension = 'gif';
      else if (mime === 'webp') extension = 'png'; // Word natively prefers png/jpeg; we can store as png
    }
  }

  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return { data: bytes, extension };
}

/**
 * Calculates EMU dimensions for Word OpenXML (1 pixel ≈ 9525 EMUs at 96 DPI).
 * Constrains maximum width to ~240px and max height to ~260px while preserving aspect ratio.
 */
export function calculateEmuDimensions(
  naturalWidth: number = 200,
  naturalHeight: number = 200,
  maxWidthPx: number = 240,
  maxHeightPx: number = 240
): { cx: number; cy: number } {
  let w = naturalWidth > 0 ? naturalWidth : 200;
  let h = naturalHeight > 0 ? naturalHeight : 200;

  // Scale down if exceeds max bounds
  const ratio = Math.min(maxWidthPx / w, maxHeightPx / h, 1.0);
  w = Math.round(w * ratio);
  h = Math.round(h * ratio);

  // 1 pixel = 9525 EMUs
  const cx = w * 9525;
  const cy = h * 9525;

  return { cx, cy };
}

/**
 * Ensures [Content_Types].xml includes overrides or defaults for png and jpeg.
 */
export function ensureContentTypesHasImages(contentTypesXml: string): string {
  try {
    const doc = parseXmlStringToDoc(contentTypesXml);
    const types = doc.documentElement;

    const defaults = Array.from(types.getElementsByTagName('*')).filter(
      (el) => el.localName === 'Default'
    );

    const hasPng = defaults.some(
      (el) => el.getAttribute('Extension')?.toLowerCase() === 'png'
    );
    const hasJpeg = defaults.some((el) => {
      const ext = el.getAttribute('Extension')?.toLowerCase();
      return ext === 'jpeg' || ext === 'jpg';
    });

    if (!hasPng) {
      const newDef = doc.createElementNS(
        'http://schemas.openxmlformats.org/package/2006/content-types',
        'Default'
      );
      newDef.setAttribute('Extension', 'png');
      newDef.setAttribute('ContentType', 'image/png');
      types.appendChild(newDef);
    }

    if (!hasJpeg) {
      const newDef = doc.createElementNS(
        'http://schemas.openxmlformats.org/package/2006/content-types',
        'Default'
      );
      newDef.setAttribute('Extension', 'jpeg');
      newDef.setAttribute('ContentType', 'image/jpeg');
      types.appendChild(newDef);
    }

    return serializeDocToXml(doc);
  } catch (e) {
    console.warn('Failed updating [Content_Types].xml for images:', e);
    return contentTypesXml;
  }
}

/**
 * Updates word/_rels/document.xml.rels to register image relationships.
 */
export function addImageRelationships(
  relsXml: string,
  images: PreparedImage[]
): string {
  try {
    const doc = parseXmlStringToDoc(relsXml);
    const root = doc.documentElement;

    for (const img of images) {
      const relEl = doc.createElementNS(
        'http://schemas.openxmlformats.org/package/2006/relationships',
        'Relationship'
      );
      relEl.setAttribute('Id', img.relationshipId);
      relEl.setAttribute(
        'Type',
        'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image'
      );
      relEl.setAttribute('Target', img.zipPath);
      root.appendChild(relEl);
    }

    return serializeDocToXml(doc);
  } catch (e) {
    console.warn('Failed updating document.xml.rels:', e);
    return relsXml;
  }
}

/**
 * Creates OpenXML Drawing Element (<w:drawing>) for inserting an inline picture into Word.
 */
export function createInlineDrawingXml(
  doc: Document,
  img: PreparedImage
): Element {
  // Create <w:drawing>
  const drawing = doc.createElementNS(
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w:drawing'
  );

  // XML template for DrawingML inline picture
  const inlineXml = `
    <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
      <wp:extent cx="${img.widthEmu}" cy="${img.heightEmu}"/>
      <wp:effectExtent l="0" t="0" r="0" b="0"/>
      <wp:docPr id="${img.docPrId}" name="Picture ${img.docPrId}"/>
      <wp:cNvGraphicFramePr>
        <a:graphicFrameLocks noChangeAspect="1"/>
      </wp:cNvGraphicFramePr>
      <a:graphic>
        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
          <pic:pic>
            <pic:nvPicPr>
              <pic:cNvPr id="${img.docPrId}" name="Picture ${img.docPrId}"/>
              <pic:cNvPicPr/>
            </pic:nvPicPr>
            <pic:blipFill>
              <a:blip r:embed="${img.relationshipId}"/>
              <a:stretch>
                <a:fillRect/>
              </a:stretch>
            </pic:blipFill>
            <pic:spPr>
              <a:xfrm>
                <a:off x="0" y="0"/>
                <a:ext cx="${img.widthEmu}" cy="${img.heightEmu}"/>
              </a:xfrm>
              <a:prstGeom prst="rect">
                <a:avLst/>
              </a:prstGeom>
            </pic:spPr>
          </pic:pic>
        </a:graphicData>
      </a:graphic>
    </wp:inline>
  `.trim();

  const tempDoc = parseXmlStringToDoc(inlineXml);
  const importedNode = doc.importNode(tempDoc.documentElement, true);
  drawing.appendChild(importedNode);

  return drawing;
}
