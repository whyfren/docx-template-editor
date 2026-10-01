/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo } from 'react';
import {
  TemplateVariable,
  VariableValues,
  DocumentInfo,
  PlaceholderOccurrence,
  ValidationState,
} from '../types';
import {
  loadDocxZip,
  extractDocxXmlFiles,
} from '../utils/docx/parser';
import { detectPlaceholders } from '../utils/docx/placeholderDetector';
import {
  buildFilledDocx,
  triggerFileDownload,
  formatFilledFileName,
} from '../utils/docx/docxBuilder';
import { validateVariables } from '../utils/validation';

export function useDocxTemplate() {
  const [templateBuffer, setTemplateBuffer] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [documentXml, setDocumentXml] = useState<string>('');

  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [variableValues, setVariableValues] = useState<VariableValues>({});
  const [occurrences, setOccurrences] = useState<PlaceholderOccurrence[]>([]);
  const [xmlFilesScanned, setXmlFilesScanned] = useState<string[]>([]);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [generatedDocx, setGeneratedDocx] = useState<{
    blob: Blob;
    fileName: string;
    size: number;
  } | null>(null);

  /**
   * Load and process a DOCX file
   */
  const loadTemplate = useCallback(
    async (fileOrBuffer: File | ArrayBuffer, customName?: string) => {
      setIsAnalyzing(true);
      setError(null);
      setGeneratedDocx(null);

      try {
        let buffer: ArrayBuffer;
        let name: string;
        let size: number;

        if (fileOrBuffer instanceof File) {
          name = fileOrBuffer.name;
          size = fileOrBuffer.size;
          buffer = await fileOrBuffer.arrayBuffer();
        } else {
          buffer = fileOrBuffer;
          name = customName || 'template.docx';
          size = buffer.byteLength;
        }

        // Validate and load ZIP
        const zip = await loadDocxZip(buffer);
        const parsed = await extractDocxXmlFiles(zip);

        // Detect placeholders across all XML files
        const detection = detectPlaceholders(parsed.xmlFiles);

        if (detection.variables.length === 0) {
          setError(
            'Tidak ada placeholder yang terdeteksi di dokumen ini. Tambahkan placeholder dengan format {{nama_variabel}} seperti {{nama}} ke dalam file Word Anda.'
          );
        }

        // Initialize values from defaultValues
        const initialValues: VariableValues = {};
        detection.variables.forEach((v) => {
          initialValues[v.key] = v.defaultValue || '';
        });

        setTemplateBuffer(buffer);
        setFileName(name);
        setFileSize(size);
        setDocumentXml(parsed.documentXml);
        setVariables(detection.variables);
        setVariableValues(initialValues);
        setOccurrences(detection.occurrences);
        setXmlFilesScanned(Array.from(parsed.xmlFiles.keys()));
      } catch (err: unknown) {
        console.error('Error loading template:', err);
        const msg =
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan saat memproses file DOCX.';
        setError(msg);
        setTemplateBuffer(null);
        setVariables([]);
        setVariableValues({});
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  /**
   * Update value of a specific variable
   */
  const updateVariableValue = useCallback((key: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [key]: value,
    }));
    // Invalidate generated file when values change
    setGeneratedDocx(null);
  }, []);

  /**
   * Update metadata (label, type, required, description, defaultValue) of a variable
   */
  const updateVariableMetadata = useCallback(
    (key: string, updates: Partial<TemplateVariable>) => {
      setVariables((prev) =>
        prev.map((v) => {
          if (v.key === key) {
            return { ...v, ...updates };
          }
          return v;
        })
      );
    },
    []
  );

  /**
   * Reset value of a specific variable to empty or defaultValue
   */
  const resetVariableValue = useCallback(
    (key: string) => {
      const variable = variables.find((v) => v.key === key);
      const defaultVal = variable?.defaultValue || '';
      setVariableValues((prev) => ({
        ...prev,
        [key]: defaultVal,
      }));
      setGeneratedDocx(null);
    },
    [variables]
  );

  /**
   * Reset all variable values to their defaults
   */
  const resetAllValues = useCallback(() => {
    const fresh: VariableValues = {};
    variables.forEach((v) => {
      fresh[v.key] = v.defaultValue || '';
    });
    setVariableValues(fresh);
    setGeneratedDocx(null);
  }, [variables]);

  /**
   * Apply multiple values imported from JSON
   */
  const applyJsonValues = useCallback((newValues: VariableValues) => {
    setVariableValues((prev) => ({
      ...prev,
      ...newValues,
    }));
    setGeneratedDocx(null);
  }, []);

  /**
   * Validation state computed based on current values and variable definitions
   */
  const validation: ValidationState = useMemo(() => {
    return validateVariables(variables, variableValues);
  }, [variables, variableValues]);

  /**
   * Document metadata info
   */
  const documentInfo: DocumentInfo | null = useMemo(() => {
    if (!fileName) return null;
    return {
      fileName,
      fileSize,
      totalVariables: variables.length,
      totalOccurrences: occurrences.length,
      xmlFilesScanned,
      lastModified: Date.now(),
    };
  }, [fileName, fileSize, variables.length, occurrences.length, xmlFilesScanned]);

  /**
   * Generates filled DOCX from template and current values
   */
  const generateDocument = useCallback(async () => {
    if (!templateBuffer || !fileName) {
      setError('Template dokumen belum dimuat.');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await buildFilledDocx(templateBuffer, fileName, variableValues);

      const generated = {
        blob: result.blob,
        fileName: result.outputFileName,
        size: result.byteLength,
      };

      setGeneratedDocx(generated);
      return generated;
    } catch (err: unknown) {
      console.error('Error generating filled DOCX:', err);
      const msg =
        err instanceof Error
          ? err.message
          : 'Gagal membuat file DOCX baru dari template.';
      setError(msg);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [templateBuffer, fileName, variableValues]);

  /**
   * Directly downloads the generated DOCX or generates and downloads
   */
  const downloadGeneratedDocx = useCallback(async () => {
    if (generatedDocx) {
      triggerFileDownload(generatedDocx.blob, generatedDocx.fileName);
      return;
    }

    const gen = await generateDocument();
    if (gen) {
      triggerFileDownload(gen.blob, gen.fileName);
    }
  }, [generatedDocx, generateDocument]);

  /**
   * Unload template and reset state
   */
  const clearTemplate = useCallback(() => {
    setTemplateBuffer(null);
    setFileName('');
    setFileSize(0);
    setDocumentXml('');
    setVariables([]);
    setVariableValues({});
    setOccurrences([]);
    setXmlFilesScanned([]);
    setGeneratedDocx(null);
    setError(null);
  }, []);

  return {
    templateBuffer,
    fileName,
    fileSize,
    documentXml,
    variables,
    variableValues,
    occurrences,
    documentInfo,
    validation,
    isAnalyzing,
    isGenerating,
    error,
    generatedDocx,
    outputFileName: formatFilledFileName(fileName),
    loadTemplate,
    updateVariableValue,
    updateVariableMetadata,
    resetVariableValue,
    resetAllValues,
    applyJsonValues,
    generateDocument,
    downloadGeneratedDocx,
    clearTemplate,
  };
}
