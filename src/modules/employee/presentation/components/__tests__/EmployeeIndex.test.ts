/* eslint-disable vue/one-component-per-file */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { defineComponent, h } from 'vue';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import EmployeeModel from '../../../core/models/employee.model';
import EmployeeIndex from '../EmployeeIndex.vue';

const { deleteEmployee, fetchList, listState, pagination } = vi.hoisted(() => ({
  deleteEmployee: vi.fn(),
  fetchList: vi.fn(),
  listState: { value: null as unknown },
  pagination: { value: null },
}));

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });

// Mock dependencies
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { country_code: 'eg' },
    query: { page: '1', word: '' },
    fullPath: '/eg/employees',
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

vi.mock('../../controllers/employee.controller', () => ({
  default: {
    getInstance: () => ({
      delete: deleteEmployee,
      fetchList,
      listState,
      pagination,
    }),
  },
}));

const employee = EmployeeModel.fromJson({
  id: 7,
  first_name: 'Ahmed',
  last_name: 'Hawam',
  email: 'ahmed@example.com',
  phone: '01000000000',
  image: '',
  status: 1,
});

const DataStatusBuilderStub = defineComponent({
  name: 'DataStatusBuilder',
  props: { controller: { type: Object, required: true } },
  setup(props, { slots }) {
    return () => h('div', slots.success?.({ data: props.controller.data }));
  },
});

const AppTableStub = defineComponent({
  name: 'AppTable',
  props: { items: { type: Array, default: () => [] } },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        props.items.flatMap((item) => slots.actions?.({ item }) ?? []),
      );
  },
});

const DropListStub = defineComponent({
  name: 'DropList',
  props: { actionList: { type: Array, default: () => [] } },
  template: '<div class="drop-list-stub" />',
});

const globalConfig = {
  plugins: [createPinia(), i18n],
  stubs: {
    'router-link': true,
    DataStatusBuilder: DataStatusBuilderStub,
    AppTable: AppTableStub,
    Pagination: true,
    DropList: DropListStub,
  },
  mocks: {
    $t: (msg: string) => msg,
  },
};

describe('EmployeeIndex.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    listState.value = new DataSuccess({ data: [employee] });
    fetchList.mockResolvedValue(listState.value);
    deleteEmployee.mockResolvedValue(new DataSuccess({ data: employee }));
  });

  it('renders correctly', () => {
    const wrapper = mount(EmployeeIndex, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('contains the search input', () => {
    const wrapper = mount(EmployeeIndex, { global: globalConfig });
    const searchInput = wrapper.find('.search-input');
    expect(searchInput.exists()).toBe(true);
  });

  it('contains the "Add Employee" button', () => {
    const wrapper = mount(EmployeeIndex, { global: globalConfig });
    const addButton = wrapper.find('.btn-add');
    expect(addButton.exists()).toBe(true);
  });

  it('provides view, edit and delete actions for every employee', async () => {
    const wrapper = mount(EmployeeIndex, { global: globalConfig });
    const actions = wrapper.getComponent({ name: 'DropList' }).props('actionList');

    expect(actions.map(({ text }: { text: string }) => text)).toEqual(['view', 'edit', 'delete']);
    expect(actions[0].link).toBe('/employees/7');
    expect(actions[1].link).toBe('/employees/edit/7');

    await actions[2].action();
    expect(deleteEmployee.mock.calls[0]?.[0].toMap()).toEqual({ employee_id: 7 });
  });
});
