import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

type LocaleMessages = Record<string, unknown>;

function readLocale(filename: string): LocaleMessages {
  const localePath = join(process.cwd(), 'src', 'locales', filename);
  return JSON.parse(readFileSync(localePath, 'utf8')) as LocaleMessages;
}

function flattenKeys(messages: LocaleMessages, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flattenKeys(value as LocaleMessages, fullKey);
    }
    return fullKey;
  });
}

describe('locale parity', () => {
  it('keeps English and Arabic translation keys in sync', () => {
    const englishKeys = flattenKeys(readLocale('en.json')).sort();
    const arabicKeys = flattenKeys(readLocale('ar.json')).sort();

    expect(arabicKeys).toEqual(englishKeys);
  });
});
