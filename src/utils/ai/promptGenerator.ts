import { TemplateVariable } from '../../types';

export function generateAiFillPrompt(variables: TemplateVariable[], fileName?: string): string {
  const header = `# DOCX Template Variable Filling Instructions

You are helping fill a Microsoft Word (.docx) template. The template uses double-curly placeholders like \`{{nama}}\` or \`{{narasi.isi}}\`.

## Core Rules
- Only fill variables that have actual values. If a value is unknown/empty, **DO NOT** provide a value for it (leave it out entirely). Unfilled variables must remain as their original \`{{...}}\` placeholders in the generated document.
- Preserve all original formatting (fonts, styles, tables, spacing, headers/footers). Do not add explanations or commentary in the final output.
- Return a single valid JSON object where keys exactly match the variable keys listed below (dot notation preserved).

## Special Formatting (Newlines & Tabs)
Certain variable types preserve Word formatting:
- **Textarea / Narration** (\`narasi.*\`, \`cerita.*\`, \`paragraf.*\`, \`deskripsi.*\`, \`kisah.*\`, \`sejarah*\`, \`latar_belakang*\`, \`visi_misi*\`, \`keterangan*\`, \`catatan*\`): Use \`\\n\` for line breaks and \`\\t\` for tabs. These are converted to Word line breaks (\`<w:br/>\`) and tab stops (\`<w:tab/>\`), so you can create indented paragraphs, bullet-like indentation, or multi-line text.
- **List** (\`list.*\`, \`daftar.*\`, \`poin.*\`, \`item.*\`, \`rincian.*\`): Same behavior — \`\\n\` creates new lines and \`\\t\` creates indentation/tabs in Word. Great for multi-point lists while preserving original indentation.
- **Regular text**: Single-line is expected; \`\\n\`/\`\\t\` still work if needed but usually not required.

## Images (Photos/Logos)
Variables detected as images will be replaced with inline images:
- Image keys typically match: \`foto.*\`, \`gambar.*\`, \`image.*\`, \`img.*\`, or end with \`.foto\`/\.gambar\`, also \`logo\`, \`avatar\`, \`tanda_tangan\`.
- Provide the image as a **data URL** (e.g. \`data:image/png;base64,...\`) for inline embedding. If you don't have the image, omit that key so the placeholder remains.

## Variable Normalization
- Spaces inside placeholder names are normalized to underscores (e.g. \`{{Nama Lengkap}}\` → key \`Nama_Lengkap\`).
- Extra whitespace and zero-width characters are ignored.
- Only letters, numbers, dots (\`.\`), hyphens (\`-\`), and underscores (\`_\`) are kept in keys.`;

  const varSection = variables.length
    ? '## Variables\n' +
      variables
        .map((v) => {
          const typeNote =
            v.type === 'textarea'
              ? 'multiline (\\n, \\t supported)'
              : v.type === 'list'
                ? 'list/multiline (\\n, \\t supported)'
                : v.type === 'image'
                  ? 'image (data:image/* base64)'
                  : v.type === 'date'
                    ? 'date (e.g. DD/MM/YYYY or YYYY-MM-DD)'
                    : v.type === 'number'
                      ? 'number'
                      : 'text';
          const desc = v.description ? ` — ${v.description}` : '';
          const required = v.required ? ' (required)' : '';
          return `- \`${v.key}\` — ${v.label}${required} [${v.type}] ${typeNote}${desc}`;
        })
        .join('\n') +
      '\n\n'
    : '';

  const example = `## Example (for narration/list)
\`\`\`json
{
  "narasi.sejarah_perusahaan": "Didirikan pada tahun 2020.\\n\\tMemiliki visi menjadi perusahaan terdepan.\\n\\tFokus pada kualitas dan inovasi.",
  "list.layanan_unggulan": "Konsultasi\\n\\tAnalisis kebutuhan\\n\\tImplementasi solusi"
}
\`\`\`

## Output Format
Return ONLY valid JSON (no markdown fences needed if instructed, but safe to return the JSON object). Keys must exactly match those above.

Template: ${fileName || 'template.docx'}`;

  return header + '\n\n' + varSection + example;
}
