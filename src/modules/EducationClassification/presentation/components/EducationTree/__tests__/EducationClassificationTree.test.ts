import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import EducationClassificationTree from '../EducationClassificationTree.vue';
import EducationTreeController from '../../../controllers/EducationTree/education.configuration.tree.controller';
import { ref } from 'vue';

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: '1' },
  }),
}));

const mockController = {
  fetchList: vi.fn(),
  create: vi.fn(),
  listState: ref({
    value: {
      data: [],
    },
  }),
};

vi.mock('../../../controllers/EducationTree/education.configuration.tree.controller', () => ({
  default: {
    getInstance: () => mockController,
  },
}));

vi.mock('../EducationTypeItem.vue', () => ({
  default: {
    name: 'EducationTypeItem',
    template: '<div class="education-type-item"></div>',
  },
}));

vi.mock(
  '@/modules/EducationClassification/subComponent/EducationTree/AddEducationTypeDialog.vue',
  () => ({
    default: {
      name: 'AddEducationTypeDialog',
      template: '<div class="add-type-dialog"></div>',
    },
  }),
);

vi.mock('@/modules/EducationClassification/subComponent/EducationTree/AddBranchDialog.vue', () => ({
  default: {
    name: 'AddBranchDialog',
    template: '<div class="add-branch-dialog"></div>',
  },
}));

describe('EducationClassificationTree', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = () =>
    mount(EducationClassificationTree, {
      global: {
        plugins: [i18n],
        stubs: {
          'router-link': true,
          'router-view': true,
        },
      },
    });

  it('renders correctly', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.education-tree').exists()).toBe(true);
    expect(wrapper.find('.left-panel').exists()).toBe(true);
    expect(wrapper.find('.right-panel').exists()).toBe(true);
  });

  it('shows empty state when no data', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.empty-state').exists()).toBe(true);
    expect(wrapper.find('.empty-title').text()).toBe('No Education Tree Yet');
  });

  it('calls fetchList on mounted', () => {
    const controller = EducationTreeController.getInstance();
    mountComponent();
    expect(controller.fetchList).toHaveBeenCalled();
  });

  it('opens add type dialog when add button is clicked', async () => {
    const wrapper = mountComponent();
    await wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.find('.add-type-dialog').exists()).toBe(true);
  });

  it('updates type dialog visibility on child emit', async () => {
    const wrapper = mountComponent();
    await wrapper.find('.btn-primary').trigger('click');
    const typeDialog = wrapper.getComponent({ name: 'AddEducationTypeDialog' });

    await typeDialog.vm.$emit('update:visible', false);
    expect(wrapper.find('.add-type-dialog').exists()).toBe(false);
  });

  it('opens add branch dialog when branch button is clicked', async () => {
    mockController.listState.value = {
      data: [
        {
          id: 1,
          number_of_branches: 2,
          branches: [{ branch_id: 1, branch_title: 'Root', branches: [] }],
        },
      ],
    };

    const wrapper = mountComponent();
    await flushPromises();
    const typeItem = wrapper.getComponent({ name: 'EducationTypeItem' });
    await typeItem.vm.$emit('add-branch', { node: { id: '1' }, level: 1 });

    expect(wrapper.find('.add-branch-dialog').exists()).toBe(true);
  });
});
