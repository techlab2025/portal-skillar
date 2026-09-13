import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import SubjectsPanel from '../SubjectsPanel.vue';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type EducationSubjectModel from '@/modules/EducationClassification/core/models/EducationSubject/education.subject.model';
import type EducationSubjectConfigurationModel from '@/modules/EducationClassification/core/models/EducationConfiguration/education.subject.configuration.model';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ locale: { value: 'en' } }),
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '1' } }),
}));

const mockConfigController = {
  fetchList: vi.fn(),
};

const mockItemController = {
  fetchList: vi.fn(),
  create: vi.fn(),
};

const mockSkillsController = {
  create: vi.fn(),
};

const mockTopicsController = {
  create: vi.fn(),
};

vi.mock(
  '@/modules/EducationClassification/presentation/controllers/educationSubject/education.subject.controller',
  () => ({ default: { getInstance: () => mockConfigController } }),
);

vi.mock(
  '@/modules/EducationClassification/presentation/controllers/educationSubject/education.subject.item.controller',
  () => ({ default: { getInstance: () => mockItemController } }),
);

vi.mock(
  '@/modules/EducationClassification/presentation/controllers/EducationSkills/education.skills.controller',
  () => ({ default: { getInstance: () => mockSkillsController } }),
);

vi.mock(
  '@/modules/EducationClassification/presentation/controllers/EducationTopics/education.topics.controller',
  () => ({ default: { getInstance: () => mockTopicsController } }),
);

vi.mock('../SubjectTreeNode.vue', () => ({
  default: {
    name: 'SubjectTreeNode',
    template: '<div class="subject-tree-node"></div>',
    props: ['node', 'selectedSubjectId', 'maxDepth', 'levelLabels'],
  },
}));

vi.mock(
  '@/modules/EducationClassification/subComponent/EducationTree/AddEducationSubjectDialog.vue',
  () => ({
    default: {
      name: 'AddEducationSubjectDialog',
      template: '<div class="add-subject-dialog"></div>',
      props: ['subjectName', 'loading'],
    },
  }),
);

