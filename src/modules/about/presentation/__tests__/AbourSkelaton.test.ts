import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AbourSkelaton from '../AbourSkelaton.vue';

describe('AbourSkelaton', () => {
  it('renders about page skeleton', () => {
    const wrapper = mount(AbourSkelaton);
    expect(wrapper.find('.about-page-skeleton').exists()).toBe(true);
    expect(wrapper.find('.skeleton.image').exists()).toBe(true);
  });
});
