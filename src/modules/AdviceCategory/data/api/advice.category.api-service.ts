import BaseApiService, { type ApiEndpoints, type ApiResponse } from '@/base/Data/ApiService/baseApiService';
import { AdviceCategoryEndpoints } from './advice.category.api.endpoints';
import type Params from '@/base/Core/Params/params';

export default class AdviceCategoryApiService extends BaseApiService {
  private static instance: AdviceCategoryApiService;
  private readonly featureEndpoints = new AdviceCategoryEndpoints();

  static getInstance() {
    if (!this.instance) this.instance = new AdviceCategoryApiService();
    return this.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.featureEndpoints.index,
      create: this.featureEndpoints.store,
      show: this.featureEndpoints.show,
      update: this.featureEndpoints.update,
      delete: this.featureEndpoints.delete,
    };
  }

  toggleStatus(params: Params): Promise<ApiResponse> {
    return this.customPost(this.featureEndpoints.status || '', params);
  }
}
