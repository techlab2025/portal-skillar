import { describe, it, expect } from 'vitest';
import FaqsModel from './faqs.model';

describe('FaqsModel', () => {
  const mockData = {
    id: 1,
    question: { en: 'Q', ar: 'س' },
    answer: { en: 'A', ar: 'ج' },
  };

  it('creates an instance from constructor', () => {
    const model = new FaqsModel(mockData);
    expect(model.id).toBe(1);
    expect((model.question as Record<string, string>).en).toBe('Q');
    expect((model.answer as Record<string, string>).ar).toBe('ج');
  });

  it('creates an instance fromJson with direct question/answer fields', () => {
    const json = {
      id: 1,
      question: { en: 'Q' },
      answer: { en: 'A' },
    };
    const model = FaqsModel.fromJson(json);
    expect(model.id).toBe(1);
    expect((model.question as Record<string, string>).en).toBe('Q');
  });

  it('throws when json is null', () => {
    expect(() => FaqsModel.fromJson(null)).toThrow();
  });

  it('throws when json is undefined', () => {
    expect(() => FaqsModel.fromJson(undefined)).toThrow();
  });

  it('has a static example', () => {
    expect(FaqsModel.example).toBeInstanceOf(FaqsModel);
    expect(FaqsModel.example.id).toBe(1);
  });
});
