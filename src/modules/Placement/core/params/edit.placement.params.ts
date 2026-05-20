import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for adding a new employee
 */
export default class EditplacementParams implements Params {
  public id: number;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: false },
  });

  constructor(data: { id: number }) {
    this.id = data.id;
  }

  toMap(): { [p: string]: any } {
    return {
      id: this.id,
    };
  }

  validate() {
    return EditplacementParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditplacementParams.validation.validateOrThrow(this);
  }
}
