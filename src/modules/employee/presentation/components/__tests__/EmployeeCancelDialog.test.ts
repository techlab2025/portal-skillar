import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import EmployeeCancelDialog from '../EmployeeCancelDialog.vue';

const dialogStub = {
  name: 'Dialog',
  props: ['visible'],
  template: '<div v-if="visible"><slot name="container" /></div>',
};

const mountDialog = () =>
  mount(EmployeeCancelDialog, {
    props: { modelValue: true },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { Dialog: dialogStub },
    },
  });

describe('EmployeeCancelDialog', () => {
  it('renders the designed warning and accessible alert dialog', () => {
    const wrapper = mountDialog();
    const dialog = wrapper.get('[role="alertdialog"]');

    expect(dialog.attributes('aria-labelledby')).toBe('employee-cancel-dialog-title');
    expect(dialog.attributes('aria-describedby')).toBe('employee-cancel-dialog-description');
    const animation = dialog.get('.employee-cancel-dialog__animation');
    expect(animation.attributes('src')).toContain('Cancel.gif');
    expect(animation.attributes('alt')).toBe('');
    expect(animation.attributes('aria-hidden')).toBe('true');
    expect(dialog.get('h2').text()).toBe('employee_cancel.title');
    expect(dialog.get('p').text()).toBe('employee_cancel.description');
  });

  it('confirms cancellation and closes the dialog', async () => {
    const wrapper = mountDialog();

    await wrapper.get('[data-testid="confirm-employee-cancel"]').trigger('click');

    expect(wrapper.emitted('confirm')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('keeps editing and closes the dialog', async () => {
    const wrapper = mountDialog();

    await wrapper.get('[data-testid="keep-editing"]').trigger('click');

    expect(wrapper.emitted('keepEditing')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });
});
