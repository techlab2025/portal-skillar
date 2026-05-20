import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for adding a new employee
 */
export default class AddplacementParams implements Params {
  public title?: string;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: false },
  });

  constructor(data: { title?: string }) {
    this.title = data.title;
  }

  toMap(): { [p: string]: any } {
    return {
      title: this.title,
    };
  }

  validate() {
    return AddplacementParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddplacementParams.validation.validateOrThrow(this);
  }
}
