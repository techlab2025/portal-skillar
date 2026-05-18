import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import FaqsSkellaton from '../FaqsSkellaton.vue';

describe('FaqsSkellaton', () => {
  it('renders faq skeleton rows', () => {
    const wrapper = mount(FaqsSkellaton);
    expect(wrapper.find('.faqs-page-skeleton').exists()).toBe(true);
    expect(wrapper.findAll('.faq-card')).toHaveLength(6);
  });
});
