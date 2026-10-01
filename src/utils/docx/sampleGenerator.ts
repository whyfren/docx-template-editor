/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';

export interface SampleTemplateInfo {
  id: string;
  name: string;
  fileName: string;
  description: string;
  variableCount: number;
  tags: string[];
}

export const SAMPLE_TEMPLATES: SampleTemplateInfo[] = [
  {
    id: 'profil_perusahaan',
    name: 'Profil Perusahaan & Biodata (Foto, Narasi & List)',
    fileName: 'Template_Profil_Perusahaan_dan_Foto.docx',
    description:
      'Template dokumen lengkap dengan foto resmi ({{foto.pas_foto}}), logo, narasi sejarah ({{narasi.sejarah_perusahaan}}), dan daftar poin bertingkat ({{list.layanan_unggulan}}).',
    variableCount: 7,
    tags: ['Foto', 'Narasi Tab', 'List Poin', 'JSON Ready'],
  },
  {
    id: 'laporan_pkl',
    name: 'Laporan Praktik Kerja Lapangan (PKL)',
    fileName: 'Template_Laporan_PKL.docx',
    description:
      'Template resmi laporan PKL dengan tabel identitas, pas foto ({{foto.pas_foto}}), dan daftar kegiatan bertingkat ({{list.rincian_kegiatan}}).',
    variableCount: 9,
    tags: ['Edukasi', 'PKL / Magang', 'Pas Foto', 'List'],
  },
  {
    id: 'perjanjian_kerja',
    name: 'Surat Perjanjian Kerja (PKWT)',
    fileName: 'Template_Perjanjian_Kerja_PKWT.docx',
    description:
      'Surat kontrak kerja karyawan antara perusahaan dan pegawai dengan pasal remunerasi dan masa kerja.',
    variableCount: 7,
    tags: ['HR / Legal', 'Kontrak', 'Perusahaan'],
  },
  {
    id: 'sertifikat',
    name: 'Sertifikat Kelulusan & Kompetensi',
    fileName: 'Template_Sertifikat_Kelulusan.docx',
    description:
      'Sertifikat penghargaan pelatihan profesional dengan nama peserta, kursus, predikat, dan tanda tangan instruktur.',
    variableCount: 5,
    tags: ['Pelatihan', 'Sertifikat', 'Formal'],
  },
  {
    id: 'run_split_test',
    name: 'Tes DOCX Run Split (Advanced Verification)',
    fileName: 'Template_Test_Run_Split.docx',
    description:
      'Dokumen khusus dengan placeholder yang sengaja terpecah di berbagai <w:r> tags (e.g. {{ + var + }}) untuk menguji keandalan parsing OOXML.',
    variableCount: 4,
    tags: ['Edge Case', 'Multi-Run Split', 'Strict Test'],
  },
];

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
</Types>`;

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const WORD_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
</Relationships>`;

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:lang w:val="id-ID"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
</w:styles>`;

const SETTINGS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:zoom w:percent="100"/>
</w:settings>`;

/**
 * Builds a valid .docx Uint8Array for a given template ID.
 */
