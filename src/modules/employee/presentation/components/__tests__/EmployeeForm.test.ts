import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import RoleModel from '@/modules/Role/core/models/role.model';
import RoleController from '@/modules/Role/presentation/controllers/role.controller';
import StageModel from '@/modules/Stages/core/models/stage.model';
import StageController from '@/modules/Stages/presentation/controllers/stage.controller';
import { EmployeeTypeEnum } from '../../../core/constant/employee.type.enum';
import EmployeeModel from '../../../core/models/employee.model';
import EmployeeForm from '../EmployeeForm.vue';

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });
const fetchStagesSpy = vi.spyOn(StageController.getInstance(), 'fetchList');
const fetchRolesSpy = vi.spyOn(RoleController.getInstance(), 'fetchList');
const fetchRoleSpy = vi.spyOn(RoleController.getInstance(), 'fetchOne');

const educationClassificationTree = [
  StageModel.fromJson({
    id: 128,
    title: 'Governmental',
    full_title: 'Governmental',
    branches: [
      {
        id: 360,
        title: 'Primary',
        subjects: [],
        children: [
          {
            id: 361,
            title: 'First',
            subjects: [
              {
                id: 284,
                e_c_subject_id: 284,
                title: 'Arabic',
                full_title: 'Primary -> First -> Arabic',
                children: [
                  {
                    id: 308,
                    e_c_subject_id: 308,
                    title: 'Reading',
                    full_title: 'Primary -> First -> Arabic -> Reading',
                    children: [],
                  },
                ],
              },
              {
                id: 285,
                e_c_subject_id: 285,
                title: 'Mathematics',
                full_title: 'Primary -> First -> Mathematics',
                children: [],
              },
            ],
            children: [],
          },
        ],
      },
    ],
    children: [],
  }),
];

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  onBeforeRouteUpdate: vi.fn(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), resolve: vi.fn() }),
  useRoute: () => ({ query: {}, params: {} }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    resolve: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

vi.mock('primevue/config', () => ({
  usePrimeVue: () => ({ config: { ripple: true } }),
}));

describe('EmployeeForm', () => {
  const mountForm = (employee?: EmployeeModel) =>
    mount(EmployeeForm, {
      props: { employee },
      global: {
        plugins: [i18n],
        stubs: {
          Teleport: true,
          Transition: true,
          TransitionGroup: true,
          'router-link': true,
          'router-view': true,
          InputSwitch: true,
          RadioButton: true,
          Select: true,
          MultiSelect: true,
          Dialog: true,
          HandleFilesUpload: true,
          UplaodImageInput: true,
        },
        mocks: {
          $t: (message: string) => message,
          $d: (date: unknown) => date,
          $n: (number: unknown) => number,
          $tc: (message: string) => message,
        },
        directives: { ripple: {}, tooltip: {} },
      },
    });

  const findSelect = (wrapper: ReturnType<typeof mountForm>, id: string) =>
    wrapper.findAllComponents(UpdatedCustomInputSelect).find((select) => select.props('id') === id);

  const selectTeacherScope = async (wrapper: ReturnType<typeof mountForm>) => {
    findSelect(wrapper, 'employee-type')?.vm.$emit('update:modelValue', {
      id: EmployeeTypeEnum.TEACHER,
      title: 'Teacher',
    });
    await wrapper.vm.$nextTick();

    findSelect(wrapper, 'employee-education-type')?.vm.$emit('update:modelValue', {
      id: 128,
      title: 'Governmental',
    });
    await wrapper.vm.$nextTick();

    findSelect(wrapper, 'employee-configured-education')?.vm.$emit('update:modelValue', [
      { id: 361, title: 'Primary → First' },
    ]);
    await wrapper.vm.$nextTick();
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
    fetchStagesSpy.mockResolvedValue(new DataSuccess({ data: educationClassificationTree }));
    fetchRolesSpy.mockResolvedValue(
      new DataSuccess({
        data: [
          new RoleModel({ id: 4, roleName: 'Teacher', permissions: [] }),
          new RoleModel({ id: 5, roleName: 'Reviewer', permissions: [] }),
        ],
      }),
    );
    fetchRoleSpy.mockImplementation(async (params) => {
      const roleId = Number(params.toMap().role_id);
      return new DataSuccess({
        data: new RoleModel({
          id: roleId,
          roleName: roleId === 4 ? 'Teacher' : 'Reviewer',
          permissions: roleId === 4 ? ['employee.fetch'] : ['question.fetch'],
        }),
      });
    });
  });

  it('renders all designed sections without an Employee ID input', async () => {
    const wrapper = mountForm();
    await flushPromises();

    expect(findSelect(wrapper, 'employee-type')?.exists()).toBe(true);
    expect(findSelect(wrapper, 'employee-education-type')?.exists()).toBe(true);
    expect(findSelect(wrapper, 'employee-configured-education')?.exists()).toBe(true);
    expect(findSelect(wrapper, 'employee-subjects')?.exists()).toBe(true);
    expect(findSelect(wrapper, 'employee-roles')?.props('type')).toBe(2);
    expect(wrapper.find('.effective-permissions').exists()).toBe(true);
    expect(wrapper.find('#employeeId').exists()).toBe(false);
  });

  it('loads education types, configured paths, and subjects in sequence for teachers', async () => {
    const wrapper = mountForm();
    await flushPromises();
    await selectTeacherScope(wrapper);

    expect(findSelect(wrapper, 'employee-education-type')?.props('staticOptions')).toMatchObject([
      { id: 128, title: 'Governmental' },
    ]);
    expect(
      findSelect(wrapper, 'employee-configured-education')?.props('staticOptions'),
    ).toMatchObject([{ id: 361, title: 'Primary → First' }]);
    expect(findSelect(wrapper, 'employee-subjects')?.props('staticOptions')).toMatchObject([
      { id: 308, title: 'Primary -> First -> Arabic -> Reading' },
      { id: 285, title: 'Primary -> First -> Mathematics' },
    ]);
  });

  it('emits selected subject and multiple role ids for the API payload', async () => {
    const wrapper = mountForm();
    await flushPromises();
    await selectTeacherScope(wrapper);

    findSelect(wrapper, 'employee-subjects')?.vm.$emit('update:modelValue', [
      { id: 308, title: 'Reading' },
    ]);
    findSelect(wrapper, 'employee-roles')?.vm.$emit('update:modelValue', [
      { id: 4, title: 'Teacher' },
      { id: 5, title: 'Reviewer' },
    ]);
    await flushPromises();

    const emittedParams = wrapper.emitted('updateData')?.at(-1)?.[0];
    expect(emittedParams?.toMap()).toMatchObject({
      type: EmployeeTypeEnum.TEACHER,
      role_id: 4,
      role_ids: [4, 5],
      e_c_subject_ids: [308],
    });
  });

  it('shows the effective permissions returned by the selected roles', async () => {
    const wrapper = mountForm();
    await flushPromises();

    findSelect(wrapper, 'employee-roles')?.vm.$emit('update:modelValue', [
      { id: 4, title: 'Teacher' },
      { id: 5, title: 'Reviewer' },
    ]);
    await flushPromises();

    expect(fetchRoleSpy).toHaveBeenCalledTimes(2);
    expect(wrapper.find('.effective-permissions__list').text()).toContain('employee.fetch');
    expect(wrapper.find('.effective-permissions__list').text()).toContain('question.fetch');
  });

  it('restores edit fields and derives the education path from assigned subjects', async () => {
    const employee = EmployeeModel.fromJson({
      id: 30,
      employee_ref: 'EMP-30',
      first_name: 'Mona',
      last_name: 'Ali',
      image: null,
      gender: 1,
      status: 2,
      type: EmployeeTypeEnum.TEACHER,
      roles: [
        { id: 4, display_name: 'Teacher' },
        { id: 5, display_name: 'Reviewer' },
      ],
      subjects: [
        { id: 308, e_c_subject_id: 308, full_title: 'Primary -> First -> Arabic -> Reading' },
      ],
      email: 'mona@example.com',
      phone: '0101546452312',
    });
    const wrapper = mountForm(employee);
    await flushPromises();

    expect(wrapper.get<HTMLInputElement>('#employee-first-name').element.value).toBe('Mona');
    expect(wrapper.get<HTMLInputElement>('#employee-last-name').element.value).toBe('Ali');
    expect(wrapper.get<HTMLInputElement>('#employee-email').element.value).toBe('mona@example.com');
    expect(wrapper.get<HTMLInputElement>('#employee-phone').element.value).toBe('0101546452312');
    expect(findSelect(wrapper, 'employee-education-type')?.props('modelValue')).toMatchObject({
      id: 128,
    });
    expect(findSelect(wrapper, 'employee-configured-education')?.props('modelValue')).toMatchObject(
      [{ id: 361 }],
    );
    expect(findSelect(wrapper, 'employee-subjects')?.props('modelValue')).toMatchObject([
      { id: 308 },
    ]);
    expect(findSelect(wrapper, 'employee-roles')?.props('modelValue')).toMatchObject([
      { id: 4 },
      { id: 5 },
    ]);
  });

  it('requires education scope for teachers and roles for every employee', async () => {
    const wrapper = mountForm();
    await flushPromises();
    const form = wrapper.vm as unknown as { validate: () => boolean };

    expect(form.validate()).toBe(false);
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.employee-field-error')).toHaveLength(1);

    findSelect(wrapper, 'employee-roles')?.vm.$emit('update:modelValue', [
      { id: 4, title: 'Teacher' },
    ]);
    findSelect(wrapper, 'employee-type')?.vm.$emit('update:modelValue', {
      id: EmployeeTypeEnum.TEACHER,
      title: 'Teacher',
    });
    await wrapper.vm.$nextTick();

    expect(form.validate()).toBe(false);
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.employee-field-error')).toHaveLength(3);

    await selectTeacherScope(wrapper);
    findSelect(wrapper, 'employee-subjects')?.vm.$emit('update:modelValue', [
      { id: 308, title: 'Reading' },
    ]);
    await wrapper.vm.$nextTick();
    expect(form.validate()).toBe(true);
  });

  it('marks a removed employee image and omits an unchanged image', async () => {
    const employee = EmployeeModel.fromJson({
      id: 30,
      employee_ref: 'EMP-30',
      first_name: 'Mona',
      last_name: 'Ali',
      image: 'https://cdn.example.test/employee.png',
      gender: 1,
      status: 1,
      type: EmployeeTypeEnum.ADMIN,
      roles: [{ id: 4, display_name: 'Teacher' }],
      subjects: [],
      email: 'mona@example.com',
      phone: '01000000000',
    });
    const wrapper = mountForm(employee);
    await flushPromises();

    const unchangedParams = wrapper.emitted('updateData')?.at(-1)?.[0] as { image: string };
    expect(unchangedParams.image).toBe('');

    wrapper.getComponent({ name: 'HandleFilesUpload' }).vm.$emit('change', []);
    await wrapper.vm.$nextTick();

    const removedParams = wrapper.emitted('updateData')?.at(-1)?.[0] as { image: string };
    expect(removedParams.image).toBe('*');
  });
});
