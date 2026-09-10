<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import type ShowPlcaementTestModel from '@/modules/PlacementTest/core/models/show.placement.test.model';
  import PlacementQuestionAnalysisCard from './PlacementQuestionAnalysisCard.vue';

  const { placementTest } = defineProps<{
    placementTest: ShowPlcaementTestModel;
  }>();

  const { t } = useI18n();
</script>

<template>
  <div
    id="placement-questions-panel"
    class="questions-analysis"
    role="tabpanel"
    aria-labelledby="placement-questions-tab"
  >
    <h2>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        />
        <path d="M10 9a2 2 0 1 1 2 2v1m0 2h.01" />
      </svg>
      {{ t('placement_test.questions') }}
    </h2>

    <div class="questions-analysis__list">
      <template
        v-for="(question, index) in placementTest.questionAnswerAnalysis"
        :key="question.id ?? index"
      >
        <PlacementQuestionAnalysisCard :question="question!" :number="index + 1" />
      </template>

      <p v-if="!placementTest.quesions?.length" class="questions-analysis__empty">
        {{ t('placement_test.no_questions_data') }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .questions-analysis {
    padding: 14px;
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-xl);

    > h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 64px;
      margin: 0 0 22px;
      padding: 0 16px;
      color: var(--color-gray-soft-1);
      font-family: 'demi';
      font-size: var(--md-size-2);
      font-weight: 600;
      background: var(--gray-200);
      border-radius: var(--radius-md);

      svg {
        width: 18px;
        height: 18px;
        fill: none;
        stroke: currentColor;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-width: 1.5;
      }
    }

    &__list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    &__article-group {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 14px;
      border: 1px solid var(--border-weak);
      border-radius: var(--radius-lg);

      > h3 {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;
        color: var(--gray-900);
        font-size: var(--md-size);

        span {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border: 2px solid var(--border-weak);
          border-radius: var(--radius-md);
        }
      }
    }

    &__article-info {
      display: flex;
      flex-direction: column;
      gap: 9px;
      padding: 14px;
      color: var(--gray-600);
      border: 1px solid var(--border-weak);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);

      small {
        color: var(--gray-500);
      }

      > strong {
        color: var(--gray-900);
        font-size: var(--md-size);
      }

      p {
        margin: 0;
        line-height: 1.5;
      }

      > span {
        margin-top: 6px;
        color: var(--gray-500);

        b {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          min-height: 24px;
          margin-inline-start: 6px;
          color: var(--success);
          background: var(--success-light);
          border-radius: var(--radius-xs);
        }
      }
    }

    &__empty {
      padding: 60px 0;
      color: var(--gray-500);
      text-align: center;
    }
  }
</style>
