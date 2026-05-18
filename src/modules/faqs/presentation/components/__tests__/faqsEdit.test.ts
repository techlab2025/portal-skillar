import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import faqsEdit from '../faqsEdit.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: {},
    params: { country_code: 'eg', id: '1' },
    fullPath: '/eg/faqs/1/edit',
  }),
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
      update: vi.fn().mockResolvedValue({ isSuccess: true }),
      fetchOne: vi.fn().mockResolvedValue({ isSuccess: true }),
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

vi.mock('../../../core/params/faqs.details.params', () => ({
  default: class FaqsDetailsParams {
    id: number;
    constructor(data: { id: number }) {
      this.id = data.id;
    }
    toMap() {
      return { faq_id: this.id };
    }
  },
}));

describe('faqsEdit', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mountComponent = async () => {
    const wrapper = mount(faqsEdit, {
      global: {
        mocks: { $t: (k: string) => k },
        stubs: { Teleport: true, Transition: true },
      },
    });
    await flushPromises();
    return wrapper;
  };

  it('renders without crashing', async () => {
    const wrapper = await mountComponent();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the faqs title', async () => {
    const wrapper = await mountComponent();
    expect(wrapper.find('.faqs-title').text()).toBe('faqs');
  });

  it('renders the FaqsForm component after loading', async () => {
    const wrapper = await mountComponent();
    expect(wrapper.find('.faq-form-card').exists()).toBe(true);
  });

  it('renders save_change and cancel buttons after loading', async () => {
    const wrapper = await mountComponent();
    expect(wrapper.find('.btn-primary').exists()).toBe(true);
    expect(wrapper.find('.btn-cancel').exists()).toBe(true);
  });
});
