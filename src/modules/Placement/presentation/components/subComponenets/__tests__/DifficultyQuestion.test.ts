import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import DifficultyQuestion from '../DifficultyQuestion.vue';

const difficultyFields = [
  {
    key: 'easy' as const,
    label: 'Easy questions',
    placeholder: 'Enter easy percentage',
    class: 'easy',
    value: 0,
  },
  {
    key: 'medium' as const,
    label: 'Medium questions',
    placeholder: 'Enter medium percentage',
    class: 'medium',
    value: 0,
  },
  {
    key: 'hard' as const,
    label: 'Hard questions',
    placeholder: 'Enter hard percentage',
    class: 'hard',
    value: 0,
  },
];

describe('DifficultyQuestion', () => {
  it('keeps prerequisite validation hidden until requested', async () => {
    const wrapper = mount(DifficultyQuestion, {
      props: {
        difficultyFields,
        questionCount: 0,
        calculatedQuestions: { easy: 0, medium: 0, hard: 0 },
        totalPercentage: 0,
        prerequisitesReady: false,
        showPrerequisiteError: false,
        modelValue: { easy: 0, medium: 0, hard: 0 },
      },
    });

    expect(wrapper.findAll('.field-input').every((input) => input.element.disabled)).toBe(true);
    expect(wrapper.find('.error-text').exists()).toBe(false);

    await wrapper.setProps({ showPrerequisiteError: true });

    expect(wrapper.findAll('.error-text')).toHaveLength(3);

    await wrapper.setProps({
      prerequisitesReady: true,
      showPrerequisiteError: false,
    });

    expect(wrapper.findAll('.field-input').every((input) => !input.element.disabled)).toBe(true);
    expect(wrapper.find('.error-text').exists()).toBe(false);
  });
});
