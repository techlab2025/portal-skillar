import { describe, it, expect } from 'vitest';
import { SkillsEndpoints } from './skill.api.endpoints';

describe('SkillsEndpoints', () => {
  it('should have the correct prefix', () => {
    const endpoints = new SkillsEndpoints();
    // @ts-expect-error - prefix is protected
    expect(endpoints.prefix).toBe('dashboard/');
  });

  it('should have the correct endpoint URLs', () => {
    const endpoints = new SkillsEndpoints();
    expect(endpoints.index).toContain('fetch_skills');
    expect(endpoints.show).toContain('show_skill');
    expect(endpoints.store).toContain('store_skill');
    expect(endpoints.update).toContain('update_skill');
    expect(endpoints.delete).toContain('delete_skill');
  });
});
