import { describe, expect, it } from 'vitest';
import TranslationParams from '@/modules/about/core/params/translation.params';
import AddSubjectItemParams from '../add.subject.item.params';

describe('AddSubjectItemParams', () => {
  it('maps the complete subject payload', () => {
    const params = new AddSubjectItemParams({
      translations: new TranslationParams({
        title: { en: 'Mathematics', ar: 'الرياضيات' },
        description: { en: 'Numbers and equations' },
      }),
      stage_id: 5,
      parent_id: 12,
      image: 'data:image/png;base64,cover',
      isDraft: true,
    });

    expect(params.toMap()).toEqual({
      translations: {
        title: { en: 'Mathematics', ar: 'الرياضيات' },
        description: { en: 'Numbers and equations' },
        question: undefined,
        answer: undefined,
      },
      education_classification_branch_id: 5,
      parent_id: 12,
      image: 'data:image/png;base64,cover',
      is_draft: 1,
    });
  });

  it('omits optional media and parent fields for a published root subject', () => {
    const params = new AddSubjectItemParams({
      translations: new TranslationParams({ title: { en: 'Science' } }),
      stage_id: 3,
    });

    expect(params.toMap()).toEqual({
      translations: {
        title: { en: 'Science' },
        description: undefined,
        question: undefined,
        answer: undefined,
      },
      education_classification_branch_id: 3,
      is_draft: 0,
    });
  });
});
