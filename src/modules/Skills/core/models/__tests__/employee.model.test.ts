import { describe, it, expect } from 'vitest';
import SkillModel from '../skills.model';

describe('SkillModel', () => {
  const mockJson = {
    skill_id: 1,
    title: [{ name: 'TypeScript' }],
  };

  it('should create an instance correctly from constructor', () => {
    const model = new SkillModel({ id: 1, title: 'JavaScript' });
    expect(model.id).toBe(1);
    expect(model.title).toBe('JavaScript');
  });

  it('should create an instance correctly from fromJson', () => {
    const model = SkillModel.fromJson(mockJson);
    expect(model.id).toBe(1);
    expect(model.title).toEqual([{ name: 'TypeScript' }]);
  });

  it('should throw error if json is null in fromJson', () => {
    expect(() => SkillModel.fromJson(null)).toThrow();
  });

  it('should have a valid example', () => {
    expect(SkillModel.example).toBeInstanceOf(SkillModel);
    expect(SkillModel.example.id).toBe(1);
  });
});
