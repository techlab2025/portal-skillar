import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TermsConditionsIndex from '../TermsConditionsIndex.vue';

vi.mock('../controllers/terms-conditions.controller', () => ({
  default: {
    getInstance: () => ({
      itemState: { value: { isLoading: true, data: null, error: null } },
      fetchOne: vi.fn(),
    }),
  },
}));

describe('TermsConditionsIndex', () => {
  const createWrapper = () =>
    mount(TermsConditionsIndex, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          DataStatusBuilder: {
            template: '<div class="data-status-builder"><slot name="loader" /></div>',
          },
          EmptyTermsIcon: true,
          EditIcon: true,
          TermSkellaton: true,
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
