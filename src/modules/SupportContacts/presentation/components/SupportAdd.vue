<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import SupportContactsController from '../controllers/support.controller';
  import type AddSupportContactsParams from '../../core/params/add.support.params';
  import SupportForm from './SupportForm.vue';

  const controller = SupportContactsController.getInstance();
  const router = useRouter();
  const route = useRoute();
  const formKey = route.fullPath;

  const sectionParams = ref<AddSupportContactsParams | null>(null);
  const supportFormRef = ref<{ prepareForSubmit: () => AddSupportContactsParams | null } | null>(
    null,
  );
  const loading = ref(false);
  const saveSupport = async () => {
    const params = supportFormRef.value?.prepareForSubmit() ?? null;
    if (!params) return;
    sectionParams.value = params;
    loading.value = true;
    try {
      await controller.create(params, undefined);
    } finally {
      loading.value = false;
      router.push({ name: 'Support' });
    }
  };

  const cancel = () => {
    const countryCode = route.params.country_code as string | undefined;
    router.push(countryCode ? `/${countryCode}/support` : '/support');
  };

  const updateData = (params: AddSupportContactsParams) => {
    sectionParams.value = params;
  };
</script>

<template>
  <div class="support-add-page">
    <SupportForm
      ref="supportFormRef"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
    />

    <div class="actions" :class="{ disabled: loading }">
      <button class="btn btn-primary" type="button" @click="saveSupport">
        {{ $t('save') }}
      </button>
      <button class="btn btn-cancel" type="button" @click="cancel">
        {{ $t('cancel') }}
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error-toast">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .actions {
    margin-top: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    justify-content: flex-end;

    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }

    .btn-primary {
      width: 80%;
    }

    .btn-cancel {
      width: 20%;
    }
  }

  @media (max-width: 600px) {
    .actions {
      gap: 10px;

      .btn-primary {
        width: 70%;
      }

      .btn-cancel {
        width: 30%;
      }
    }
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
