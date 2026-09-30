export type LocalizedAdviceField = Record<string, string> | Array<Record<string, string>> | string;

export interface AdviceCategoryReference {
  id: number;
  title: string;
}
export interface CreatedBy {
  id: number;
  name: string;
}

export default class AdviceModel {
  public readonly id: number;
  public readonly title: LocalizedAdviceField;
  public readonly description: LocalizedAdviceField;
  public readonly adviceCategory: AdviceCategoryReference | null;
  public readonly createdAt: string | null;
  public readonly createdBy: CreatedBy;

  constructor(data: {
    id: number;
    title: LocalizedAdviceField;
    description: LocalizedAdviceField;
    adviceCategory?: AdviceCategoryReference | null;
    createdAt: string | null;
    createdBy: CreatedBy;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.adviceCategory = data.adviceCategory ?? null;
    this.createdAt = data.createdAt;
    this.createdBy = data.createdBy;
    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): AdviceModel {
    const category = json.advice_category ?? json.category;
    const categoryId = Number(
      json.advice_category_id ??
        (category && typeof category === 'object'
          ? (category as Record<string, unknown>).id
          : undefined),
    );
    return new AdviceModel({
      id: Number(json.id ?? json.advice_id),
      title: (json.title ?? '') as LocalizedAdviceField,
      description: (json.description ?? '') as LocalizedAdviceField,
      adviceCategory:
        Number.isFinite(categoryId) && categoryId > 0
          ? {
              id: categoryId,
              title:
                category && typeof category === 'object'
                  ? String((category as Record<string, unknown>).title ?? '')
                  : '',
            }
          : null,
      createdAt: json.created_at ? json.created_at! : '',
      createdBy: json.created_by,
    });
  }

  static readonly example = new AdviceModel({
    id: 1,
    title: 'Study consistently',
    description: 'Review a small amount every day.',
    adviceCategory: { id: 1, title: 'Study planning' },
  });
}
