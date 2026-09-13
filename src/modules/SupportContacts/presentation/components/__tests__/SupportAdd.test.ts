import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

const create = vi.hoisted(() => vi.fn().mockResolvedValue({}));
const mockPush = vi.hoisted(() => vi.fn());
const prepareForSubmit = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    fullPath: '/support/add',
    params: {},
  })),
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

vi.mock('../../controllers/support.controller', () => ({
  default: {
    getInstance: () => ({
      create,
      errorMessage: { value: '' },
    }),
  },
}));

import SupportAdd from '../SupportAdd.vue';

const globalConfig = {
  mocks: { $t: (key: string) => key },
  stubs: {
    SupportForm: {
      template: '<div class="support-form-stub" />',
      emits: ['updateData'],
      setup(_: unknown, { expose }: { expose: (value: object) => void }) {
        expose({ prepareForSubmit });
      },
    },
  },
};

describe('SupportAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prepareForSubmit.mockReturnValue({ contacts: [{ value: 'support@example.com' }] });
  });

  it('renders without errors', () => {
    const wrapper = mount(SupportAdd, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the save and cancel buttons', () => {
    const wrapper = mount(SupportAdd, { global: globalConfig });
    const saveBtn = wrapper.find('button.btn-primary');
    const cancelBtn = wrapper.find('button.btn-cancel');
    expect(saveBtn.exists()).toBe(true);
    expect(saveBtn.text()).toContain('save');
    expect(cancelBtn.exists()).toBe(true);
    expect(cancelBtn.text()).toContain('cancel');
  });

  it('returns to the support list when cancel is clicked', async () => {
    const wrapper = mount(SupportAdd, { global: globalConfig });

    await wrapper.get('button.btn-cancel').trigger('click');

    expect(mockPush).toHaveBeenCalledWith('/support');
    expect(create).not.toHaveBeenCalled();
  });

  it('renders the support add page wrapper', () => {
    const wrapper = mount(SupportAdd, { global: globalConfig });
    expect(wrapper.find('.support-add-page').exists()).toBe(true);
  });

  it('submits the payload prepared by the form', async () => {
    const wrapper = mount(SupportAdd, { global: globalConfig });

    await wrapper.get('button.btn-primary').trigger('click');

    expect(prepareForSubmit).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith(
      { contacts: [{ value: 'support@example.com' }] },
      undefined,
    );
  });

  it('does not call create when the form has no contact method', async () => {
    prepareForSubmit.mockReturnValue(null);
    const wrapper = mount(SupportAdd, { global: globalConfig });

    await wrapper.get('button.btn-primary').trigger('click');

    expect(create).not.toHaveBeenCalled();
  });
});
