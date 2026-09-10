import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class CancelGenerateQuestionsParams implements Params {
  public readonly questionBatchId: number;

  public static readonly validation = new ClassValidation().setRules({
    questionBatchId: { required: true, min: 1 },
  });

  constructor(questionBatchId: number) {
    this.questionBatchId = questionBatchId;
  }

  toMap(): Record<string, number> {
    return { question_batch_id: this.questionBatchId };
  }

  validate() {
    return CancelGenerateQuestionsParams.validation.validate(this);
  }

  validateOrThrow() {
    return CancelGenerateQuestionsParams.validation.validateOrThrow(this);
  }
}
