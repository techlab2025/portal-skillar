import TitleInterface from '@/base/Data/Models/titleInterface';

export default class HistoryLogModel {
  public readonly id?: number;
  public readonly action?: string;
  public readonly answer?: TitleInterface<number>;
  public readonly answerText?: string;
  public readonly attachments?: unknown[];
  public readonly visitNumber?: number;
  public readonly durationSeconds?: number;
  public readonly answerChangesCount?: number;
  public readonly selectedAt?: string;
  public readonly selectedAtFormatted?: string;

  constructor(data: {
    id?: number;
    action?: string;
    answer?: TitleInterface<number>;
    answerText?: string;
    attachments?: unknown[];
    visitNumber?: number;
    durationSeconds?: number;
    answerChangesCount?: number;
    selectedAt?: string;
    selectedAtFormatted?: string;
  }) {
    this.id = data.id;
    this.action = data.action;
    this.answer = data.answer;
    this.answerText = data.answerText;
    this.attachments = data.attachments;
    this.visitNumber = data.visitNumber;
    this.durationSeconds = data.durationSeconds;
    this.answerChangesCount = data.answerChangesCount;
    this.selectedAt = data.selectedAt;
    this.selectedAtFormatted = data.selectedAtFormatted;
    Object.freeze(this);
  }

  static fromJson(json: any): HistoryLogModel {
    if (!json) {
      throw new Error('Cannot create HistoryLogModel from null or undefined');
    }

    return new HistoryLogModel({
      id: json.id,
      action: json.action,
      answer:
        typeof json.answer_id?.id === 'number'
          ? new TitleInterface({ id: json.answer_id.id, title: json.answer_id.title })
          : undefined,
      answerText: json.answer_text,
      attachments: Array.isArray(json.attachments) ? json.attachments : [],
      visitNumber: json.visit_number,
      durationSeconds: json.duration_seconds,
      answerChangesCount: json.answer_changes_count,
      selectedAt: json.selected_at,
      selectedAtFormatted: json.selected_at_formatted,
    });
  }

  static example = new HistoryLogModel({
    id: 171,
    action: 'select',
    answer: new TitleInterface({ id: 2098, title: '1015' }),
    answerText: '1015',
    attachments: [],
    visitNumber: 1,
    durationSeconds: 2,
    answerChangesCount: 1,
    selectedAt: '2026-09-09T09:50:33.000000Z',
    selectedAtFormatted: '09:50:33',
  });
}
