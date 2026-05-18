import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('../../presentation/controllers/EducationTopics/education.topics.controller', () => ({
  default: {
    getInstance: () => ({
      listState: { value: null },
      fetchList: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      errorMessage: { value: '' },
    }),
  },
}));

vi.mock('../../core/params/EducationTopic/index.education.subject.topic.params', () => ({
  default: class {},
}));
vi.mock('../../core/params/EducationTopic/edit.education.subject.topic.params', () => ({
  default: class {},
}));
vi.mock('../../core/params/EducationTopic/add.education.subject.topic.params', () => ({
  default: class {},
}));
vi.mock('../../core/params/EducationTopic/delete.education.subject.topic.params', () => ({
  default: class {},
}));
vi.mock('../../core/params/EducationTopic/show.education.subject.topic.params', () => ({
  default: class {},
}));
vi.mock('@/modules/about/core/params/translation.params', () => ({
  default: class {},
}));

import TopicsDialog from '../TopicsDialog.vue';

describe('TopicsDialog', () => {
  const defaultProps = {
    visible: true,
    level: 1,
    branchName: 'Test Branch',
    branchId: 123,
  };

  it('renders without crashing', () => {
    const wrapper = mount(TopicsDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Dialog: {
            template: '<div v-if="visible"><slot name="header" /><slot /></div>',
            props: ['visible'],
          },
          DeleteDialog: true,
          MultiLangInput: true,
          EditeIcon: true,
          IndexDelete: true,
        },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders dialog when visible', () => {
    const wrapper = mount(TopicsDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Dialog: {
            template: '<div v-if="visible" class="dialog-stub"><slot /></div>',
            props: ['visible'],
          },
          DeleteDialog: true,
          MultiLangInput: true,
          EditeIcon: true,
          IndexDelete: true,
        },
      },
    });
    expect(wrapper.find('.dialog-stub').exists()).toBe(true);
  });
});
