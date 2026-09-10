import HistoryLogModel from './subModels/history.log.model';

interface PlacementAnswerHistoryPayload {
  student_exam_answer_id?: number;
  placement_test_id?: number;
  history_log?: Parameters<typeof HistoryLogModel.fromJson>[0][];
}

export default class PlacementAnswerHistoryModel {
  public readonly studentExamAnswerId?: number;
  public readonly placementTestId?: number;
  public readonly historyLog: HistoryLogModel[];

  constructor(data: {
    studentExamAnswerId?: number;
    placementTestId?: number;
    historyLog?: HistoryLogModel[];
  }) {
    this.studentExamAnswerId = data.studentExamAnswerId;
    this.placementTestId = data.placementTestId;
    this.historyLog = data.historyLog ?? [];
    Object.freeze(this);
  }

  static fromJson(json: PlacementAnswerHistoryPayload): PlacementAnswerHistoryModel {
    if (!json) {
      throw new Error('Cannot create PlacementAnswerHistoryModel from null or undefined');
    }

    return new PlacementAnswerHistoryModel({
      studentExamAnswerId: json.student_exam_answer_id,
      placementTestId: json.placement_test_id,
      historyLog: Array.isArray(json.history_log)
        ? json.history_log.map((log) => HistoryLogModel.fromJson(log))
        : [],
    });
  }

  static example = new PlacementAnswerHistoryModel({
    studentExamAnswerId: 532,
    placementTestId: 80,
    historyLog: [HistoryLogModel.example],
  });
}
