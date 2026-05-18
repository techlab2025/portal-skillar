import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TableSkelaton from '../TableSkelaton.vue';

const createWrapper = (props = {}) => mount(TableSkelaton, { props });

describe('TableSkelaton', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders a table element', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('table').exists()).toBe(true);
  });

  it('renders default 6 rows when rows prop not provided', () => {
    const wrapper = createWrapper();
    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(6);
  });

  it('renders correct number of rows', () => {
    const wrapper = createWrapper({ rows: 3 });
    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(3);
  });

  it('renders correct number of header columns', () => {
    const wrapper = createWrapper({ columns: 4 });
    expect(wrapper.findAll('thead th').length).toBe(4);
  });

  it('renders checkbox column when selectable is true', () => {
    const wrapper = createWrapper({ selectable: true });
    expect(wrapper.find('.th-checkbox').exists()).toBe(true);
    expect(wrapper.find('.td-checkbox').exists()).toBe(true);
  });

  it('does not render checkbox column when selectable is false', () => {
    const wrapper = createWrapper({ selectable: false });
    expect(wrapper.find('.th-checkbox').exists()).toBe(false);
    expect(wrapper.find('.td-checkbox').exists()).toBe(false);
  });

  it('renders index column when showIndex is true', () => {
    const wrapper = createWrapper({ showIndex: true });
    expect(wrapper.find('.th-index').exists()).toBe(true);
    expect(wrapper.find('.td-index').exists()).toBe(true);
  });

  it('renders actions column when hasActions is true', () => {
    const wrapper = createWrapper({ hasActions: true });
    expect(wrapper.find('.th-actions').exists()).toBe(true);
    expect(wrapper.find('.td-actions').exists()).toBe(true);
  });

  it('renders skeleton elements in cells', () => {
    const wrapper = createWrapper({ columns: 2, rows: 1 });
    expect(wrapper.findAll('.skeleton-text').length).toBeGreaterThan(0);
  });
});
