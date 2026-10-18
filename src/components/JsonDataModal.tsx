/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FileJson,
  Upload,
  Copy,
  Check,
  Download,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { TemplateVariable, VariableValues, JsonImportResult } from '../types';
import {
  generateEmptyJsonTemplate,
  exportCurrentValuesToJson,
  parseAndValidateJsonInput,
  downloadJsonFile,
} from '../utils/json/jsonManager';
import { generateAiFillPrompt } from '../utils/ai/promptGenerator';

interface JsonDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  variables: TemplateVariable[];
  currentValues: VariableValues;
  onApplyJsonValues: (newValues: VariableValues) => void;
  fileName: string;
}

export const JsonDataModal: React.FC<JsonDataModalProps> = ({
  isOpen,
  onClose,
  variables,
  currentValues,
  onApplyJsonValues,
  fileName,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'schema' | 'export'>('import');
  const [jsonInput, setJsonInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [schemaCopied, setSchemaCopied] = useState(false);
  const [aiPromptCopied, setAiPromptCopied] = useState(false);
  const [importResult, setImportResult] = useState<JsonImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize jsonInput with empty template when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!jsonInput) {
        setJsonInput(generateEmptyJsonTemplate(variables));
      }
      setImportError(null);
      setImportResult(null);
    }
  }, [isOpen, variables]);

  if (!isOpen) return null;

  const emptyTemplate = generateEmptyJsonTemplate(variables);
  const currentExport = exportCurrentValuesToJson(variables, currentValues);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(emptyTemplate);
    setSchemaCopied(true);
    setTimeout(() => setSchemaCopied(false), 2000);
  };

  const handleCopyAiPrompt = async () => {
    const prompt = generateAiFillPrompt(variables, fileName);
    try {
      await navigator.clipboard.writeText(prompt);
      setAiPromptCopied(true);
      setTimeout(() => setAiPromptCopied(false), 1500);
    } catch (err) {
      console.warn('Failed to copy AI prompt:', err);
    }
  };

  const handleValidateInput = () => {
    try {
      setImportError(null);
      const res = parseAndValidateJsonInput(jsonInput, variables);
      setImportResult(res);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memvalidasi JSON.';
      setImportError(msg);
      setImportResult(null);
      return null;
    }
  };

  const handleApply = () => {
    const res = handleValidateInput();
    if (res && res.matchedCount > 0) {
      onApplyJsonValues(res.parsedValues);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      try {
        setImportError(null);
        const res = parseAndValidateJsonInput(content, variables);
        setImportResult(res);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Format JSON tidak valid.';
        setImportError(msg);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FileJson className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Integrasi & Manajemen Data JSON
              </h3>
              <p className="text-xs text-slate-500">
                Isi form otomatis via JSON atau ekspor data variabel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`border-b-2 py-3 px-4 text-xs font-semibold transition ${
              activeTab === 'import'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Isi Form via JSON (Import)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`border-b-2 py-3 px-4 text-xs font-semibold transition ${
              activeTab === 'schema'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Template JSON (Schema)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`border-b-2 py-3 px-4 text-xs font-semibold transition ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Ekspor Nilai Form
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Tempel data JSON di bawah ini atau unggah file .json:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Upload className="h-3.5 w-3.5 text-slate-500" />
                    <span>Upload .json</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={10}
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setImportError(null);
                  setImportResult(null);
                }}
                placeholder="Tempel format JSON di sini..."
                className="w-full rounded-xl border border-slate-300 p-3 font-mono text-xs text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />

              {/* Status or validation message */}
              {importError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                  <span>{importError}</span>
                </div>
              )}

              {importResult && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>
                      {importResult.matchedCount} dari {variables.length} variabel berhasil dicocokkan!
                    </span>
                  </div>
                  {importResult.unmatchedKeys.length > 0 && (
                    <p className="mt-1 text-[11px] text-emerald-700">
                      Kunci yang tidak cocok di dokumen: {importResult.unmatchedKeys.join(', ')}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleValidateInput}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cek Kesesuaian
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Terapkan ke Form</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEMPLATE SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Struktur JSON yang Diperlukan Template Ini
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Salin format ini ke sistem eksternal, webhook, atau script Anda
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySchema}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {schemaCopied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    <span>{schemaCopied ? 'Tersalin!' : 'Salin JSON'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      downloadJsonFile(
                        emptyTemplate,
                        `${fileName.replace('.docx', '')}-schema.json`
                      )
                    }
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    <span>Unduh File</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="max-h-[360px] overflow-auto rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-emerald-400">
                  {emptyTemplate}
                </pre>
              </div>

              <div className="rounded-lg bg-indigo-50/60 p-3 text-xs text-indigo-900">
                <span className="font-bold">Tips Integrasi:</span>
                <ul className="mt-1 list-disc list-inside space-y-0.5 text-[11px] text-indigo-700">
                  <li>Variabel gambar (<code className="font-mono">foto.xxx</code>) menerima Data URL base64 (<code className="font-mono">data:image/png;base64,...</code>).</li>
                  <li>Variabel narasi (<code className="font-mono">narasi.xxx</code>) dapat berisi teks multibaris (<code className="font-mono">\n</code>).</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: EXPORT CURRENT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Nilai Form Saat Ini dalam Format JSON
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Ekspor seluruh data yang sedang diisi untuk disimpan atau digunakan kembali
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(currentExport)}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    <span>{copied ? 'Tersalin!' : 'Salin JSON'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      downloadJsonFile(
                        currentExport,
                        `${fileName.replace('.docx', '')}-data.json`
                      )
                    }
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    <span>Unduh File</span>
                  </button>
                </div>
              </div>

              {/* AI Prompt Export */}
              <div className="rounded-lg border border-indigo-200 bg-gradient-to-br from-indigo-50 to-sky-50 p-3 text-xs text-indigo-900">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <span className="font-bold">Prompt untuk AI (Copy-Paste ke ChatGPT/Claude/Gemini)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAiPrompt}
                    className="inline-flex items-center gap-1 rounded border border-indigo-300 bg-white px-2.5 py-0.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                  >
                    {aiPromptCopied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-indigo-600" />
                    )}
                    <span>{aiPromptCopied ? 'Tersalin!' : 'Salin Prompt AI'}</span>
                  </button>
                </div>
                <p className="mb-2 text-[11px] text-indigo-700">
                  Prompt ini menjelaskan semua variabel, cara penggunaan newline (<code className="font-mono">\n</code>) dan tab (<code className="font-mono">\t</code>) untuk narasi/list, aturan "jangan isi jika kosong", dan format data URL untuk foto.
                </p>
                <div className="relative">
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-indigo-200 bg-white/80 p-3 font-mono text-[10px] leading-relaxed text-slate-700">
                    {generateAiFillPrompt(variables, fileName)}
                  </pre>
                </div>
              </div>

              <div className="relative">
                <pre className="max-h-[360px] overflow-auto rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-emerald-400">
                  {currentExport}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
