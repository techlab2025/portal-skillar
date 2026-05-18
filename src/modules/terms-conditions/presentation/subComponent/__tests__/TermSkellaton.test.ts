import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TermSkellaton from '../TermSkellaton.vue';

describe('TermSkellaton', () => {
  it('renders terms skeleton content', () => {
    const wrapper = mount(TermSkellaton);
    expect(wrapper.find('.terms-container-skeleton').exists()).toBe(true);
    expect(wrapper.find('.terms-content').exists()).toBe(true);
  });
});
