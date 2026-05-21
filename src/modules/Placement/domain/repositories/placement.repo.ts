import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type Params from '@/base/Core/Params/params';
import type PlacementModel from '../../core/models/placement.model';

/**
 * Interface for Employee Repository
 */
export default interface IPlacementRepo {
  index(params?: Params): Promise<DataState<PlacementModel[]>>;
  show(params: Params): Promise<DataState<PlacementModel>>;
  create(params: Params): Promise<DataState<PlacementModel>>;
  update(params: Params): Promise<DataState<PlacementModel>>;
  delete(params: Params): Promise<DataState<void>>;
}
