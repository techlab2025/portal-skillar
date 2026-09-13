import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import EmployeeIndex from '../EmployeeIndex.vue';
import { ref } from 'vue';
import EmployeeModel from '../../../core/models/employee.model';
import {
  DataSuccess,
  DataFailed,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import en from '@/locales/en.json';
import TitleInterface from '@/base/Data/Models/titleInterface';
import { EmployeeStatusEnm } from '../../../core/constant/employee.status.enum';
import { EmployeeTypeEnum } from '../../../core/constant/employee.type.enum';

const controller = vi.hoisted(() => ({
  fetchList: vi.fn(),
  fetchOne: vi.fn(),
  delete: vi.fn(),
  update: vi.fn(),
}));
const employees = ref([EmployeeModel.example]);
const subjectController = vi.hoisted(() => ({
  indexSubjects: vi.fn(),
}));
vi.mock('../../controllers/employee.controller', () => ({
  default: {
    getInstance: () => ({
      ...controller,
      listState: ref({ data: employees.value }),
      pagination: ref(null),
    }),
  },
}));
vi.mock('@/modules/Subjects/presentation/controllers/subject.controller', () => ({
  default: {
    getInstance: () => subjectController,
  },
}));

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en } });

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

const globalConfig = {
  plugins: [createPinia(), i18n],
  stubs: {
    'router-link': {
      name: 'RouterLink',
      props: ['to'],
      template: '<a><slot /></a>',
    },
    DataStatusBuilder: {
      props: ['controller'],
      template: '<slot name="success" :data="controller.data" />',
    },
    AppTable: {
      name: 'AppTable',
      props: ['items', 'headers'],
      template: `
        <div>
          <template v-if="items[0]">
            <span data-testid="employee-type-cell">
              <slot name="cell-employeeType" :item="items[0]" />
            </span>
            <span data-testid="created-at-cell">
              <slot name="cell-createdAt" :item="items[0]" />
            </span>
            <span data-testid="created-by-cell">
              <slot name="cell-createdBy" :item="items[0]" />
            </span>
          </template>
          <slot v-for="item in items" name="actions" :item="item" />
        </div>
      `,
    },
    Pagination: true,
    Dialog: {
      props: ['visible', 'header'],
      template: '<section v-if="visible" role="dialog"><slot name="container" /></section>',
    },
    FilterDialog: {
      name: 'FilterDialog',
      props: ['modelValue'],
      template: '<div><slot name="content" /><slot name="footer" /></div>',
    },
    UpdatedCustomInputSelect: {
      name: 'UpdatedCustomInputSelect',
      props: ['id', 'modelValue', 'staticOptions', 'controller', 'params'],
      emits: ['update:modelValue'],
      template: '<div :data-testid="id"></div>',
    },
    ReloadIcon: true,
  },
};

