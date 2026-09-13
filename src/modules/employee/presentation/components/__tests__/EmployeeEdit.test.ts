import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock('vue-router', () => ({
  createRouter: vi.fn(() => ({
    beforeEach: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  })),
  createWebHistory: vi.fn(),
  useRoute: vi.fn(() => ({
    fullPath: '/employees/1/edit',
    params: { id: '1' },
  })),
  useRouter: vi.fn(() => ({ push: mocks.push })),
}));

vi.mock('../../controllers/employee.controller', () => ({
  default: {
    getInstance: () => ({
      fetchOne: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      itemData: { value: null },
      errorMessage: { value: '' },
    }),
  },
}));

import EmployeeEdit from '../EmployeeEdit.vue';

const globalConfig = {
  plugins: [createPinia()],
  mocks: { $t: (key: string) => key },
  stubs: {
    EmployeeForm: true,
    EmployeeCancelDialog: {
      name: 'EmployeeCancelDialog',
      props: ['modelValue'],
      emits: ['update:modelValue', 'confirm', 'keepEditing'],
      template: `
        <div v-if="modelValue" class="employee-cancel-dialog-stub">
          <button class="confirm-cancel" @click="$emit('confirm')">Confirm</button>
          <button class="keep-editing" @click="$emit('keepEditing')">Keep Editing</button>
        </div>
      `,
    },
    IconAccept: true,
    AppButton: true,
  },
};

describe('EmployeeEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  it('renders without errors', () => {
    const wrapper = mount(EmployeeEdit, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the update employee button', () => {
    const wrapper = mount(EmployeeEdit, { global: globalConfig });
    const saveBtn = wrapper.find('button.btn-primary');
    expect(saveBtn.exists()).toBe(true);
    expect(saveBtn.text()).toContain('update_employee');
  });

  it('renders the employee edit page wrapper', () => {
    const wrapper = mount(EmployeeEdit, { global: globalConfig });
    expect(wrapper.find('.employee-edit-page').exists()).toBe(true);
  });

  it('asks before canceling an edit and stays when keep editing is selected', async () => {
    const wrapper = mount(EmployeeEdit, { global: globalConfig });

    await wrapper.get('.btn-cancel').trigger('click');
    expect(wrapper.find('.employee-cancel-dialog-stub').exists()).toBe(true);
    expect(mocks.push).not.toHaveBeenCalled();

    await wrapper.get('.keep-editing').trigger('click');
    expect(wrapper.find('.employee-cancel-dialog-stub').exists()).toBe(false);
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('discards edit progress and returns to employees after confirmation', async () => {
    const wrapper = mount(EmployeeEdit, { global: globalConfig });

    await wrapper.get('.btn-cancel').trigger('click');
    await wrapper.get('.confirm-cancel').trigger('click');

    expect(mocks.push).toHaveBeenCalledWith({ name: 'Employees' });
  });
});
