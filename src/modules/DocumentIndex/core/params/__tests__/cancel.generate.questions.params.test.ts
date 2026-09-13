import { describe, expect, it } from 'vitest';
import CancelGenerateQuestionsParams from '../cancel.generate.questions.params';

describe('CancelGenerateQuestionsParams', () => {
  it('maps the indexing batch id to the backend key', () => {
    expect(new CancelGenerateQuestionsParams(42).toMap()).toEqual({
      question_batch_id: 42,
    });
  });
});
