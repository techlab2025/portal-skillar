import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  onBeforeRouteUpdate: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    resolve: vi.fn(),
  }),
  useRoute: () => ({
    fullPath: '/eg/employees/edit/1',
    query: {},
    params: { id: '1' },
  }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    resolve: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

vi.mock('../controllers/employee.controller', () => ({
  default: {
    getInstance: () => ({
      update: vi.fn(),
      fetchOne: vi.fn(),
      itemData: { value: { name: 'Test Employee' } },
      errorMessage: { value: '' },
    }),
  },
}));

vi.mock('../../core/params/show.employee.params', () => ({
  default: class {},
}));

import EmployeeEdit from '../EmployeeEdit.vue';

describe('EmployeeEdit.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const globalConfig = {
    plugins: [createPinia()],
    stubs: {
      EmployeeForm: true,
      AppButton: true,
      IconAccept: true,
    },
    mocks: {
      $t: (msg: string) => msg,
    },
  };

  it('renders correctly', () => {
    const wrapper = mount(EmployeeEdit, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('contains the employee-edit-page container', () => {
    const wrapper = mount(EmployeeEdit, { global: globalConfig });
    expect(wrapper.find('.employee-edit-page').exists()).toBe(true);
  });
});
