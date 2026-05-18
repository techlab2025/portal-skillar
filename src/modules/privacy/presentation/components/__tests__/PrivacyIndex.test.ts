import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PrivacyIndex from '../PrivacyIndex.vue';

vi.mock('../controllers/privacy.controller', () => ({
  default: {
    getInstance: () => ({
      itemState: { value: { isLoading: true, data: null, error: null } },
      fetchOne: vi.fn(),
    }),
  },
}));

describe('PrivacyIndex', () => {
  const createWrapper = () =>
    mount(PrivacyIndex, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          DataStatusBuilder: {
            template: '<div class="data-status-builder"><slot name="loader" /></div>',
          },
          EmptyPrivacy: true,
          EditIcon: true,
          PrivacySkeleton: true,
          'router-link': true,
        },
      },
    });

  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('contains DataStatusBuilder', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.data-status-builder').exists()).toBe(true);
  });
});
