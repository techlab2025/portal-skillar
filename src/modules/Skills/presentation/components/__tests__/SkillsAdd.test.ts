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
    fullPath: '/eg/skills/add',
    query: {},
    params: {},
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
      create: vi.fn(),
      errorMessage: { value: '' },
    }),
  },
}));

import SkillsAdd from '../SkillsAdd.vue';

describe('SkillsAdd.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const globalConfig = {
    plugins: [createPinia()],
    stubs: {
      SkillsForm: true,
    },
    mocks: {
      $t: (msg: string) => msg,
    },
  };

  it('renders correctly', () => {
    const wrapper = mount(SkillsAdd, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('contains the employee-add-page container', () => {
    const wrapper = mount(SkillsAdd, { global: globalConfig });
    expect(wrapper.find('.employee-add-page').exists()).toBe(true);
  });
});
