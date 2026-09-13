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
}));

vi.mock('../../controllers/employee.controller', () => ({
  default: {
    getInstance: () => ({
      itemState: mocks.employeeState,
      itemData: mocks.employeeItem,
      fetchOne: mocks.fetchEmployee,
    }),
  },
}));

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
      },
    },
  });

describe('EmployeeShow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });
});
