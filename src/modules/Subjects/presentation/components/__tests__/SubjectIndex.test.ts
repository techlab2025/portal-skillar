import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import SubjectIndex from '../SubjectIndex.vue';
import SubjectController from '../../controllers/subject.controller';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({
    params: { country_code: 'eg' },
    query: {},
  }),
}));

vi.mock('../../controllers/subject.controller', () => ({
  default: { getInstance: vi.fn() },
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('@/base/Presentation/Utils/debouced', () => ({
  debounce: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({ formData: {} }),
}));

const educationTree = [
  {
    id: 103,
    title: 'New EducationClassification',
    branches: [
      {
        id: 235,
        e_c_branch_id: 235,
        title: 'branch 1',
        children: [
          {
            id: 236,
            e_c_branch_id: 236,
            title: 'branch2',
            children: [
              {
                id: 237,
                e_c_branch_id: 237,
                title: 'branch 3',
                children: [],
                subjects: [
                  {
                    id: 219,
                    e_c_subject_id: 219,
                    title: 'subject 1',
                    children: [
                      {
                        id: 220,
                        e_c_subject_id: 220,
                        title: 'subject2',
                        children: [
                          {
                            id: 221,
                            e_c_subject_id: 221,
                            title: 'subject 3',
                            children: [],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
            subjects: [],
          },
        ],
        subjects: [],
      },
      {
        id: 300,
        e_c_branch_id: 300,
        title: 'branch leaf',
        children: [],
        subjects: [],
      },
    ],
  },
];

describe('SubjectIndex.vue', () => {
  let mockFetchList: ReturnType<typeof vi.fn>;
  let mockIndexSubjects: ReturnType<typeof vi.fn>;
  let mockDeleteSubject: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockFetchList = vi.fn().mockResolvedValue({ data: educationTree });
    mockIndexSubjects = vi.fn().mockResolvedValue({ data: educationTree });
    mockDeleteSubject = vi.fn().mockResolvedValue({});
    vi.mocked(SubjectController.getInstance).mockReturnValue({
      fetchList: mockFetchList,
      indexSubjects: mockIndexSubjects,
      delete: mockDeleteSubject,
      pagination: ref(null),
      listState: ref({ status: 'success', data: educationTree }),
    } as unknown as ReturnType<typeof SubjectController.getInstance>);
  });

  const mountOptions = {
    global: {
      mocks: { $t: (msg: string) => msg },
      stubs: {
        DataStatusBuilder: { template: '<div><slot name="success" /><slot name="empty" /></div>' },
        AppTable: {
          name: 'AppTable',
          template:
            '<div class="app-table-stub"><div v-for="item in items"><span class="table-title">{{ item.title }}</span><slot name="actions" :item="item" /></div></div>',
          props: ['headers', 'items'],
        },
        Pagination: {
          template:
            '<div class="pagination-stub"><button class="page-2" @click="$emit(\'changePage\', 2)" /><button class="per-page-20" @click="$emit(\'countPerPage\', 20)" /></div>',
          props: ['pagination'],
          emits: ['changePage', 'countPerPage'],
        },
        UpdatedCustomInputSelect: {
          template: `<button
            class="education-filter"
            :data-label="label"
            :data-placeholder="placeholder"
            :data-selected="modelValue?.title ?? ''"
            @click="$emit('update:modelValue', staticOptions[0] ?? null)"
          />`,
          props: ['modelValue', 'label', 'staticOptions', 'placeholder', 'reload'],
          emits: ['update:modelValue'],
        },
        DropList: {
          template: `
            <div>
              <button class="delete-action" @click="actionList[0].action()" />
              <button
                v-for="action in actionList.slice(1)"
                :key="action.text"
                :data-action="action.text"
                @click="action.action()"
              />
            </div>
          `,
          props: ['actionList', 'deleteDialogTitle', 'deleteDialogMessage'],
        },
        SkillsDialog: {
          name: 'SkillsDialog',
          props: ['visible', 'level', 'branchName', 'branchId'],
          emits: ['update:visible'],
          template: '<div v-if="visible" class="skills-dialog-stub" />',
        },
        RenameSubjectDialog: true,
        DeleteDialog: true,
        'router-link': { template: '<a><slot /></a>', props: ['to'] },
      },
    },
  };

  it('renders the index wrapper', () => {
    const wrapper = mount(SubjectIndex, mountOptions);
    expect(wrapper.find('.subject-page').exists()).toBe(true);
  });

  it('shows the education path and question-count columns', async () => {
    mockIndexSubjects.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Governmental',
          children: [
            {
              id: 2,
              title: 'Primary',
              children: [
                {
                  id: 3,
                  title: 'First',
                  children: [
                    {
                      id: 4,
                      e_c_subject_id: 44,
                      title: 'Arabic',
                      numberOfQuestions: 10,
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const wrapper = mount(SubjectIndex, mountOptions);
    await flushPromises();

    const table = wrapper.getComponent({ name: 'AppTable' });
    expect(table.props('headers')).toMatchObject([
      { key: 'title', label: 'subject_table.subject' },
      { key: 'educationPath', label: 'subject_table.education_type' },
      { key: 'numberOfQuestions', label: 'subject_table.number_of_questions' },
    ]);
    expect(table.props('items')).toMatchObject([
      {
        id: 44,
        title: 'Arabic',
        educationPath: ['Governmental', 'Primary', 'First'],
        numberOfQuestions: 10,
      },
    ]);
  });

  it('leaves the question count unavailable when the API omits it', async () => {
    mockIndexSubjects.mockResolvedValue({
      data: [
        { id: 9, title: 'Math', full_title: 'Governmental -> Secondary -> Math', children: [] },
      ],
    });

    const wrapper = mount(SubjectIndex, mountOptions);
    await flushPromises();

    expect(wrapper.getComponent({ name: 'AppTable' }).props('items')).toMatchObject([
      {
        id: 9,
        title: 'Math',
        educationPath: ['Governmental', 'Secondary'],
        numberOfQuestions: undefined,
      },
    ]);
  });

  it('renders the classification filter from the fetched tree', async () => {
    const wrapper = mount(SubjectIndex, mountOptions);
    await flushPromises();

    const filter = wrapper.find('.education-filter');
    expect(wrapper.findAll('.education-filter')).toHaveLength(1);
    expect(filter.exists()).toBe(true);
    expect(filter.attributes('data-placeholder')).toBe('select subject ');
  });

  it('updates the selected classification value', async () => {
    const wrapper = mount(SubjectIndex, mountOptions);
    await flushPromises();

    await wrapper.find('.education-filter').trigger('click');

    expect(wrapper.find('.education-filter').attributes('data-selected')).toBe(
      'New EducationClassification',
    );
  });

  it('deletes the selected subject with the subject endpoint', async () => {
    const wrapper = mount(SubjectIndex, mountOptions);
    await flushPromises();

    const deleteButtons = wrapper.findAll('.delete-action');
    await deleteButtons[0]?.trigger('click');
    await flushPromises();

    expect(mockDeleteSubject).toHaveBeenCalledTimes(1);
    expect(mockDeleteSubject.mock.calls[0][0].toMap()).toMatchObject({
      education_classification_subject_id: 103,
    });
  });

  it('loads paginated table data and complete filter data', async () => {
    mount(SubjectIndex, mountOptions);
    await flushPromises();

    expect(mockFetchList).toHaveBeenCalledTimes(1);
    expect(mockFetchList.mock.calls[0][0].toMap()).toMatchObject({ with_pagination: 0 });
    expect(mockIndexSubjects).toHaveBeenCalledTimes(1);
    expect(mockIndexSubjects.mock.calls[0][0].toMap()).toMatchObject({ with_pagination: 1 });
  });

  it('shows subjects from later pages through the table pagination', async () => {
    const subjects = Array.from({ length: 13 }, (_, index) => ({
      id: index + 1,
      title: index === 12 ? 'New subject' : `Subject ${index + 1}`,
      children: [],
    }));
    mockIndexSubjects.mockImplementation(async (params) => {
      const page = params.toMap().page as number;
      const perPage = params.toMap().per_page as number;
      return {
        data: subjects.slice((page - 1) * perPage, page * perPage),
        pagination: {
          current: page,
          last: Math.ceil(subjects.length / perPage),
          total: subjects.length,
          count: perPage,
          next: Math.min(page + 1, Math.ceil(subjects.length / perPage)),
        },
      };
    });

    const wrapper = mount(SubjectIndex, mountOptions);
    await flushPromises();

    expect(wrapper.findAll('.delete-action')).toHaveLength(10);
    expect(wrapper.find('.pagination-stub').exists()).toBe(true);

    await wrapper.get('.page-2').trigger('click');
    await flushPromises();

    expect(mockIndexSubjects.mock.calls[1][0].toMap()).toMatchObject({ page: 2, per_page: 10 });
    expect(wrapper.findAll('.delete-action')).toHaveLength(3);
    expect(wrapper.text()).toContain('New subject');
  });

  it('reloads the first page when the per-page count changes', async () => {
    mockIndexSubjects.mockResolvedValue({
      data: educationTree,
      pagination: { current: 1, last: 3, total: 22, count: 10, next: 2 },
    });
    const wrapper = mount(SubjectIndex, mountOptions);
    await flushPromises();

    await wrapper.get('.per-page-20').trigger('click');
    await flushPromises();

    expect(mockIndexSubjects.mock.calls[1][0].toMap()).toMatchObject({ page: 1, per_page: 20 });
  });

  it('shows add button link', () => {
    const wrapper = mount(SubjectIndex, mountOptions);
    const links = wrapper.findAll('a');
    expect(links.length).toBeGreaterThan(0);
  });

  it('opens one skills dialog for only the selected subject', async () => {
    const wrapper = mount(SubjectIndex, mountOptions);
    await flushPromises();

    await wrapper.find('[data-action="skills"]').trigger('click');

    const dialogs = wrapper.findAllComponents({ name: 'SkillsDialog' });
    expect(dialogs).toHaveLength(1);
    expect(dialogs[0]?.props()).toMatchObject({
      visible: true,
      branchId: 103,
      branchName: 'New EducationClassification',
    });

    await dialogs[0]?.vm.$emit('update:visible', false);

    expect(wrapper.findComponent({ name: 'SkillsDialog' }).exists()).toBe(false);
  });
});
