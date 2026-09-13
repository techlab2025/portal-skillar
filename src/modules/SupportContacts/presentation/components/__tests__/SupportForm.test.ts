import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import SupportForm from '../SupportForm.vue';
import type AddSupportContactsParams from '../../../core/params/add.support.params';

const toastWarning = vi.hoisted(() => vi.fn());

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: { toastWarning },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ query: {}, params: {}, fullPath: '/support' }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

vi.mock('@/shared/MultiLangInput.vue', () => ({
  default: {
    name: 'MultiLangInput',
    template: '<div class="multi-lang-input" />',
    props: ['fieldKey', 'label', 'languages', 'modelValue', 'type'],
    emits: ['update:modelValue'],
  },
}));

vi.mock('@/shared/icons/Support/DeleteIcon.vue', () => ({
  default: { name: 'DeleteIcon', template: '<span class="delete-icon" />' },
}));

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });

const mountForm = (props: Record<string, unknown> = {}) =>
  mount(SupportForm, {
    props,
    global: {
      plugins: [i18n],
      stubs: { Teleport: true, Transition: true },
    },
  });

describe('SupportForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const wrapper = mountForm();
    expect(wrapper.exists()).toBe(true);
  });

  it('does not render the add section button', () => {
    const wrapper = mountForm();
    const addBtn = wrapper.find('.add-section-btn');
    expect(addBtn.exists()).toBe(false);
  });

  it('starts with one section', () => {
    const wrapper = mountForm();
    expect(wrapper.findAll('.support-section-card')).toHaveLength(1);
  });

  it('does not show delete button when only one section exists', () => {
    const wrapper = mountForm();
    expect(wrapper.find('.delete-section-btn').exists()).toBe(false);
  });

  it('shows delete button when more than one section exists', async () => {
    const wrapper = mountForm({
      initialSections: [
        { id: 1, titles: {}, supportContacts: [] },
        { id: 2, titles: {}, supportContacts: [] },
      ],
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.delete-section-btn').exists()).toBe(true);
  });

  it('emits updateData on mount', () => {
    const wrapper = mountForm();
    expect(wrapper.emitted('updateData')).toBeTruthy();
  });

  it('uses each contact id instead of the parent section id in emitted payload', () => {
    const wrapper = mountForm({
      initialSections: [
        {
          id: 10,
          titles: { en: 'Support', ar: 'الدعم' },
          supportContacts: [{ id: 55, key: 'phonenumbers', type: '', value: '+201234567890' }],
        },
      ],
    });
    const emitted = wrapper.emitted('updateData')?.[0]?.[0] as {
      toMap: () => { support_contacts: { id?: number }[] };
    };

    expect(emitted.toMap().support_contacts[0].id).toBe(55);
    expect(emitted.toMap().support_contacts[0].id).not.toBe(10);
  });

  it('includes every valid typed contact when preparing the form for submission', async () => {
    const wrapper = mountForm();
    const inputs = wrapper.findAll('.contact-input');

    await inputs[0].setValue('+20 123 456 7890');
    await inputs[1].setValue('+20 123 456 7891');
    await inputs[2].setValue('support@example.com');
    await inputs[3].setValue('https://t.me/support');

    const params = (
      wrapper.vm as unknown as { prepareForSubmit: () => AddSupportContactsParams }
    ).prepareForSubmit();

    expect(params.toMap().support_contacts).toEqual([
      expect.objectContaining({ key: 'phonenumbers', value: '+20 123 456 7890' }),
      expect.objectContaining({ key: 'whatsapp_numbers', value: '+20 123 456 7891' }),
      expect.objectContaining({ key: 'telegram_numbers', value: 'https://t.me/support' }),
      expect.objectContaining({ key: 'emails', value: 'support@example.com' }),
    ]);
    await wrapper.vm.$nextTick();
    expect(inputs.every((input) => input.element.value === '')).toBe(true);
  });

  it('blocks submission when no contact method has been added', () => {
    const wrapper = mountForm();

    const params = (
      wrapper.vm as unknown as { prepareForSubmit: () => AddSupportContactsParams | null }
    ).prepareForSubmit();

    expect(params).toBeNull();
    expect(toastWarning).toHaveBeenCalledWith('support_contact_method_required', {
      title: 'invalid_input_warning_title',
    });
  });
});
