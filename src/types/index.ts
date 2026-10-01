/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type VariableType = 'text' | 'textarea' | 'number' | 'date' | 'image' | 'list';

export interface TemplateVariable {
  key: string;
  label: string;
  type: VariableType;
  defaultValue?: string;
  description?: string;
  required?: boolean;
  occurrences: number;
  locations: ('body' | 'table' | 'header' | 'footer' | 'other')[];
  snippets: string[];
  imageOptions?: {
    maxWidthPx?: number;
    maxHeightPx?: number;
  };
}

export type VariableValues = Record<string, string>;

export interface JsonImportResult {
  totalKeysInJson: number;
  matchedCount: number;
  matchedKeys: string[];
  unmatchedKeys: string[];
  parsedValues: VariableValues;
}

export interface DocumentInfo {
  fileName: string;
  fileSize: number;
  totalVariables: number;
  totalOccurrences: number;
  xmlFilesScanned: string[];
  lastModified: number;
}

export interface ValidationState {
  isValid: boolean;
  missingRequired: string[];
  errors: Record<string, string>;
}

export interface PlaceholderOccurrence {
  key: string;
  filePath: string;
  locationType: 'body' | 'table' | 'header' | 'footer' | 'other';
  paragraphIndex: number;
  contextSnippet: string;
  isRunSplit: boolean;
  runCount: number;
}

export interface PreviewParagraph {
  id: string;
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'table-cell';
  rawText: string;
  renderedText: string;
  variablesContained: string[];
}

export interface PreviewData {
  paragraphs: PreviewParagraph[];
  tablesCount: number;
  hasHeaders: boolean;
  hasFooters: boolean;
}
