/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Settings2, HelpCircle } from 'lucide-react';
import { TemplateVariable, VariableType } from '../types';

interface VariableMetadataModalProps {
  variable: TemplateVariable | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string, updates: Partial<TemplateVariable>) => void;
}

export const VariableMetadataModal: React.FC<VariableMetadataModalProps> = ({
  variable,
  isOpen,
  onClose,
  onSave,
}) => {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<VariableType>('text');
  const [description, setDescription] = useState('');
  const [defaultValue, setDefaultValue] = useState('');
  const [required, setRequired] = useState(true);

  useEffect(() => {
    if (variable) {
      setLabel(variable.label);
      setType(variable.type);
      setDescription(variable.description || '');
      setDefaultValue(variable.defaultValue || '');
      setRequired(variable.required ?? true);
    }
  }, [variable]);

  if (!isOpen || !variable) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(variable.key, {
      label: label.trim() || variable.key,
      type,
      description: description.trim(),
      defaultValue,
      required,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Settings2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Konfigurasi Variabel
              </h3>
              <p className="font-mono text-xs text-indigo-600">
                {'{{' + variable.key + '}}'}
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

        {/* Modal Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {/* Key Reference (Read Only) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Kunci Placeholder di Dokumen Word
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700">
              <span>{'{{' + variable.key + '}}'}</span>
              <span className="text-[11px] text-slate-400 font-sans ml-auto">
                (Asli di OOXML XML)
              </span>
            </div>
          </div>

          {/* Human Display Label */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Label Tampilan (Human Label) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Contoh: Nama Lengkap Siswa"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Label yang muncul di antarmuka input tanpa merubah nama variabel di file .docx.
            </p>
          </div>

          {/* Input Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipe Input Data
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
              {(
                [
                  { id: 'text', label: 'Teks' },
                  { id: 'textarea', label: 'Narasi' },
                  { id: 'list', label: 'Daftar Poin' },
                  { id: 'number', label: 'Angka' },
                  { id: 'date', label: 'Tanggal' },
                  { id: 'image', label: 'Foto' },
                ] as const
              ).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setType(item.id)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                    type === item.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Default Value */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nilai Default (Opsional)
            </label>
            <input
              type="text"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder="Nilai awal bila belum diisi"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan / Panduan Pengisian
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Masukkan nama sesuai KTP / Rapor"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Required Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="var-required-check"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="var-required-check"
              className="text-xs font-medium text-slate-700 cursor-pointer select-none"
            >
              Variabel ini wajib diisi (Required)
            </label>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
