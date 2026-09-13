<script setup lang="ts">
  import { computed } from 'vue';
  import Dialog from 'primevue/dialog';
  import successImage from '@/assets/images/question/Saved.gif';
  import draftImage from '@/assets/images/PLan/DraftDialogIcon.gif';

  type EmployeeFeedbackVariant = 'success' | 'draft';

  const props = defineProps<{
    variant: EmployeeFeedbackVariant;
  }>();
  const visible = defineModel<boolean>({ default: false });
  const emit = defineEmits<{ acknowledge: [] }>();

  const config = computed(() =>
    props.variant === 'success'
      ? {
          image: successImage,
          title: 'employee_feedback.success_title',
          message: 'employee_feedback.success_message',
        }
      : {
          image: draftImage,
          title: 'employee_feedback.draft_title',
          message: 'employee_feedback.draft_message',
        },
  );
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :closable="false"
    :dismissable-mask="false"
    :close-on-escape="false"
    :style="{ width: 'min(22rem, calc(100vw - 2rem))' }"
    :pt="{ root: `employee-feedback-dialog-host employee-feedback-dialog-host--${variant}` }"
  >
    <template #container>
      <article class="employee-feedback-dialog" role="status" aria-live="polite">
        <img :src="config.image" alt="" aria-hidden="true" />
        <div class="employee-feedback-dialog__copy">
          <h2>{{ $t(config.title) }}</h2>
          <p>{{ $t(config.message) }}</p>
        </div>
        <button
          type="button"
          class="btn btn-primary employee-feedback-dialog__acknowledge"
          @click="emit('acknowledge')"
        >
          {{ $t('employee_feedback.acknowledge') }}
        </button>
      </article>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
  .employee-feedback-dialog {
    display: grid;
    justify-items: center;
    gap: 1rem;
    padding: 1.5rem;
    border-radius: var(--radius-xl);
    background: var(--standard-white);
    color: var(--standard-black);
    text-align: center;

    img {
      width: 6.5rem;
      height: 6.5rem;
      object-fit: contain;
    }
  }

  .employee-feedback-dialog__copy {
    display: grid;
    gap: 0.5rem;

    h2,
    p {
      margin: 0;
    }

    h2 {
      font-size: 1rem;
      font-weight: 700;
    }

    p {
      color: var(--title-header-color);
      font-size: 0.78rem;
      line-height: 1.5;
      text-transform: none;
    }
  }

  .employee-feedback-dialog__acknowledge {
    width: min(15rem, 100%);
    min-height: 2.75rem;
    border-radius: var(--radius-full);
  }
</style>
