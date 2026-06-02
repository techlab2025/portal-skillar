import AttachmentModel from './attachment.model';

export default class SolutionHintModel {
  public readonly id?: number;
  public readonly hint: string;
  public readonly attachments: AttachmentModel[];
  public readonly image?: string;

  constructor(data: { id?: number; hint?: string; attachments?: AttachmentModel[]; image?: string }) {
    this.id = data.id;
    this.hint = data.hint || '';
    this.attachments = data.attachments || [];
    this.image = data.image;
    Object.freeze(this);
  }

  static fromJson(json: any): SolutionHintModel {
    if (!json) {
      throw new Error('Cannot create AnswerModel from null or undefined');
    }

    return new SolutionHintModel({
      id: json.question_answer_hint_id,
      hint: json.text,
      attachments: json.attachments,
      image: json.image,
    });
  }

  static example: SolutionHintModel = new SolutionHintModel({
    id: 1,
    hint: 'Hint',
    attachments: [AttachmentModel.example],
    image: 'image',
  });
}
