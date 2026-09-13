import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type AddEmployeeParams from '../../../core/params/add.employee.params';
import EmployeeAdd from '../EmployeeAdd.vue';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  fetchList: vi.fn(),
  push: vi.fn(),
}));

vi.mock('@/router', () => ({
  default: { push: vi.fn(), replace: vi.fn() },
}));

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  useRoute: () => ({ fullPath: '/employees/add', params: {} }),
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('../../controllers/employee.controller', () => ({
  default: {
    getInstance: () => ({
      create: mocks.create,
      fetchList: mocks.fetchList,
      errorMessage: { value: '' },
    }),
  },
}));

const feedbackDialogStub = {
  name: 'EmployeeFeedbackDialog',
  props: ['modelValue', 'variant'],
  emits: ['update:modelValue', 'acknowledge'],
  template: '<div class="feedback-dialog-stub" :data-variant="variant" />',
};

const cancelDialogStub = {
  name: 'EmployeeCancelDialog',
  props: ['modelValue'],
  emits: ['update:modelValue', 'confirm', 'keepEditing'],
  template: `
    <div v-if="modelValue" class="employee-cancel-dialog-stub">
      <button class="confirm-cancel" @click="$emit('confirm')">Confirm</button>
      <button class="keep-editing" @click="$emit('keepEditing')">Keep Editing</button>
    </div>
  `,
};

const mountAdd = () =>
  mount(EmployeeAdd, {
    global: {
      plugins: [createPinia()],
      mocks: { $t: (key: string) => key },
      stubs: {
        EmployeeForm: true,
        EmployeeFeedbackDialog: feedbackDialogStub,
        EmployeeCancelDialog: cancelDialogStub,
        'router-link': {
          template: '<a><slot /></a>',
        },
      },
    },
  });

const employeeParams = { firstname: 'Mona' } as AddEmployeeParams;

describe('EmployeeAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setActivePinia(createPinia());
    mocks.create.mockResolvedValue(new DataSuccess({ data: null }));
    mocks.fetchList.mockResolvedValue(new DataSuccess({ data: [] }));
  });

  it('renders save, save as draft, and cancel actions', () => {
    const wrapper = mountAdd();

    expect(wrapper.get('.actions .btn-primary').text()).toBe('save_employee');
    expect(wrapper.get('.btn-draft').text()).toBe('save_as_draft');
    expect(wrapper.get('.btn-cancel').text()).toBe('cancel');
  });

  it('shows the success dialog before returning to the employee list', async () => {
    const wrapper = mountAdd();
    wrapper.getComponent({ name: 'EmployeeForm' }).vm.$emit('updateData', employeeParams);
    await wrapper.get('.actions .btn-primary').trigger('click');
    await flushPromises();

    const successDialog = wrapper
      .findAllComponents({ name: 'EmployeeFeedbackDialog' })
      .find((dialog) => dialog.props('variant') === 'success');
    expect(mocks.create).toHaveBeenCalledWith(employeeParams, undefined, '/employees/add');
    expect(successDialog?.props('modelValue')).toBe(true);
    expect(mocks.push).not.toHaveBeenCalled();

    successDialog?.vm.$emit('acknowledge');
    await flushPromises();
    expect(mocks.fetchList).toHaveBeenCalledOnce();
    expect(mocks.push).toHaveBeenCalledWith({ name: 'Employees' });
  });

  it('does not show success feedback when employee creation fails', async () => {
    mocks.create.mockResolvedValue(new DataFailed({ error: new Error('Failed') }));
    const wrapper = mountAdd();
    wrapper.getComponent({ name: 'EmployeeForm' }).vm.$emit('updateData', employeeParams);

    await wrapper.get('.actions .btn-primary').trigger('click');
    await flushPromises();

    const successDialog = wrapper
      .findAllComponents({ name: 'EmployeeFeedbackDialog' })
      .find((dialog) => dialog.props('variant') === 'success');
    expect(successDialog?.props('modelValue')).toBe(false);
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('stores the draft and shows feedback before returning to the list', async () => {
    const wrapper = mountAdd();
    wrapper.getComponent({ name: 'EmployeeForm' }).vm.$emit('updateData', employeeParams);
    await wrapper.get('.btn-draft').trigger('click');

    const draftDialog = wrapper
      .findAllComponents({ name: 'EmployeeFeedbackDialog' })
      .find((dialog) => dialog.props('variant') === 'draft');
    expect(JSON.parse(localStorage.getItem('employee-draft') ?? '{}')).toEqual(employeeParams);
    expect(draftDialog?.props('modelValue')).toBe(true);
    expect(mocks.push).not.toHaveBeenCalled();

    draftDialog?.vm.$emit('acknowledge');
    await flushPromises();
    expect(mocks.push).toHaveBeenCalledWith({ name: 'Employees' });
  });

  it('asks for confirmation before canceling and keeps the form when requested', async () => {
    const wrapper = mountAdd();

    await wrapper.get('.btn-cancel').trigger('click');
    expect(wrapper.find('.employee-cancel-dialog-stub').exists()).toBe(true);
    expect(mocks.push).not.toHaveBeenCalled();

    await wrapper.get('.keep-editing').trigger('click');
    expect(wrapper.find('.employee-cancel-dialog-stub').exists()).toBe(false);
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('deletes the add progress and returns to employees after confirming cancel', async () => {
    localStorage.setItem('employee-draft', JSON.stringify(employeeParams));
    const wrapper = mountAdd();

    await wrapper.get('.btn-cancel').trigger('click');
    await wrapper.get('.confirm-cancel').trigger('click');
    await flushPromises();

    expect(localStorage.getItem('employee-draft')).toBeNull();
    expect(mocks.push).toHaveBeenCalledWith({ name: 'Employees' });
  });
});
