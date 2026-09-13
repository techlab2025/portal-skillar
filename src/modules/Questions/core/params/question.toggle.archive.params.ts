import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ToggleQuestionArchiveParams implements Params {
  public readonly id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true, min: 1 },
  });

  constructor(id: number) {
    this.id = id;
  }

  toMap(): Record<string, number> {
    return { question_id: this.id };
  }

  validate() {
    return ToggleQuestionArchiveParams.validation.validate(this);
  }

  validateOrThrow() {
    return ToggleQuestionArchiveParams.validation.validateOrThrow(this);
  }
}
