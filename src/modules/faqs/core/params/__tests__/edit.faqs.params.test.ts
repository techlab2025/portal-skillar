import { describe, it, expect } from 'vitest';
import EditFaqsParams from '../edit.faqs.params';
import TranslationParams from '@/modules/about/core/params/translation.params';

const makeTranslations = (overrides: Partial<Record<string, Record<string, string>>> = {}) =>
  new TranslationParams({
    question: overrides.question ?? { en: 'Updated question?', ar: 'سؤال محدث؟' },
    answer: overrides.answer ?? { en: 'Updated answer.', ar: 'إجابة محدثة.' },
  });

const makeParams = (overrides: Partial<{ id: number; translations: TranslationParams }> = {}) =>
  new EditFaqsParams({
    id: 1,
    translations: makeTranslations(),
    ...overrides,
  });

describe('EditFaqsParams', () => {
  it('constructs with correct fields', () => {
    const params = makeParams();
    expect(params.id).toBe(1);
    expect(params.translations).toBeInstanceOf(TranslationParams);
  });

  it('toMap returns faq_id and translations', () => {
    const translations = makeTranslations();
    const params = new EditFaqsParams({ id: 1, translations });
    expect(params.toMap()).toEqual({
      faq_id: 1,
      translations: translations.toMap(),
    });
  });

  it('validate returns isValid:true with a valid id', () => {
    expect(makeParams().validate().isValid).toBe(true);
  });

  it('validate returns isValid:false when id is null', () => {
    const params = new EditFaqsParams({ id: null as any, translations: makeTranslations() });
    expect(params.validate().isValid).toBe(false);
  });
});
