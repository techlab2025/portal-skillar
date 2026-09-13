import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import EmployeeFeedbackDialog from '../EmployeeFeedbackDialog.vue';

const mountDialog = (variant: 'success' | 'draft') =>
  mount(EmployeeFeedbackDialog, {
    props: { modelValue: true, variant },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        Dialog: {
          props: ['visible'],
          template: '<div v-if="visible" role="dialog"><slot name="container" /></div>',
        },
      },
    },
  });

describe('EmployeeFeedbackDialog', () => {
  it('renders the employee success feedback and acknowledges it', async () => {
    const wrapper = mountDialog('success');

    expect(wrapper.get('h2').text()).toBe('employee_feedback.success_title');
    expect(wrapper.get('p').text()).toBe('employee_feedback.success_message');
    expect(wrapper.get('img').attributes('src')).toContain('Saved.gif');

    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('acknowledge')).toHaveLength(1);
  });

  it('renders the draft feedback design', () => {
    const wrapper = mountDialog('draft');

    expect(wrapper.get('h2').text()).toBe('employee_feedback.draft_title');
    expect(wrapper.get('p').text()).toBe('employee_feedback.draft_message');
    expect(wrapper.get('img').attributes('src')).toContain('DraftDialogIcon.gif');
  });
});