describe('EmployeeIndex.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
    employees.value = [EmployeeModel.example];
    controller.fetchOne.mockImplementation(
      async () => new DataSuccess({ data: employees.value[0] }),
    );
    controller.delete.mockResolvedValue(new DataSuccess({}));
    controller.update.mockResolvedValue(new DataSuccess({ data: EmployeeModel.example }));
    subjectController.indexSubjects.mockResolvedValue(
      new DataSuccess({ data: [{ id: 42, title: 'Arabic', children: [] }] }),
    );
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

  it('renders a view action that opens the employee details route', () => {
    const wrapper = mount(EmployeeIndex, { global: globalConfig });
    const viewAction = wrapper.getComponent('.action-btn.view');

    expect(viewAction.props('to')).toEqual({ name: 'Employee Details', params: { id: 1 } });
    expect(viewAction.attributes('aria-label')).toBe('View details for John Doe');
  });

  it('renders user type, creation date, and creator columns from the employee response', () => {
    employees.value = [
      EmployeeModel.fromJson({
        id: 43,
        employee_ref: 'EMP-043',
        first_name: 'Amira',
        last_name: 'Ahmed',
        email: 'amira@example.com',
        phone: '010102030',
        image: '',
        status: EmployeeStatusEnm.active,
        type: EmployeeTypeEnum.TEACHER,
        created_at: '2026-07-15T10:00:00Z',
        created_by: { name: 'Ahmed Admin' },
      }),
    ];
    const wrapper = mount(EmployeeIndex, { global: globalConfig });
    const table = wrapper.getComponent({ name: 'AppTable' });

    expect(table.props('headers').map(({ key }: { key: string }) => key)).toEqual([
      'firstname',
      'email',
      'phone',
      'employeeType',
      'status',
      'createdAt',
      'createdBy',
    ]);
    expect(wrapper.get('[data-testid="employee-type-cell"]').text()).toBe('Teacher');
    expect(wrapper.get('[data-testid="created-at-cell"]').text()).toBe('15/07/2026');
    expect(wrapper.get('[data-testid="created-by-cell"]').text()).toBe('Ahmed Admin');
  });

  it('shows unavailable values when the employee API omits the new fields', () => {
    employees.value = [
      EmployeeModel.fromJson({
        id: 43,
        first_name: 'Amira',
        last_name: 'Ahmed',
        email: 'amira@example.com',
        phone: '010102030',
        image: '',
        status: EmployeeStatusEnm.active,
      }),
    ];
    const wrapper = mount(EmployeeIndex, { global: globalConfig });

    expect(wrapper.get('[data-testid="employee-type-cell"]').text()).toBe('—');
    expect(wrapper.get('[data-testid="created-at-cell"]').text()).toBe('—');
    expect(wrapper.get('[data-testid="created-by-cell"]').text()).toBe('—');
  });

  it('renders user type, role, subject scope, and checkbox status filters', async () => {
    const wrapper = mount(EmployeeIndex, { global: globalConfig });
    await flushPromises();

    expect(wrapper.get('[data-testid="employee-filter-type"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="employee-filter-role"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="employee-filter-subject"]').exists()).toBe(true);
    expect(wrapper.findAll('.employee-filter__statuses input[type="checkbox"]')).toHaveLength(3);
    expect(wrapper.text()).toContain(en.employee_filter.inactive);
    expect(wrapper.text()).toContain(en.employee_filter.active);
    expect(wrapper.text()).toContain(en.employee_filter.draft);
  });

  it('applies all selected employee filters to the list request', async () => {
    const wrapper = mount(EmployeeIndex, { global: globalConfig });
    await flushPromises();
    controller.fetchList.mockClear();

    const selects = wrapper.findAllComponents({ name: 'UpdatedCustomInputSelect' });
    selects[0]?.vm.$emit(
      'update:modelValue',
      new TitleInterface({ id: EmployeeTypeEnum.TEACHER, title: 'Teacher' }),
    );
    selects[1]?.vm.$emit('update:modelValue', new TitleInterface({ id: 7, title: 'Reviewer' }));
    selects[2]?.vm.$emit('update:modelValue', new TitleInterface({ id: 42, title: 'Arabic' }));
    const statusInputs = wrapper.findAll('.employee-filter__statuses input[type="checkbox"]');
    await statusInputs[0]?.setValue(true);
    await statusInputs[2]?.setValue(true);
    await wrapper.get('.employee-filter__actions .btn-primary').trigger('click');
    await flushPromises();

    const request = controller.fetchList.mock.calls.at(-1)?.[0];
    expect(request.toMap()).toMatchObject({
      status: [EmployeeStatusEnm.disavtive, EmployeeStatusEnm.draft],
      type: EmployeeTypeEnum.TEACHER,
      role_id: 7,
      e_c_subject_id: 42,
      page: 1,
    });
  });
});

