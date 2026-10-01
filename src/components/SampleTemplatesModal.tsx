/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Sparkles, FileCode2, ArrowRight } from 'lucide-react';
import { SAMPLE_TEMPLATES, SampleTemplateInfo } from '../utils/docx/sampleGenerator';

interface SampleTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
  isLoading?: boolean;
}

export const SampleTemplatesModal: React.FC<SampleTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pilih Dokumen Template Contoh
              </h3>
              <p className="text-xs text-slate-500">
                Pilih template Word siap pakai untuk langsung menguji aplikasi
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

        {/* Templates List */}
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {SAMPLE_TEMPLATES.map((sample) => (
            <div
              key={sample.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:bg-slate-50/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                  <span className="font-bold text-sm text-slate-900">
                    {sample.name}
                  </span>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                    {sample.variableCount} variabel
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {sample.description}
                </p>
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  {sample.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="font-mono text-[10px] text-slate-400">
                    · {sample.fileName}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelect(sample.id);
                  onClose();
                }}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex-shrink-0"
              >
                <span>Gunakan</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
