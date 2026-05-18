import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('../../presentation/controllers/EducationPricing/education.pricing.controller', () => ({
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

vi.mock('../../core/params/EducationPricing/add.education.subject.pricing.params', () => ({
  default: class {},
}));
vi.mock('../../core/params/EducationPricing/edit.education.subject.pricing.params', () => ({
  default: class {},
}));
vi.mock('../../core/params/EducationPricing/delete.education.subject.pricing.params', () => ({
  default: class {},
}));
vi.mock('../../core/params/EducationPricing/index.education.subject.pricing.params', () => ({
  default: class {},
}));
vi.mock('../../core/params/EducationPricing/show.education.subject.pricing.params', () => ({
  default: class {},
}));

import PricingDialog from '../PricingDialog.vue';

describe('PricingDialog', () => {
  const defaultProps = {
    visible: true,
    level: 1,
    branchName: 'Test Branch',
    branchId: 123,
  };

  it('renders without crashing', () => {
    const wrapper = mount(PricingDialog, {
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
          PricingDIalogIcon: true,
          EditeIcon: true,
          IndexDelete: true,
        },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders dialog when visible', () => {
    const wrapper = mount(PricingDialog, {
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
          PricingDIalogIcon: true,
          EditeIcon: true,
          IndexDelete: true,
        },
      },
    });
    expect(wrapper.find('.dialog-stub').exists()).toBe(true);
  });
});