describe('employee deletion rules', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    employees.value = [EmployeeModel.example];
    controller.fetchOne.mockImplementation(
      async () => new DataSuccess({ data: employees.value[0] }),
    );
    controller.delete.mockResolvedValue(new DataSuccess({}));
    controller.update.mockResolvedValue(new DataSuccess({ data: EmployeeModel.example }));
    subjectController.indexSubjects.mockResolvedValue(
      new DataSuccess({ data: [{ id: 42, title: 'Arabic', children: [] }] }),
    );
  });

  const openDialog = async () => {
    const wrapper = mount(EmployeeIndex, { global: globalConfig });
    await wrapper.get('.action-btn.delete').trigger('click');
    return wrapper;
  };

  it('only offers deactivation for active employees and preserves their details', async () => {
    employees.value = [new EmployeeModel({ ...EmployeeModel.example, status: 1 })];
    const wrapper = await openDialog();
    const dialog = wrapper.get('[role="dialog"]');
    expect(dialog.text()).toContain(en.employee_delete.blocked_title);
    expect(dialog.text()).toContain(en.employee_delete.blocked_message);
    expect(dialog.findAll('button').map((button) => button.text())).toEqual([
      'Deactivate',
      'Cancel',
    ]);
    await dialog.get('[data-testid="confirm-employee-action"]').trigger('click');
    await flushPromises();
    expect(controller.delete).not.toHaveBeenCalled();
    expect(controller.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        employeeStatus: 2,
        firstname: EmployeeModel.example.firstname,
        roleId: EmployeeModel.example.roleId,
        educationClassificationSubjectIds: EmployeeModel.example.educationClassificationSubjectIds,
        password: '',
      }),
    );
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it('confirms deletion of an inactive employee with the designed copy', async () => {
    const wrapper = await openDialog();
    const dialog = wrapper.get('[role="dialog"]');
    expect(dialog.text()).toContain(en.employee_delete.confirm_title);
    expect(dialog.text()).toContain(en.employee_delete.confirm_message);
    expect(dialog.findAll('button').map((button) => button.text())).toEqual([
      'Yes, Delete It',
      'Cancel',
    ]);
    await dialog.get('[data-testid="confirm-employee-action"]').trigger('click');
    await flushPromises();
    expect(controller.delete).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    expect(controller.update).not.toHaveBeenCalled();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it('cancels without mutating the employee', async () => {
    const wrapper = await openDialog();
    await wrapper.get('[data-testid="cancel-employee-action"]').trigger('click');
    expect(controller.fetchOne).not.toHaveBeenCalled();
    expect(controller.delete).not.toHaveBeenCalled();
    expect(controller.update).not.toHaveBeenCalled();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it('blocks deletion if the employee became active after opening the dialog', async () => {
    const wrapper = await openDialog();
    controller.fetchOne.mockResolvedValue(
      new DataSuccess({ data: new EmployeeModel({ ...EmployeeModel.example, status: 1 }) }),
    );
    await wrapper.get('[data-testid="confirm-employee-action"]').trigger('click');
    await flushPromises();
    expect(controller.delete).not.toHaveBeenCalled();
    expect(controller.update).not.toHaveBeenCalled();
    expect(wrapper.get('[role="dialog"]').text()).toContain(en.employee_delete.blocked_title);
  });

  it('keeps the dialog open when deactivation fails', async () => {
    employees.value = [new EmployeeModel({ ...EmployeeModel.example, status: 1 })];
    controller.update.mockResolvedValue(new DataFailed({ error: new Error('Failed') }));
    const wrapper = await openDialog();
    await wrapper.get('[data-testid="confirm-employee-action"]').trigger('click');
    await flushPromises();
    expect(controller.delete).not.toHaveBeenCalled();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    expect(
      wrapper.get('[data-testid="confirm-employee-action"]').attributes('disabled'),
    ).toBeUndefined();
  });

  it('does not mutate when the current employee cannot be loaded', async () => {
    controller.fetchOne.mockResolvedValue(new DataFailed({ error: new Error('Failed') }));
    const wrapper = await openDialog();
    await wrapper.get('[data-testid="confirm-employee-action"]').trigger('click');
    await flushPromises();
    expect(controller.delete).not.toHaveBeenCalled();
    expect(controller.update).not.toHaveBeenCalled();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
  });
});
