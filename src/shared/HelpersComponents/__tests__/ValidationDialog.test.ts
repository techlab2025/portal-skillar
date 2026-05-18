import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

const mockContext = vi.hoisted(() => ({
  isOpen: null as any,
  message: null as any,
  clearValidation: vi.fn(),
  openDialog: vi.fn(),
}));

vi.mock('@/base/Presentation/Utils/validationService', async () => {
  const { ref } = await import('vue');
  mockContext.isOpen = ref(false);
  mockContext.message = ref('');
  return {
    default: {
      get isOpen() {
        return mockContext.isOpen;
      },
      get message() {
        return mockContext.message;
      },
      openDialog: mockContext.openDialog,
      clearValidation: mockContext.clearValidation,
    },
  };
});

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    error: vi.fn(),
    toastWarning: vi.fn(),
  },
}));

import ValidationDialog from '@/shared/HelpersComponents/ValidationDialog.vue';

describe('ValidationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (mockContext.isOpen) mockContext.isOpen.value = false;
    if (mockContext.message) mockContext.message.value = '';
  });

  it('renders without crashing', () => {
    const wrapper = mount(ValidationDialog, {
      global: { stubs: { Teleport: true } },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('is hidden when isOpen is false', () => {
    mockContext.isOpen.value = false;
    const wrapper = mount(ValidationDialog, {
      global: { stubs: { Teleport: true } },
    });
    expect(wrapper.find('.dialog-overlay').exists()).toBe(false);
  });

  it('is visible when isOpen is true', () => {
    mockContext.isOpen.value = true;
    mockContext.message.value = 'Required field';
    const wrapper = mount(ValidationDialog, {
      global: { stubs: { Teleport: true } },
    });
    expect(wrapper.find('.dialog-overlay').exists()).toBe(true);
  });

  it('displays the validation message', () => {
    mockContext.isOpen.value = true;
    mockContext.message.value = 'Name is required';
    const wrapper = mount(ValidationDialog, {
      global: { stubs: { Teleport: true } },
    });
    expect(wrapper.find('.dialog-message').text()).toBe('Name is required');
  });

  it('renders close button when visible', () => {
    mockContext.isOpen.value = true;
    mockContext.message.value = 'Error';
    const wrapper = mount(ValidationDialog, {
      global: { stubs: { Teleport: true } },
    });
    expect(wrapper.find('.dialog-close-btn').text()).toBe('Close');
  });

  it('calls clearValidation when close button clicked', async () => {
    mockContext.isOpen.value = true;
    mockContext.message.value = 'Error';
    const wrapper = mount(ValidationDialog, {
      global: { stubs: { Teleport: true } },
    });

    await wrapper.find('.dialog-close-btn').trigger('click');
    expect(mockContext.clearValidation).toHaveBeenCalled();
  });

  it('calls clearValidation when overlay clicked', async () => {
    mockContext.isOpen.value = true;
    mockContext.message.value = 'Error';
    const wrapper = mount(ValidationDialog, {
      global: { stubs: { Teleport: true } },
    });

    await wrapper.find('.dialog-overlay').trigger('click');
    expect(mockContext.clearValidation).toHaveBeenCalled();
  });
});
