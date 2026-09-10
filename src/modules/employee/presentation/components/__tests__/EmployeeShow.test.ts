/* eslint-disable vue/one-component-per-file */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import EmployeeModel from '../../../core/models/employee.model';
import EmployeeShow from '../EmployeeShow.vue';

const { deleteEmployee, fetchOne, itemData, itemState, replace, translate } = vi.hoisted(() => ({
  deleteEmployee: vi.fn(),
  fetchOne: vi.fn(),
  itemData: { value: null as unknown },
  itemState: { value: null as unknown },
  replace: vi.fn(),
  translate: (key: string, params?: { name?: string }) => {
    const translations: Record<string, string> = {
      employee_type_admin: 'Admin',
      'employee_show.by_actor': `By ${params?.name}`,
      'permission.groups.document_index': 'Document Index',
      'permission.actions.fetch': 'Table',
      'permission.actions.update': 'Update',
      'permission.actions.start': 'Start',
      'permission.actions.status': 'Status',
      'permission.actions.refresh_status': 'Refresh Status',
      'permission.actions.save': 'Save',
      'permission.actions.fetch_transactions': 'Transactions',
    };

    return translations[key] ?? key;
  },
}));

vi.mock('../../controllers/employee.controller', () => ({
  default: {
    getInstance: () => ({
      delete: deleteEmployee,
      fetchOne,
      itemData,
      itemState,
    }),
  },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '61' } }),
  useRouter: () => ({ replace }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: { value: 'en' },
    t: translate,
  }),
}));

const employee = EmployeeModel.fromJson({
  id: 61,
  employee_ref: '+1 (586) 959-5549',
  name: '',
  first_name: 'Naomi',
  last_name: 'Shelley',
  image: null,
  gender: 1,
  status: 1,
  role: { id: 16, display_name: 'aaaaaaaaaa' },
  permissions: ['DI01', 'DI04', 'DI06', 'DI07', 'DI08', 'DI09', 'DI10'],
  type: 1,
  subjects: [],
  email: 'tejolyp@mailinator.com',
  phone: '01141519222',
  token: '',
  created_at: '2026-09-10 12:09:07',
});

const DataStatusBuilderStub = defineComponent({
  name: 'DataStatusBuilder',
  setup(_, { slots }) {
    return () => h('div', slots.success?.());
  },
});

const DropListStub = defineComponent({
  name: 'DropList',
  props: {
    actionList: { type: Array, default: () => [] },
    deleteDialogTitle: { type: String, default: '' },
    deleteDialogMessage: { type: String, default: '' },
  },
  template: '<div class="drop-list-stub" />',
});

const mountEmployeeShow = () =>
  mount(EmployeeShow, {
    global: {
      mocks: { $t: translate },
      stubs: {
        DataStatusBuilder: DataStatusBuilderStub,
        DropList: DropListStub,
      },
    },
  });

describe('EmployeeShow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    itemData.value = employee;
    itemState.value = new DataSuccess({ data: employee });
    fetchOne.mockResolvedValue(itemState.value);
    deleteEmployee.mockResolvedValue(new DataSuccess({ data: employee }));
  });

  it('loads show_employee and renders the employee details', async () => {
    const wrapper = mountEmployeeShow();
    await flushPromises();

    expect(fetchOne).toHaveBeenCalledOnce();
    expect(fetchOne.mock.calls[0]?.[0].toMap()).toEqual({ employee_id: 61 });
    expect(wrapper.get('h1').text()).toBe('Naomi Shelley');
    expect(wrapper.text()).toContain('+1 (586) 959-5549');
    expect(wrapper.text()).toContain('Admin');
    expect(wrapper.text()).toContain('aaaaaaaaaa');
    expect(wrapper.text()).toContain('Table Document Index');
    expect(wrapper.text()).toContain('Transactions Document Index');
    expect(wrapper.text()).toContain('tejolyp@mailinator.com');
    expect(wrapper.text()).toContain('01141519222');
    expect(wrapper.text()).toContain('employee_show.created_at');
    expect(wrapper.text()).toContain('2026');
    expect(wrapper.text()).toContain('employee_show.no_history');
    expect(wrapper.text()).not.toContain('employee_show.teacher_scope');
    expect(wrapper.findAll('.employee-show-card__record > div')).toHaveLength(1);

    const dropList = wrapper.getComponent({ name: 'DropList' });
    const actions = dropList.props('actionList');
    expect(actions.map(({ text }: { text: string }) => text)).toEqual(['edit', 'delete']);
    expect(actions[0].link).toBe('/employees/edit/61');
    expect(dropList.props('deleteDialogTitle')).toBe('employee_show.delete_title');
  });

  it('deletes the shown employee and returns to the employee list', async () => {
    const wrapper = mountEmployeeShow();
    const actions = wrapper.getComponent({ name: 'DropList' }).props('actionList');

    await actions[1].action();

    expect(deleteEmployee).toHaveBeenCalledOnce();
    expect(deleteEmployee.mock.calls[0]?.[0].toMap()).toEqual({ employee_id: 61 });
    expect(replace).toHaveBeenCalledWith({ name: 'Employees' });
  });
});
