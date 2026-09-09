import TitleInterface from "@/base/Data/Models/titleInterface";
import ShowQuestionsModel from "@/modules/Questions/core/models/show.questions.model";


export default class QuestionAnswerAnalysisModel {
  public readonly question?: ShowQuestionsModel;
  public readonly questionAnswerDuration?: number;
  public readonly hesitation?: number;
  public readonly id?: number;

  constructor(data: {
    question?: ShowQuestionsModel;
    questionAnswerDuration?: number;
    hesitation?: number;
    id?: number;

  }) {
    this.question = data.question;
    this.questionAnswerDuration = data.questionAnswerDuration;
    this.hesitation = data.hesitation;
    this.id = data.id;

  }

  static fromJson(json: any): QuestionAnswerAnalysisModel {
    if (!json) {
      throw new Error('Cannot create QuestionAnswerAnalysisModel from null or undefined');
    }

    return new QuestionAnswerAnalysisModel({
      question: ShowQuestionsModel.fromJson(json.question),
      questionAnswerDuration: json.question_answer_duration,
      hesitation: json.hesitation,
      id: json.question_answer_duration,
    });
  }

  static example: QuestionAnswerAnalysisModel = new QuestionAnswerAnalysisModel({
    question: ShowQuestionsModel.example,
    questionAnswerDuration: 120,
    hesitation: 5,
  });
}
