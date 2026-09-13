import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/modules/about/core/params/translation.params';

export default class AddSubjectItemParams implements Params {
  public translations: TranslationParams;
  public stage_id: number;
  public parent_id?: number;
  public image?: string;
  public isDraft: boolean;

  public static readonly validation = new ClassValidation().setRules({
    translations: { required: true },
  });

  constructor(data: {
    translations: TranslationParams;
    stage_id: number;
    parent_id?: number;
    image?: string;
    isDraft?: boolean;
  }) {
    this.translations = data.translations;
    this.stage_id = data.stage_id;
    this.parent_id = data.parent_id;
    this.image = data.image;
    this.isDraft = data.isDraft ?? false;
  }

  toMap(): Record<string, unknown> {
    const map: Record<string, unknown> = {
      translations: this.translations.toMap(),
      education_classification_branch_id: this.stage_id,
    };
    if (this.parent_id) map.parent_id = this.parent_id;
    if (this.image) map.image = this.image;
    map.is_draft = this.isDraft ? 1 : 0;
    return map;
  }

  validate() {
    return AddSubjectItemParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddSubjectItemParams.validation.validateOrThrow(this);
  }
}
