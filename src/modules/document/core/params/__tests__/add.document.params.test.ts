import { describe, it, expect } from 'vitest';
import AddDocumentParams from '../add.document.params';
import DocumentTranslationParams from '../translation.params';

const makeTranslation = () =>
  new DocumentTranslationParams({
    description: { en: 'Desc', ar: 'وصف' },
    title: { en: 'Title', ar: 'عنوان' },
  });

const makeParams = (overrides: Partial<ConstructorParameters<typeof AddDocumentParams>[0]> = {}) =>
  new AddDocumentParams({
    refNumber: 'REF-001',
    documentTypeId: 1,
    stage_id: 2,
    subjects: 3,
    translations: makeTranslation(),
    tags: ['tag1'],
    images: [],
    files: [],
    ...overrides,
  });

describe('AddDocumentParams', () => {
  it('should create an instance with correct data', () => {
    const params = makeParams();
    expect(params.refNumber).toBe('REF-001');
    expect(params.documentTypeId).toBe(1);
    expect(params.stage_id).toBe(2);
    expect(params.subjects).toBe(3);
    expect(params.tags).toEqual(['tag1']);
  });

  it('should map to an object correctly', () => {
    const params = makeParams();
    const map = params.toMap();
    expect(map.reference_number).toBe('REF-001');
    expect(map.document_type_id).toBe(1);
    expect(map.stage_id).toBe(2);
    expect(map.subject_id).toBe(3);
    expect(map.document_tags).toEqual(['tag1']);
  });

  it('should validate correctly with valid data', () => {
    const result = makeParams().validate();
    expect(result.isValid).toBe(true);
  });

  it('should fail validation when translations are missing', () => {
    const params = new AddDocumentParams({
      refNumber: 'REF-001',
      documentTypeId: 1,
      stage_id: 2,
      subjects: 3,
      translations: undefined as any,
      tags: [],
      images: [],
      files: [],
    });
    const result = params.validate();
    expect(result.isValid).toBe(false);
  });
});
