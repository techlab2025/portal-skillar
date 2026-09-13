import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AddEducationSubjectDialog from '../AddEducationSubjectDialog.vue';

vi.mock('@/shared/icons/NewBranchIcon.vue', () => ({
  default: { name: 'NewBranchIcon', template: '<span class="new-branch-icon" />' },
}));

vi.mock('@/modules/Skills/presentation/controllers/skills.controller', () => ({
  default: {
    getInstance: () => ({}),
  },
}));

const dialogStub = {
  template: '<div v-if="visible" class="dialog-stub"><slot name="header" /><slot /></div>',
  props: ['visible'],
};

const skillSelectStub = {
  name: 'UpdatedCustomInputSelect',
  template:
    '<button class="skill-select-stub" type="button" @click="$emit(\'update:modelValue\', { id: 7, title: \'Reading\' })">Select skill</button>',
};

const uploadStub = {
  name: 'HandleFilesUpload',
  template:
    '<button class="cover-upload-stub" type="button" @click="$emit(\'change\', [{ base64: \'data:image/png;base64,cover\' }])"><slot name="content" /></button>',
};

const mountDialog = (visible = true) =>
  mount(AddEducationSubjectDialog, {
    props: { visible, subjectName: 'Course' },
    global: {
      mocks: {
        $t: (key: string) => key,
      },
      stubs: {
        Dialog: dialogStub,
        UpdatedCustomInputSelect: skillSelectStub,
        HandleFilesUpload: uploadStub,
      },
    },
  });

describe('AddEducationSubjectDialog', () => {
  it('renders the designed subject identity and media sections', () => {
    const wrapper = mountDialog();

    expect(wrapper.find('.dialog-title').text()).toBe('education_subject_form.title');
    expect(wrapper.find('#subject-identity-heading').text()).toBe(
      'education_subject_form.identity',
    );
    expect(wrapper.find('#subject-media-heading').text()).toBe(
      'education_subject_form.media_pricing',
    );
    expect(wrapper.find('#subject-search-terms').exists()).toBe(true);
    expect(wrapper.find('.cover-upload-stub').exists()).toBe(true);
    expect(wrapper.find('textarea').exists()).toBe(true);
  });

  it('does not render when visible is false', () => {
    expect(mountDialog(false).find('.dialog-stub').exists()).toBe(false);
  });

  it('requires a subject name and skill before creating', async () => {
    const wrapper = mountDialog();
    const createButton = wrapper.get('.create-subject-button');

    expect((createButton.element as HTMLButtonElement).disabled).toBe(true);

    await wrapper.get('input[dir="ltr"]').setValue('Mathematics');
    expect((createButton.element as HTMLButtonElement).disabled).toBe(true);

    await wrapper.get('.skill-select-stub').trigger('click');
    expect((createButton.element as HTMLButtonElement).disabled).toBe(false);
  });

  it('emits all form data and includes a typed search term without requiring Add', async () => {
    const wrapper = mountDialog();

    await wrapper.get('input[dir="ltr"]').setValue('  Mathematics  ');
    await wrapper.get('textarea').setValue('  Numbers and equations  ');
    await wrapper.get('.skill-select-stub').trigger('click');
    await wrapper.get('#subject-search-terms').setValue('algebra');
    await wrapper.get('.cover-upload-stub').trigger('click');
    await wrapper.get('form').trigger('submit');

    expect(wrapper.emitted('confirm')?.[0]?.[0]).toEqual({
      name: { en: 'Mathematics' },
      description: { en: 'Numbers and equations' },
      skill: { id: 7, title: 'Reading' },
      tags: ['algebra'],
      coverImage: 'data:image/png;base64,cover',
      isDraft: false,
    });
  });

  it('adds and removes search term chips', async () => {
    const wrapper = mountDialog();

    await wrapper.get('#subject-search-terms').setValue('algebra, geometry');
    await wrapper.get('.tag-add-button').trigger('click');
    expect(wrapper.findAll('.tag-chip').map((chip) => chip.text().replace(/\s+/g, ' '))).toEqual([
      'algebra ×',
      'geometry ×',
    ]);

    await wrapper.findAll('.tag-chip button')[0]?.trigger('click');
    expect(wrapper.findAll('.tag-chip')).toHaveLength(1);
    expect(wrapper.find('.tag-chip').text()).toContain('geometry');
  });

  it('allows a named incomplete subject to be saved as draft', async () => {
    const wrapper = mountDialog();

    await wrapper.get('input[dir="ltr"]').setValue('Draft subject');
    await wrapper.get('.draft-button').trigger('click');

    expect(wrapper.emitted('confirm')?.[0]?.[0]).toMatchObject({
      name: { en: 'Draft subject' },
      skill: null,
      isDraft: true,
    });
  });

  it('closes when Cancel is clicked', async () => {
    const wrapper = mountDialog();

    await wrapper.get('.btn-secondary').trigger('click');

    expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
  });
});
