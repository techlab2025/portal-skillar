import { describe, it, expect } from 'vitest';
import AddFaqsParams from '../add.faqs.params';
import TranslationParams from '@/modules/about/core/params/translation.params';

const makeTranslations = () =>
  new TranslationParams({
    question: { en: 'What is this?', ar: 'ما هذا؟' },
    answer: { en: 'This is a FAQ.', ar: 'هذا سؤال شائع.' },
  });

describe('AddFaqsParams', () => {
  it('constructs with translations', () => {
    const params = new AddFaqsParams({ translations: makeTranslations() });
    expect(params.translations).toBeInstanceOf(TranslationParams);
  });

  it('toMap serialises translations using TranslationParams.toMap', () => {
    const translations = makeTranslations();
    const params = new AddFaqsParams({ translations });
    const map = params.toMap();
    expect(map.translations).toEqual(translations.toMap());
    expect(map.translations.question).toEqual({ en: 'What is this?', ar: 'ما هذا؟' });
  });

  it('validate returns isValid:true when translations is present', () => {
    const params = new AddFaqsParams({ translations: makeTranslations() });
    expect(params.validate().isValid).toBe(true);
  });
});
