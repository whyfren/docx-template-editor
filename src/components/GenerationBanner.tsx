/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Download,
  FileCheck2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { ValidationState } from '../types';

interface GenerationBannerProps {
  fileName: string;
  outputFileName: string;
  validation: ValidationState;
  isGenerating: boolean;
  generatedDocx: { blob: Blob; fileName: string; size: number } | null;
  onGenerate: () => void;
  onDownload: () => void;
}

export const GenerationBanner: React.FC<GenerationBannerProps> = ({
  fileName,
  outputFileName,
  validation,
  isGenerating,
  generatedDocx,
  onGenerate,
  onDownload,
}) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: Status / Target File Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            {generatedDocx ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <FileCheck2 className="h-5 w-5 text-indigo-600" />
            )}
          </div>

          <div>
            {generatedDocx ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700">
                    ✓ Document generated successfully
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono text-slate-600">
                    {formatBytes(generatedDocx.size)}
                  </span>
                </div>
                <p className="font-mono text-xs font-semibold text-slate-900 truncate max-w-[280px] sm:max-w-md">
                  {generatedDocx.fileName}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    Target Dokumen Output:
                  </span>
                  {validation.missingRequired.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                      <AlertTriangle className="h-3 w-3" />
                      {validation.missingRequired.length} wajib belum diisi
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs font-semibold text-slate-800 truncate max-w-[280px] sm:max-w-md">
                  {outputFileName}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {generatedDocx ? (
            <>
              <button
                type="button"
                onClick={onGenerate}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Generate Ulang</span>
              </button>

              <button
                type="button"
                onClick={onDownload}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all scale-100 active:scale-95"
              >
                <Download className="h-4 w-4" />
                <span>Download DOCX</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Memproses OOXML...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate DOCX</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
