import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DeleteSkillsDialog from '../DeleteSkillsDialog.vue';

describe('DeleteSkillsDialog', () => {
  const createWrapper = (props = {}) =>
    mount(DeleteSkillsDialog, {
      props: { hasbtn: true, ...props },
      global: {
        stubs: {
          Dialog: {
            template: '<div v-if="visible" class="p-dialog"><slot name="container" /></div>',
            props: ['visible', 'modal', 'pt', 'style'],
            emits: ['update:visible'],
          },
          DeleteIcon: true,
        },
      },
    });

  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders button with slot when hasbtn is true', () => {
    const wrapper = createWrapper({ hasbtn: true });
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('renders delete button when hasbtn is false', () => {
    const wrapper = createWrapper({ hasbtn: false });
    expect(wrapper.find('.action-btn.delete').exists()).toBe(true);
  });

  it('shows dialog on button click when hasbtn is true', async () => {
    const wrapper = createWrapper({ hasbtn: true });
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('.p-dialog').exists()).toBe(true);
  });
});
