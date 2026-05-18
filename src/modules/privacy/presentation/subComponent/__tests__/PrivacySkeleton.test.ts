import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PrivacySkeleton from '../PrivacySkeleton.vue';

describe('PrivacySkeleton', () => {
  it('renders privacy skeleton content', () => {
    const wrapper = mount(PrivacySkeleton);
    expect(wrapper.find('.privacy-container-skeleton').exists()).toBe(true);
    expect(wrapper.find('.privacy-content').exists()).toBe(true);
  });
});
