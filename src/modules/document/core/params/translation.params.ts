import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DocumentTranslationParams implements Params {
  public description: Record<string, string>;
  public title: Record<string, string>;

  private static readonly hasTextValue = (value: Record<string, string>) =>
    Object.values(value || {}).some((text) => text.trim().length > 0);

  public static readonly validation = new ClassValidation().setRules({
    title: {
      required: true,
      custom: (value) => DocumentTranslationParams.hasTextValue(value) || 'title is required',
    },
    description: {
      required: true,
      custom: (value) => DocumentTranslationParams.hasTextValue(value) || 'description is required',
    },
  });

  constructor(data: { description: Record<string, string>; title: Record<string, string> }) {
    this.description = data.description;
    this.title = data.title;
  }

  toMap(): Record<string, unknown> {
    return {
      description: this.description,
      title: this.title,
    };
  }

  validate() {
    return DocumentTranslationParams.validation.validate(this);
  }

  validateOrThrow() {
    return DocumentTranslationParams.validation.validateOrThrow(this);
  }
}
