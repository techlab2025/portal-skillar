<script setup lang="ts">
  import Dialog from 'primevue/dialog';
  import cancelAnimation from '@/assets/images/question/Cancel.gif';

  const visible = defineModel<boolean>({ default: false });
  const emit = defineEmits<{
    confirm: [];
    keepEditing: [];
  }>();

  const confirmCancel = () => {
    visible.value = false;
    emit('confirm');
  };

  const keepEditing = () => {
    visible.value = false;
    emit('keepEditing');
  };
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :closable="false"
    :close-on-escape="false"
    :dismissable-mask="false"
    :pt="{
      root: 'employee-cancel-dialog-host',
      mask: 'employee-cancel-dialog-mask',
    }"
  >
    <template #container>
      <section
        class="employee-cancel-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="employee-cancel-dialog-title"
        aria-describedby="employee-cancel-dialog-description"
      >
        <img
          class="employee-cancel-dialog__animation"
          :src="cancelAnimation"
          alt=""
          aria-hidden="true"
        />

        <div class="employee-cancel-dialog__copy">
          <h2 id="employee-cancel-dialog-title">{{ $t('employee_cancel.title') }}</h2>
          <p id="employee-cancel-dialog-description">
            {{ $t('employee_cancel.description') }}
          </p>
        </div>

        <div class="employee-cancel-dialog__actions">
          <button
            type="button"
            class="btn employee-cancel-dialog__confirm"
            data-testid="confirm-employee-cancel"
            @click="confirmCancel"
          >
            {{ $t('employee_cancel.confirm') }}
          </button>
          <button
            type="button"
            class="btn employee-cancel-dialog__keep"
            data-testid="keep-editing"
            @click="keepEditing"
          >
            {{ $t('employee_cancel.keep_editing') }}
          </button>
        </div>
      </section>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
  :global(.employee-cancel-dialog-host) {
    width: min(28rem, calc(100vw - 2rem));
    overflow: hidden;
    border-radius: var(--radius-xl);
  }

  :global(.employee-cancel-dialog-mask) {
    background: var(--black-alpha-40);
  }

  .employee-cancel-dialog {
    display: grid;
    gap: 24px;
    width: 100%;
    padding: 32px 24px 24px;
    border-radius: var(--radius-xl);
    background: var(--standard-white);
    text-align: center;
  }

  .employee-cancel-dialog__animation {
    width: 112px;
    height: 112px;
    margin-inline: auto;
    object-fit: contain;
  }

  .employee-cancel-dialog__copy {
    display: grid;
    gap: 10px;

    h2,
    p {
      margin: 0;
      font-family: var(--font-family);
    }

    h2 {
      color: var(--standard-black);
      font-size: 18px;
      font-weight: 700;
    }

    p {
      color: var(--second-text);
      font-size: 14px;
      font-weight: 500;
    }
  }

  .employee-cancel-dialog__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;

    .btn {
      width: 100%;
      min-height: 44px;
      padding-inline: 14px;
      border-radius: var(--radius-full);
      font-size: 14px;
      font-weight: 600;
    }
  }

  .employee-cancel-dialog__confirm {
    border: 1px solid var(--danger);
    background: var(--danger);
    color: var(--standard-white);
  }

  .employee-cancel-dialog__keep {
    border: 1px solid var(--gray-200);
    background: var(--gray-100);
    color: var(--standard-black);
  }

  @media (max-width: 420px) {
    .employee-cancel-dialog {
      padding: 24px 18px 18px;
    }

    .employee-cancel-dialog__actions {
      grid-template-columns: 1fr;
    }
  }
</style>
