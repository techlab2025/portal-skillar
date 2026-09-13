<script setup lang="ts">
  type DifficultyKey = 'easy' | 'medium' | 'hard';

  defineProps<{
    difficultyFields: {
      key: DifficultyKey;
      label: string;
      placeholder: string;
      class: string;
      value: number;
    }[];
    questionCount: number;
    calculatedQuestions: Record<string, number>;
    totalPercentage: number;
    prerequisitesReady: boolean;
    showPrerequisiteError: boolean;
  }>();

  const model = defineModel<{
    easy: number;
    medium: number;
    hard: number;
  }>({
    required: true,
  });

  const handlePercentageInput = (event: Event, key: DifficultyKey) => {
    const target = event.target as HTMLInputElement;
    const value = target.value.replace(/\D/g, '');
    const numericValue = Number(value);
    // if (numericValue > 100) {
    //   numericValue = 100;
    // }
    // const currentFieldValue = model.value[key];
    // const totalWithoutCurrent = props.totalPercentage - currentFieldValue;
    // if (totalWithoutCurrent + numericValue > 100) {
    //   numericValue = 100 - totalWithoutCurrent;
    // }
    // if (numericValue < 0) {
    //   numericValue = 0;
    // }
    model.value[key] = numericValue;
    target.value = numericValue ? `${numericValue}%` : '';
  };
</script>

<template>
  <div class="difficulty-selection">
    <div v-for="field in difficultyFields" :key="field.key" class="difficulty-option-row">
      <div class="input" :class="field.class">
        <label class="field-label">
          {{ field.label }}
        </label>

        <!-- :value="model[field.key as 'easy' | 'medium' | 'hard'] + '%'" -->
        <input
          class="field-input"
          type="text"
          :placeholder="field.placeholder"
          :value="model[field.key] + '%'"
          :disabled="(totalPercentage >= 100 && !model[field.key]) || !prerequisitesReady"
          @input="handlePercentageInput($event, field.key)"
        />

        <small v-if="showPrerequisiteError" class="error-text">
          Please enter number of questions and time first
        </small>
      </div>

      <div class="percentage">
        <p>equal</p>

        <h6>
          <span>
            {{ calculatedQuestions[field.key] || 0 }}
          </span>

          questions
        </h6>
      </div>
    </div>
  </div>
</template>
