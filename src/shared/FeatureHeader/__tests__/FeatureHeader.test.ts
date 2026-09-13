import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import ar from '@/locales/ar.json';
import en from '@/locales/en.json';
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

vi.mock('../../LayoutComponents/SubComponents/RouteHelper', () => ({
  buildBreadcrumb: vi.fn().mockReturnValue([
    { label: 'Home', url: '/' },
    { label: 'notification_plan.title', url: '/notification-plans' },
    { label: 'notification_plan.view_title', url: '/notification-plans/7' },
  ]),
}));

const mountHeader = (locale: 'ar' | 'en' = 'en') =>
  mount(FeatureHeader, {
    global: {
      plugins: [
        createI18n({
          legacy: false,
          locale,
          fallbackLocale: 'en',
          messages: { ar, en },
        }),
      ],
      stubs: { Breadcrumb: true },
    },
  });

describe('FeatureHeader.vue', () => {
  it('renders without crashing', () => {
    const wrapper = mountHeader();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the header image as decorative content', () => {
    const wrapper = mountHeader();
    expect(wrapper.get('img.header-img').attributes()).toMatchObject({
      alt: '',
      'aria-hidden': 'true',
    });
  });

  it('uses an isolated content class that cannot inherit the page layout height', () => {
    const wrapper = mountHeader();

    expect(wrapper.find('.feature-header__content').exists()).toBe(true);
    expect(wrapper.find('.feature-header-container > .content').exists()).toBe(false);
  });

  it.each([
    ['en', 'Notification Plan Details'],
    ['ar', 'تفاصيل خطة الإشعارات'],
  ] as const)('translates the breadcrumb title in %s', (locale, expectedTitle) => {
    const wrapper = mountHeader(locale);
    expect(wrapper.get('.title').text()).toBe(expectedTitle);
  });
});
