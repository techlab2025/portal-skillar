import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import CancelGenerateQuestionsParams from '../../../core/params/cancel.generate.questions.params';
import GenerateDocumentIndexParams from '../../../core/params/generate.document.index.params';
import RefreshDocumentIndexStatusParams from '../../../core/params/refresh.document.index.status.params';
import DocumentIndexStatusModel from '../../../core/models/document.index.status.model';

const startIndex = vi.fn();
const cancelGeneration = vi.fn();
const refreshStatus = vi.fn();

vi.mock('../../../data/repositories/document.index.patch.repository', () => ({
  default: {
    getInstance: () => ({ startIndex, cancelGeneration, refreshStatus }),
  },
}));

import DocumentIndexPatchController from '../document.index.patch.controller';

describe('DocumentIndexPatchController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates start and status refresh with controller options', async () => {
    startIndex.mockResolvedValue(new DataSuccess({ data: 12 }));
    cancelGeneration.mockResolvedValue(new DataSuccess<void>({}));
    refreshStatus.mockResolvedValue(
      new DataSuccess({
        data: DocumentIndexStatusModel.fromJson({ status: 2, is_apply: true }),
      }),
    );
    const startParams = new GenerateDocumentIndexParams(17);
    const cancelParams = new CancelGenerateQuestionsParams(42);
    const refreshParams = new RefreshDocumentIndexStatusParams('TXN-012');

    await DocumentIndexPatchController.getInstance().startIndex(startParams);
    await DocumentIndexPatchController.getInstance().cancelGeneration(cancelParams);
    await DocumentIndexPatchController.getInstance().refreshStatus(refreshParams);

    const options = expect.objectContaining({
      enableRetry: false,
      retryOptions: { maxAttempts: 2 },
    });
    expect(startIndex).toHaveBeenCalledWith(startParams, options);
    expect(cancelGeneration).toHaveBeenCalledWith(cancelParams, options);
    expect(refreshStatus).toHaveBeenCalledWith(refreshParams, options);
  });
});
