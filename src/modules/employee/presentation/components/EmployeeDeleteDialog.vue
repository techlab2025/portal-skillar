<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Dialog from 'primevue/dialog';
import warningImage from '@/assets/images/dialogs/warning.png';
import DeleteIllustration from '@/shared/icons/DeleteDialogIcons/DeleteIcon.vue';
import { EmployeeStatusEnm } from '../../core/constant/employee.status.enum';
import type EmployeeModel from '../../core/models/employee.model';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    employee: EmployeeModel | null;
    loading?: boolean;
  }>(),
  { loading: false },
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'delete', employee: EmployeeModel): void;
  (event: 'deactivate', employee: EmployeeModel): void;
}>();

const { t } = useI18n();
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});
const isActive = computed(() => Number(props.employee?.status) === EmployeeStatusEnm.active);

const confirm = () => {
  if (!props.employee || props.loading) return;

  if (isActive.value) {
    emit('deactivate', props.employee);
    return;
  }

  emit('delete', props.employee);
};
</script>

<template>
  <Dialog v-model:visible="visible" modal :closable="false" :dismissable-mask="!loading" :close-on-escape="!loading"
    :style="{ width: 'min(35rem, calc(100vw - 2rem))' }">
    <template #container>
      <section class="employee-delete-dialog" :aria-busy="loading" aria-live="polite" role="alertdialog"
        :aria-labelledby="'employee-delete-dialog-title'" :aria-describedby="'employee-delete-dialog-message'">
        <img v-if="isActive" class="employee-delete-dialog__warning" :src="warningImage" alt="" aria-hidden="true" />
        <DeleteIllustration v-else class="employee-delete-dialog__illustration" aria-hidden="true" />

        <div class="employee-delete-dialog__copy">
          <h2 id="employee-delete-dialog-title">
            {{
              t(
                isActive
                  ? 'employee_delete_dialog.active_title'
                  : 'employee_delete_dialog.inactive_title',
              )
            }}
          </h2>
          <p id="employee-delete-dialog-message">
            {{
              t(
                isActive
                  ? 'employee_delete_dialog.active_message'
                  : 'employee_delete_dialog.inactive_message',
              )
            }}
          </p>
        </div>

        <div class="employee-delete-dialog__actions">
          <button type="button" class="employee-delete-dialog__confirm"
            :class="{ 'employee-delete-dialog__confirm--danger': !isActive }"
            :data-testid="isActive ? 'confirm-deactivate' : 'confirm-delete'" :disabled="loading" @click="confirm">
            {{
              t(
                isActive
                  ? 'employee_delete_dialog.deactivate'
                  : 'employee_delete_dialog.confirm_delete',
              )
            }}
          </button>
          <button type="button" class="employee-delete-dialog__cancel" data-testid="cancel-employee-delete"
            :disabled="loading" @click="visible = false">
            {{ t('cancel') }}
          </button>
        </div>
      </section>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
.employee-delete-dialog {
  display: grid;
  justify-items: center;
  gap: var(--xl-size-base);
  padding: var(--xl-size-2);
  color: var(--gray-900);
  text-align: center;
  background: var(--BgWhite);
  border-radius: var(--radius-lg);
}

.employee-delete-dialog__warning {
  width: 180px;
  height: 180px;
  object-fit: contain;
}

.employee-delete-dialog__illustration {
  width: min(100%, 280px);
}

.employee-delete-dialog__copy {
  display: grid;
  gap: var(--xs-size-2);
}

h2,
p {
  margin: 0;
  font-family: var(--font-family);
}

h2 {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
}

p {
  color: var(--gray-500);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
}

.employee-delete-dialog__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--xs-size);
  width: 100%;
}

.employee-delete-dialog__confirm,
.employee-delete-dialog__cancel {
  min-height: 52px;
  padding: 0 var(--md-size);
  border: 0;
  border-radius: var(--radius-full);
  font-family: var(--font-family);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.employee-delete-dialog__confirm {
  color: var(--BgWhite);
  background: var(--PrimaryColor);
}

.employee-delete-dialog__confirm--danger {
  background: var(--danger);
}

.employee-delete-dialog__cancel {
  color: var(--gray-900);
  background: var(--gray-100);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 480px) {
  .employee-delete-dialog {
    padding: var(--xl-size-base);
  }

  .employee-delete-dialog__warning {
    width: 140px;
    height: 140px;
  }

  .employee-delete-dialog__actions {
    grid-template-columns: 1fr;
  }
}
</style>
