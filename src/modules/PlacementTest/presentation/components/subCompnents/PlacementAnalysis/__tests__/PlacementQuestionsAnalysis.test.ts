import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { describe, expect, it } from 'vitest';
import en from '@/locales/en.json';
import ShowQuestionsModel from '@/modules/Questions/core/models/show.questions.model';
import ShowPlcaementTestModel from '@/modules/PlacementTest/core/models/show.placement.test.model';
import QuestionAnswerAnalysisModel from '@/modules/PlacementTest/core/models/subModels/question.answer.analysis.model';
import PlacementQuestionsAnalysis from '../PlacementQuestionsAnalysis.vue';

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en } });

describe('PlacementQuestionsAnalysis', () => {
  it('renders questions from the answer analysis response', () => {
    const placementTest = new ShowPlcaementTestModel({
      questionAnswerAnalysis: [
        new QuestionAnswerAnalysisModel({
          question: new ShowQuestionsModel({
            id: 1,
            question: 'Regular question',
          }),
          questionAnswerDuration: 12,
        }),
        new QuestionAnswerAnalysisModel({
          question: new ShowQuestionsModel({
            id: 2,
            question: 'Second question',
          }),
          questionAnswerDuration: 20,
        }),
      ],
      quesions: [
        new ShowQuestionsModel({
          id: 2,
          questionTitle: 'Second question',
        }),
      ],
    });

    const wrapper = mount(PlacementQuestionsAnalysis, {
      props: { placementTest },
      global: { plugins: [i18n] },
    });

    expect(wrapper.text()).toContain('Regular question');
    expect(wrapper.text()).toContain('Second question');
    expect(wrapper.text()).toContain('12 s');
  });
});
