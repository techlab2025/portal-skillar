import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import faqsAdd from '../faqsAdd.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {}, params: { country_code: 'eg' }, fullPath: '/eg/faqs/add' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

vi.mock('../../controllers/faqs.controller', () => ({
  default: {
    getInstance: vi.fn(() => ({
      create: vi.fn().mockResolvedValue({ isSuccess: true }),
      errorMessage: { value: '' },
      itemState: { value: { data: null } },
    })),
  },
}));

vi.mock('../faqsForm.vue', () => ({
  default: {
    name: 'FaqsForm',
    template: '<div class="faq-form-card" />',
    props: ['loading', 'faq'],
    emits: ['update-data'],
  },
}));

describe('faqsAdd', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const wrapper = mount(faqsAdd, {
      global: {
        mocks: { $t: (k: string) => k },
        stubs: { Teleport: true, Transition: true },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the faqs title', () => {
    const wrapper = mount(faqsAdd, {
      global: {
        mocks: { $t: (k: string) => k },
        stubs: { Teleport: true, Transition: true },
      },
    });
    expect(wrapper.find('.faqs-title').text()).toBe('faqs');
  });

  it('renders the FaqsForm component', () => {
    const wrapper = mount(faqsAdd, {
      global: {
        mocks: { $t: (k: string) => k },
        stubs: { Teleport: true, Transition: true },
      },
    });
    expect(wrapper.find('.faq-form-card').exists()).toBe(true);
  });

  it('renders save and cancel buttons', () => {
    const wrapper = mount(faqsAdd, {
      global: {
        mocks: { $t: (k: string) => k },
        stubs: { Teleport: true, Transition: true },
      },
    });
    expect(wrapper.find('.btn-primary').exists()).toBe(true);
    expect(wrapper.find('.btn-cancel').exists()).toBe(true);
  });
});
