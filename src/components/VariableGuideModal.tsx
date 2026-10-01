/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Image as ImageIcon,
  AlignLeft,
  ListOrdered,
  Calendar,
  FileCheck2,
  Lock,
  FileJson,
  Keyboard,
  CheckCircle2,
} from 'lucide-react';

interface VariableGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrySample?: (templateId: string) => void;
}

export const VariableGuideModal: React.FC<VariableGuideModalProps> = ({
  isOpen,
  onClose,
  onTrySample,
}) => {
  const [activeTab, setActiveTab] = useState<'variables' | 'capabilities' | 'rules'>('variables');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Panduan Variabel &amp; Penggunaan DOCX Template Editor
              </h3>
              <p className="text-xs text-slate-500">
                Pelajari jenis variabel, sintaks penulisan, dan seluruh fitur yang bisa Anda gunakan
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('variables')}
            className={`border-b-2 py-3 px-4 text-xs font-semibold transition ${
              activeTab === 'variables'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Jenis Variabel &amp; Fungsinya
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('capabilities')}
            className={`border-b-2 py-3 px-4 text-xs font-semibold transition ${
              activeTab === 'capabilities'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Apa Saja yang Bisa Kita Lakukan?
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`border-b-2 py-3 px-4 text-xs font-semibold transition ${
              activeTab === 'rules'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Tips Penulisan &amp; Deteksi Toleran
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: VARIABLES & TYPES */}
          {activeTab === 'variables' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-xs text-indigo-900">
                <span className="font-bold">Prinsip Kerja:</span> Tulis placeholder dengan tanda kurung kurawal ganda di Microsoft Word, misalnya <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-200">{'{{nama}}'}</code>. Sistem akan mendeteksinya secara otomatis dan menyediakan antarmuka input yang sesuai.
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {/* 1. Teks Biasa */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 p-1.5 text-slate-700">
                      <FileCheck2 className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">1. Teks Biasa</h4>
                      <span className="font-mono text-[11px] text-indigo-600">{'{{nama}}'}, {'{{nis}}'}, {'{{kelas}}'}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Untuk isian singkat seperti nama lengkap, jabatan, instansi, atau identitas.
                  </p>
                  <div className="mt-2.5 rounded bg-slate-50 p-2 text-[11px] text-slate-500 font-mono">
                    Contoh: Frentis Radytia Pratama
                  </div>
                </div>

                {/* 2. Foto / Gambar */}
                <div className="rounded-xl border border-sky-200 bg-sky-50/30 p-4 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-sky-100 p-1.5 text-sky-700">
                      <ImageIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">2. Foto / Gambar</h4>
                      <span className="font-mono text-[11px] text-sky-700">{'{{foto.pas_foto}}'}, {'{{foto.logo}}'}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Awalan <code className="font-mono font-bold">foto.</code> atau <code className="font-mono font-bold">gambar.</code> otomatis membuat area upload foto. Foto akan disisipkan ke OpenXML DrawingML dengan ukuran proporsional.
                  </p>
                  <div className="mt-2.5 rounded bg-white border border-sky-100 p-2 text-[11px] text-sky-800">
                    ✓ Upload PNG, JPG, WEBP langsung dari browser.
                  </div>
                </div>

                {/* 3. Narasi Paragraf Panjang */}
                <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-4 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-purple-100 p-1.5 text-purple-700">
                      <AlignLeft className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">3. Narasi Paragraf</h4>
                      <span className="font-mono text-[11px] text-purple-700">{'{{narasi.sejarah}}'}, {'{{narasi.visi_misi}}'}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Awalan <code className="font-mono font-bold">narasi.</code> untuk cerita atau uraian panjang. Mendukung <b>Enter</b> (baris baru) dan tombol <b>Tab</b> (indentasi paragraf resmi).
                  </p>
                  <div className="mt-2.5 rounded bg-white border border-purple-100 p-2 text-[11px] text-purple-800">
                    ✓ Dikonversi menjadi tag Word <code className="font-mono">&lt;w:tab/&gt;</code> &amp; <code className="font-mono">&lt;w:br/&gt;</code>.
                  </div>
                </div>

                {/* 4. Daftar / List Poin Bertingkat */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-100 p-1.5 text-emerald-700">
                      <ListOrdered className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">4. Daftar Poin / List</h4>
                      <span className="font-mono text-[11px] text-emerald-700">{'{{list.tugas}}'}, {'{{list.layanan}}'}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Awalan <code className="font-mono font-bold">list.</code> atau <code className="font-mono font-bold">daftar.</code> untuk daftar rincian dengan tombol pintas bullet (<code className="font-mono">•</code>), penomoran (<code className="font-mono">1.</code>), dan indentasi bertingkat.
                  </p>
                  <div className="mt-2.5 rounded bg-white border border-emerald-100 p-2 text-[11px] text-emerald-800">
                    ✓ Tekan <b>Tab</b> langsung untuk membuat sub-poin berindentasi.
                  </div>
                </div>

                {/* 5. Tanggal & Angka */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 p-1.5 text-slate-700">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">5. Tanggal &amp; Angka</h4>
                      <span className="font-mono text-[11px] text-slate-700">{'{{tanggal_mulai}}'}, {'{{gaji}}'}, {'{{tahun}}'}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Variabel yang mengandung kata <code className="font-mono">tanggal</code>, <code className="font-mono">tgl</code>, <code className="font-mono">date</code>, atau angka seperti <code className="font-mono">gaji</code>, <code className="font-mono">tahun</code>, <code className="font-mono">nominal</code> otomatis disesuaikan dengan validasi tipe data kalender/angka.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAPABILITIES */}
          {activeTab === 'capabilities' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">
                Fitur Lengkap Aplikasi (Apa Saja yang Bisa Anda Lakukan)
              </h4>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-xs">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-900">1. Gunakan Template Dokumen Word Asli</h5>
                    <p className="mt-0.5 text-slate-600">
                      Upload file <code className="font-mono text-indigo-600">.docx</code> apa pun. Font, margin, alignment, spasi, tabel kompleks, header, footer, dan format paragraf asli dipertahankan 100% tanpa konversi merusak ke HTML/PDF.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-xs">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-900">2. Deteksi Cerdas Toleran Format &amp; Run-Merge</h5>
                    <p className="mt-0.5 text-slate-600">
                      Mengenali variabel meskipun Word memecahnya ke beberapa elemen XML (<code className="font-mono">&lt;w:r&gt;</code>) atau jika Anda mengetik spasi seperti <code className="font-mono">{'{{ nama }}'}</code>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-xs">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-900">3. Sisipkan Foto &amp; Gambar Asli</h5>
                    <p className="mt-0.5 text-slate-600">
                      Ganti placeholder <code className="font-mono text-indigo-600">{'{{foto.pas_foto}}'}</code> dengan foto asli. Sistem mengonversi gambar ke DrawingML resmi Microsoft Word dengan rasio dan penempatan presisi.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-xs">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-900">4. Pengetikan Bebas dengan Tombol Tab &amp; Enter</h5>
                    <p className="mt-0.5 text-slate-600">
                      Tekan tombol <b>Tab</b> di keyboard saat mengisi narasi atau list untuk indentasi otomatis. Tersedia bilah tombol pintas: Bullet (<code className="font-mono">•</code>), Nomor (<code className="font-mono">1.</code>), dan Strip (<code className="font-mono">-</code>).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-xs">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-900">5. Isi Cepat Form via JSON &amp; Ekspor Data</h5>
                    <p className="mt-0.5 text-slate-600">
                      Salin format schema JSON atau tempel file <code className="font-mono text-indigo-600">.json</code> untuk mengisi seluruh variabel dalam sekali klik.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-xs">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-900">6. Pratinjau Alur Real-Time &amp; Halaman Word</h5>
                    <p className="mt-0.5 text-slate-600">
                      Lihat perubahan langsung saat mengetik dengan penyorotan warna cerdas, atau lihat tampilan halaman asli dokumen Word via <code className="font-mono">docx-preview</code>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-xs">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-900">7. Privasi 100% Client-Side</h5>
                    <p className="mt-0.5 text-slate-600">
                      Seluruh pemrosesan OOXML dan kompresi ZIP dilakukan di browser Anda. Dokumen sensitif tidak pernah diunggah atau disimpan di server mana pun.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RULES & DETECTION TIPS */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">
                Tips Penulisan &amp; Kemampuan Deteksi yang Ditingkatkan
              </h4>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-3">
                <div>
                  <span className="font-bold text-slate-800">✓ Sintaks yang didukung sepenuhnya:</span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 font-mono text-[11px]">
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-300">
                      {'{{nama}}'}
                    </span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-300">
                      {'{{ nama }}'} (spasi didukung)
                    </span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-300">
                      {'{{foto.pas_foto}}'}
                    </span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-300">
                      {'{{narasi.sejarah_perusahaan}}'}
                    </span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-300">
                      {'{{list.tugas_utama}}'}
                    </span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-300">
                      {'{{nama-lengkap}}'} (strip didukung)
                    </span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-300">
                      {'{ { nama } }'} (spasi antar kurung)
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <span className="font-bold text-slate-800">Kenapa Variabel Sebelumnya Terkadang Terlewat?</span>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    Microsoft Word sering kali menyisipkan karakter tersembunyi seperti spasi tak terlihat (*Zero-Width Space* <code className="font-mono">\u200B</code>), spasi tanpa jeda (*Non-Breaking Space* <code className="font-mono">&amp;nbsp;</code>), atau memecah kurung kurawal di antara run XML berbeda.
                  </p>
                  <p className="mt-1 text-slate-600 leading-relaxed font-semibold text-emerald-700">
                    Sistem kini telah dilengkapi filter sanitasi khusus yang otomatis membersihkan karakter tersembunyi tersebut dan memindai semua bagian dokumen (body, tabel, header, footer, catatan kaki, hingga kotak teks).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3">
          <div className="text-xs text-slate-500">
            Ingin langsung mencoba?
          </div>
          <div className="flex items-center gap-2">
            {onTrySample && (
              <button
                type="button"
                onClick={() => {
                  onTrySample('profil_perusahaan');
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Coba Template Lengkap</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
