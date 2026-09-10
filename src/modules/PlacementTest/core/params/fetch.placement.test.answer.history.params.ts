import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class FetchPlacementTestAnswerHistoryParams implements Params {
  public readonly placementTestId: number;
  public readonly studentExamAnswerId: number;

  static readonly validation = new ClassValidation().setRules({
    placementTestId: { required: true },
    studentExamAnswerId: { required: true },
  });

  constructor(placementTestId: number, studentExamAnswerId: number) {
    this.placementTestId = placementTestId;
    this.studentExamAnswerId = studentExamAnswerId;
  }

  toMap(): Record<string, number> {
    return {
      placement_test_id: this.placementTestId,
      student_exam_answer_id: this.studentExamAnswerId,
    };
  }

  validate() {
    return FetchPlacementTestAnswerHistoryParams.validation.validate(this);
  }

  validateOrThrow() {
    return FetchPlacementTestAnswerHistoryParams.validation.validateOrThrow(this);
  }
}
