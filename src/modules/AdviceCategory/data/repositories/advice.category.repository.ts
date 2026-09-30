import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import AdviceCategoryModel from '../../core/models/advice.category.model';
import AdviceCategoryApiService from '../api/advice.category.api-service';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type Params from '@/base/Core/Params/params';

export default class AdviceCategoryRepository extends BaseRepository<
  AdviceCategoryModel,
  AdviceCategoryModel[]
> {
  private static instance: AdviceCategoryRepository;

  protected get apiService() {
    return AdviceCategoryApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return { hasPagination: true, dataKey: 'data', paginationKey: 'meta' };
  }

  protected get mockItem() {
    return AdviceCategoryModel.example;
  }

  protected get mockList() {
    return [AdviceCategoryModel.example];
  }

  static getInstance() {
    if (!this.instance) this.instance = new AdviceCategoryRepository();
    return this.instance;
  }

  protected parseItem(data: unknown) {
    return AdviceCategoryModel.fromJson(data as Record<string, unknown>);
  }

  protected parseList(data: unknown) {
    return Array.isArray(data) ? data.map((item) => this.parseItem(item)) : [];
  }

    async toggleStatus(params: Params): Promise<DataState<AdviceCategoryModel>> {
    return this.executeCustom(
      () => this.apiService.toggleStatus(params),
      (data) => this.parseItem(data),
    );
  }
}
