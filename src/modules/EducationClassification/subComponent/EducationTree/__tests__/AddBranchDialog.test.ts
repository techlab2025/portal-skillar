import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AddBranchDialog from '../AddBranchDialog.vue';

describe('AddBranchDialog', () => {
  const defaultProps = {
    visible: true,
    level: 1,
    branchId: 123,
    branchName: 'branch',
  };

  it('renders when visible', async () => {
    const wrapper = mount(AddBranchDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Dialog: {
            template:
              '<div v-if="visible" class="dialog-stub"><slot name="header" /><slot /></div>',
            props: ['visible'],
          },
          MultiLangInput: {
            template: '<input class="multi-lang-input" />',
            props: ['modelValue', 'fieldKey', 'label', 'languages', 'type'],
          },
        },
      },
    });
    expect(wrapper.find('.dialog-stub').exists()).toBe(true);
    expect(wrapper.text()).toContain('add_a_new');
    expect(wrapper.text()).toContain('branch');
  });

  it('emits update:visible false when Cancel button is clicked', async () => {
    const wrapper = mount(AddBranchDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Dialog: {
            template: '<div v-if="visible"><slot /></div>',
            props: ['visible'],
          },
          MultiLangInput: {
            template: '<input class="multi-lang-input" />',
            props: ['modelValue', 'fieldKey', 'label', 'languages', 'type'],
          },
        },
      },
    });

    await wrapper.find('button.btn-secondary').trigger('click');
    expect(wrapper.emitted('update:visible')).toBeTruthy();
    const emitted = wrapper.emitted('update:visible');
    expect(emitted?.[0]).toEqual([false]);
  });

  it('emits confirm with input value when Add button is clicked', async () => {
    const wrapper = mount(AddBranchDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Dialog: {
            template: '<div v-if="visible"><slot /></div>',
            props: ['visible'],
          },
          MultiLangInput: {
            template:
              '<input class="multi-lang-input" :value="modelValue" @input="$emit(\'update:modelValue\', { en: $event.target.value })" />',
            props: ['modelValue', 'fieldKey', 'label', 'languages', 'type'],
            emits: ['update:modelValue'],
          },
        },
      },
    });

    const input = wrapper.find('input.multi-lang-input');
    await input.setValue('New Branch Name');
    await wrapper.find('button.btn-primary').trigger('click');

    expect(wrapper.emitted('confirm')).toBeTruthy();
    const emitted = wrapper.emitted('confirm');
    expect(emitted?.[0]?.[0]).toEqual({
      name: { en: 'New Branch Name' },
      level: 1,
      branchId: 123,
    });
  });

  it('disables Add button when input is empty', async () => {
    const wrapper = mount(AddBranchDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Dialog: {
            template: '<div v-if="visible"><slot /></div>',
            props: ['visible'],
          },
          MultiLangInput: {
            template:
              '<input class="multi-lang-input" :value="modelValue" @input="$emit(\'update:modelValue\', { en: $event.target.value })" />',
            props: ['modelValue', 'fieldKey', 'label', 'languages', 'type'],
            emits: ['update:modelValue'],
          },
        },
      },
    });

    const addButton = wrapper.find('button.btn-primary');
    expect((addButton.element as HTMLButtonElement).disabled).toBe(true);

    await wrapper.find('input.multi-lang-input').setValue('   ');
    expect((addButton.element as HTMLButtonElement).disabled).toBe(true);

    await wrapper.find('input.multi-lang-input').setValue('Valid Name');
    expect((addButton.element as HTMLButtonElement).disabled).toBe(false);
  });
});
