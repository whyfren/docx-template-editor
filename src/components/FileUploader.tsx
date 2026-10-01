/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Lock,
  FileCode2,
  HelpCircle,
  BookOpen,
  Image as ImageIcon,
  AlignLeft,
  ListOrdered,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { SAMPLE_TEMPLATES } from '../utils/docx/sampleGenerator';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  onSelectSample: (templateId: string) => void;
  onOpenGuideModal: () => void;
  isAnalyzing: boolean;
  error: string | null;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  onSelectSample,
  onOpenGuideModal,
  isAnalyzing,
  error,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const validateAndProcessFile = (file: File) => {
    setDragError(null);

    const isDocx =
      file.name.toLowerCase().endsWith('.docx') ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!isDocx) {
      setDragError(
        'Format file tidak valid. Harap pilih file Microsoft Word berekstensi .docx.'
      );
      return;
    }

    if (file.size === 0) {
      setDragError('File kosong (0 bytes). Silakan pilih file dokumen yang valid.');
      return;
    }

    onFileSelected(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
      // Reset input value so re-selecting same file triggers change
      e.target.value = '';
    }
  };

  const displayError = dragError || error;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Intro Hero */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          Template-Driven Word Document Automation · 100% Client-Side
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Edit Dokumen Word Tanpa Merusak Formatting
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
          Upload file template <span className="font-bold text-slate-900">.docx</span> asli Anda. Sistem mendeteksi placeholder <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-indigo-600">{'{{variabel}}'}</code> secara cerdas dan menghasilkan dokumen baru dengan font, tabel, margin, dan gaya asli yang tetap 100% utuh.
        </p>
      </div>

      {/* SECTION 1: KENALI SEMUA VARIABEL & KITA BISA NGAPAIN AJA */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 via-white to-white p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100/60 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Panduan Cepat
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Kenali Jenis Variabel &amp; Apa Saja yang Bisa Anda Lakukan
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenGuideModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs hover:bg-indigo-50/80"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Buku Panduan Lengkap</span>
          </button>
        </div>

        {/* 5 Variable Types Grid */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Teks Biasa */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 p-1.5 text-slate-700">
                <FileText className="h-3.5 w-3.5" />
              </span>
              <span className="font-bold text-xs text-slate-900">1. Teks Singkat</span>
            </div>
            <div className="mt-2 font-mono text-[11px] font-semibold text-indigo-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block">
              {'{{nama}}'}, {'{{nis}}'}, {'{{posisi}}'}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
              Untuk teks standar seperti nama orang, nomor identitas, judul, atau keterangan pendek.
            </p>
          </div>

          {/* 2. Foto / Gambar */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/20 p-3.5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="rounded bg-sky-100 p-1.5 text-sky-700">
                <ImageIcon className="h-3.5 w-3.5" />
              </span>
              <span className="font-bold text-xs text-slate-900">2. Foto / Gambar</span>
            </div>
            <div className="mt-2 font-mono text-[11px] font-semibold text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200 inline-block">
              {'{{foto.pas_foto}}'}, {'{{foto.logo}}'}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
              Awalan <code className="font-bold text-sky-800">foto.</code> otomatis membuat slot upload gambar PNG/JPG ke DrawingML Word resmi!
            </p>
          </div>

          {/* 3. Narasi Paragraf */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/20 p-3.5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="rounded bg-purple-100 p-1.5 text-purple-700">
                <AlignLeft className="h-3.5 w-3.5" />
              </span>
              <span className="font-bold text-xs text-slate-900">3. Narasi Paragraf</span>
            </div>
            <div className="mt-2 font-mono text-[11px] font-semibold text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200 inline-block">
              {'{{narasi.sejarah}}'}, {'{{narasi.visi}}'}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
              Awalan <code className="font-bold text-purple-800">narasi.</code> untuk teks panjang. Mendukung <b>Enter</b> dan tombol <b>Tab</b> untuk indentasi paragraf.
            </p>
          </div>

          {/* 4. Daftar / List Poin */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-3.5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-100 p-1.5 text-emerald-700">
                <ListOrdered className="h-3.5 w-3.5" />
              </span>
              <span className="font-bold text-xs text-slate-900">4. Daftar Poin (List)</span>
            </div>
            <div className="mt-2 font-mono text-[11px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 inline-block">
              {'{{list.tugas}}'}, {'{{list.layanan}}'}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
              Awalan <code className="font-bold text-emerald-800">list.</code> untuk poin bertingkat. Tekan <b>Tab</b> di keyboard untuk membuat sub-poin berindentasi.
            </p>
          </div>

          {/* 5. Tanggal & Angka */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 p-1.5 text-slate-700">
                <Calendar className="h-3.5 w-3.5" />
              </span>
              <span className="font-bold text-xs text-slate-900">5. Tanggal &amp; Nilai Angka</span>
            </div>
            <div className="mt-2 font-mono text-[11px] font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block">
              {'{{tanggal_mulai}}'}, {'{{gaji}}'}, {'{{tahun}}'}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
              Otomatis mengenali isian tanggal (dengan bantuan ikon kalender) dan validasi angka numerik.
            </p>
          </div>
        </div>

        {/* 6 Capabilities summary pill row */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
          <span className="font-bold text-slate-700">Fitur Utama:</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Preservasi Tata Letak 100%
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Deteksi Cerdas Toleran Spasi
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Run-Merge OOXML
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Impor &amp; Ekspor JSON
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Pratinjau Real-Time
          </span>
        </div>
      </div>

      {/* SECTION 2: UPLOAD DRAG & DROP CARD */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 sm:p-12 ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-slate-400'
        } ${isAnalyzing ? 'pointer-events-none opacity-70' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="hidden"
          id="docx-file-input"
        />

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
          {isAnalyzing ? (
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          ) : (
            <UploadCloud className="h-8 w-8 text-indigo-600" />
          )}
        </div>

        <h3 className="mt-4 text-lg font-bold text-slate-900">
          {isAnalyzing
            ? 'Menganalisis OOXML Dokumen & Memindai Variabel...'
            : 'Drop your .DOCX template here'}
        </h3>
        <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
          Mendukung semua dokumen Word (.docx) dengan tabel, header, footer, gambar, dan gaya custom
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <FileText className="h-4 w-4" />
            Choose File (.docx)
          </button>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Lock className="h-3.5 w-3.5 text-emerald-600" />
          <span>Privasi Terjamin: Dokumen diproses sepenuhnya di browser (client-side tanpa server).</span>
        </div>
      </div>

      {/* Error Banner */}
      {displayError && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-900">Gagal Memproses Dokumen</h4>
            <p className="mt-0.5 text-xs text-red-700">{displayError}</p>
          </div>
        </div>
      )}

      {/* SECTION 3: INSTANT SAMPLE TEMPLATES */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Belum punya template sendiri? Coba Template Siap Pakai:
            </h2>
            <p className="text-xs text-slate-400">
              Klik salah satu untuk langsung mencoba deteksi foto, narasi tab, dan daftar poin
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SAMPLE_TEMPLATES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample.id)}
              disabled={isAnalyzing}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-indigo-600">
                    <FileCode2 className="h-4 w-4 text-indigo-600" />
                    {sample.name}
                  </span>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                    {sample.variableCount} var
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                  {sample.description}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                <span className="font-mono">{sample.fileName}</span>
                <span className="font-medium text-indigo-600 group-hover:underline inline-flex items-center gap-1">
                  Gunakan Template <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
