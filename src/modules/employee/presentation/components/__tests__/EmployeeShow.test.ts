<<<<<<< HEAD
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import RoleModel from '@/modules/Role/core/models/role.model';
import { EmployeeTypeEnum } from '../../../core/constant/employee.type.enum';
import EmployeeModel from '../../../core/models/employee.model';
import en from '@/locales/en.json';
import EmployeeShow from '../EmployeeShow.vue';

const mocks = vi.hoisted(() => ({
  employeeState: { value: null as unknown },
  employeeItem: { value: null as unknown },
  fetchEmployee: vi.fn(),
  fetchRole: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '30' } }),
=======
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
>>>>>>> fix/trello-bugs
}));

vi.mock('../../controllers/employee.controller', () => ({
  default: {
    getInstance: () => ({
<<<<<<< HEAD
      itemState: mocks.employeeState,
      itemData: mocks.employeeItem,
      fetchOne: mocks.fetchEmployee,
=======
      delete: deleteEmployee,
      fetchOne,
      itemData,
      itemState,
>>>>>>> fix/trello-bugs
    }),
  },
}));

<<<<<<< HEAD
vi.mock('@/modules/Role/presentation/controllers/role.controller', () => ({
  default: {
    getInstance: () => ({ fetchOne: mocks.fetchRole }),
  },
}));

const employee = new EmployeeModel({
  id: 30,
  firstname: 'Ahmed',
  lastname: 'Hawam',
  email: 'ahmed@example.com',
  phone: '01012345678',
  image: '',
  isSuperadmin: false,
  employeeId: 'EMP-101',
  status: 1,
  gender: 1,
  employeeType: EmployeeTypeEnum.TEACHER,
  roleId: 4,
  roleName: 'Teacher',
  subjects: [{ id: 308, title: 'Governmental -> Primary -> First -> Arabic' }],
  createdBy: 'System Admin',
  createdAt: '2026-09-01T10:00:00Z',
  updatedBy: 'Sara Ahmed',
  updatedAt: '2026-09-09T12:30:00Z',
  history: [
    {
      id: '1',
      action: 'Employee activated',
      actor: 'System Admin',
      createdAt: '2026-09-09T12:30:00Z',
    },
  ],
});

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en } });

const mountShow = () =>
  mount(EmployeeShow, {
    global: {
      plugins: [i18n],
      stubs: {
        DataStatusBuilder: {
          props: ['controller'],
          template: '<div><slot name="success" /></div>',
        },
        'router-link': {
          props: ['to'],
          template: '<a><slot /></a>',
        },
=======
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
>>>>>>> fix/trello-bugs
      },
    },
  });

describe('EmployeeShow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
<<<<<<< HEAD
    mocks.employeeState.value = new DataSuccess({ data: employee });
    mocks.employeeItem.value = employee;
    mocks.fetchEmployee.mockResolvedValue(new DataSuccess({ data: employee }));
    mocks.fetchRole.mockResolvedValue(
      new DataSuccess({
        data: new RoleModel({ id: 4, title: 'Teacher', permissions: ['ADM01'] }),
      }),
    );
  });

  it('loads the employee and permissions and renders every details section', async () => {
    const wrapper = mountShow();
    await flushPromises();

    expect(mocks.fetchEmployee).toHaveBeenCalledOnce();
    expect(mocks.fetchEmployee.mock.calls[0]?.[0].toMap()).toEqual({ employee_id: 30 });
    expect(mocks.fetchRole).toHaveBeenCalledOnce();
    expect(mocks.fetchRole.mock.calls[0]?.[0].toMap()).toEqual({ role_id: 4 });
    expect(wrapper.get('h1').text()).toBe('Ahmed Hawam');
    expect(wrapper.text()).toContain(en.employee_details.basic_information);
    expect(wrapper.text()).toContain(en.employee_details.assigned_roles);
    expect(wrapper.text()).toContain(en.employee_details.effective_permissions);
    expect(wrapper.text()).toContain(en.employee_details.teacher_scope);
    expect(wrapper.text()).toContain(en.employee_details.record_information);
    expect(wrapper.text()).toContain(en.employee_details.history_log);
    expect(wrapper.text()).toContain('Teacher');
    expect(wrapper.text()).toContain('Governmental');
    expect(wrapper.text()).toContain('Primary');
    expect(wrapper.text()).toContain('Arabic');
    expect(wrapper.text()).toContain('Sara Ahmed');
    expect(wrapper.text()).toContain('Employee activated');
    expect(wrapper.text()).toContain(en.permission.groups.admins);
    expect(wrapper.text()).toContain(en.permission.actions.fetch);
  });

  it('keeps employee details visible when permissions cannot be loaded', async () => {
    mocks.fetchRole.mockResolvedValue(new DataFailed({ error: new Error('Failed') }));
    const wrapper = mountShow();
    await flushPromises();

    expect(wrapper.get('h1').text()).toBe('Ahmed Hawam');
    expect(wrapper.text()).toContain(en.employee_details.permissions_unavailable);
=======
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
>>>>>>> fix/trello-bugs
  });
});
