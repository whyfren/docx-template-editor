/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  VariableValues,
  PlaceholderOccurrence,
} from '../types';
import {
  extractDocumentPreviewBlocks,
  PreviewBlock,
} from '../utils/docx/previewExtractor';
import { PLACEHOLDER_REGEX } from '../utils/docx/placeholderDetector';
import {
  Eye,
  FileCheck2,
  FileText,
  Search,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Layers,
  Code2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { renderAsync } from 'docx-preview';
import { buildFilledDocx } from '../utils/docx/docxBuilder';

interface DocumentPreviewProps {
  documentXml: string;
  templateBuffer: ArrayBuffer | null;
  fileName: string;
  values: VariableValues;
  occurrences: PlaceholderOccurrence[];
  isGenerating?: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  documentXml,
  templateBuffer,
  fileName,
  values,
  occurrences,
  isGenerating,
}) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'word-page' | 'inspector'>('flow');
  const [highlightReplacements, setHighlightReplacements] = useState(true);
  const [isRenderingPage, setIsRenderingPage] = useState(false);
  const [pageRenderError, setPageRenderError] = useState<string | null>(null);

  const wordPageContainerRef = useRef<HTMLDivElement>(null);

  // Extract preview blocks from document.xml
  const previewBlocks = useMemo(() => {
    if (!documentXml) return [];
    return extractDocumentPreviewBlocks(documentXml);
  }, [documentXml]);

  // Helper to render text with placeholders replaced and optional highlighting
  const renderTextWithReplacements = (rawText: string) => {
    if (!rawText) return null;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    PLACEHOLDER_REGEX.lastIndex = 0;

    let match: RegExpExecArray | null;
    let keyIdx = 0;

    while ((match = PLACEHOLDER_REGEX.exec(rawText)) !== null) {
      const matchStart = match.index;
      const matchEnd = matchStart + match[0].length;
      const varKey = match[1];

      // Push text before match
      if (matchStart > lastIndex) {
        parts.push(rawText.substring(lastIndex, matchStart));
      }

      // Value replacement
      const userValue = values[varKey];
      const isFilled = userValue !== undefined && String(userValue).trim().length > 0;
      const isImageVar =
        varKey.toLowerCase().startsWith('foto.') ||
        varKey.toLowerCase().startsWith('gambar.') ||
        varKey.toLowerCase().startsWith('image.') ||
        (userValue && String(userValue).startsWith('data:image/'));

      if (isFilled) {
        if (isImageVar && String(userValue).startsWith('data:image/')) {
          // Render photo preview thumbnail
          parts.push(
            <span
              key={`match-${keyIdx++}`}
              className="inline-block my-1 align-middle"
              title={`Foto disisipkan untuk {{${varKey}}}`}
            >
              <img
                src={userValue}
                alt={varKey}
                className="max-h-36 max-w-[180px] rounded-lg border-2 border-indigo-400 shadow-sm object-contain bg-white"
              />
            </span>
          );
        } else if (String(userValue).includes('\n') || String(userValue).includes('\t')) {
          // Render multiline narration / indented list with line breaks and authentic tab stops
          parts.push(
            <span
              key={`match-${keyIdx++}`}
              className={
                highlightReplacements
                  ? 'inline-block rounded bg-indigo-50/90 text-indigo-950 font-medium px-2.5 py-1.5 border border-indigo-200 shadow-xs my-1 whitespace-pre-wrap font-mono text-xs leading-relaxed'
                  : 'whitespace-pre-wrap font-mono text-xs leading-relaxed'
              }
              style={{ tabSize: 4 }}
              title={`Isi {{${varKey}}}`}
            >
              {String(userValue)}
            </span>
          );
        } else if (highlightReplacements) {
          parts.push(
            <span
              key={`match-${keyIdx++}`}
              className="inline-block rounded bg-indigo-100/90 text-indigo-950 font-semibold px-1 py-0.5 border border-indigo-300 shadow-xs"
              title={`Placeholder {{${varKey}}} diganti menjadi "${userValue}"`}
            >
              {userValue}
            </span>
          );
        } else {
          parts.push(userValue);
        }
      } else {
        parts.push(
          <span
            key={`match-${keyIdx++}`}
            className={`inline-block rounded font-mono text-[11px] px-1.5 py-0.5 border ${
              isImageVar
                ? 'bg-sky-100 text-sky-900 border-sky-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
            title={`Placeholder {{${varKey}}} belum diisi`}
          >
            {isImageVar ? `[Foto: {{${varKey}}}]` : '{{' + varKey + '}}'}
          </span>
        );
      }

      lastIndex = matchEnd;
    }

    // Push remaining text
    if (lastIndex < rawText.length) {
      parts.push(rawText.substring(lastIndex));
    }

    return parts;
  };

  // Render authentic Word page via docx-preview when tab is active
  useEffect(() => {
    if (activeTab !== 'word-page' || !templateBuffer || !wordPageContainerRef.current) {
      return;
    }

    let isMounted = true;
    setIsRenderingPage(true);
    setPageRenderError(null);

    const renderWordDoc = async () => {
      try {
        // Build filled docx buffer
        const filled = await buildFilledDocx(templateBuffer, fileName, values);
        const arrayBuffer = await filled.blob.arrayBuffer();

        if (!isMounted || !wordPageContainerRef.current) return;

        wordPageContainerRef.current.innerHTML = '';
        await renderAsync(arrayBuffer, wordPageContainerRef.current, undefined, {
          className: 'docx',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          useBase64URL: true,
          renderHeaders: true,
          renderFooters: true,
        });
      } catch (err: unknown) {
        console.error('docx-preview error:', err);
        if (isMounted) {
          setPageRenderError(
            'Tidak dapat menampilkan render halaman Word. Silakan gunakan Tampilan Alur Interaktif.'
          );
        }
      } finally {
        if (isMounted) setIsRenderingPage(false);
      }
    };

    renderWordDoc();

    return () => {
      isMounted = false;
    };
  }, [activeTab, templateBuffer, fileName, values]);

  return (
    <div className="flex h-full flex-col bg-slate-100">
      {/* Top Preview Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mode Switcher */}
          <button
            type="button"
            onClick={() => setActiveTab('flow')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'flow'
                ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Alur Dokumen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('word-page')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'word-page'
                ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Halaman Word (.docx)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'inspector'
                ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Inspektur Run XML</span>
          </button>
        </div>

        {/* View Options */}
        {activeTab === 'flow' && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={highlightReplacements}
                onChange={(e) => setHighlightReplacements(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Sorot Penggantian</span>
            </label>
          </div>
        )}

        {activeTab === 'word-page' && (
          <button
            type="button"
            onClick={() => {
              // Trigger reload
              setActiveTab('flow');
              setTimeout(() => setActiveTab('word-page'), 50);
            }}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Segarkan Halaman</span>
          </button>
        )}
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* Tab 1: Interactive Flow View */}
        {activeTab === 'flow' && (
          <div className="mx-auto max-w-3xl rounded-xl border border-slate-300/80 bg-white p-8 sm:p-12 shadow-md">
            {/* Document Header Watermark */}
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-mono">
                <FileCheck2 className="h-3.5 w-3.5 text-indigo-600" />
                {fileName}
              </span>
              <span>Pratinjau Alur Struktur Dokumen</span>
            </div>

            {/* Document Flow Content */}
            <div className="space-y-4 text-slate-800 leading-relaxed">
              {previewBlocks.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">
                  Tidak ada konten yang dapat dipratinjau dari file ini.
                </div>
              ) : (
                previewBlocks.map((block) => {
                  if (block.type === 'table' && block.tableData) {
                    return (
                      <div
                        key={block.id}
                        className="my-5 overflow-x-auto rounded-lg border border-slate-200"
                      >
                        <table className="min-w-full divide-y divide-slate-200 text-xs">
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {block.tableData.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50/50">
                                {row.cells.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`px-4 py-2.5 text-slate-700 ${
                                      cell.isHeader
                                        ? 'bg-slate-50 font-semibold text-slate-900 border-r border-slate-200'
                                        : 'border-r last:border-r-0 border-slate-100'
                                    }`}
                                  >
                                    {renderTextWithReplacements(cell.text)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }

                  // Heading or Paragraph
                  const alignClass =
                    block.align === 'center'
                      ? 'text-center'
                      : block.align === 'right'
                      ? 'text-right'
                      : block.align === 'justify'
                      ? 'text-justify'
                      : 'text-left';

                  // Combine all runs text in block
                  const fullBlockText = (block.runs || []).map((r) => r.text).join('');

                  if (block.type === 'heading1') {
                    return (
                      <h1
                        key={block.id}
                        className={`text-xl font-extrabold tracking-tight text-slate-900 ${alignClass}`}
                      >
                        {renderTextWithReplacements(fullBlockText)}
                      </h1>
                    );
                  }

                  if (block.type === 'heading2') {
                    return (
                      <h2
                        key={block.id}
                        className={`text-lg font-bold text-slate-800 ${alignClass}`}
                      >
                        {renderTextWithReplacements(fullBlockText)}
                      </h2>
                    );
                  }

                  if (block.type === 'heading3') {
                    return (
                      <h3
                        key={block.id}
                        className={`text-base font-semibold text-slate-800 ${alignClass}`}
                      >
                        {renderTextWithReplacements(fullBlockText)}
                      </h3>
                    );
                  }

                  // Standard paragraph
                  return (
                    <p
                      key={block.id}
                      className={`text-sm text-slate-700 min-h-[1.25rem] ${alignClass}`}
                    >
                      {renderTextWithReplacements(fullBlockText)}
                    </p>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Authentic Word Page Rendering */}
        {activeTab === 'word-page' && (
          <div className="relative mx-auto max-w-4xl">
            {isRenderingPage && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
                <p className="mt-3 text-xs font-medium">
                  Merender halaman dokumen Microsoft Word asli...
                </p>
              </div>
            )}

            {pageRenderError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                {pageRenderError}
              </div>
            )}

            <div
              ref={wordPageContainerRef}
              className={`docx-container min-h-[500px] transition-opacity ${
                isRenderingPage ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </div>
        )}

        {/* Tab 3: XML Run Inspector */}
        {activeTab === 'inspector' && (
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">
                Inspektur Analisis Placeholder & Multi-Run Split
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Menampilkan rincian setiap kemunculan placeholder yang ditemukan di dalam OpenXML Word, termasuk deteksi placeholder yang terpecah di beberapa tag <code className="font-mono text-indigo-600">&lt;w:r&gt;</code>.
              </p>
            </div>

            <div className="space-y-3">
              {occurrences.map((occ, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {'{{' + occ.key + '}}'}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 uppercase">
                        {occ.locationType}
                      </span>
                    </div>

                    {occ.isRunSplit ? (
                      <span className="flex items-center gap-1 rounded border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                        <Sparkles className="h-3 w-3 text-purple-600" />
                        Terpecah di {occ.runCount} Runs XML (Merged)
                      </span>
                    ) : (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                        Single Run
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-slate-600">
                    <span className="font-semibold text-slate-700">Konteks: </span>
                    <span className="italic font-serif">"{occ.contextSnippet}"</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-mono">
                    <span>File: {occ.filePath}</span>
                    <span>Nilai saat ini: {values[occ.key] || '(kosong)'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
