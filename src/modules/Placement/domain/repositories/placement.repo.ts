import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type Params from '@/base/Core/Params/params';
import type placementModel from '../../core/models/placement.model';

/**
 * Interface for Employee Repository
 */
export default interface IplacementRepo {
  index(params?: Params): Promise<DataState<placementModel[]>>;
  show(params: Params): Promise<DataState<placementModel>>;
  create(params: Params): Promise<DataState<placementModel>>;
  update(params: Params): Promise<DataState<placementModel>>;
  delete(params: Params): Promise<DataState<void>>;
}
