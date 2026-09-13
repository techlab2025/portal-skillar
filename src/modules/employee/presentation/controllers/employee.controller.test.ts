import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import EmployeeController from './employee.controller';

const mockSuperCreate = vi.hoisted(() => vi.fn());

vi.mock('@/base/Presentation/Controller/baseController', () => ({
  default: class {
    create(...args: unknown[]) {
      return mockSuperCreate(...args);
    }
  },
}));

vi.mock('../../data/repositories/employee.repository', () => ({
  default: { getInstance: () => ({}) },
}));

describe('EmployeeController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    mockSuperCreate.mockResolvedValue(new DataSuccess({ data: null }));
  });

  it('returns create success without navigating away from the feedback dialog', async () => {
    const params = { validate: vi.fn(), validateOrThrow: vi.fn(), toMap: vi.fn() };

    const result = await EmployeeController.getInstance().create(
      params,
      undefined,
      '/employees/add',
    );

    expect(mockSuperCreate).toHaveBeenCalledWith(params, { useJson: true });
    expect(result).toBeInstanceOf(DataSuccess);
  });
});
