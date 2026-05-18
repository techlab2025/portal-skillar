import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('../../presentation/controllers/EducationSkills/education.skills.controller', () => ({
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

vi.mock('@/modules/Skills/presentation/controllers/skills.controller', () => ({
  default: {
    getInstance: () => ({
      listState: { value: null },
      fetchList: vi.fn(),
    }),
  },
}));

vi.mock('../../core/params/EducationSkills/add.education.subject.skills.params', () => ({
  default: class {},
}));
vi.mock('../../core/params/EducationSkills/edit.education.subject.skills.params', () => ({
  default: class {},
}));
vi.mock('../../core/params/EducationSkills/delete.education.subject.skills.params', () => ({
  default: class {},
}));
vi.mock('../../core/params/EducationSkills/index.education.subject.skills.params', () => ({
  default: class {},
}));
vi.mock('../../core/params/EducationSkills/show.education.subject.skills.params', () => ({
  default: class {},
}));
vi.mock('../../core/params/EducationSkills/skill.params', () => ({
  default: class {},
}));
vi.mock('@/modules/Skills/core/params/index.skills.params', () => ({
  default: class {},
}));

import SkillsDialog from '../SkillsDialog.vue';

describe('SkillsDialog', () => {
  const defaultProps = {
    visible: true,
    level: 1,
    branchName: 'Test Branch',
    branchId: 123,
  };

  it('renders without crashing', () => {
    const wrapper = mount(SkillsDialog, {
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
          UpdatedCustomInputSelect: true,
          EditeIcon: true,
          IndexDelete: true,
        },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders dialog when visible', () => {
    const wrapper = mount(SkillsDialog, {
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
          UpdatedCustomInputSelect: true,
          EditeIcon: true,
          IndexDelete: true,
        },
      },
    });
    expect(wrapper.find('.dialog-stub').exists()).toBe(true);
  });
});
