import { describe, it, expect } from 'vitest';
import AddDocumentParams from '../add.document.params';
import DocumentTranslationParams from '../translation.params';

const makeTranslations = (
  overrides: Partial<ConstructorParameters<typeof DocumentTranslationParams>[0]> = {},
) =>
  new DocumentTranslationParams({
    title: { en: 'Doc Title', ar: 'عنوان' },
    description: { en: 'Desc', ar: 'وصف' },
    ...overrides,
  });

const makeParams = (overrides: Partial<ConstructorParameters<typeof AddDocumentParams>[0]> = {}) =>
  new AddDocumentParams({
    refNumber: 'REF-001',
    documentTypeId: 1,
    stage_id: 2,
    subjects: 3,
    translations: makeTranslations(),
    tags: ['tag1'],
    images: 'image-base64',
    files: 'file-base64',
    ...overrides,
  });

describe('AddDocumentParams', () => {
  it('creates an instance with correct data', () => {
    const params = makeParams();

    expect(params.refNumber).toBe('REF-001');
    expect(params.documentTypeId).toBe(1);
    expect(params.stage_id).toBe(2);
    expect(params.subjects).toBe(3);
    expect(params.tags).toEqual(['tag1']);
  });

  it('maps to an object correctly', () => {
    const map = makeParams().toMap();

    expect(map.reference_number).toBe('REF-001');
    expect(map.document_type_id).toBe(1);
    expect(map.stage_id).toBe(2);
    expect(map.subject_id).toBe(3);
    expect(map.document_tags).toEqual(['tag1']);
    expect(map.image).toBe('image-base64');
    expect(map.document_file).toBe('file-base64');
    expect(map.translations).toEqual({
      title: { en: 'Doc Title', ar: 'عنوان' },
      description: { en: 'Desc', ar: 'وصف' },
    });
  });

  it('validates correctly with valid data', () => {
    expect(makeParams().validate().isValid).toBe(true);
    expect(makeParams().translations.validate().isValid).toBe(true);
  });

  it('fails validation when required top-level fields are missing', () => {
    const result = makeParams({
      refNumber: '',
      documentTypeId: 0,
      stage_id: 0,
      subjects: 0,
      images: '',
      files: '',
    }).validate();

    expect(result.isValid).toBe(false);
    expect(result.errors.map((error) => error.field)).toEqual([
      'refNumber',
      'documentTypeId',
      'subjects',
      'stage_id',
      'images',
      'files',
    ]);
  });

  it('fails nested translation validation when title or description is empty', () => {
    const translations = makeTranslations({ title: {}, description: { en: '   ' } });
    const result = translations.validate();

    expect(result.isValid).toBe(false);
    expect(result.errors.map((error) => error.field)).toEqual(['title', 'description']);
  });
});
