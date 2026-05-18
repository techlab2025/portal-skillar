import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  onBeforeRouteUpdate: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    resolve: vi.fn(),
  }),
  useRoute: () => ({
    fullPath: '/eg/skills/edit/1',
    query: {},
    params: { id: '1' },
  }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    resolve: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

vi.mock('../controllers/skills.controller', () => ({
  default: {
    getInstance: () => ({
      update: vi.fn(),
      fetchOne: vi.fn(),
      itemData: { value: { title: 'Test Skill' } },
      errorMessage: { value: '' },
    }),
  },
}));

vi.mock('../../core/params/show.skills.params', () => ({
  default: class {},
}));

import SkillsEdit from '../SkillsEdit.vue';

describe('SkillsEdit.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const globalConfig = {
    plugins: [createPinia()],
    stubs: {
      SkillsForm: true,
      AppButton: true,
      IconAccept: true,
    },
    mocks: {
      $t: (msg: string) => msg,
    },
  };

  it('renders correctly', () => {
    const wrapper = mount(SkillsEdit, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('contains the skills-edit-page container', () => {
    const wrapper = mount(SkillsEdit, { global: globalConfig });
    expect(wrapper.find('.skills-edit-page').exists()).toBe(true);
  });
});
