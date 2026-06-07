
export default class ArticleSubjectModel {
  public readonly id: string;
  public readonly e_c_branch_id: string;
  public readonly title: string;
  public readonly full_title: string;

  constructor(data: { id?: string; e_c_branch_id?: string; title?: string; full_title: string }) {
    this.id = data.id || '';
    this.e_c_branch_id = data.e_c_branch_id || '';
    this.title = data.title || '';
    this.full_title = data.full_title || '';
  }

  static fromJson(json: any): ArticleSubjectModel {
    if (!json) return new ArticleSubjectModel({});
    return new ArticleSubjectModel({
      id: json.id ?? '',
      e_c_branch_id: json.e_c_branch_id ?? '',
      title: json.title ?? '',
      full_title: json.full_title ?? '',
    });
  }

  static example = new ArticleSubjectModel({
    id: '',
    e_c_branch_id: '',
    title: '',
    full_title: '',
  });

  static example2 = new ArticleSubjectModel({
    id: '',
    e_c_branch_id: '',
    title: '',
    full_title: '',
  });

  static example3 = new ArticleSubjectModel({
    id: '',
    e_c_branch_id: '',
    title: '',
    full_title: '',
  });
}
