import { describe, expect, it, vi } from 'vitest';
import type Params from '@/base/Core/Params/params';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import type BaseRepository from '@/base/Domain/Repositories/baseRepository';
import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
import BaseController from '../baseController';

class TestController extends BaseController<unknown> {
  constructor(private readonly testRepository: BaseRepository<unknown, unknown[]>) {
    super();
  }

  protected get repository(): BaseRepository<unknown, unknown[]> {
    return this.testRepository;
  }

  protected get config() {
    return {
      showSuccessTosat: true,
      showErrorTosat: true,
    };
  }
}

describe('BaseController.update', () => {
  it('skips params validation when applyValidation is false', async () => {
    const result = new DataSuccess({ data: null });
    const update = vi.fn().mockResolvedValue(result);
    const repository = { update } as unknown as BaseRepository<unknown, unknown[]>;
    const controller = new TestController(repository);
    const params: Params = {
      toMap: () => ({}),
      validate: vi.fn(() => ({ isValid: false, errors: [] })),
      validateOrThrow: vi.fn(),
    };

    expect(await controller.update(params, undefined, undefined, false)).toBe(result);
    expect(params.validate).not.toHaveBeenCalled();
    expect(params.validateOrThrow).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledOnce();
  });

  it('shows success toast when the API error message reports success', async () => {
    const result = new DataFailed({
      error: new ErrorModel('Saved Successfully', ErrorType.serviceSide),
    });
    const create = vi.fn().mockResolvedValue(result);
    const repository = { create } as unknown as BaseRepository<unknown, unknown[]>;
    const controller = new TestController(repository);
    const toastSuccess = vi.spyOn(dialogManager, 'toastSuccess');
    const toastError = vi.spyOn(dialogManager, 'toastError');
    const params: Params = {
      toMap: () => ({}),
      validate: vi.fn(() => ({ isValid: true, errors: [] })),
      validateOrThrow: vi.fn(),
    };

    await controller.create(params, undefined, undefined, false);

    expect(toastSuccess).toHaveBeenCalledWith('Saved Successfully');
    expect(toastError).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
