# DOCX Template Editor

Browser-based Microsoft Word (`.docx`) template engine. Upload a Word template, fill in `{{placeholder}}` values through a form or a JSON payload, preview the result live, and download a finished document.

Everything runs client-side. No backend, no API keys, no server-side file handling. The `.docx` is unzipped with JSZip, the placeholder text is replaced directly in the OOXML, and the archive is re-zipped and downloaded.

> UI strings are in Indonesian (Bahasa Indonesia). Code, comments, and types are in English.

## Why this exists

Word templates written by humans are fragile. A placeholder typed as `{{nama}}` rarely survives a save in Word, because Word splits text into arbitrary `<w:r>` runs. What you get on disk can be `{{nama}}` split across three runs, or with zero-width characters injected in the middle. Naive find-and-replace on the raw XML silently misses those. Most template tools either lose formatting or leave `{{nama}}` in the output.

This editor solves that by parsing the OOXML as a DOM, rebuilding each paragraph's text into a character map, and matching placeholders across run boundaries while preserving the `<w:rPr>` formatting of the host run.

## Features

**Placeholder detection**
- Matches `{{key}}`, `{{ key }}`, `{ { key } }`, and full-width `｛｛key｝｝`
- Tolerates non-breaking spaces, zero-width characters, dots, and hyphens in names
- Recovers placeholders split across 2+ XML runs
- Scans body, headers, footers, footnotes, endnotes, comments, and glossary parts
- Reports every occurrence with its file path, location type, and surrounding context

**Type inference and smart fields**
Variable types are inferred from key naming conventions, so `{{foto.pas_foto}}` opens an image slot and `{{narasi.sejarah}}` opens a multi-line field without any manual setup.

| Key pattern | Inferred type | Input |
|---|---|---|
| `foto.*`, `gambar.*`, `logo`, `tanda_tangan` | `image` | File upload or generated sample photo |
| `narasi.*`, `cerita.*`, `*_sejarah`, `*_alamat` | `textarea` | Multi-line, honours Enter and Tab |
| `list.*`, `daftar.*`, `*_rincian` | `list` | Tab-indented sub-points |
| `*tanggal*`, `*tgl*`, `*deadline*` | `date` | Native date picker |
| `*nis*`, `*gaji*`, `*jumlah*`, `*tahun*` | `number` | Numeric input with format validation |
| anything else | `text` | Single-line text |

**Image embedding**
Image variables are written as real DrawingML into the document: binary data goes into `word/media/`, relationships are registered in `word/_rels/document.xml.rels`, content types are patched in `[Content_Types].xml`, and an inline `<w:drawing>` element replaces the placeholder run. Images are scaled to fit within 240x260 px preserving aspect ratio.

**Text fidelity**
- Formatting of the host run is preserved (bold, italic, colour, font)
- Newlines become `<w:br/>` and tabs become `<w:tab/>`, so list indentation survives
- `xml:space="preserve"` is set where leading or trailing whitespace matters
- Matches are processed right-to-left so earlier offsets stay valid

**Three preview modes**
- **Document Flow** - a lightweight block renderer that highlights filled values inline as you type, with images shown as thumbnails
- **Word Page** - authentic page rendering of the generated file via `docx-preview`, with headers, footers, and page breaks
- **Run Inspector** - every placeholder occurrence with its XML file, location, run-split count, and context snippet

**JSON integration**
Export the detected variables as a JSON schema, paste or upload a JSON payload to bulk-fill, or export current values. Nested objects are flattened to dot notation, `{ data: ... }` and `{ variables: ... }` wrappers are unwrapped, and keys are matched case-insensitively with unmatched keys reported.

**AI Prompt for LLMs**
Generate a ready-to-paste prompt for ChatGPT/Claude/Gemini with all detected variables, rules (do not fill empty variables), and special formatting notes for `\n`/`\t` in narration/list fields.

