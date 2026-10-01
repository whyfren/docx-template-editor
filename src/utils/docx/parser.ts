/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';

export interface ParsedDocx {
  zip: JSZip;
  xmlFiles: Map<string, string>; // path -> xml content
  documentXml: string;
  hasHeaders: boolean;
  hasFooters: boolean;
}

/**
 * Validates that an uploaded file or buffer is a valid .docx file.
 */
export async function loadDocxZip(fileData: ArrayBuffer | Blob): Promise<JSZip> {
  try {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(fileData);

    // Verify it is a valid OpenXML document
    if (!loadedZip.file('[Content_Types].xml') && !loadedZip.file('word/document.xml')) {
      throw new Error(
        'Format file tidak valid. Pastikan file yang diupload adalah dokumen Microsoft Word (.docx).'
      );
    }

    if (!loadedZip.file('word/document.xml')) {
      throw new Error(
        'File .docx rusak atau tidak memiliki word/document.xml yang valid.'
      );
    }

    return loadedZip;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Gagal membaca file .docx. File mungkin rusak atau tidak kompatibel.');
  }
}

/**
 * Extracts all relevant XML documents that can contain text runs (body, headers, footers, footnotes, endnotes).
 */
export async function extractDocxXmlFiles(zip: JSZip): Promise<ParsedDocx> {
  const xmlFiles = new Map<string, string>();
  let hasHeaders = false;
  let hasFooters = false;

  const targetPatterns = [
    /^word\/document\d*\.xml$/i,
    /^word\/header\d*\.xml$/i,
    /^word\/footer\d*\.xml$/i,
    /^word\/footnotes\d*\.xml$/i,
    /^word\/endnotes\d*\.xml$/i,
    /^word\/comments\d*\.xml$/i,
    /^word\/glossary\/document\d*\.xml$/i,
    /^word\/glossary\/header\d*\.xml$/i,
    /^word\/glossary\/footer\d*\.xml$/i,
  ];

  for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue;

    const matches = targetPatterns.some((pattern) => pattern.test(relativePath));
    if (matches) {
      const content = await zipEntry.async('text');
      xmlFiles.set(relativePath, content);

      if (/header\d*\.xml/i.test(relativePath)) {
        hasHeaders = true;
      }
      if (/footer\d*\.xml/i.test(relativePath)) {
        hasFooters = true;
      }
    }
  }

  const documentXml = xmlFiles.get('word/document.xml');
  if (!documentXml) {
    throw new Error('word/document.xml tidak ditemukan di dalam paket DOCX.');
  }

  return {
    zip,
    xmlFiles,
    documentXml,
    hasHeaders,
    hasFooters,
  };
}

/**
 * Parses XML text into a DOM Document.
 */
export function parseXmlStringToDoc(xmlString: string): Document {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

  // Check for parser errors
  const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
  if (parseError) {
    throw new Error(`XML parsing error: ${parseError.textContent}`);
  }

  return xmlDoc;
}

/**
 * Serializes a DOM Document back to XML string.
 */
export function serializeDocToXml(doc: Document): string {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}
