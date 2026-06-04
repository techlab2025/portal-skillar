import { describe, it, expect, vi } from 'vitest';
import EditDocumentParams from '../edit.document.params';
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

describe('EditDocumentParams', () => {
  const makeParams = (overrides = {}) =>
    new EditDocumentParams({
      document_id: 10,
      documentTypeId: 1,
      stage_id: 2,
      subjects: 3,
      translations: new DocumentTranslationParams({ title: { en: 'Update Doc' } }),
      tags: ['tag2'],
      images: ['data:image/png;base64,123'],
      files: [],
      ...overrides,
    });

  it('should create an instance with correct data', () => {
    const params = makeParams();
    expect(params.document_id).toBe(10);
    expect(params.stage_id).toBe(2);
    expect(params.translations).toBeDefined();
  });

  it('should map to an object correctly', () => {
    const params = makeParams();
    const map = params.toMap();
    expect(map.document_id).toBe(10);
    expect(map.translations).toBeDefined();
    expect(map.image).toBe('data:image/png;base64,123');
  });

  it('should validate correctly with valid data', () => {
    const params = makeParams();
    const result = params.validate();
    expect(result.isValid).toBe(true);
  });

  it('should fail validation with missing document_id', () => {
    const params = makeParams({ document_id: null });
    expect(params.validate().isValid).toBe(false);
  });
});
