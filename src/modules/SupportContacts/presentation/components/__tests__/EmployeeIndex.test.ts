import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import SupportIndex from '../SupportIndex.vue';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { country_code: 'eg' },
    query: { page: '1', word: '' },
    fullPath: '/eg/support',
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  createRouter: vi.fn(() => ({
    getRoutes: vi.fn(() => []),
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

const mockFetchList = vi.fn().mockResolvedValue(undefined);
const mockListState = ref(new DataSuccess([]));

vi.mock('@/modules/SupportContacts/presentation/controllers/support.controller', () => ({
  default: {
    getInstance: vi.fn(() => ({
      fetchList: mockFetchList,
      listState: mockListState,
      pagination: ref(null),
    })),
  },
}));

vi.mock('@/shared/icons/Support/SupportEmptyDataIcon.vue', () => ({
  default: { name: 'SupportEmptyDataIcon', template: '<div />' },
}));
vi.mock('@/shared/icons/EditpinIcon.vue', () => ({
  default: { name: 'EditpinIcon', template: '<span />' },
}));
vi.mock('@/shared/icons/Support/PhoneIcon.vue', () => ({
  default: { name: 'PhoneIcon', template: '<span />' },
}));
vi.mock('@/shared/icons/Support/WhatsIcon.vue', () => ({
  default: { name: 'WhatsIcon', template: '<span />' },
}));
vi.mock('@/shared/icons/Support/EmailIcon.vue', () => ({
  default: { name: 'EmailIcon', template: '<span />' },
}));
vi.mock('@/shared/DataStatues/DataStatusBuilder.vue', () => ({
  default: {
    name: 'DataStatusBuilder',
    props: ['controller', 'onRetry'],
    template:
      '<div class="data-status-builder"><slot name="success" /><slot name="empty" /><slot name="loader" /><slot name="default" /></div>',
  },
}));
vi.mock('../SupportSeklaton.vue', () => ({
  default: { name: 'SupportSeklaton', template: '<div />' },
}));

const globalConfig = {
  plugins: [createPinia()],
  stubs: {
    'router-link': true,
  },
  mocks: {
    $t: (msg: string) => msg,
    $i18n: { locale: 'en' },
  },
};

describe('SupportIndex.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockListState.value = new DataSuccess([]);
  });

  it('renders correctly', async () => {
    const wrapper = mount(SupportIndex, { global: globalConfig });
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the support-contact-page container when data exists', async () => {
    mockListState.value = new DataSuccess([{ id: 1, titles: 'Test', supportContacts: [] }]);
    const wrapper = mount(SupportIndex, { global: globalConfig });
    await flushPromises();
    expect(wrapper.find('.support-contact-page').exists()).toBe(true);
  });

  it('renders the header container when data exists', async () => {
    mockListState.value = new DataSuccess([{ id: 1, titles: 'Test', supportContacts: [] }]);
    const wrapper = mount(SupportIndex, { global: globalConfig });
    await flushPromises();
    expect(wrapper.find('.header-container').exists()).toBe(true);
  });
});
