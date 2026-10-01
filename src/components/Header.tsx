/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileText,
  FileCheck2,
  RefreshCw,
  FolderOpen,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  fileName?: string;
  variableCount?: number;
  onOpenSampleModal: () => void;
  onOpenGuideModal?: () => void;
  onResetTemplate?: () => void;
  isGenerating?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  fileName,
  variableCount = 0,
  onOpenSampleModal,
  onOpenGuideModal,
  onResetTemplate,
  isGenerating,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-100">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                DOCX Template Editor
              </span>
              <span className="hidden items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 sm:inline-flex">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                100% Client-Side
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Preserve formatting · Word OOXML Run-Merge Engine
            </p>
          </div>
        </div>

        {/* Current Document Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {fileName ? (
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 md:flex">
              <FileCheck2 className="h-4 w-4 text-indigo-600" />
              <span className="max-w-[180px] truncate text-xs font-medium text-slate-700">
                {fileName}
              </span>
              <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                {variableCount} var
              </span>
            </div>
          ) : null}

          {/* Guide Modal button */}
          {onOpenGuideModal && (
            <button
              type="button"
              onClick={onOpenGuideModal}
              title="Buka panduan format variabel dan fitur lengkap"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Panduan Variabel</span>
              <span className="sm:hidden">Panduan</span>
            </button>
          )}

          {/* Load Sample Template button */}
          <button
            type="button"
            onClick={onOpenSampleModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          >
            <FolderOpen className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Pilih Contoh</span>
            <span className="sm:hidden">Contoh</span>
          </button>

          {/* Change Template button */}
          {fileName && onResetTemplate ? (
            <button
              type="button"
              onClick={onResetTemplate}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50"
            >
              <FolderOpen className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Ganti File</span>
              <span className="sm:hidden">Ganti</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