**Validation and metadata**
Required-field checking, numeric and date format checks, and per-variable overrides for label, type, description, default value, and required status.

**Built-in samples**
Five `.docx` templates are generated in-browser with JSZip, including a dedicated run-split stress test whose placeholders are deliberately fragmented across multiple runs.

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

The dev server listens on `http://localhost:3000`.

```bash
npm run build      # production bundle into dist/
npm run preview    # serve the production bundle locally
npm run lint       # tsc --noEmit
npm run clean      # remove dist/
```

No environment variables are required. The `.env.example` file is a leftover from the Google AI Studio starter template; the Gemini and Express dependencies in `package.json` are unused by the current code and can be removed.

## Usage

1. Drop a `.docx` file onto the upload area, or pick one of the sample templates.
2. Fill the detected variables in the left panel. The preview updates as you type.
3. Adjust label, type, description, or required status per variable through the metadata dialog.
4. Optionally import a JSON payload to bulk-fill.
5. Press **Generate DOCX**, then **Download DOCX**. Output is named `<original>-filled.docx`.

If a document contains no placeholders, the editor says so and tells you to add `{{nama_variabel}}` markers in Word first.

## Project structure

```
src/
  App.tsx                        two-screen shell: upload, then editor + preview
  main.tsx                       React entry point
  types/index.ts                 shared domain types
  hooks/
    useDocxTemplate.ts           all application state and the generate/download flow
  utils/
    docx/
      parser.ts                  ZIP loading, XML part extraction, DOM parse/serialize
      placeholderDetector.ts     placeholder regex, label/type inference, occurrence map
      replacer.ts                run-aware placeholder replacement, text/image insertion
      imageManager.ts            base64 decoding, EMU sizing, DrawingML and rels generation
      docxBuilder.ts             orchestrates build -> Blob and triggers download
      previewExtractor.ts        lightweight blocks for the flow preview
      sampleGenerator.ts         builds the five sample .docx files
      sampleImage.ts             Canvas-generated sample photos and logos
    json/jsonManager.ts          JSON schema generation, import matching, export
    ai/promptGenerator.ts        AI prompt generator for copy-paste to LLMs
    validation/index.ts          required-field and type validation
  components/
    Header.tsx                   app bar, template info, reset
    FileUploader.tsx             drag-and-drop upload and sample picker entry
    VariableEditor.tsx           typed input forms, search, missing-only filter
    DocumentPreview.tsx          flow / Word page / inspector tabs
    GenerationBanner.tsx         generate button and download state
    VariableMetadataModal.tsx    per-variable overrides
    JsonDataModal.tsx            import, schema, export
    SampleTemplatesModal.tsx     sample template gallery
    VariableGuideModal.tsx       placeholder syntax guide
```

## How the replacement engine works

1. `parser.ts` loads the `.docx` with JSZip and pulls out every text-bearing XML part.
2. `placeholderDetector.ts` walks each paragraph's `<w:t>` elements in document order, concatenates their text into a character map, and runs the placeholder regex over the combined string. Because matching happens on the merged text, a placeholder split across runs is found intact. Each match is mapped back to the runs it intersects.
3. `replacer.ts` processes matches in descending start order. For a single-run match, the prefix and suffix around the placeholder stay in place and only the placeholder text is swapped. For a multi-run match, one run is chosen as the primary host (preferring the run that carries `<w:rPr>`), the first run keeps its prefix, the last keeps its suffix, and fully-interior runs are emptied. Text values containing newlines or tabs are decomposed into `<w:br/>` and `<w:tab/>` nodes. Image values get a `<w:drawing>` inserted instead.
4. `docxBuilder.ts` re-zips the modified parts alongside all untouched binary assets, producing a valid `.docx` Blob with styles, tables, headers, footers, and media preserved.

## Tech stack

React 19, TypeScript, Vite 8, Tailwind CSS 4, JSZip, `docx-preview`, `lucide-react`.

## License

Apache-2.0