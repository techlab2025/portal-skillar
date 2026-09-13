import { computed, ref } from 'vue';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import CancelGenerateQuestionsParams from '../../core/params/cancel.generate.questions.params';
import GenerateDocumentIndexParams from '../../core/params/generate.document.index.params';
import DocumentIndexPatchController from './document.index.patch.controller';

export default class DocumentIndexProgressController {
  private static instance: DocumentIndexProgressController;
  private readonly patchController: DocumentIndexPatchController;
  private startRequestId = 0;

  public readonly startingDocumentId = ref<number>();
  public readonly activeQuestionBatchId = ref<number>();
  public readonly manualProgressActive = ref(false);
  public readonly generationDialogVisible = ref(false);
  public readonly cancelConfirmationVisible = ref(false);
  public readonly isCancelling = ref(false);
  public readonly hasActiveIndexing = computed(
    () =>
      this.startingDocumentId.value != null ||
      this.activeQuestionBatchId.value != null ||
      this.manualProgressActive.value,
  );

  private constructor() {
    this.patchController = DocumentIndexPatchController.getInstance();
  }

  static getInstance(): DocumentIndexProgressController {
    if (!DocumentIndexProgressController.instance) {
      DocumentIndexProgressController.instance = new DocumentIndexProgressController();
    }
    return DocumentIndexProgressController.instance;
  }

  async startIndex(documentId: number): Promise<boolean> {
    if (this.hasActiveIndexing.value) return false;

    const requestId = ++this.startRequestId;
    this.startingDocumentId.value = documentId;
    this.activeQuestionBatchId.value = undefined;
    this.manualProgressActive.value = false;
    this.cancelConfirmationVisible.value = false;
    this.generationDialogVisible.value = true;

    const result = await this.patchController.startIndex(
      new GenerateDocumentIndexParams(documentId, false),
    );
    if (requestId !== this.startRequestId) return false;
    if (!(result instanceof DataSuccess) || !result.data) {
      this.finishStartRequest();
      return false;
    }

    this.startingDocumentId.value = undefined;
    this.activeQuestionBatchId.value = result.data;
    this.manualProgressActive.value = true;
    return true;
  }

  openProgress(questionBatchId?: number) {
    if (questionBatchId != null && questionBatchId > 0) {
      this.activeQuestionBatchId.value = questionBatchId;
    }
    if (this.startingDocumentId.value == null) this.manualProgressActive.value = true;
    this.cancelConfirmationVisible.value = false;
    this.generationDialogVisible.value = true;
  }

  openActiveProgress() {
    if (this.hasActiveIndexing.value) this.openProgress();
  }

  minimize() {
    this.generationDialogVisible.value = false;
    this.cancelConfirmationVisible.value = false;
  }

  requestCancel() {
    this.cancelConfirmationVisible.value = true;
  }

  keepIndexing() {
    this.cancelConfirmationVisible.value = false;
  }

  async confirmCancel(): Promise<boolean> {
    const questionBatchId = this.activeQuestionBatchId.value;
    if (questionBatchId == null || this.isCancelling.value) return false;

    this.isCancelling.value = true;
    try {
      const result = await this.patchController.cancelGeneration(
        new CancelGenerateQuestionsParams(questionBatchId),
      );
      if (!(result instanceof DataSuccess)) return false;

      this.startRequestId += 1;
      this.finishStartRequest();
      return true;
    } finally {
      this.isCancelling.value = false;
    }
  }

  reset() {
    this.startRequestId += 1;
    this.finishStartRequest();
  }

  private finishStartRequest() {
    this.startingDocumentId.value = undefined;
    this.activeQuestionBatchId.value = undefined;
    this.manualProgressActive.value = false;
    this.generationDialogVisible.value = false;
    this.cancelConfirmationVisible.value = false;
  }
}
