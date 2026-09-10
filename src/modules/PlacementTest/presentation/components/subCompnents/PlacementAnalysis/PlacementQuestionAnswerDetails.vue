<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type ShowQuestionsModel from '@/modules/Questions/core/models/show.questions.model';
  import type PlacementAnswerHistoryModel from '@/modules/PlacementTest/core/models/placement.answer.history.model';
  import FetchPlacementTestAnswerHistoryParams from '@/modules/PlacementTest/core/params/fetch.placement.test.answer.history.params';
  import PlacementTestController from '@/modules/PlacementTest/presentation/controllers/placement.test.controller';

  const { question } = defineProps<{
    question: ShowQuestionsModel;
  }>();

  const { t } = useI18n();
  const route = useRoute();
  const controller = PlacementTestController.getInstance();
  const answerHistory = ref<PlacementAnswerHistoryModel>();
  const isHistoryLoading = ref(false);
  const historyLogs = computed(() => answerHistory.value?.historyLog ?? []);

  async function fetchAnswerHistory() {
    const placementTestId = Number(route.params.id);
    const studentExamAnswerId = question.student_exam_answer_id;

    if (!Number.isInteger(placementTestId) || placementTestId <= 0 || !studentExamAnswerId) return;

    isHistoryLoading.value = true;
    try {
      const result = await controller.fetchAnswerHistory(
        new FetchPlacementTestAnswerHistoryParams(placementTestId, studentExamAnswerId),
      );

      if (result instanceof DataSuccess) answerHistory.value = result.data ?? undefined;
    } finally {
      isHistoryLoading.value = false;
    }
  }

  onMounted(fetchAnswerHistory);
</script>

<template>
  <div class="question-answer-details">
    <p v-if="question.question_description" class="question-answer-details__description">
      {{ question.question_description }}
    </p>

    <div class="question-answer-details__answers">
      <div
        v-for="(answer, index) in question.answers"
        :key="answer.id ?? index"
        class="question-answer-details__answer"
        :class="{ 'question-answer-details__answer--correct': answer.is_right_answer }"
      >
        <div>
          <span>
            {{ t('placement_test.answer_number', { number: index + 1 }) }}
            <b v-if="answer.is_right_answer"> ({{ t('placement_test.correct_answer_label') }}) </b>
          </span>
          <strong>{{ answer.answer ?? '—' }}</strong>
        </div>
        <img
          v-if="answer.image?.[0]?.file"
          :src="answer.image[0].file"
          :alt="answer.image[0].alt ?? answer.answer"
        />
      </div>

      <p v-if="!question.answers?.length" class="question-answer-details__empty">
        {{ t('placement_test.no_answer_data') }}
      </p>
    </div>

    <aside class="question-answer-details__history">
      <h3>{{ t('placement_test.history_log') }}</h3>
      <div class="question-answer-details__history-list">
        <div v-for="log in historyLogs" :key="log.id">
          <time>{{ log.selectedAtFormatted ?? log.selectedAt ?? '—' }}</time>
          <span>
            <strong>{{ log.action ?? '—' }}</strong>
            <small v-if="log.answer?.title ?? log.answerText">
              {{ log.answer?.title ?? log.answerText }}
            </small>
          </span>
        </div>

        <p v-if="!isHistoryLoading && !historyLogs.length" class="question-answer-details__empty">
          {{ t('placement_test.no_history_data') }}
        </p>
      </div>
    </aside>
  </div>
</template>

<style scoped lang="scss">
  .question-answer-details {
    display: grid;
    grid-template-columns: minmax(360px, 1fr) minmax(230px, 0.42fr);
    gap: 16px;
    padding: 14px;
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);

    &__description {
      grid-column: 1 / -1;
      margin: 0;
      padding: 0 2px;
      color: var(--gray-600);
      line-height: 1.5;
    }

    &__answers {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &__answer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-height: 62px;
      padding: 6px 10px;
      background: var(--gray-50);
      border-radius: var(--radius-sm);

      > div {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-width: 0;

        span {
          color: var(--gray-500);
          font-size: var(--xs-size);

          b {
            color: var(--success);
          }
        }

        strong {
          color: var(--gray-700);
          font-weight: 500;
        }
      }

      img {
        flex: 0 0 56px;
        width: 56px;
        height: 56px;
        object-fit: cover;
        border-radius: var(--radius-sm);
      }

      &--correct {
        background: var(--success-light);
      }
    }

    &__history {
      overflow: hidden;
      border: 1px solid var(--border-weak);
      border-radius: var(--radius-md);

      h3 {
        margin: 0;
        padding: 14px;
        color: var(--table-header-color);
        border-bottom: 1.8px dashed var(--border-color);
        font-family: 'Medium';
        font-weight: 600;
        font-size: 1rem;
      }
    }

    &__history-list {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-height: 220px;
      padding: 14px;
      overflow-y: auto;

      > div {
        position: relative;
        display: grid;
        grid-template-columns: 86px minmax(0, 1fr);
        gap: 14px;
        align-items: center;

        &::before {
          position: absolute;
          inset-block: -8px;
          inset-inline-start: 43px;
          width: 1px;
          content: '';
          background: var(--border-color);
        }

        &:first-of-type::before {
          inset-block-start: 50%;
        }

        &:last-of-type::before {
          inset-block-end: 50%;
        }

        &:only-of-type::before {
          display: none;
        }

        time {
          position: relative;
          z-index: 1;
          padding: 7px 10px;
          color: var(--gray-5);
          text-align: center;
          background: var(--border-color);
          border-radius: 10px;
          font-weight: 500;
          font-family: 'Medium';
          font-size: 12px;
        }

        span {
          z-index: 1;
          display: flex;
          flex-direction: column;
          // gap: 3px;
          padding-inline-start: 10px;
          background: var(--bg-card);

          strong {
            color: var(--gray-text);
            font-size: 14px;
          }

          small {
            color: var(--Gray-6);
            font-size: 12px;
          }

          strong,
          small {
            // color: var(--gray-600);
            // font-size: var(--xs-size-2);
            font-weight: 500;
            font-family: 'Medium';
          }
        }
      }
    }

    &__empty {
      margin: 20px 0;
      color: var(--gray-500);
      text-align: center;
    }
  }

  @media (max-width: 820px) {
    .question-answer-details {
      grid-template-columns: 1fr;
    }
  }
</style>
