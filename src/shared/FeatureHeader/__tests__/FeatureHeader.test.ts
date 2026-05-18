import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FeatureHeader from '../FeatureHeader.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/some-path',
    matched: [],
  }),
  useRouter: () => ({
    push: vi.fn(),
    getRoutes: vi.fn(() => []),
  }),
}));

vi.mock('../LayoutComponents/SubComponents/RouteHelper', () => ({
  buildBreadcrumb: vi.fn().mockReturnValue([
    { labelKey: 'home', url: '/' },
    { labelKey: 'feature', url: '/feature' },
  ]),
}));

const globalConfig = {
  stubs: {
    Breadcrumb: true,
    'router-link': true,
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('FeatureHeader.vue', () => {
  it('renders without crashing', () => {
    const wrapper = mount(FeatureHeader, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the header image', () => {
    const wrapper = mount(FeatureHeader, { global: globalConfig });
    expect(wrapper.find('img.header-img').exists()).toBe(true);
  });

  it('displays the correct breadcrumb title based on items', () => {
    const wrapper = mount(FeatureHeader, { global: globalConfig });
    const title = wrapper.find('.title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toContain('home');
  });
});
