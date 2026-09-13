import { describe, expect, it } from 'vitest';
import ToggleQuestionArchiveParams from './question.toggle.archive.params';

describe('ToggleQuestionArchiveParams', () => {
  it('maps the question id to the archive-toggle payload', () => {
    expect(new ToggleQuestionArchiveParams(437).toMap()).toEqual({
      question_id: 437,
    });
  });
});
