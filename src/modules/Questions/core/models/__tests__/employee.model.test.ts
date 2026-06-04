import { describe, it, expect } from 'vitest';
import questionsModel from '../questions.model';
import { QuestionGeneratedByEnum } from '../../constant/generatedby.enum';
import { QuestionTypeEnum } from '../../constant/question.type.enum';
import { QuestionDifficultyEnum } from '../../constant/question.difficulty.enum';
import { QuestionStatusEnum } from '../../constant/question.status.enum';

describe('questionsModel', () => {
  const mockJson = {
    question_id: 1,
    question: 'What is the capital of Egypt?',
    generated_by: QuestionGeneratedByEnum.manual,
    question_type: QuestionTypeEnum.mcq,
    difficulty_level: QuestionDifficultyEnum.easy,
    review_status: QuestionStatusEnum.not_Reviewd,
  };

  it('should create an instance correctly from constructor', () => {
    const model = new questionsModel({
      id: 1,
      title: 'What is Vue?',
      generatedBy: QuestionGeneratedByEnum.manual,
      questionType: QuestionTypeEnum.mcq,
      difficulty: QuestionDifficultyEnum.easy,
      status: QuestionStatusEnum.not_Reviewd,
    });
    expect(model.title).toBe('What is Vue?');
    expect(model.generatedBy).toBe(QuestionGeneratedByEnum.manual);
  });

  it('should create an instance correctly from fromJson', () => {
    const model = questionsModel.fromJson(mockJson);
    expect(model.id).toBe(1);
    expect(model.title).toBe('What is the capital of Egypt?');
    expect(model.generatedBy).toBe(QuestionGeneratedByEnum.manual);
  });

  it('should throw error if json is null in fromJson', () => {
    expect(() => questionsModel.fromJson(null)).toThrow();
  });

  it('should have a valid example', () => {
    expect(questionsModel.example).toBeInstanceOf(questionsModel);
    expect(questionsModel.example.title).toBeTruthy();
  });
});
