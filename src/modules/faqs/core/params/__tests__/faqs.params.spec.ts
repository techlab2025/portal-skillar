import { describe, it, expect, vi } from 'vitest';
import AddFaqsParams from '../add.faqs.params';
import DeleteFaqsParams from '../delete.faqs.params';
import EditFaqsParams from '../edit.faqs.params';
import FaqsDetailsParams from '../faqs.details.params';
import IndexFaqsParams from '../index.faqs.params';
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

describe('Faqs Parameters', () => {
  it('AddFaqsParams converts to Map correctly', () => {
    const translation = new TranslationParams({ title: { en: 'FAQ Title' } });
    const params = new AddFaqsParams({ translations: translation });
    const map = params.toMap();
    expect(map.translations).toBeDefined();
  });

  it('DeleteFaqsParams converts to Map correctly', () => {
    const params = new DeleteFaqsParams({ id: 1 });
    const map = params.toMap();
    expect(map.faq_id).toBe(1);
  });

  it('EditFaqsParams converts to Map correctly', () => {
    const translation = new TranslationParams({ title: { en: 'Updated' } });
    const params = new EditFaqsParams({ id: 1, translations: translation });
    const map = params.toMap();
    expect(map.faq_id).toBe(1);
    expect(map.translations).toBeDefined();
  });

  it('FaqsDetailsParams converts to Map correctly', () => {
    const params = new FaqsDetailsParams({ id: 5 });
    const map = params.toMap();
    expect(map.faq_id).toBe(5);
  });

  it('IndexFaqsParams converts to Map correctly', () => {
    const params = new IndexFaqsParams();
    const map = params.toMap();
    expect(map.page).toBe(1);
  });
});
