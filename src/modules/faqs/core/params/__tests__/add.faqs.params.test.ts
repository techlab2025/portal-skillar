import { describe, it, expect, vi } from 'vitest';
import AddFaqsParams from '../add.faqs.params';
import TranslationParams from '@/modules/about/core/params/translation.params';

vi.mock('@/modules/about/core/params/translation.params', () => {
  return {
    default: class TranslationParams {
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

const makeTranslation = () => new TranslationParams({ title: { en: 'Test FAQ', ar: 'اختبار' } });

describe('AddFaqsParams', () => {
  it('constructs with translations', () => {
    const params = new AddFaqsParams({ translations: makeTranslation() });
    expect(params.translations).toBeDefined();
  });

  it('toMap serialises translations correctly', () => {
    const translation = makeTranslation();
    const params = new AddFaqsParams({ translations: translation });
    const map = params.toMap();
    expect(map.translations).toBeDefined();
  });

  it('validate returns isValid:true when translations provided', () => {
    const params = new AddFaqsParams({ translations: makeTranslation() });
    expect(params.validate().isValid).toBe(true);
  });

  it('validate returns isValid:false when translations is null', () => {
    const params = new AddFaqsParams({ translations: null as any });
    expect(params.validate().isValid).toBe(false);
  });
});
