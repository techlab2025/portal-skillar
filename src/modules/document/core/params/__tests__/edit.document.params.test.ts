import { describe, it, expect } from 'vitest';
import EditDocumentParams from '../edit.document.params';
import DocumentTranslationParams from '../translation.params';

const makeTranslation = () =>
  new DocumentTranslationParams({
    description: { en: 'Desc', ar: 'وصف' },
    title: { en: 'Title', ar: 'عنوان' },
  });

describe('EditDocumentParams', () => {
  it('should create an instance with correct data', () => {
    const params = new EditDocumentParams({
      document_id: 10,
      refNumber: 'REF-001',
      documentTypeId: 1,
      stage_id: 2,
      subjects: 3,
      translations: makeTranslation(),
      tags: ['tag1'],
      images: [],
      files: [],
    });

    expect(params.document_id).toBe(10);
    expect(params.refNumber).toBe('REF-001');
    expect(params.documentTypeId).toBe(1);
    expect(params.stage_id).toBe(2);
    expect(params.subjects).toBe(3);
  });

  it('should map to an object correctly', () => {
    const params = new EditDocumentParams({
      document_id: 10,
      refNumber: 'REF-001',
      documentTypeId: 1,
      stage_id: 2,
      subjects: 3,
      translations: makeTranslation(),
      tags: ['tag1'],
      images: [],
      files: [],
    });

    const map = params.toMap();
    expect(map.document_id).toBe(10);
    expect(map.reference_number).toBe('REF-001');
    expect(map.document_type_id).toBe(1);
    expect(map.stage_id).toBe(2);
    expect(map.subject_id).toBe(3);
  });

  it('should validate correctly with valid data', () => {
    const params = new EditDocumentParams({
      document_id: 10,
      refNumber: 'REF-001',
      documentTypeId: 1,
      stage_id: 2,
      subjects: 3,
      translations: makeTranslation(),
      tags: [],
      images: [],
      files: [],
    });

    const result = params.validate();
    expect(result.isValid).toBe(true);
  });

  it('should fail validation with missing document_id', () => {
    const params = new EditDocumentParams({
      document_id: undefined as any,
      refNumber: 'REF-001',
      documentTypeId: 1,
      stage_id: 2,
      subjects: 3,
      translations: makeTranslation(),
      tags: [],
      images: [],
      files: [],
    });

    const result = params.validate();
    expect(result.isValid).toBe(false);
  });
});
