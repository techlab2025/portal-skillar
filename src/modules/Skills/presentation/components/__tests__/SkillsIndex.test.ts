import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SkillsIndex from '../SkillsIndex.vue';

vi.mock('../../controllers/skills.controller', () => ({
  default: {
    getInstance: () => ({
      listState: { value: { isLoading: true, data: null, error: null } },
      pagination: { value: null },
      fetchList: vi.fn(),
      delete: vi.fn(),
    }),
  },
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({
    formData: {},
  }),
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { country_code: 'eg' },
    query: {},
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('SkillsIndex', () => {
  const createWrapper = () =>
    mount(SkillsIndex, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          DataStatusBuilder: { template: '<div><slot name="loader" /></div>' },
          IndexSearchIcon: true,
          IndexPluseIcon: true,
          ExportExcelIcon: true,
          FilterDialog: true,
          AppTable: true,
          Pagination: true,
          TableSkelaton: true,
          'router-link': true,
        },
      },
    });

  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders search input', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.search-input').exists()).toBe(true);
  });

  it('contains export button', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.btn-secondary').exists()).toBe(true);
  });
});
