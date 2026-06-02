import TitleInterface from '@/base/Data/Models/titleInterface';
import ExplanationModel from './explanation.model';
import DocumentModel from './document.model';
export default class ArticalDetailsModel {
  public readonly id: number;
  public readonly question_description: string;
  public readonly question: string;
  public readonly document: DocumentModel[];
  public readonly explanation: ExplanationModel;
  public readonly e_c_subject: TitleInterface<number>;


  constructor(data: {
    id: number;
    question_description: string;
    question: string;
    document: DocumentModel[];
    explanation: ExplanationModel;
    e_c_subject: TitleInterface<number>;
  }) {
    this.id = data.id;
    this.question = data.question;
    this.question_description = data.question_description;
    this.document = data.document;
    this.explanation = data.explanation;
    this.e_c_subject = data.e_c_subject;
  }

  static fromJson(json: any): ArticalDetailsModel {
    if (!json) {
      throw new Error('Cannot create ArticalDetailsModel from null or undefined');
    }
    return new ArticalDetailsModel({
      id: json.question_id ?? json.id ?? 0,
      question: json.question ?? '',
      question_description: json.question_description ?? '',
      document:  json.documents.map((doc: any) => DocumentModel.fromJson(doc)),
      explanation: ExplanationModel.fromJson(json.explanation),
      e_c_subject: new TitleInterface({
        id: json.e_c_subject?.e_c_subject_id,
        title: json.e_c_subject?.title ?? '',
      }),
    });
  }

  static example = new ArticalDetailsModel({
    id: 1,
    question: 'Egypt is a country located in North Africa.It is famous for its ancient civilization and historical landmarks such as the Pyramids and the Nile River. Cairo is the capital of Egypt and one of the largest cities in Africa. The Nile River is the longest river in the world and plays an important role in agriculture and daily life in Egypt. Many tourists visit Egypt every year to explore its rich history and culture.',
    question_description: 'Egypt is a country located in North Africa.It is famous for its ancient civilization and historical landmarks such as the Pyramids and the Nile River. Cairo is the capital of Egypt and one of the largest cities in Africa. The Nile River is the longest river in the world and plays an important role in agriculture and daily life in Egypt. Many tourists visit Egypt every year to explore its rich history and culture.',
    document: [DocumentModel.example],
    explanation: ExplanationModel.example,
    e_c_subject: new TitleInterface({
      id: 1,
      title: 'Subject 1',
    }),
  });
}
