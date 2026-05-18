import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AddEducationSubjectDialog from '../AddEducationSubjectDialog.vue';

vi.mock('@/shared/icons/NewBranchIcon.vue', () => ({
  default: { name: 'NewBranchIcon', template: '<span class="new-branch-icon" />' },
}));

const dialogStubWithHeader = {
  template: '<div v-if="visible" class="dialog-stub"><slot name="header" /><slot /></div>',
  props: ['visible'],
};

const dialogStub = {
  template: '<div v-if="visible"><slot /></div>',
  props: ['visible'],
};

const multiLangInputStub = {
  template:
    '<input class="multi-lang-input" :value="modelValue?.en" @input="$emit(\'update:modelValue\', { en: $event.target.value })" />',
  props: ['modelValue', 'fieldKey', 'label', 'languages', 'type'],
  emits: ['update:modelValue'],
};

describe('AddEducationSubjectDialog', () => {
  const defaultProps = { visible: true };

  it('renders when visible is true', () => {
    const wrapper = mount(AddEducationSubjectDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: { Dialog: dialogStubWithHeader, MultiLangInput: multiLangInputStub },
      },
    });
    expect(wrapper.find('.dialog-stub').exists()).toBe(true);
  });

  it('does not render when visible is false', () => {
    const wrapper = mount(AddEducationSubjectDialog, {
      props: { visible: false },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: { Dialog: dialogStubWithHeader, MultiLangInput: multiLangInputStub },
      },
    });
    expect(wrapper.find('.dialog-stub').exists()).toBe(false);
  });

  it('has Add button enabled when input is empty (empty object is truthy)', () => {
    const wrapper = mount(AddEducationSubjectDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: { Dialog: dialogStub, MultiLangInput: multiLangInputStub },
      },
    });
    const addBtn = wrapper.find('button.btn-primary');
    expect((addBtn.element as HTMLButtonElement).disabled).toBe(false);
  });

  it('enables Add button when input has text', async () => {
    const wrapper = mount(AddEducationSubjectDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: { Dialog: dialogStub, MultiLangInput: multiLangInputStub },
      },
    });
    await wrapper.find('input.multi-lang-input').setValue('Mathematics');
    expect((wrapper.find('button.btn-primary').element as HTMLButtonElement).disabled).toBe(false);
  });

  it('emits confirm with translations object when Add is clicked', async () => {
    const wrapper = mount(AddEducationSubjectDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: { Dialog: dialogStub, MultiLangInput: multiLangInputStub },
      },
    });
    await wrapper.find('input.multi-lang-input').setValue('Science');
    await wrapper.find('button.btn-primary').trigger('click');

    expect(wrapper.emitted('confirm')).toBeTruthy();
    expect(wrapper.emitted('confirm')?.[0]?.[0]).toEqual({ en: 'Science' });
  });

  it('clears the input after a successful confirm', async () => {
    const wrapper = mount(AddEducationSubjectDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: { Dialog: dialogStub, MultiLangInput: multiLangInputStub },
      },
    });
    await wrapper.find('input.multi-lang-input').setValue('Art');
    await wrapper.find('button.btn-primary').trigger('click');

    expect((wrapper.find('input.multi-lang-input').element as HTMLInputElement).value).toBe('');
  });

  it('emits update:visible false when Cancel is clicked', async () => {
    const wrapper = mount(AddEducationSubjectDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: { Dialog: dialogStub, MultiLangInput: multiLangInputStub },
      },
    });
    await wrapper.find('button.btn-secondary').trigger('click');

    expect(wrapper.emitted('update:visible')).toBeTruthy();
    expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
  });

  it('emits update:visible false on Escape key press', async () => {
    const wrapper = mount(AddEducationSubjectDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: { Dialog: dialogStub, MultiLangInput: multiLangInputStub },
      },
    });
    await wrapper.find('input.multi-lang-input').trigger('keydown.esc');

    expect(wrapper.emitted('update:visible')).toBeTruthy();
    expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
  });

  it('triggers confirm on Enter key press when input has text', async () => {
    const wrapper = mount(AddEducationSubjectDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: { Dialog: dialogStub, MultiLangInput: multiLangInputStub },
      },
    });
    await wrapper.find('input.multi-lang-input').setValue('History');
    await wrapper.find('input.multi-lang-input').trigger('keydown.enter');

    expect(wrapper.emitted('confirm')).toBeTruthy();
    expect(wrapper.emitted('confirm')?.[0]?.[0]).toEqual({ en: 'History' });
  });
});
