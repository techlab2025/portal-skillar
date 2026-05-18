import { describe, it, expect } from 'vitest';
import SkillModel from '../skills.model';

describe('SkillModel', () => {
  it('should create an instance correctly from constructor', () => {
    const model = new SkillModel({ id: 1, title: [{ en: 'JavaScript', ar: 'جافاسكريبت' }] });

    expect(model.id).toBe(1);
    expect(model.title).toEqual([{ en: 'JavaScript', ar: 'جافاسكريبت' }]);
  });

  it('should create an instance correctly from fromJson', () => {
    const json = { id: 2, title: [{ locale: 'en', title: 'Vue.js' }] };
    const model = SkillModel.fromJson(json);

    expect(model.id).toBe(2);
    expect(model.title).toEqual([{ locale: 'en', title: 'Vue.js' }]);
  });

  it('should throw error if json is null in fromJson', () => {
    expect(() => SkillModel.fromJson(null)).toThrow();
  });

  it('should throw error if json is undefined in fromJson', () => {
    expect(() => SkillModel.fromJson(undefined)).toThrow();
  });

  it('should have a valid example', () => {
    expect(SkillModel.example).toBeInstanceOf(SkillModel);
    expect(SkillModel.example.id).toBe(1);
  });

  it('should be frozen after construction', () => {
    const model = new SkillModel({ id: 1, title: [{ en: 'Test' }] });
    expect(Object.isFrozen(model)).toBe(true);
  });
});
