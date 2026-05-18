import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import questionsAdd from '../questionsAdd.vue';

vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
    replace: vi.fn(),
  },
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    fullPath: '/eg/questions/add',
    params: {},
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  onBeforeRouteLeave: vi.fn(),
}));

vi.mock('../controllers/questions.controller', () => ({
  default: {
    getInstance: () => ({
      create: vi.fn(),
      errorMessage: { value: '' },
    }),
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

describe('questionsAdd.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = mount(questionsAdd, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('contains the "Save Employee" button', () => {
    const wrapper = mount(questionsAdd, { global: globalConfig });
    const saveButton = wrapper.find('.save-emp');
    expect(saveButton.exists()).toBe(true);
  });

  it('contains the "Save As draft" button', () => {
    const wrapper = mount(questionsAdd, { global: globalConfig });
    const draftButton = wrapper.find('.btn-draft');
    expect(draftButton.exists()).toBe(true);
  });

  it('contains the "cancel" button', () => {
    const wrapper = mount(questionsAdd, { global: globalConfig });
    const cancelButton = wrapper.find('.btn-cancel');
    expect(cancelButton.exists()).toBe(true);
  });
});
