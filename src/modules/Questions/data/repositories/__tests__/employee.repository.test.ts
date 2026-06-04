import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import questionsRepository from '../question.repository';

describe('questionsRepository', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should be defined', () => {
    expect(questionsRepository).toBeDefined();
  });

  it('should return a singleton instance', () => {
    const a = questionsRepository.getInstance();
    const b = questionsRepository.getInstance();
    expect(a).toBe(b);
  });
});
