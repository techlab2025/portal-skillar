import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class PlacementEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_placement_jobs');
  readonly show = this.url('show_placement_job');
  readonly store = this.url('store_placement_job');
  readonly update = this.url('update_placement_job');
  readonly delete = this.url('delete_placement_job');
}
