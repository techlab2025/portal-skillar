<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import Dialog from 'primevue/dialog';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import HandleFilesUpload, { type UploadedFile } from '@/shared/FormInputs/HandleFilesUpload.vue';
  import NewBranchIcon from '@/shared/icons/NewBranchIcon.vue';
  import SkillsController from '@/modules/Skills/presentation/controllers/skills.controller';
  import IndexSkillsParams from '@/modules/Skills/core/params/index.skills.params';
  import type TitleInterface from '@/base/Data/Models/titleInterface';

  export interface EducationSubjectFormData {
    name: Record<string, string>;
    description: Record<string, string>;
    skill: TitleInterface<string | number> | null;
    tags: string[];
    coverImage: string;
    isDraft: boolean;
  }

  const props = withDefaults(
    defineProps<{
      visible: boolean;
      subjectName?: string;
      loading?: boolean;
    }>(),
    {
      subjectName: '',
      loading: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'confirm', data: EducationSubjectFormData): void;
  }>();

  const skillsController = SkillsController.getInstance();
  const skillsParams = new IndexSkillsParams('', 1, 100, 0);
  const name = ref<Record<string, string>>({});
  const description = ref<Record<string, string>>({});
  const selectedSkill = ref<TitleInterface<string | number> | null>(null);
  const tags = ref<string[]>([]);
  const tagInput = ref('');
  const coverImage = ref('');

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value),
  });

  const hasName = computed(() => Object.values(name.value).some((value) => Boolean(value?.trim())));
  const canCreate = computed(() => hasName.value && Boolean(selectedSkill.value));
  const canSaveDraft = computed(() => hasName.value);

  function resetForm() {
    name.value = {};
    description.value = {};
    selectedSkill.value = null;
    tags.value = [];
    tagInput.value = '';
    coverImage.value = '';
  }

  watch(
    () => props.visible,
    (visible) => {
      if (visible) resetForm();
    },
    { immediate: true },
  );

  function cleanTranslations(values: Record<string, string>) {
    return Object.fromEntries(
      Object.entries(values)
        .map(([locale, value]) => [locale, value.trim()])
        .filter(([, value]) => Boolean(value)),
    );
  }

  function pendingTags() {
    return tagInput.value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  function addTags() {
    tags.value = [...new Set([...tags.value, ...pendingTags()])];
    tagInput.value = '';
  }

  function removeTag(index: number) {
    tags.value.splice(index, 1);
  }

  function handleCoverChange(files: UploadedFile[]) {
    coverImage.value = files[0]?.base64 ?? '';
  }

  function submit(isDraft: boolean) {
    if (!hasName.value || (!isDraft && !selectedSkill.value)) return;

    emit('confirm', {
      name: cleanTranslations(name.value),
      description: cleanTranslations(description.value),
      skill: selectedSkill.value,
      tags: [...new Set([...tags.value, ...pendingTags()])],
      coverImage: coverImage.value,
      isDraft,
    });
  }
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :dismissable-mask="false"
    :closable="!loading"
    :style="{ width: 'min(64rem, calc(100vw - 2rem))' }"
    :pt="{
      root: 'add-subject-dialog',
      header: 'dialog-header',
      content: 'dialog-body',
    }"
  >
    <template #header>
      <div class="dialog-icon" aria-hidden="true">
        <NewBranchIcon />
      </div>
      <div class="dialog-heading">
        <h3 class="dialog-title">{{ $t('education_subject_form.title') }}</h3>
        <p class="dialog-subtitle">{{ $t('education_subject_form.subtitle') }}</p>
      </div>
    </template>

    <form class="subject-form" @submit.prevent="submit(false)">
      <section class="form-section" aria-labelledby="subject-identity-heading">
        <div class="section-heading">
          <span class="section-step">1</span>
          <div>
            <h4 id="subject-identity-heading">{{ $t('education_subject_form.identity') }}</h4>
            <p>{{ $t('education_subject_form.identity_hint') }}</p>
          </div>
        </div>

        <div class="fields-grid">
          <MultiLangInput
            field-key="title"
            class="field-span-2"
            :label="$t('education_subject_form.subject_name')"
            :languages="['en', 'ar']"
            :model-value="name"
            :placeholder="
              $t('education_subject_form.subject_name_placeholder', {
                name: subjectName || $t('subject'),
              })
            "
            type="title"
            @update:model-value="name = $event"
          />

          <div class="skill-field field-span-2">
            <UpdatedCustomInputSelect
              id="add-subject-skill"
              :label="'education_subject_form.skill'"
              :params="skillsParams"
              :controller="skillsController"
              :model-value="selectedSkill"
              :placeholder="$t('education_subject_form.skill_placeholder')"
              :required="true"
              :reload="false"
              @update:model-value="selectedSkill = $event as TitleInterface<string | number>"
            />
          </div>

          <div class="tag-field field-span-2">
            <label class="field-label" for="subject-search-terms">
              {{ $t('education_subject_form.search_terms') }}
            </label>
            <div class="tag-input-row">
              <input
                id="subject-search-terms"
                v-model="tagInput"
                class="field-input"
                type="text"
                :placeholder="$t('education_subject_form.search_terms_placeholder')"
                @keydown.enter.prevent="addTags"
              />
              <button
                class="tag-add-button"
                type="button"
                :disabled="!tagInput.trim()"
                @click="addTags"
              >
                {{ $t('education_subject_form.add_term') }}
              </button>
            </div>
            <div
              v-if="tags.length"
              class="tag-list"
              :aria-label="$t('education_subject_form.search_terms')"
            >
              <span v-for="(tag, index) in tags" :key="tag" class="tag-chip">
                {{ tag }}
                <button
                  type="button"
                  :aria-label="$t('education_subject_form.remove_term', { term: tag })"
                  @click="removeTag(index)"
                >
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section class="form-section" aria-labelledby="subject-media-heading">
        <div class="section-heading">
          <span class="section-step">2</span>
          <div>
            <h4 id="subject-media-heading">{{ $t('education_subject_form.media_pricing') }}</h4>
            <p>{{ $t('education_subject_form.media_pricing_hint') }}</p>
          </div>
        </div>

        <div class="fields-grid">
          <div class="cover-field">
            <HandleFilesUpload
              :label="$t('education_subject_form.cover_image')"
              accept="image/png,image/jpeg,image/webp"
              :multiple="false"
              :max-files="1"
              :have-content="true"
              class-name="subject-cover-upload"
              @change="handleCoverChange"
            >
              <template #content>
                <span class="upload-symbol" aria-hidden="true">↑</span>
                <strong>{{ $t('education_subject_form.upload_cover') }}</strong>
                <small>{{ $t('education_subject_form.cover_hint') }}</small>
              </template>
            </HandleFilesUpload>
          </div>

          <MultiLangInput
            field-key="description"
            :label="$t('education_subject_form.description')"
            :languages="['en', 'ar']"
            :model-value="description"
            :placeholder="$t('education_subject_form.description_placeholder')"
            type="description"
            @update:model-value="description = $event"
          />
        </div>
      </section>

      <div class="dialog-actions">
        <button
          class="btn btn-primary create-subject-button"
          type="submit"
          :disabled="!canCreate || loading"
        >
          {{ $t('education_subject_form.create') }}
        </button>
        <button
          class="btn draft-button"
          type="button"
          :disabled="!canSaveDraft || loading"
          @click="submit(true)"
        >
          {{ $t('save_as_draft') }}
        </button>
        <button
          class="btn btn-secondary"
          type="button"
          :disabled="loading"
          @click="dialogVisible = false"
        >
          {{ $t('cancel') }}
        </button>
      </div>
    </form>
  </Dialog>