describe('SubjectsPanel', () => {
  const defaultProps = { stageId: 5, stageName: 'Grade 5' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfigController.fetchList.mockResolvedValue(
      new DataSuccess<EducationSubjectConfigurationModel[]>({
        data: [
          {
            numberOfBranches: 1,
            branches: [],
            SingluarTitle: { en: 'Subject' },
          } as unknown as EducationSubjectConfigurationModel,
        ],
      }),
    );
    mockItemController.fetchList.mockResolvedValue(
      new DataSuccess<EducationSubjectModel[]>({ data: [] }),
    );
    mockItemController.create.mockResolvedValue(new DataSuccess({ data: null }));
    mockSkillsController.create.mockResolvedValue(new DataSuccess({ data: null }));
    mockTopicsController.create.mockResolvedValue(new DataSuccess({ data: null }));
  });

  const mountComponent = (props = defaultProps) =>
    mount(SubjectsPanel, {
      props,
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { 'router-link': true },
      },
    });

  it('renders the subjects panel', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.find('.subjects-panel').exists()).toBe(true);
  });

  it('displays the stage name in the panel header', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain('Grade 5');
  });

  it('calls itemController.fetchList on mounted', async () => {
    mountComponent();
    await flushPromises();
    expect(mockItemController.fetchList).toHaveBeenCalled();
  });

  it('calls configController.fetchList on mounted', async () => {
    mountComponent();
    await flushPromises();
    expect(mockConfigController.fetchList).toHaveBeenCalled();
  });

  it('opens AddEducationSubjectDialog when the add icon in header is clicked', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.get('.stage-root-row .icon-btn').trigger('click');
    expect(wrapper.find('.add-subject-dialog').exists()).toBe(true);
  });

  it('passes the configured subject name to the add dialog', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.get('.stage-root-row .icon-btn').trigger('click');

    expect(wrapper.getComponent({ name: 'AddEducationSubjectDialog' }).props('subjectName')).toBe(
      'Subject',
    );
  });

  it('closes AddEducationSubjectDialog on update:visible false emit', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.get('.stage-root-row .icon-btn').trigger('click');
    expect(wrapper.find('.add-subject-dialog').exists()).toBe(true);

    const dialog = wrapper.getComponent({ name: 'AddEducationSubjectDialog' });
    await dialog.vm.$emit('update:visible', false);
    expect(wrapper.find('.add-subject-dialog').exists()).toBe(false);
  });

  it('re-fetches subjects when stageId prop changes', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const callsBefore = mockItemController.fetchList.mock.calls.length;

    await wrapper.setProps({ stageId: 10, stageName: 'Grade 10' });
    await flushPromises();

    expect(mockItemController.fetchList.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('adds the root subject level to the configured branch count', async () => {
    const mockSubject = {
      subject_id: 1,
      subject_title: 'Math',
      has_children: false,
    } as EducationSubjectModel;
    const mockConfig = {
      numberOfBranches: 1,
    } as EducationSubjectConfigurationModel;
    mockConfigController.fetchList.mockResolvedValue(
      new DataSuccess<EducationSubjectConfigurationModel[]>({ data: [mockConfig] }),
    );
    mockItemController.fetchList.mockResolvedValue(
      new DataSuccess<EducationSubjectModel[]>({ data: [mockSubject] }),
    );

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.getComponent({ name: 'SubjectTreeNode' }).props('maxDepth')).toBe(2);
  });

  it('passes localized configuration branch names to subject nodes', async () => {
    mockConfigController.fetchList.mockResolvedValue(
      new DataSuccess<EducationSubjectConfigurationModel[]>({
        data: [
          {
            numberOfBranches: 1,
            branches: [{ levelNumber: 1, singularTitle: { en: 'Unit' } }],
            SingluarTitle: { en: 'Subject' },
          } as unknown as EducationSubjectConfigurationModel,
        ],
      }),
    );
    mockItemController.fetchList.mockResolvedValue(
      new DataSuccess<EducationSubjectModel[]>({
        data: [
          {
            subject_id: 1,
            subject_title: 'Math',
            has_children: false,
          } as EducationSubjectModel,
        ],
      }),
    );

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.getComponent({ name: 'SubjectTreeNode' }).props('levelLabels')).toEqual({
      0: 'Subject',
      1: 'Unit',
    });
  });

  it('opens the full subject form with the configured level name from a tree node', async () => {
    mockConfigController.fetchList.mockResolvedValue(
      new DataSuccess<EducationSubjectConfigurationModel[]>({
        data: [
          {
            numberOfBranches: 1,
            branches: [{ levelNumber: 1, singularTitle: { en: 'Unit' } }],
            SingluarTitle: { en: 'Subject' },
          } as unknown as EducationSubjectConfigurationModel,
        ],
      }),
    );
    mockItemController.fetchList.mockResolvedValue(
      new DataSuccess<EducationSubjectModel[]>({
        data: [
          {
            subject_id: 1,
            subject_title: 'Math',
            has_children: false,
          } as EducationSubjectModel,
        ],
      }),
    );

    const wrapper = mountComponent();
    await flushPromises();
    wrapper.getComponent({ name: 'SubjectTreeNode' }).vm.$emit('add-child', 1, 1);
    await wrapper.vm.$nextTick();

    const dialog = wrapper.getComponent({ name: 'AddEducationSubjectDialog' });
    expect(dialog.props('subjectName')).toBe('Unit');
  });

  it('creates subject details and its skill and search terms', async () => {
    mockItemController.create.mockResolvedValue(
      new DataSuccess({
        data: {
          subject_id: 42,
          subject_title: 'Mathematics',
          has_children: false,
        } as EducationSubjectModel,
      }),
    );
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.get('.stage-root-row .icon-btn').trigger('click');

    wrapper.getComponent({ name: 'AddEducationSubjectDialog' }).vm.$emit('confirm', {
      name: { en: 'Mathematics', ar: 'الرياضيات' },
      description: { en: 'Numbers' },
      skill: { id: 7, title: 'Problem solving' },
      tags: ['algebra', 'geometry'],
      coverImage: 'data:image/png;base64,cover',
      isDraft: false,
    });
    await flushPromises();

    expect(mockItemController.create).toHaveBeenCalledOnce();
    expect(mockItemController.create.mock.calls[0]?.[0].toMap()).toEqual({
      translations: {
        title: { en: 'Mathematics', ar: 'الرياضيات' },
        description: { en: 'Numbers' },
        question: undefined,
        answer: undefined,
      },
      education_classification_branch_id: 5,
      image: 'data:image/png;base64,cover',
      is_draft: 0,
    });
    expect(mockSkillsController.create.mock.calls[0]?.[0].toMap()).toEqual({
      education_classification_subject_id: 42,
      skills: [{ skill_id: 7, percentage: '100' }],
    });
    expect(mockTopicsController.create).toHaveBeenCalledTimes(2);
    expect(wrapper.find('.add-subject-dialog').exists()).toBe(false);
  });
});
