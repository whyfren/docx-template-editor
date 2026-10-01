/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TemplateVariable, VariableValues, JsonImportResult } from '../../types';

/**
 * Generates an empty JSON template (schema) with all detected variable keys.
 */
export function generateEmptyJsonTemplate(
  variables: TemplateVariable[],
  includeComments: boolean = false
): string {
  const obj: Record<string, string> = {};

  for (const v of variables) {
    if (v.type === 'image') {
      obj[v.key] = v.defaultValue || 'data:image/png;base64,...';
    } else if (v.type === 'textarea') {
      obj[v.key] =
        v.defaultValue ||
        `Tulis narasi panjang untuk ${v.label} di sini...`;
    } else {
      obj[v.key] = v.defaultValue || '';
    }
  }

  return JSON.stringify(obj, null, 2);
}

/**
 * Exports current form values as formatted JSON.
 */
export function exportCurrentValuesToJson(
  variables: TemplateVariable[],
  values: VariableValues
): string {
  const result: Record<string, string> = {};

  for (const v of variables) {
    result[v.key] = values[v.key] ?? '';
  }

  return JSON.stringify(result, null, 2);
}

/**
 * Flattens a nested object into dot-notation keys.
 * e.g. { "foto": { "pas_foto": "abc" } } -> { "foto.pas_foto": "abc" }
 */
function flattenObject(
  obj: Record<string, unknown>,
  prefix: string = ''
): Record<string, string> {
  const flattened: Record<string, string> = {};

  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(
        flattened,
        flattenObject(val as Record<string, unknown>, fullKey)
      );
    } else if (val !== undefined && val !== null) {
      flattened[fullKey] = String(val);
    }
  }

  return flattened;
}

/**
 * Parses user-provided JSON string and matches it against current template variables.
 * Supports both flat dot-notation keys and nested object structures.
 */
export function parseAndValidateJsonInput(
  jsonString: string,
  variables: TemplateVariable[]
): JsonImportResult {
  if (!jsonString.trim()) {
    throw new Error('Data JSON kosong. Silakan tempel atau unggah file JSON.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Format JSON tidak valid.';
    throw new Error(`Sintaks JSON tidak valid: ${msg}`);
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Format JSON harus berupa objek JSON (contoh: { "key": "value" }).');
  }

  // Handle case where user provided root { data: { ... } } or { variables: { ... } }
  let targetObj = parsed as Record<string, unknown>;
  if (targetObj.data && typeof targetObj.data === 'object') {
    targetObj = targetObj.data as Record<string, unknown>;
  } else if (targetObj.variables && typeof targetObj.variables === 'object') {
    targetObj = targetObj.variables as Record<string, unknown>;
  }

  // Flatten nested objects to dot-notation (e.g. foto: { logo: "..." } -> "foto.logo")
  const flattenedInput = flattenObject(targetObj);

  const matchedKeys: string[] = [];
  const unmatchedKeys: string[] = [];
  const parsedValues: VariableValues = {};

  const variableKeySet = new Set(variables.map((v) => v.key));

  for (const [key, val] of Object.entries(flattenedInput)) {
    if (variableKeySet.has(key)) {
      matchedKeys.push(key);
      parsedValues[key] = val;
    } else {
      // Also try case-insensitive match
      const matchingVar = variables.find(
        (v) => v.key.toLowerCase() === key.toLowerCase()
      );
      if (matchingVar) {
        matchedKeys.push(matchingVar.key);
        parsedValues[matchingVar.key] = val;
      } else {
        unmatchedKeys.push(key);
      }
    }
  }

  return {
    totalKeysInJson: Object.keys(flattenedInput).length,
    matchedCount: matchedKeys.length,
    matchedKeys,
    unmatchedKeys,
    parsedValues,
  };
}

/**
 * Triggers download of JSON content as a .json file.
 */
export function downloadJsonFile(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
