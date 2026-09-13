import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlacementsAdd from '../PlacementsAdd.vue';

const { createPlacement, fetchOne, resetItem } = vi.hoisted(() => ({
  createPlacement: vi.fn(),
  fetchOne: vi.fn(),
  resetItem: vi.fn(),
}));

vi.mock('../../controllers/placement.controller', () => ({
  default: {
    getInstance: () => ({
      create: createPlacement,
      fetchOne,
      resetItem,
      errorMessage: { value: '' },
    }),
  },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/placement-configuration', params: {} }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe('PlacementsAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts clean without fetching a placement using a missing route id', () => {
    const wrapper = shallowMount(PlacementsAdd, {
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    expect(resetItem).toHaveBeenCalledOnce();
    expect(fetchOne).not.toHaveBeenCalled();
    expect(wrapper.find('.error-toast').exists()).toBe(false);
  });
});