export async function generateSampleDocx(templateId: string): Promise<{ buffer: ArrayBuffer; fileName: string }> {
  const zip = new JSZip();

  zip.file('[Content_Types].xml', CONTENT_TYPES_XML);
  zip.file('_rels/.rels', ROOT_RELS_XML);
  zip.file('word/_rels/document.xml.rels', WORD_RELS_XML);
  zip.file('word/styles.xml', STYLES_XML);
  zip.file('word/settings.xml', SETTINGS_XML);

  let documentXml = '';
  let fileName = 'Template.docx';

  if (templateId === 'profil_perusahaan') {
    fileName = 'Template_Profil_Perusahaan_dan_Foto.docx';
    documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="200"/></w:pPr>
      <w:r><w:t>{{foto.logo}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:after="100"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="34"/>
          <w:color w:val="0F172A"/>
        </w:rPr>
        <w:t>{{nama_perusahaan}}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:after="400"/>
      </w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="24"/><w:color w:val="64748B"/></w:rPr>
        <w:t>DOKUMEN PROFIL ORGANISASI &amp; PORTOFOLIO RESMI</w:t>
      </w:r>
    </w:p>

    <!-- Section 1: Sejarah Perusahaan (Narasi Panjang) -->
    <w:p>
      <w:pPr><w:spacing w:before="200" w:after="120"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="1E3A8A"/></w:rPr>
        <w:t>1. Sejarah Singkat Perusahaan</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="240"/><w:jc w:val="both"/></w:pPr>
      <w:r>
        <w:t>{{narasi.sejarah_perusahaan}}</w:t>
      </w:r>
    </w:p>

    <!-- Section 2: Visi & Misi (Narasi Multibaris) -->
    <w:p>
      <w:pPr><w:spacing w:before="200" w:after="120"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="1E3A8A"/></w:rPr>
        <w:t>2. Visi dan Misi</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="300"/><w:jc w:val="both"/></w:pPr>
      <w:r>
        <w:t>{{narasi.visi_misi}}</w:t>
      </w:r>
    </w:p>

    <!-- Section 3: Data Pimpinan & Pas Foto -->
    <w:p>
      <w:pPr><w:spacing w:before="200" w:after="160"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="1E3A8A"/></w:rPr>
        <w:t>3. Penanggung Jawab / Pimpinan Organisasi</w:t>
      </w:r>
    </w:p>

    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="3000" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Nama Pimpinan</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="6000" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>{{nama_pimpinan}}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="3000" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Pas Foto Resmi</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="6000" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:t>{{foto.pas_foto}}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>

    <!-- Section 4: Layanan Unggulan (Daftar Poin & Indentasi Tab) -->
    <w:p>
      <w:pPr><w:spacing w:before="300" w:after="120"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="1E3A8A"/></w:rPr>
        <w:t>4. Layanan Unggulan &amp; Ruang Lingkup</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="300"/><w:jc w:val="both"/></w:pPr>
      <w:r>
        <w:t>{{list.layanan_unggulan}}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;
  } else if (templateId === 'laporan_pkl') {
    fileName = 'Template_Laporan_PKL.docx';
    documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:after="200"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="32"/>
          <w:color w:val="1E3A8A"/>
        </w:rPr>
        <w:t>LAPORAN PRAKTIK KERJA LAPANGAN (PKL)</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:after="400"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="24"/>
          <w:color w:val="475569"/>
        </w:rPr>
        <w:t>SMK NEGERI 1 TEKNOLOGI INFORMATIKA</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr><w:spacing w:after="160"/></w:pPr>
      <w:r><w:t>Berikut adalah data pelaksanaan Praktik Kerja Lapangan siswa:</w:t></w:r>
    </w:p>

    <!-- Data Table -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
        </w:tblBorders>
      </w:tblPr>

      <!-- Row 1: Nama -->
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Nama Siswa</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="6000" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/><w:color w:val="0F172A"/></w:rPr><w:t>{{nama}}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>

      <!-- Row 2: NIS -->
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Nomor Induk Siswa (NIS)</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="6000" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:t>{{nis}}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>

      <!-- Row 3: Kelas -->
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Kelas / Jurusan</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="6000" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:t>{{kelas}}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>

      <!-- Row 4: Tempat PKL -->
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Tempat PKL / Industri</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="6000" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>{{tempat_pkl}}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>

      <!-- Row 5: Pembimbing -->
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Guru Pembimbing</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="6000" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:t>{{pembimbing}}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>

      <!-- Row 6: Tanggal Mulai -->
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Tanggal Mulai</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="6000" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:t>{{tanggal_mulai}}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>

      <!-- Row 7: Tanggal Selesai -->
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Tanggal Selesai</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="6000" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:t>{{tanggal_selesai}}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>

      <!-- Row 8: Pas Foto Siswa -->
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="2500" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Pas Foto Resmi</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="6000" w:type="dxa"/></w:tcPr>
          <w:p><w:r><w:t>{{foto.pas_foto}}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>

    <w:p><w:pPr><w:spacing w:before="300" w:after="160"/></w:pPr>
      <w:r><w:t>Menyatakan bahwa siswa </w:t></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:t>{{nama}}</w:t></w:r>
      <w:r><w:t> telah menyelesaikan seluruh kewajiban praktiknya di </w:t></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:t>{{tempat_pkl}}</w:t></w:r>
      <w:r><w:t> dengan bimbingan dari </w:t></w:r>
      <w:r><w:t>{{pembimbing}}</w:t></w:r>
      <w:r><w:t>.</w:t></w:r>
    </w:p>

    <!-- Rincian Kegiatan (List Poin Bertingkat) -->
    <w:p><w:pPr><w:spacing w:before="240" w:after="100"/></w:pPr>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Rincian Agenda &amp; Pekerjaan Siswa:</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:spacing w:after="240"/></w:pPr>
      <w:r><w:t>{{list.rincian_kegiatan}}</w:t></w:r>
    </w:p>

    <w:p><w:pPr><w:spacing w:before="400" w:after="120"/></w:pPr>
      <w:r><w:t>Demikian surat laporan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;
  } else if (templateId === 'perjanjian_kerja') {
    fileName = 'Template_Perjanjian_Kerja_PKWT.docx';
    documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="100"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="30"/></w:rPr><w:t>SURAT PERJANJIAN KERJA WAKTU TERTENTU (PKWT)</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="300"/></w:pPr>
      <w:r><w:t>Nomor: {{nomor_surat}}</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:spacing w:after="160"/></w:pPr>
      <w:r><w:t>Pada hari ini, dibuat kesepakatan kerja antara:</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:spacing w:after="100"/></w:pPr>
      <w:r><w:rPr><w:b/></w:rPr><w:t>1. {{nama_perusahaan}}</w:t></w:r>
      <w:r><w:t>, diwakili oleh </w:t></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:t>{{nama_direktur}}</w:t></w:r>
      <w:r><w:t>, bertindak sebagai PIHAK PERTAMA.</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:spacing w:after="240"/></w:pPr>
      <w:r><w:rPr><w:b/></w:rPr><w:t>2. {{nama_karyawan}}</w:t></w:r>
      <w:r><w:t>, bertindak atas nama pribadi sebagai PIHAK KEDUA.</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:spacing w:after="140"/></w:pPr>
      <w:r><w:t>Kedua belah pihak sepakat mengikatkan diri dengan ketentuan:</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:spacing w:after="100"/></w:pPr>
      <w:r><w:t>• Posisi Jabatan: </w:t></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:t>{{posisi}}</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:spacing w:after="100"/></w:pPr>
      <w:r><w:t>• Gaji Pokok Bulanan: Rp </w:t></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:t>{{gaji}}</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:spacing w:after="100"/></w:pPr>
      <w:r><w:t>• Tanggal Mulai Bekerja: </w:t></w:r>
      <w:r><w:t>{{tanggal_bergabung}}</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;
  } else if (templateId === 'sertifikat') {
    fileName = 'Template_Sertifikat_Kelulusan.docx';
    documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="200"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="38"/><w:color w:val="0F766E"/></w:rPr><w:t>SERTIFIKAT KELULUSAN</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="200"/></w:pPr>
      <w:r><w:t>Diberikan dengan hormat dan apresiasi setinggi-tingginya kepada:</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="200"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="1E293B"/></w:rPr><w:t>{{nama_peserta}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="160"/></w:pPr>
      <w:r><w:t>Atas keberhasilan menyelesaikan seluruh kurikulum program pelatihan:</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="0369A1"/></w:rPr><w:t>{{nama_kursus}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="160"/></w:pPr>
      <w:r><w:t>Dengan predikat pencapaian: </w:t></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:t>{{predikat}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="300" w:after="100"/></w:pPr>
      <w:r><w:t>Diterbitkan pada tanggal: {{tanggal_kelulusan}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="100"/></w:pPr>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Instruktur Utama: {{nama_instruktur}}</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;
  } else {
    // Advanced Run-Split Test Case
    fileName = 'Template_Test_Run_Split.docx';
    documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="200"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="DC2626"/></w:rPr><w:t>DOKUMEN UJI RUN-SPLIT OOXML</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:spacing w:after="160"/></w:pPr>
      <w:r><w:t>Dokumen ini menguji placeholder yang secara sengaja dipecah ke beberapa run XML (&lt;w:r&gt;):</w:t></w:r>
    </w:p>
    
    <!-- Test 1: Split into 3 runs: "{{" then "nama_siswa" then "}}" -->
    <w:p><w:pPr><w:spacing w:after="120"/></w:pPr>
      <w:r><w:t>1. Nama Siswa (3 Runs): </w:t></w:r>
      <w:r><w:t>{{</w:t></w:r>
      <w:r><w:rPr><w:b/><w:color w:val="2563EB"/></w:rPr><w:t>nama_siswa</w:t></w:r>
      <w:r><w:t>}}</w:t></w:r>
    </w:p>

    <!-- Test 2: Split into 4 runs: "{" then "{" then "nomor_registrasi" then "}}" -->
    <w:p><w:pPr><w:spacing w:after="120"/></w:pPr>
      <w:r><w:t>2. Nomor Registrasi (4 Runs): </w:t></w:r>
      <w:r><w:t>{</w:t></w:r>
      <w:r><w:t>{</w:t></w:r>
      <w:r><w:rPr><w:i/></w:rPr><w:t>nomor_registrasi</w:t></w:r>
      <w:r><w:t>}}</w:t></w:r>
    </w:p>

    <!-- Test 3: Split inside the variable name itself: "{{unit_" then "kerja}}" -->
    <w:p><w:pPr><w:spacing w:after="120"/></w:pPr>
      <w:r><w:t>3. Unit Kerja (Internal Word Split): </w:t></w:r>
      <w:r><w:t>{{unit_</w:t></w:r>
      <w:r><w:rPr><w:b/><w:u w:val="single"/></w:rPr><w:t>kerja}}</w:t></w:r>
    </w:p>

    <!-- Test 4: Standard single-run placeholder -->
    <w:p><w:pPr><w:spacing w:after="120"/></w:pPr>
      <w:r><w:t>4. Tanggal Uji (Single Run): </w:t></w:r>
      <w:r><w:t>{{tanggal_uji}}</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;
  }

  zip.file('word/document.xml', documentXml);

  const arrayBuffer = await zip.generateAsync({
    type: 'arraybuffer',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
  });

  return {
    buffer: arrayBuffer,
    fileName,
  };
}
