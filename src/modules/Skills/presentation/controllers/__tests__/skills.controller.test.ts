import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import DeleteSkillsParams from '../../../core/params/delete.skills.params';
import SkillsController from '../skills.controller';

const { repositoryDeleteMock, toastErrorMock } = vi.hoisted(() => ({
  repositoryDeleteMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock('../../../data/repositories/skills.repository', () => ({
  default: {
    getInstance: () => ({ delete: repositoryDeleteMock }),
  },
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    hideLoading: vi.fn(),
    toastError: toastErrorMock,
  },
}));

describe('SkillsController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the backend message when an assigned skill cannot be deleted', async () => {
    const backendMessage = 'This skill is assigned to one or more subjects and cannot be deleted';
    repositoryDeleteMock.mockResolvedValueOnce(
      new DataFailed({ error: new ErrorModel(backendMessage, ErrorType.validation) }),
    );

    await SkillsController.getInstance().delete(new DeleteSkillsParams(7));

    expect(toastErrorMock).toHaveBeenCalledOnce();
    expect(toastErrorMock).toHaveBeenCalledWith(backendMessage);
  });

  it('does not show an error after a successful deletion', async () => {
    repositoryDeleteMock.mockResolvedValueOnce(new DataSuccess<void>({ message: 'Deleted' }));

    await SkillsController.getInstance().delete(new DeleteSkillsParams(7));

    expect(toastErrorMock).not.toHaveBeenCalled();
  });
});
