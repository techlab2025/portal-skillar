import { describe, it, expect, vi } from 'vitest';
import EditFaqsParams from '../edit.faqs.params';
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

const makeParams = (overrides: Partial<{ id: number; translations: TranslationParams }> = {}) =>
  new EditFaqsParams({
    id: 1,
    translations: new TranslationParams({ title: { en: 'Updated', ar: 'محدث' } }),
    ...overrides,
  });

describe('EditFaqsParams', () => {
  it('constructs with correct id', () => {
    const params = makeParams();
    expect(params.id).toBe(1);
  });

  it('constructs with translations', () => {
    const params = makeParams();
    expect(params.translations).toBeDefined();
  });

  it('toMap includes faq_id and translations', () => {
    const params = makeParams();
    const map = params.toMap();
    expect(map.faq_id).toBe(1);
    expect(map.translations).toBeDefined();
  });

  it('validate returns isValid:true with a valid id', () => {
    expect(makeParams().validate().isValid).toBe(true);
  });

  it('validate returns isValid:false when id is null', () => {
    const params = makeParams({ id: null as any });
    expect(params.validate().isValid).toBe(false);
  });
});
