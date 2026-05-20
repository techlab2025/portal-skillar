import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import placementModel from '../../core/models/placement.model';
import ShowplacementModel from '../../core/models/show.placement.model';
import PlacementApiService from '../api/placement.api-service';

export default class placementRepository extends BaseRepository<
  ShowplacementModel,
  placementModel[]
> {
  private static instance: placementRepository;

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

  protected get mockItem(): ShowplacementModel {
    return ShowplacementModel.example;
  }

  protected get mockList(): placementModel[] {
    return [
      placementModel.example,
      {
        ...placementModel.example,
        id: 2,
      },
      {
        ...placementModel.example,
        id: 3,
      },
      {
        ...placementModel.example,
        id: 4,
      },
    ];
  }

  static getInstance(): placementRepository {
    if (!placementRepository.instance) {
      placementRepository.instance = new placementRepository();
    }
    return placementRepository.instance;
  }

  protected parseItem(data: any): ShowplacementModel {
    return ShowplacementModel.fromJson(data);
  }

  protected parseList(data: any): placementModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: placementModel[], item) => {
      try {
        if (item != null) {
          acc.push(placementModel.fromJson(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
