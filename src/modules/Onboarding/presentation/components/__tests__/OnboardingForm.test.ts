import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import OnboardingForm from '../OnboardingForm.vue';

const MultiLangInputStub = {
  name: 'MultiLangInput',
  props: ['fieldKey', 'label', 'modelValue', 'type'],
  emits: ['update:modelValue'],
  template: '<div class="multi-lang-input-stub" :data-field="fieldKey" />',
};

const mountForm = () =>
  mount(OnboardingForm, {
    global: {
      plugins: [
        createI18n({
          legacy: false,
          locale: 'en',
          messages: {
            en: {
              onboarding: {
                validation_required: 'Complete all fields',
                api_unavailable: 'API unavailable',
              },
            },
          },
        }),
      ],
      stubs: {
        MultiLangInput: MultiLangInputStub,
        SidebarTerms: true,
      },
    },
  });

describe('OnboardingForm', () => {
  it('renders title and description controls for all three screens', () => {
    const wrapper = mountForm();

    expect(wrapper.findAll('.onboarding-screen')).toHaveLength(3);
    expect(wrapper.findAllComponents({ name: 'MultiLangInput' })).toHaveLength(6);
  });

  it('asks for every English and Arabic value before saving', async () => {
    const wrapper = mountForm();

    await wrapper.get('form').trigger('submit');

    expect(wrapper.get('[role="alert"]').text()).toBe('Complete all fields');
  });

  it('reports the missing backend integration after the form is complete', async () => {
    const wrapper = mountForm();
    const inputs = wrapper.findAllComponents({ name: 'MultiLangInput' });

    for (const input of inputs) {
      input.vm.$emit('update:modelValue', { en: 'English value', ar: 'قيمة عربية' });
    }
    await wrapper.vm.$nextTick();
    await wrapper.get('form').trigger('submit');

    expect(wrapper.get('[role="alert"]').text()).toBe('API unavailable');
  });
});
