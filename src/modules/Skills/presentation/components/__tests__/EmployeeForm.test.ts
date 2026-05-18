import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import SkillsForm from '../SkillsForm.vue';

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });

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

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({
    getFormData: vi.fn(() => null),
    setFormData: vi.fn(),
    showReturnWarning: vi.fn(),
    clearFormData: vi.fn(),
    formData: {},
  }),
}));

vi.mock('@/shared/MultiLangInput.vue', () => ({
  default: {
    name: 'MultiLangInput',
    template: '<div class="multi-lang-input" />',
    props: ['fieldKey', 'label', 'languages', 'modelValue', 'type'],
    emits: ['update:modelValue'],
  },
}));

describe('SkillsForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const wrapper = mount(SkillsForm, {
      global: {
        plugins: [i18n],
        stubs: {
          Teleport: true,
          Transition: true,
        },
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the form card container', () => {
    const wrapper = mount(SkillsForm, {
      global: {
        plugins: [i18n],
        stubs: { Teleport: true, Transition: true },
        mocks: { $t: (msg: string) => msg },
      },
    });
    expect(wrapper.find('.employee-details-form-card').exists()).toBe(true);
  });

  it('renders the MultiLangInput for title', () => {
    const wrapper = mount(SkillsForm, {
      global: {
        plugins: [i18n],
        stubs: { Teleport: true, Transition: true },
        mocks: { $t: (msg: string) => msg },
      },
    });
    expect(wrapper.find('.multi-lang-input').exists()).toBe(true);
  });
});
