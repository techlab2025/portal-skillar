import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

const startIndex = vi.fn();
const cancelGeneration = vi.fn();

vi.mock('../document.index.patch.controller', () => ({
  default: {
    getInstance: () => ({ startIndex, cancelGeneration }),
  },
}));

import DocumentIndexProgressController from '../document.index.progress.controller';

describe('DocumentIndexProgressController', () => {
  const controller = DocumentIndexProgressController.getInstance();

  beforeEach(() => {
    vi.clearAllMocks();
    controller.reset();
    cancelGeneration.mockResolvedValue(new DataSuccess<void>({}));
  });

  it('keeps progress active with the question batch id returned by start_document_index', async () => {
    let resolveStart: ((result: DataSuccess<number>) => void) | undefined;
    startIndex.mockReturnValueOnce(
      new Promise<DataSuccess<number>>((resolve) => {
        resolveStart = resolve;
      }),
    );

    const request = controller.startIndex(17);

    expect(startIndex.mock.calls[0]?.[0].toMap()).toEqual({
      document_id: 17,
      auto_generate: false,
    });
    expect(controller.generationDialogVisible.value).toBe(true);
    expect(controller.hasActiveIndexing.value).toBe(true);

    controller.minimize();
    expect(controller.generationDialogVisible.value).toBe(false);
    expect(controller.hasActiveIndexing.value).toBe(true);

    controller.openActiveProgress();
    expect(controller.generationDialogVisible.value).toBe(true);

    resolveStart?.(new DataSuccess({ data: 12 }));

    await expect(request).resolves.toBe(true);
    expect(controller.generationDialogVisible.value).toBe(true);
    expect(controller.hasActiveIndexing.value).toBe(true);
    expect(controller.startingDocumentId.value).toBeUndefined();
    expect(controller.activeQuestionBatchId.value).toBe(12);
  });

  it('calls cancel_generate_questions with the id returned by the start request', async () => {
    startIndex.mockResolvedValueOnce(new DataSuccess({ data: 42 }));

    await controller.startIndex(17);
    controller.requestCancel();
    await controller.confirmCancel();

    expect(cancelGeneration).toHaveBeenCalledOnce();
    expect(cancelGeneration.mock.calls[0]?.[0].toMap()).toEqual({ question_batch_id: 42 });
    expect(controller.generationDialogVisible.value).toBe(false);
    expect(controller.cancelConfirmationVisible.value).toBe(false);
    expect(controller.hasActiveIndexing.value).toBe(false);
  });

  it('cancels a pending transaction using its question batch id', async () => {
    controller.openProgress(42);

    expect(controller.generationDialogVisible.value).toBe(true);
    expect(controller.hasActiveIndexing.value).toBe(true);
    expect(startIndex).not.toHaveBeenCalled();

    controller.minimize();
    expect(controller.generationDialogVisible.value).toBe(false);
    expect(controller.hasActiveIndexing.value).toBe(true);

    controller.openActiveProgress();
    expect(controller.generationDialogVisible.value).toBe(true);

    await controller.confirmCancel();
    expect(cancelGeneration.mock.calls[0]?.[0].toMap()).toEqual({ question_batch_id: 42 });
    expect(controller.hasActiveIndexing.value).toBe(false);
  });

  it('keeps the progress dialog open when backend cancellation fails', async () => {
    cancelGeneration.mockResolvedValueOnce({ hasError: true });
    controller.openProgress(42);
    controller.requestCancel();

    await expect(controller.confirmCancel()).resolves.toBe(false);

    expect(controller.hasActiveIndexing.value).toBe(true);
    expect(controller.generationDialogVisible.value).toBe(true);
    expect(controller.cancelConfirmationVisible.value).toBe(true);
  });
});
