import { describe, expect, it } from 'vitest';
import StageModel from './stage.model';

describe('StageModel', () => {
  it('maps the subject question count supplied by the API', () => {
    const model = StageModel.fromJson({
      id: 17,
      title: 'Arabic',
      full_title: 'Governmental -> Primary -> First -> Arabic',
      education_type: { id: 1, title: 'Governmental' },
      number_of_questions: 12,
      children: [],
    });

    expect(model.numberOfQuestions).toBe(12);
  });

  it('keeps the question count unavailable when the API omits it', () => {
    const model = StageModel.fromJson({ id: 18, title: 'Math', children: [] });

    expect(model.numberOfQuestions).toBeUndefined();
  });
});
