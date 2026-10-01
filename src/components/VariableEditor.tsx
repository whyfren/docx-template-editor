/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  TemplateVariable,
  VariableValues,
  ValidationState,
} from '../types';
import {
  Settings,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Hash,
  AlignLeft,
  Sparkles,
  Info,
  Image as ImageIcon,
  Upload,
  X,
  FileJson,
  BookOpen,
} from 'lucide-react';
import { generateSamplePhotoDataUrl } from '../utils/docx/sampleImage';

interface VariableEditorProps {
  variables: TemplateVariable[];
  values: VariableValues;
  validation: ValidationState;
  onUpdateValue: (key: string, value: string) => void;
  onResetValue: (key: string) => void;
  onResetAll: () => void;
  onOpenMetadataModal: (variable: TemplateVariable) => void;
  onOpenJsonModal: () => void;
  fileName: string;
}

export const VariableEditor: React.FC<VariableEditorProps> = ({
  variables,
  values,
  validation,
  onUpdateValue,
  onResetValue,
  onResetAll,
  onOpenMetadataModal,
  onOpenJsonModal,
  fileName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMissingOnly, setFilterMissingOnly] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const handleInsertToken = (key: string, token: string) => {
    const current = values[key] || '';
    const textarea = textareaRefs.current[key];
    if (!textarea) {
      onUpdateValue(key, current + token);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextVal = current.substring(0, start) + token + current.substring(end);
    onUpdateValue(key, nextVal);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + token.length;
    }, 0);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, key: string) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      handleInsertToken(key, '\t');
    }
  };

  // Filter variables based on search and missing toggle
  const filteredVariables = variables.filter((v) => {
    const matchesSearch =
      v.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMissingOnly) {
      return validation.missingRequired.includes(v.key);
    }

    return true;
  });

  const filledCount = variables.filter((v) => {
    const val = values[v.key];
    return val !== undefined && String(val).trim().length > 0;
  }).length;

  const handleQuickAutofill = () => {
    // Populate realistic context-aware sample values
    variables.forEach((v) => {
      const key = v.key.toLowerCase();
      let sample = '';

      if (v.type === 'image' || key.startsWith('foto.') || key.startsWith('gambar.')) {
        sample = generateSamplePhotoDataUrl('Frentis Radytia', key.includes('logo') ? 'logo' : 'pas_foto');
      } else if (v.type === 'list' || key.startsWith('list.') || key.startsWith('daftar.')) {
        sample =
          '1. Melaksanakan riset kebutuhan arsitektur sistem\n2. Menyusun skema integrasi OpenXML\n\t• Sub-tugas: Penanganan DOCX run split\n\t• Sub-tugas: Validasi tata letak tabel & gambar\n3. Pengujian format dokumen Microsoft Word asli\n4. Dokumentasi teknis dan deployment';
      } else if (key.startsWith('narasi.') || key.includes('sejarah')) {
        sample =
          '\tPerusahaan ini didirikan pada tahun 2018 dengan visi menjadi pionir transformasi digital dan rekayasa perangkat lunak terkemuka di Asia Tenggara.\n\n\tBermula dari inisiatif riset akademis, kini kami telah melayani ratusan institusi terkemuka dengan mengedepankan integritas, inovasi berkelanjutan, dan dedikasi profesional dalam setiap proses rekayasa sistem.';
      } else if (key.includes('visi_misi') || key.includes('misi')) {
        sample =
          'Visi:\n\tMenjadi platform automasi dokumen berbasis arsitektur terbuka yang paling terpercaya dan presisi tinggi di Indonesia.\n\nMisi:\n\t1. Mempermudah pertukaran dan pemrosesan dokumen kerja secara efisien.\n\t2. Menjaga kualitas dan konsistensi identitas visual dokumen organisasi.';
      } else if (key.includes('nama_siswa') || key === 'nama') {
        sample = 'Frentis Radytia Pratama';
      } else if (key.includes('nis') || key.includes('nik')) {
        sample = '123456';
      } else if (key.includes('kelas')) {
        sample = 'XI RPL 1';
      } else if (key.includes('tempat_pkl') || key.includes('perusahaan')) {
        sample = 'PT Bangun Nusantara Kanaka';
      } else if (key.includes('pembimbing')) {
        sample = 'Pak Roni';
      } else if (key.includes('tanggal_mulai') || key.includes('tgl_mulai')) {
        sample = '2026-07-01';
      } else if (key.includes('tanggal_selesai') || key.includes('tgl_selesai')) {
        sample = '2026-10-31';
      } else if (key.includes('nomor_surat')) {
        sample = '042/HRD-PKWT/X/2026';
      } else if (key.includes('nama_karyawan') || key.includes('nama_peserta')) {
        sample = 'Frentis Radytia Pratama';
      } else if (key.includes('direktur')) {
        sample = 'Ir. Bambang Trihatmojo, M.Kom.';
      } else if (key.includes('posisi')) {
        sample = 'Fullstack Software Engineer';
      } else if (key.includes('gaji')) {
        sample = '8.500.000';
      } else if (key.includes('tanggal_bergabung')) {
        sample = '2026-11-01';
      } else if (key.includes('kursus')) {
        sample = 'Pengembangan Sistem Dokumen OOXML Modern';
      } else if (key.includes('predikat')) {
        sample = 'Dengan Pujian (Cum Laude)';
      } else if (key.includes('instruktur')) {
        sample = 'Dr. Hendra Gunawan, S.T., M.T.';
      } else if (key.includes('tanggal')) {
        sample = '2026-10-15';
      } else if (v.type === 'number') {
        sample = '100';
      } else if (v.type === 'date') {
        sample = '2026-10-01';
      } else {
        sample = v.defaultValue || `Contoh ${v.label}`;
      }

      onUpdateValue(v.key, sample);
    });
  };

  const handleImageFileChange = (key: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onUpdateValue(key, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white">
      {/* Header & Status Section */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              VARIABEL TEMPLATE
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
              {filledCount}/{variables.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* JSON Data Button */}
            <button
              type="button"
              onClick={onOpenJsonModal}
              title="Kelola Data JSON (Isi form otomatis atau salin template JSON)"
              className="inline-flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50/80 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              <FileJson className="h-3.5 w-3.5" />
              <span>JSON Data</span>
            </button>

            {/* Quick Fill Sample Data */}
            <button
              type="button"
              onClick={handleQuickAutofill}
              title="Isi dengan data contoh otomatis"
              className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Sparkles className="h-3 w-3 text-indigo-600" />
              <span>Isi Contoh</span>
            </button>

            {/* Reset All Values */}
            <button
              type="button"
              onClick={onResetAll}
              title="Reset semua nilai"
              className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Status Indicators as requested in the prompt */}
        <div className="mt-3 space-y-1.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">Template loaded: {fileName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
            <span>{variables.length} variables detected</span>
          </div>
          {validation.missingRequired.length === 0 ? (
            <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span>All required fields completed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-semibold text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
              <span>{validation.missingRequired.length} required variables are missing</span>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari variabel..."
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          {validation.missingRequired.length > 0 && (
            <button
              type="button"
              onClick={() => setFilterMissingOnly(!filterMissingOnly)}
              className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition ${
                filterMissingOnly
                  ? 'border-amber-400 bg-amber-50 text-amber-800 font-semibold'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Belum Diisi ({validation.missingRequired.length})
            </button>
          )}
        </div>
      </div>

      {/* Variables List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {filteredVariables.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            {searchTerm
              ? 'Tidak ada variabel yang sesuai dengan pencarian.'
              : 'Tidak ada variabel yang perlu diisi.'}
          </div>
        ) : (
          filteredVariables.map((v) => {
            const currentValue = values[v.key] ?? '';
            const isMissing = v.required && !currentValue.trim();
            const hasError = validation.errors[v.key];
            const isImage = v.type === 'image';
            const isList = v.type === 'list' || v.key.startsWith('list.') || v.key.startsWith('daftar.');
            const isNarasi = v.key.startsWith('narasi.') || (v.type === 'textarea' && v.key.includes('sejarah'));

            return (
              <div
                key={v.key}
                className={`group rounded-xl border p-3.5 transition-all shadow-sm ${
                  isMissing
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Variable Card Top: Key & Controls */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {'{{' + v.key + '}}'}
                      </span>
                      {v.required && (
                        <span className="text-[11px] font-semibold text-red-500">
                          *
                        </span>
                      )}
                      {isImage && (
                        <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800">
                          Gambar / Foto
                        </span>
                      )}
                      {isList && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                          Daftar / List Poin
                        </span>
                      )}
                      {isNarasi && !isList && (
                        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-800">
                          Narasi Paragraf
                        </span>
                      )}
                      <span className="text-[10px] font-medium text-slate-400">
                        ({v.occurrences}x {v.locations.join(', ')})
                      </span>
                    </div>

                    <div className="mt-1 flex items-baseline justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        {v.label}
                      </label>
                    </div>
                  </div>

                  {/* Actions for this variable */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => onOpenMetadataModal(v)}
                      title="Edit metadata variabel (label, tipe data, required)"
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                    {currentValue && (
                      <button
                        type="button"
                        onClick={() => onResetValue(v.key)}
                        title="Kosongkan nilai ini"
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Description snippet if any */}
                {v.description && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    {v.description}
                  </p>
                )}

                {/* Input according to type */}
                <div className="mt-2">
                  {isImage ? (
                    // IMAGE VARIABLE ZONE
                    <div className="space-y-2">
                      <input
                        ref={(el) => {
                          fileInputRefs.current[v.key] = el;
                        }}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFileChange(v.key, file);
                          e.target.value = '';
                        }}
                      />

                      {currentValue ? (
                        <div className="relative flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
                          <img
                            src={currentValue}
                            alt={v.label}
                            className="h-16 w-16 rounded object-cover border border-slate-200 shadow-xs"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-semibold text-slate-700 block">
                              Gambar Siap Disisipkan
                            </span>
                            <span className="text-[10px] text-emerald-600 font-medium block">
                              ✓ Format terenkod Base64 / PNG
                            </span>
                            <div className="mt-1.5 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => fileInputRefs.current[v.key]?.click()}
                                className="text-[11px] font-medium text-indigo-600 hover:underline"
                              >
                                Ganti Foto
                              </button>
                              <span className="text-slate-300">·</span>
                              <button
                                type="button"
                                onClick={() => onResetValue(v.key)}
                                className="text-[11px] font-medium text-red-600 hover:underline"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[v.key]?.click()}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
                            >
                              <Upload className="h-3.5 w-3.5 text-indigo-600" />
                              <span>Pilih File Foto</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateValue(
                                  v.key,
                                  generateSamplePhotoDataUrl('Pas Foto', v.key.includes('logo') ? 'logo' : 'pas_foto')
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                            >
                              <Sparkles className="h-3 w-3" />
                              <span>Contoh Foto</span>
                            </button>
                          </div>
                          <p className="mt-1.5 text-[10px] text-slate-400">
                            Mendukung file PNG, JPG, WEBP (disisipkan via DrawingML OpenXML)
                          </p>
                        </div>
                      )}
                    </div>
                  ) : v.type === 'textarea' || v.type === 'list' || isList ? (
                    // TEXTAREA / LIST / LONG NARRATION ZONE
                    <div>
                      <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-medium">
                          <AlignLeft className="h-3 w-3 text-slate-400" />
                          <span>
                            {isList
                              ? 'Daftar Poin (Tab untuk Indentasi Bertingkat)'
                              : 'Paragraf Narasi (Tab untuk Indentasi Paragraf)'}
                          </span>
                        </span>
                        {currentValue && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {currentValue.split(/\s+/).filter(Boolean).length} kata · {currentValue.length} kar
                          </span>
                        )}
                      </div>

                      {/* Indentation & Formatting Quick Toolbar */}
                      <div className="mb-1.5 flex items-center gap-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleInsertToken(v.key, '\t')}
                          title="Sisipkan Tab / Indentasi (Word <w:tab/>)"
                          className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          + Tab (Indent)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertToken(v.key, '• ')}
                          title="Sisipkan Bullet Point"
                          className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          • Bullet
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertToken(v.key, '1. ')}
                          title="Sisipkan Nomor Poin"
                          className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          1. Nomor
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertToken(v.key, '- ')}
                          title="Sisipkan Strip Poin"
                          className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          - Strip
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertToken(v.key, '\n\t• ')}
                          title="Baris baru dengan indentasi tab & bullet"
                          className="rounded border border-indigo-200 bg-indigo-50/70 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          ↵ Sub-poin (Tab)
                        </button>
                      </div>

                      <textarea
                        ref={(el) => {
                          textareaRefs.current[v.key] = el;
                        }}
                        rows={isList ? 6 : isNarasi ? 6 : 3}
                        value={currentValue}
                        onChange={(e) => onUpdateValue(v.key, e.target.value)}
                        onKeyDown={(e) => handleTextareaKeyDown(e, v.key)}
                        placeholder={
                          isList
                            ? '1. Poin utama\n\t• Sub-poin bertingkat (tekan Tab)\n2. Poin kedua...'
                            : `Tulis teks untuk ${v.label.toLowerCase()} (tekan Tab untuk indentasi)...`
                        }
                        className={`w-full rounded-lg border px-3 py-2 font-mono text-xs text-slate-900 placeholder-slate-400 shadow-sm leading-relaxed focus:outline-none focus:ring-1 ${
                          isMissing
                            ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500'
                            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                        style={{ tabSize: 4 }}
                      />
                      <p className="mt-1 text-[10px] text-slate-400">
                        * Tekan tombol <b>Tab</b> di keyboard untuk indentasi langsung. Dikonversi menjadi elemen Word <code className="font-mono">&lt;w:tab/&gt;</code> &amp; <code className="font-mono">&lt;w:br/&gt;</code>.
                      </p>
                    </div>
                  ) : v.type === 'date' ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) => onUpdateValue(v.key, e.target.value)}
                        placeholder="Contoh: 2026-10-15 atau 15 Oktober 2026"
                        className={`w-full rounded-lg border px-3 py-1.5 pl-8 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-1 ${
                          isMissing
                            ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500'
                            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                      />
                      <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  ) : v.type === 'number' ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) => onUpdateValue(v.key, e.target.value)}
                        placeholder="Contoh: 123456"
                        className={`w-full rounded-lg border px-3 py-1.5 pl-8 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-1 ${
                          isMissing
                            ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500'
                            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                      />
                      <Hash className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={currentValue}
                      onChange={(e) => onUpdateValue(v.key, e.target.value)}
                      placeholder={`Masukkan ${v.label.toLowerCase()}...`}
                      className={`w-full rounded-lg border px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-1 ${
                        isMissing
                          ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                  )}
                </div>

                {/* Validation message if invalid */}
                {hasError && (
                  <p className="mt-1 text-[11px] font-medium text-amber-700">
                    {hasError}
                  </p>
                )}

                {/* Context snippet footer */}
                {v.snippets && v.snippets.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 border-t border-slate-100 pt-1.5 text-[10px] text-slate-400">
                    <span className="font-medium text-slate-500">Konteks:</span>
                    <span className="truncate italic">"{v.snippets[0]}"</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
