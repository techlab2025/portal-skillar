import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TableDialogSkelaton from '../TableDialogSkelaton.vue';

describe('TableDialogSkelaton', () => {
  it('renders without crashing', () => {
    const wrapper = mount(TableDialogSkelaton);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the skeleton list container', () => {
    const wrapper = mount(TableDialogSkelaton);
    expect(wrapper.find('.document-type-skeleton-list').exists()).toBe(true);
  });

  it('renders default 6 rows when rows prop is not provided', () => {
    const wrapper = mount(TableDialogSkelaton);
    const rows = wrapper.findAll('.document-type-row');
    expect(rows.length).toBe(6);
  });

  it('renders the specified number of rows', () => {
    const wrapper = mount(TableDialogSkelaton, {
      props: { rows: 3 },
    });
    const rows = wrapper.findAll('.document-type-row');
    expect(rows.length).toBe(3);
  });
});
