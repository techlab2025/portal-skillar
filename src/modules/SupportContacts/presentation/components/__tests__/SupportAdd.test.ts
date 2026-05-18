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
    fullPath: '/eg/support/add',
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

vi.mock('../controllers/support.controller', () => ({
  default: {
    getInstance: () => ({
      create: vi.fn(),
      errorMessage: { value: '' },
    }),
  },
}));

import SupportAdd from '../SupportAdd.vue';

describe('SupportAdd.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const globalConfig = {
    plugins: [createPinia()],
    stubs: {
      SupportForm: true,
    },
    mocks: {
      $t: (msg: string) => msg,
    },
  };

  it('renders correctly', () => {
    const wrapper = mount(SupportAdd, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('contains the support-add-page container', () => {
    const wrapper = mount(SupportAdd, { global: globalConfig });
    expect(wrapper.find('.support-add-page').exists()).toBe(true);
  });
});
