import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import PlacementModel from '../../core/models/placement.model';
import PlacementApiService from '../api/placement.api-service';

export default class PlacementRepository extends BaseRepository<
  PlacementModel,
  PlacementModel[]
> {
  private static instance: PlacementRepository;

  protected get apiService() {
    return PlacementApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): PlacementModel {
    return PlacementModel.example;
  }

  protected get mockList(): PlacementModel[] {
    return [
      PlacementModel.example,
      {
        ...PlacementModel.example,
        id: 2,
      },
      {
        ...PlacementModel.example,
        id: 3,
      },
      {
        ...PlacementModel.example,
        id: 4,
      },
    ];
  }

  static getInstance(): PlacementRepository {
    if (!PlacementRepository.instance) {
      PlacementRepository.instance = new PlacementRepository();
    }
    return PlacementRepository.instance;
  }

  protected parseItem(data: any): PlacementModel {
    return PlacementModel.fromJson(data);
  }

  protected parseList(data: any): PlacementModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: PlacementModel[], item) => {
      try {
        if (item != null) {
          acc.push(PlacementModel.fromJson(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
