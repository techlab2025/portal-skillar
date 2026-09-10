import { describe, expect, it } from 'vitest';
import FetchPlacementTestAnswerHistoryParams from '../fetch.placement.test.answer.history.params';

describe('FetchPlacementTestAnswerHistoryParams', () => {
  it('maps placement and student answer IDs to the endpoint body', () => {
    const params = new FetchPlacementTestAnswerHistoryParams(80, 532);

    expect(params.toMap()).toEqual({
      placement_test_id: 80,
      student_exam_answer_id: 532,
    });
    expect(params.validate().isValid).toBe(true);
  });
});
