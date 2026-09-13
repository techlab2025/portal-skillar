<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import EmployeeController from '../controllers/employee.controller';
  import EmployeeForm from './EmployeeForm.vue';
  import EmployeeFeedbackDialog from './EmployeeFeedbackDialog.vue';
  import EmployeeCancelDialog from './EmployeeCancelDialog.vue';
  import type AddEmployeeParams from '../../core/params/add.employee.params';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { useFormsStore } from '@/stores/formsStore';

  const controller = EmployeeController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const formsStore = useFormsStore();

  const params = ref<AddEmployeeParams | null>(null);
  const loading = ref(false);
  const successDialogVisible = ref(false);
  const draftDialogVisible = ref(false);
  const cancelDialogVisible = ref(false);
  const employeeFormRef = ref<{ validate: () => boolean | Promise<boolean> } | null>(null);
  /**
   * Save new employee
   */
  const saveEmployee = async () => {
    const isFormValid = await employeeFormRef.value?.validate?.();
    if (isFormValid === false) return;

    loading.value = true;
    try {
      if (!params.value) {
        console.error('No employee parameters to save');
        return;
      }

      const result = await controller.create(params.value, undefined, formKey);
      if (result instanceof DataSuccess) {
        successDialogVisible.value = true;
      }
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: AddEmployeeParams) => {
    params.value = updatedParams;
  };

  const router = useRouter();
  const saveDraft = () => {
    if (loading.value) return;
    loading.value = true;
    try {
      if (!params.value) {
        console.error('No employee parameters to save');
        return;
      }
      localStorage.setItem(`employee-draft`, JSON.stringify(params.value));
      draftDialogVisible.value = true;
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      loading.value = false;
    }
  };

  const acknowledgeSuccess = async () => {
    successDialogVisible.value = false;
    await controller.fetchList();
    await router.push({ name: 'Employees' });
  };

  const acknowledgeDraft = async () => {
    draftDialogVisible.value = false;
    await router.push({ name: 'Employees' });
  };

  const requestCancel = () => {
    if (!loading.value) cancelDialogVisible.value = true;
  };

  const confirmCancel = async () => {
    cancelDialogVisible.value = false;
    formsStore.clearFormData(formKey);
    localStorage.removeItem('employee-draft');
    await router.push({ name: 'Employees' });
  };
</script>

<template>
  <div class="employee-add-page">
    <EmployeeForm
      ref="employeeFormRef"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
      @save-employee="saveEmployee"
    />

    <div class="actions">
      <button
        class="btn btn-primary w-full"
        type="submit"
        :disabled="loading"
        @click="saveEmployee"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>
          {{ $t('save_employee') }}
        </span>
      </button>
      <button class="btn btn-draft" type="button" :disabled="loading" @click="saveDraft">
        {{ $t('save_as_draft') }}
      </button>
      <button class="btn btn-cancel" type="button" :disabled="loading" @click="requestCancel">
        {{ $t(`cancel`) }}
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="controller.errorMessage.value" class="error-toast">
      {{ controller.errorMessage.value }}
    </div>

    <EmployeeFeedbackDialog
      v-model="successDialogVisible"
      variant="success"
      @acknowledge="acknowledgeSuccess"
    />
    <EmployeeFeedbackDialog
      v-model="draftDialogVisible"
      variant="draft"
      @acknowledge="acknowledgeDraft"
    />
    <EmployeeCancelDialog
      v-model="cancelDialogVisible"
      @confirm="confirmCancel"
      @keep-editing="cancelDialogVisible = false"
    />
  </div>
</template>

<style scoped lang="scss">
  .loader {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    border: 8px solid;
    border-color: var(--standard-black) transparent;
    animation: l1 1s infinite;
  }

  @keyframes l1 {
    to {
      transform: rotate(0.5turn);
    }
  }

  @keyframes l7 {
    to {
      transform: rotate(0.5turn);
    }
  }

  .btn-cancel {
    background-color: var(--background-btn-outline-color);
    color: var(--danger-color);
    border: 1px solid rgba(245, 194, 192, 1);
    border-radius: 50px;
    width: 20%;

    @media (max-width: 768px) {
      width: 50%;
    }
  }

  .btn-draft {
    background-color: var(--PrimaryColor-alpha-10);
    color: var(--PrimaryColor);
    border: 1px solid var(--PrimaryColor-alpha-10);
    border-radius: 50px;
    width: 20%;

    @media (max-width: 768px) {
      width: 50%;
    }
  }

  .save-emp {
    width: 60%;

    &.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .actions {
    margin-top: 24px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .error-toast {
    margin-top: 20px;
    padding: 12px 16px;
    background-color: var(--error-light);
    color: var(--error-dark);
    border: 1px solid var(--error-border);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
  }
</style>
