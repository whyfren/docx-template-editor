/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TemplateVariable, VariableValues, ValidationState } from '../../types';

/**
 * Validates current variable values against the template's variable specifications.
 */
export function validateVariables(
  variables: TemplateVariable[],
  values: VariableValues
): ValidationState {
  const missingRequired: string[] = [];
  const errors: Record<string, string> = {};

  for (const v of variables) {
    const rawValue = values[v.key];
    const stringVal = rawValue !== undefined && rawValue !== null ? String(rawValue).trim() : '';

    // Check required constraint
    if (v.required && !stringVal) {
      missingRequired.push(v.key);
      errors[v.key] = `${v.label} wajib diisi.`;
      continue;
    }

    // If value is provided, check type-specific constraints
    if (stringVal) {
      if (v.type === 'number') {
        // Allows digits, commas, dots, dashes, spaces (e.g. "123.456", "100000", "0812-3456")
        const isValidNumber = /^[\d\s.,\-+/()]+$/.test(stringVal);
        if (!isValidNumber) {
          errors[v.key] = `${v.label} harus berupa angka yang valid.`;
        }
      } else if (v.type === 'date') {
        // Check reasonable date pattern (e.g. YYYY-MM-DD, DD/MM/YYYY, or alphanumeric date "20 Oktober 2024")
        if (stringVal.length < 4) {
          errors[v.key] = `Format tanggal untuk ${v.label} terlalu singkat.`;
        }
      }
    }
  }

  return {
    isValid: missingRequired.length === 0 && Object.keys(errors).length === 0,
    missingRequired,
    errors,
  };
}

/**
 * Formats user-facing status badge text.
 */
export function getValidationSummary(
  validation: ValidationState,
  totalVariables: number
): { status: 'success' | 'warning' | 'neutral'; message: string } {
  if (totalVariables === 0) {
    return {
      status: 'neutral',
      message: 'Tidak ada variabel untuk divalidasi.',
    };
  }

  if (validation.missingRequired.length > 0) {
    return {
      status: 'warning',
      message: `⚠ ${validation.missingRequired.length} variabel wajib belum diisi`,
    };
  }

  if (Object.keys(validation.errors).length > 0) {
    return {
      status: 'warning',
      message: `⚠ Terdapat ${Object.keys(validation.errors).length} nilai variabel tidak valid`,
    };
  }

  return {
    status: 'success',
    message: '✓ Semua variabel wajib telah terisi lengkap',
  };
}
