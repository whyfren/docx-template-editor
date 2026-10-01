/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';
import { VariableValues } from '../../types';
import { replacePlaceholdersInXmlFiles } from './replacer';
import { loadDocxZip, extractDocxXmlFiles } from './parser';
import {
  PreparedImage,
  parseImageDataUrl,
  calculateEmuDimensions,
  ensureContentTypesHasImages,
  addImageRelationships,
} from './imageManager';

export interface BuildDocxResult {
  blob: Blob;
  outputFileName: string;
  byteLength: number;
}

/**
 * Computes standard output filename:
 * "Template_Laporan_PKL.docx" -> "Template_Laporan_PKL-filled.docx"
 */
export function formatFilledFileName(originalFileName: string): string {
  const cleanName = originalFileName.trim() || 'document.docx';
  if (cleanName.toLowerCase().endsWith('.docx')) {
    const base = cleanName.slice(0, -5);
    return `${base}-filled.docx`;
  }
  return `${cleanName}-filled.docx`;
}

/**
 * Checks if a value is an image data URL or base64 image.
 */
function isImageDataValue(key: string, value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  if (value.startsWith('data:image/')) return true;
  const lower = key.toLowerCase();
  return (
    lower.startsWith('foto.') ||
    lower.startsWith('gambar.') ||
    lower.startsWith('image.') ||
    lower.startsWith('img.') ||
    lower.endsWith('.foto') ||
    lower.endsWith('.gambar')
  );
}

/**
 * Generates a filled DOCX Blob from original DOCX buffer and variable values.
 * All formatting, styles, tables, headers, footers, and binary assets are 100% preserved.
 * Seamlessly embeds photos and drawings for {{foto.xxx}} variables.
 */
export async function buildFilledDocx(
  originalBuffer: ArrayBuffer,
  originalFileName: string,
  values: VariableValues
): Promise<BuildDocxResult> {
  // Load a fresh ZIP instance from the original buffer
  const zip = await loadDocxZip(originalBuffer.slice(0));

  // Extract all XML documents
  const { xmlFiles } = await extractDocxXmlFiles(zip);

  // Prepare images if any image variables have data
  const preparedImages = new Map<string, PreparedImage>();
  const imagesToAdd: PreparedImage[] = [];

  let imageCounter = 1;
  for (const [key, val] of Object.entries(values)) {
    if (isImageDataValue(key, val) && val.trim().length > 0) {
      try {
        const { data, extension } = parseImageDataUrl(val);
        const relId = `rIdImg_${imageCounter}`;
        const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
        const mediaFileName = `image_${cleanKey}_${imageCounter}.${extension}`;
        const zipPath = `media/${mediaFileName}`;
        const fullZipPath = `word/media/${mediaFileName}`;

        // Calculate EMU dimensions (200px max width, 220px max height)
        const { cx, cy } = calculateEmuDimensions(200, 200, 240, 260);

        const prepared: PreparedImage = {
          key,
          relationshipId: relId,
          mediaPath: fullZipPath,
          zipPath,
          extension,
          binaryData: data,
          widthEmu: cx,
          heightEmu: cy,
          docPrId: 100 + imageCounter,
        };

        preparedImages.set(key, prepared);
        imagesToAdd.push(prepared);
        imageCounter++;

        // Add binary image to ZIP
        zip.file(fullZipPath, data);
      } catch (err) {
        console.warn(`Failed parsing image for variable ${key}:`, err);
      }
    }
  }

  // If there are images to add, update relationships and content types
  if (imagesToAdd.length > 0) {
    // 1. Update [Content_Types].xml
    const contentTypesEntry = zip.file('[Content_Types].xml');
    if (contentTypesEntry) {
      const currentCtXml = await contentTypesEntry.async('text');
      const updatedCtXml = ensureContentTypesHasImages(currentCtXml);
      zip.file('[Content_Types].xml', updatedCtXml);
    }

    // 2. Update word/_rels/document.xml.rels
    const docRelsEntry = zip.file('word/_rels/document.xml.rels');
    let currentRelsXml = '';
    if (docRelsEntry) {
      currentRelsXml = await docRelsEntry.async('text');
    } else {
      currentRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;
    }

    const updatedRelsXml = addImageRelationships(currentRelsXml, imagesToAdd);
    zip.file('word/_rels/document.xml.rels', updatedRelsXml);
  }

  // Perform surgical replacement in the XML trees
  const modifiedXmlFiles = replacePlaceholdersInXmlFiles(
    xmlFiles,
    values,
    preparedImages
  );

  // Update files in ZIP
  for (const [filePath, newContent] of modifiedXmlFiles.entries()) {
    zip.file(filePath, newContent);
  }

  // Generate new DOCX binary Blob
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6,
    },
  });

  const outputFileName = formatFilledFileName(originalFileName);

  return {
    blob,
    outputFileName,
    byteLength: blob.size,
  };
}

/**
 * Triggers client-side browser download for a Blob.
 */
export function triggerFileDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
