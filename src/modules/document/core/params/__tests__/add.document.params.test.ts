import { describe, it, expect, vi } from 'vitest';
import AddDocumentParams from '../add.document.params';
import DocumentTranslationParams from '../translation.params';

vi.mock('../translation.params', () => {
  return {
    default: class DocumentTranslationParams {
      title: Record<string, string>;
      constructor(data: { title: Record<string, string> }) {
        this.title = data.title;
      }
      toMap() {
        return { title: this.title };
      }
    },
  };
});

describe('AddDocumentParams', () => {
  const makeParams = (overrides = {}) =>
    new AddDocumentParams({
      refNumber: 'REF-001',
      documentTypeId: 1,
      stage_id: 2,
      subjects: 3,
      translations: new DocumentTranslationParams({ title: { en: 'Doc Title' } }),
      tags: ['tag1'],
      images: 'img.png',
      files: 'doc.pdf',
      ...overrides,
    });

  it('should create an instance with correct data', () => {
    const params = makeParams();
    expect(params.refNumber).toBe('REF-001');
    expect(params.documentTypeId).toBe(1);
    expect(params.stage_id).toBe(2);
    expect(params.translations).toBeDefined();
  });

  it('should map to an object correctly', () => {
    const params = makeParams();
    const map = params.toMap();
    expect(map.reference_number).toBe('REF-001');
    expect(map.document_type_id).toBe(1);
    expect(map.translations).toBeDefined();
  });

  it('should validate correctly with valid data', () => {
    expect(makeParams().validate().isValid).toBe(true);
  });

  it('should fail validation with missing translations', () => {
    const result = makeParams({ translations: null }).validate();
    expect(result.isValid).toBe(false);
  });
});