</template>

<style scoped lang="scss">
  :global(.p-dialog.add-subject-dialog) {
    max-height: calc(100vh - 2rem);
  }

  :global(.p-dialog.add-subject-dialog .p-dialog-content) {
    overflow-y: auto;
  }

  :global(.p-dialog.add-subject-dialog .multi-lang-input .field-input) {
    background: var(--standard-white) !important;
    border-color: var(--gray-200-std) !important;
    color: var(--standard-black) !important;
  }

  :global(.p-dialog.add-subject-dialog .multi-lang-input .field-input:focus) {
    border-color: var(--success-green-std) !important;
  }

  .dialog-heading,
  .section-heading,
  .tag-input-row,
  .dialog-actions {
    display: flex;
  }

  .dialog-heading {
    flex-direction: column;
  }

  .subject-form {
    display: grid;
    gap: 1rem;
  }

  .form-section {
    padding: 1rem;
    border: 1px solid var(--gray-200-std);
    border-radius: var(--radius-lg);
    background: var(--standard-white);
  }

  .section-heading {
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1rem;

    h4,
    p {
      margin: 0;
    }

    h4 {
      color: var(--standard-black);
      font-family: var(--font-family);
      font-size: 1rem;
    }

    p {
      margin-top: 0.2rem;
      color: var(--bread-crumb-color-span);
      font-size: 0.8rem;
    }
  }

  .section-step {
    display: grid;
    width: 2rem;
    height: 2rem;
    flex: 0 0 2rem;
    place-items: center;
    border-radius: var(--radius-full);
    background: var(--PrimaryColor-alpha-10);
    color: var(--PrimaryColor);
    font-family: var(--font-family);
  }

  .fields-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .field-span-2 {
    grid-column: 1 / -1;
  }

  .tag-field {
    display: grid;
    gap: 0.5rem;
  }

  .tag-input-row {
    gap: 0.5rem;
  }

  .tag-input-row .field-input {
    min-width: 0;
    margin: 0;
    border-radius: var(--radius-full);
    background: var(--standard-white);
  }

  .tag-add-button {
    padding-inline: 1.25rem;
    border: 0;
    border-radius: var(--radius-full);
    background: var(--PrimaryColor-alpha-10);
    color: var(--PrimaryColor);
    cursor: pointer;
    font-family: var(--font-family);

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    border-radius: var(--radius-full);
    background: var(--PrimaryColor-alpha-10);
    color: var(--PrimaryColor);
    font-size: 0.8rem;

    button {
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
    }
  }

  :deep(.subject-cover-upload) {
    display: flex;
    min-height: 9rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 1rem;
    border: 1px dashed var(--gray-300);
    border-radius: var(--radius-md);
    background: var(--bg-section);
    color: var(--bread-crumb-color-span);
    cursor: pointer;
    text-align: center;

    strong {
      color: var(--standard-black);
    }
  }

  .upload-symbol {
    display: grid;
    width: 2.25rem;
    height: 2.25rem;
    place-items: center;
    border-radius: var(--radius-full);
    background: var(--PrimaryColor-alpha-10);
    color: var(--PrimaryColor);
    font-size: 1.25rem;
  }

  .dialog-actions {
    justify-content: flex-end;
    gap: 0.65rem;
    padding-top: 0.25rem;

    .btn {
      min-width: 9rem;
    }
  }

  .draft-button {
    border: 1px solid var(--PrimaryColor-alpha-10);
    background: var(--PrimaryColor-alpha-10);
    color: var(--PrimaryColor);
  }

  @media (max-width: 700px) {
    .fields-grid {
      grid-template-columns: 1fr;
    }

    .field-span-2 {
      grid-column: auto;
    }

    .dialog-actions {
      flex-direction: column;

      .btn {
        width: 100%;
      }
    }
  }
</style>
