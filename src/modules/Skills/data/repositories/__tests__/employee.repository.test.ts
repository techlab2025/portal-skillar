import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import SkillsRepository from '../skills.repository';

describe('SkillsRepository', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should be defined', () => {
    expect(SkillsRepository).toBeDefined();
  });

  it('should return singleton via getInstance', () => {
    const a = SkillsRepository.getInstance();
    const b = SkillsRepository.getInstance();
    expect(a).toBe(b);
  });
});
