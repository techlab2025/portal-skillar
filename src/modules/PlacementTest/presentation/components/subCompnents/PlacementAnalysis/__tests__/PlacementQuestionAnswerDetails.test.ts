import { flushPromises, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import en from '@/locales/en.json';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import TitleInterface from '@/base/Data/Models/titleInterface';
import ShowQuestionsModel from '@/modules/Questions/core/models/show.questions.model';
import AnswerModel from '@/modules/Questions/core/models/subModels/answer.model';
import PlacementAnswerHistoryModel from '@/modules/PlacementTest/core/models/placement.answer.history.model';
import PlacementQuestionAnswerDetails from '../PlacementQuestionAnswerDetails.vue';

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en } });
const fetchAnswerHistory = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '80' } }),
}));

vi.mock('@/modules/PlacementTest/presentation/controllers/placement.test.controller', () => ({
  default: {
    getInstance: () => ({ fetchAnswerHistory }),
  },
}));

describe('PlacementQuestionAnswerDetails', () => {
  beforeEach(() => {
    fetchAnswerHistory.mockReset();
    fetchAnswerHistory.mockResolvedValue(
      new DataSuccess({
        data: new PlacementAnswerHistoryModel({
          studentExamAnswerId: 532,
          placementTestId: 80,
          historyLog: [
            {
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
            },
          ],
        }),
      }),
    );
  });

  it('renders answers and endpoint history for the question', async () => {
    const question = new ShowQuestionsModel({
      question_description: 'Question details',
      student_exam_answer_id: 532,
      answers: [
        new AnswerModel({ id: 1, answer: 'Heart', is_right_answer: true }),
        new AnswerModel({ id: 2, answer: 'Cell', is_right_answer: false }),
      ],
    });

    const wrapper = mount(PlacementQuestionAnswerDetails, {
      props: { question },
      global: { plugins: [i18n] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Question details');
    expect(wrapper.text()).toContain('Heart');
    expect(wrapper.text()).toContain('Cell');
    expect(wrapper.text()).toContain('Correct Answer');
    expect(wrapper.text()).toContain('09:50:33');
    expect(wrapper.text()).toContain('select');
    expect(wrapper.text()).toContain('1015');
    expect(fetchAnswerHistory).toHaveBeenCalledOnce();
    expect(fetchAnswerHistory.mock.calls[0]?.[0].toMap()).toEqual({
      placement_test_id: 80,
      student_exam_answer_id: 532,
    });
  });
});
