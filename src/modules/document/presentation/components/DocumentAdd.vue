<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import DocumentController from '../controllers/document.controller';
  import DocumentForm from './DocumentForm.vue';
  import type AddDocumentParams from '../../core/params/add.document.params';
  import type { FieldError } from '@/base/Presentation/Utils/classValidation';

  const controller = DocumentController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;

  const params = ref<AddDocumentParams | null>(null);
  const loading = ref(false);
  const errors = ref<FieldError[]>([]);

  const validateParams = (documentParams: AddDocumentParams) => [
    ...documentParams.validate().errors,
    ...documentParams.translations.validate().errors,
  ];

  const saveDocument = async () => {
    if (!params.value) return;

    errors.value = validateParams(params.value);
    if (errors.value.length > 0) return;

    loading.value = true;
    try {
      await controller.create(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: AddDocumentParams) => {
    params.value = updatedParams;

    if (errors.value.length > 0) {
      errors.value = validateParams(updatedParams);
    }
  };
</script>

<template>
  <div class="document-crud-example">
    <DocumentForm
      :form-key="formKey"
      :loading="loading"
      :errors="errors"
      @update-data="updateData"
    />

    <!-- <AppButton :title="$t('save_document')" size="sm" icon="right" type="submit" @click="saveDocument">
      {{ $t('save_document') }}
      <template #icon>
        <IconAccept />
      </template>
</AppButton> -->
    <div class="actions" :class="{ disabled: loading }">
      <button class="btn btn-primary w-full" type="submit" @click="saveDocument">
        <span v-if="loading" class="loader"></span>
        <span v-else>
          {{ $t('save_document') }}
        </span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .document-crud-example {
    margin: 0 auto;
  }

  .actions {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .error {
    margin-top: 20px;
    padding: 10px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }
</style>
