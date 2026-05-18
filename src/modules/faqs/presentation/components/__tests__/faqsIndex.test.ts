import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import faqsIndex from '../faqsIndex.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {}, params: { country_code: 'eg' }, fullPath: '/eg/faqs' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

const mockFetchList = vi.fn().mockResolvedValue({ isSuccess: true });
vi.mock('../../controllers/faqs.controller', () => ({
  default: {
    getInstance: vi.fn(() => ({
      fetchList: mockFetchList,
      delete: vi.fn().mockResolvedValue({ isSuccess: true }),
      errorMessage: { value: '' },
      listState: { value: null },
    })),
  },
}));

vi.mock('@/shared/icons/faqs/EmptyFaqs.vue', () => ({
  default: { name: 'EmptyFaqs', template: '<div class="empty-faqs" />' },
}));

vi.mock('@/shared/icons/EditpinIcon.vue', () => ({
  default: { name: 'EditpinIcon', template: '<span />' },
}));

vi.mock('@/shared/icons/IconAdd.vue', () => ({
  default: { name: 'IconAdd', template: '<span class="icon-add" />' },
}));

vi.mock('@/shared/icons/IconMins.vue', () => ({
  default: { name: 'IconMins', template: '<span class="icon-mins" />' },
}));

vi.mock('@/shared/DataStatues/DataStatusBuilder.vue', () => ({
  default: {
    name: 'DataStatusBuilder',
    template:
      '<div class="data-status-builder"><slot name="success" /><slot name="empty" /><slot name="loader" /><slot name="default" /></div>',
    props: ['controller'],
  },
}));

vi.mock('../subComponent/FaqsSkellaton.vue', () => ({
  default: { name: 'FaqsSkellaton', template: '<div class="faqs-skellaton" />' },
}));

const globalConfig = {
  mocks: { $t: (k: string) => k },
  stubs: { 'router-link': true, Teleport: true, Transition: true, TransitionGroup: true },
};

describe('faqsIndex', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockFetchList.mockResolvedValue({ isSuccess: true });
  });

  it('renders without crashing', async () => {
    const wrapper = mount(faqsIndex, { global: globalConfig });
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('calls fetchList on mount', async () => {
    mount(faqsIndex, { global: globalConfig });
    await flushPromises();
    expect(mockFetchList).toHaveBeenCalled();
  });

  it('renders the faqs-page container', async () => {
    const wrapper = mount(faqsIndex, { global: globalConfig });
    await flushPromises();
    expect(wrapper.find('.faqs-page').exists()).toBe(true);
  });
});
