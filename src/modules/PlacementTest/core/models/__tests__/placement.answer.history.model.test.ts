import { describe, expect, it } from 'vitest';
import PlacementAnswerHistoryModel from '../placement.answer.history.model';

describe('PlacementAnswerHistoryModel', () => {
  it('maps the answer history response and all history-log fields', () => {
    const model = PlacementAnswerHistoryModel.fromJson({
      student_exam_answer_id: 532,
      placement_test_id: 80,
      history_log: [
        {
          id: 171,
          action: 'select',
          answer_id: { id: 2098, title: '1015' },
          answer_text: '1015',
          attachments: [],
          visit_number: 1,
          duration_seconds: 2,
          answer_changes_count: 1,
          selected_at: '2026-09-09T09:50:33.000000Z',
          selected_at_formatted: '09:50:33',
        },
      ],
    });

    expect(model.studentExamAnswerId).toBe(532);
    expect(model.placementTestId).toBe(80);
    expect(model.historyLog[0]).toMatchObject({
      id: 171,
      action: 'select',
      answerText: '1015',
      attachments: [],
      visitNumber: 1,
      durationSeconds: 2,
      answerChangesCount: 1,
      selectedAt: '2026-09-09T09:50:33.000000Z',
      selectedAtFormatted: '09:50:33',
    });
    expect(model.historyLog[0]?.answer?.title).toBe('1015');
  });
});
