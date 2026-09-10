import { describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import PlacementStudentProfileModel from '../../../core/models/placement.student.profile.model';
import PlacementAnswerHistoryModel from '../../../core/models/placement.answer.history.model';
import FetchPlacementTestAnswerHistoryParams from '../../../core/params/fetch.placement.test.answer.history.params';
import ShowPlacementStudentParams from '../../../core/params/show.placement.student.params';
import PlacementTestRepository from '../../../data/repositories/placement.test.repository';
import PlacementTestController from '../placement.test.controller';

describe('PlacementTestController', () => {
  it('stores student profile data in its dedicated state', async () => {
    const result = new DataSuccess({ data: PlacementStudentProfileModel.example });
    vi.spyOn(PlacementTestRepository.getInstance(), 'showStudentProfile').mockResolvedValue(result);
    const controller = PlacementTestController.getInstance();

    await controller.fetchStudentProfile(new ShowPlacementStudentParams(7));

    expect(controller.studentProfileState.value).toBeInstanceOf(DataSuccess);
    expect(controller.studentProfileState.value.data).toBe(PlacementStudentProfileModel.example);
  });

  it('fetches answer history through the placement repository', async () => {
    const result = new DataSuccess({ data: PlacementAnswerHistoryModel.example });
    vi.spyOn(PlacementTestRepository.getInstance(), 'fetchAnswerHistory').mockResolvedValue(result);
    const controller = PlacementTestController.getInstance();

    const history = await controller.fetchAnswerHistory(
      new FetchPlacementTestAnswerHistoryParams(80, 532),
    );

    expect(history).toBe(result);
  });
});
