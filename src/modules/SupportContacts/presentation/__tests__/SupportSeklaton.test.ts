import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import SupportSeklaton from '../SupportSeklaton.vue';

describe('SupportSeklaton', () => {
  it('renders support contact skeleton cards', () => {
    const wrapper = mount(SupportSeklaton);
    expect(wrapper.find('.support-contact-page-skeleton').exists()).toBe(true);
    expect(wrapper.findAll('.support-view-card')).toHaveLength(3);
  });
});
