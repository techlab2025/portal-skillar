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

import SkillsForm from '../SkillsForm.vue';

describe('SkillsForm.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const globalConfig = {
    plugins: [createPinia()],
    stubs: {
      MultiLangInput: true,
    },
    mocks: {
      $t: (msg: string) => msg,
    },
  };

  it('renders correctly', () => {
    const wrapper = mount(SkillsForm, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders without skill prop', () => {
    const wrapper = mount(SkillsForm, {
      props: { formKey: 'test-key' },
      global: globalConfig,
    });
    expect(wrapper.exists()).toBe(true);
  });
});
