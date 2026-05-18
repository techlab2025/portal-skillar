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
    expect(model.question.en).toBe('Q');
    expect(model.answer.ar).toBe('ج');
  });

  it('creates an instance fromJson with locale-object fields', () => {
    const json = {
      id: 1,
      question: { en: 'Q' },
      answer: { en: 'A' },
    };
    const model = FaqsModel.fromJson(json);
    expect(model.id).toBe(1);
    expect(model.question.en).toBe('Q');
  });

  it('fromJson normalises array-style locale fields', () => {
    const json = {
      id: 2,
      question: [
        { locale: 'en', question: 'Q-en' },
        { locale: 'ar', question: 'Q-ar' },
      ],
      answer: [
        { locale: 'en', answer: 'A-en' },
        { locale: 'ar', answer: 'A-ar' },
      ],
    };
    const model = FaqsModel.fromJson(json);
    expect(model.question).toEqual({ en: 'Q-en', ar: 'Q-ar' });
    expect(model.answer).toEqual({ en: 'A-en', ar: 'A-ar' });
  });

  it('fromJson throws on null', () => {
    expect(() => FaqsModel.fromJson(null)).toThrow();
    expect(() => FaqsModel.fromJson(undefined)).toThrow();
  });

  it('fromJson handles string question/answer', () => {
    const json = { id: 3, question: 'plain q', answer: 'plain a' };
    const model = FaqsModel.fromJson(json);
    expect(model.question).toBe('plain q');
    expect(model.answer).toBe('plain a');
  });

  it('has example', () => {
    expect(FaqsModel.example).toBeInstanceOf(FaqsModel);
    expect(FaqsModel.example.id).toBe(1);
  });

  it('is frozen after construction', () => {
    const model = new FaqsModel(mockData);
    expect(Object.isFrozen(model)).toBe(true);
  });
});
