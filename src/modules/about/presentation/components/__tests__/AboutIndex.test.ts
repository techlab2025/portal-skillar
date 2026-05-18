import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import AboutIndex from '../AboutIndex.vue';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {}, params: { country_code: 'eg' }, fullPath: '/eg/about' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

const mockFetchList = vi.fn().mockResolvedValue(undefined);
const mockListState = ref(new DataSuccess([]));

vi.mock('@/modules/about/presentation/controllers/about.controller', () => ({
  default: {
    getInstance: vi.fn(() => ({
      fetchList: mockFetchList,
      listState: mockListState,
      pagination: ref(null),
    })),
  },
}));

vi.mock('@/shared/icons/EditpinIcon.vue', () => ({
  default: { name: 'EditpinIcon', template: '<span />' },
}));
vi.mock('@/shared/icons/SocialIcons/LinksIcon.vue', () => ({
  default: { name: 'LinksIcon', template: '<span />' },
}));
vi.mock('@/shared/icons/About/EmptyData.vue', () => ({
  default: { name: 'EmptyData', template: '<div />' },
}));
vi.mock('@/shared/DataStatues/DataStatusBuilder.vue', () => ({
  default: {
    name: 'DataStatusBuilder',
    props: ['controller', 'onRetry'],
    template:
      '<div class="data-status-builder"><slot name="success" /><slot name="empty" /><slot name="loader" /><slot name="default" /></div>',
  },
}));
vi.mock('../AbourSkelaton.vue', () => ({
  default: { name: 'AbourSkelaton', template: '<div />' },
}));

const globalConfig = {
  mocks: { $t: (k: string) => k, $i18n: { locale: 'en' } },
  stubs: { 'router-link': true, Teleport: true },
};

describe('AboutIndex', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockListState.value = new DataSuccess([]);
  });

  it('renders without errors', async () => {
    const wrapper = mount(AboutIndex, { global: globalConfig });
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the about-page container', async () => {
    mockListState.value = new DataSuccess([
      {
        id: 1,
        translations: { title: { en: 'T' }, description: { en: 'D' } },
        images: '',
        socialMedia: [],
      },
    ]);
    const wrapper = mount(AboutIndex, { global: globalConfig });
    await flushPromises();
    expect(wrapper.find('.about-page').exists()).toBe(true);
  });

  it('calls fetchList on mount', async () => {
    mount(AboutIndex, { global: globalConfig });
    await flushPromises();
    expect(mockFetchList).toHaveBeenCalled();
  });
});
