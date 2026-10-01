import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexDocumentTypeParams extends IndexParams {
  public isActive?: boolean;
  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    isActive?: boolean,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.isActive = isActive;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();
    data['is_active'] = this.isActive;
    return data;
  }
}
