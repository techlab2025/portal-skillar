import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { ref } from 'vue';
import questionsIndex from '../questionsIndex.vue';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { country_code: 'eg' },
    query: { page: '1', word: '' },
    fullPath: '/eg/questions',
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

vi.mock('../controllers/questions.controller', () => ({
  default: {
    getInstance: vi.fn(() => ({
      fetchList: mockFetchList,
      listState: mockListState,
      pagination: ref(null),
      delete: vi.fn().mockResolvedValue(undefined),
    })),
  },
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({
    getFormData: vi.fn(() => null),
    setFormData: vi.fn(),
    showReturnWarning: vi.fn(),
    clearFormData: vi.fn(),
    formData: {},
  }),
}));

vi.mock('@/shared/DataStatues/DataStatusBuilder.vue', () => ({
  default: {
    name: 'DataStatusBuilder',
    props: ['controller', 'onRetry'],
    template:
      '<div class="data-status-builder"><slot name="success" :data="[]" /><slot name="empty" /><slot name="loader" /><slot name="default" /></div>',
  },
}));

vi.mock('@/shared/HelpersComponents/AppTable.vue', () => ({
  default: {
    name: 'AppTable',
    template: '<div />',
    props: ['headers', 'items', 'hoverable', 'striped', 'showIndex'],
  },
}));
vi.mock('@/shared/HelpersComponents/Pagination.vue', () => ({
  default: { name: 'Pagination', template: '<div />', props: ['pagination'] },
}));
vi.mock('@/shared/HelpersComponents/dialog/DeleteDialog.vue', () => ({
  default: { name: 'DeleteDialog', template: '<div />', props: [], emits: ['delete'] },
}));
vi.mock('@/shared/HelpersComponents/FilterDialog/FilterDialog.vue', () => ({
  default: {
    name: 'FilterDialog',
    template: '<div />',
    props: ['modelValue'],
    emits: ['update:modelValue'],
  },
}));
vi.mock('@/shared/HelpersComponents/TableSkelaton.vue', () => ({
  default: {
    name: 'TableSkelaton',
    template: '<div />',
    props: ['rows', 'columns', 'hasActions', 'showIndex', 'selectable'],
  },
}));
vi.mock('@/shared/icons/IndexPluseIcon.vue', () => ({
  default: { name: 'IndexPluseIcon', template: '<span />' },
}));
vi.mock('@/shared/icons/ExportExcelIcon.vue', () => ({
  default: { name: 'ExportExcelIcon', template: '<span />' },
}));
vi.mock('@/shared/icons/IndexSearchIcon.vue', () => ({
  default: { name: 'IndexSearchIcon', template: '<span />' },
}));
vi.mock('@/base/Presentation/Utils/debouced', () => ({
  debounce: (fn: any) => fn,
}));

const globalConfig = {
  plugins: [createPinia(), i18n],
  stubs: {
    'router-link': true,
  },
  mocks: {
    $t: (msg: string) => msg,
    $i18n: { locale: 'en' },
  },
};

describe('questionsIndex.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockListState.value = new DataSuccess([]);
  });

  it('renders correctly', () => {
    const wrapper = mount(questionsIndex, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('contains the search input', () => {
    const wrapper = mount(questionsIndex, { global: globalConfig });
    const searchInput = wrapper.find('.search-input');
    expect(searchInput.exists()).toBe(true);
  });

  it('contains the "Add Employee" button', () => {
    const wrapper = mount(questionsIndex, { global: globalConfig });
    const addButton = wrapper.find('.btn-add');
    expect(addButton.exists()).toBe(true);
  });
});
