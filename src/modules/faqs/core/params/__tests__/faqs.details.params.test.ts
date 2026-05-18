import { describe, it, expect } from 'vitest';
import FaqsDetailsParams from '../faqs.details.params';

describe('FaqsDetailsParams', () => {
  it('constructs with the given id', () => {
    const params = new FaqsDetailsParams({ id: 5 });
    expect(params.id).toBe(5);
  });

  it('defaults isLocale to true', () => {
    const params = new FaqsDetailsParams({ id: 1 });
    expect(params.isLocale).toBe(true);
  });

  it('allows overriding isLocale', () => {
    const params = new FaqsDetailsParams({ id: 1, isLocale: false });
    expect(params.isLocale).toBe(false);
  });

  it('toMap returns faq_id', () => {
    const params = new FaqsDetailsParams({ id: 10 });
    expect(params.toMap()).toEqual({ faq_id: 10 });
  });

  it('validate returns isValid:true when id is present', () => {
    expect(new FaqsDetailsParams({ id: 1 }).validate().isValid).toBe(true);
  });

  it('validate returns isValid:false when id is null', () => {
    const params = new FaqsDetailsParams({ id: null as any });
    expect(params.validate().isValid).toBe(false);
  });
});
