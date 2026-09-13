<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import SidebarTerms from '@/shared/icons/SidebarTerms.vue';

  type LocalizedText = Record<'en' | 'ar', string>;

  interface OnboardingScreen {
    key: 'first' | 'second' | 'third';
    title: LocalizedText;
    description: LocalizedText;
  }

  const { t } = useI18n();
  const formMessage = ref('');
  const messageType = ref<'validation' | 'unavailable'>('validation');

  const screens = reactive<OnboardingScreen[]>([
    { key: 'first', title: { en: '', ar: '' }, description: { en: '', ar: '' } },
    { key: 'second', title: { en: '', ar: '' }, description: { en: '', ar: '' } },
    { key: 'third', title: { en: '', ar: '' }, description: { en: '', ar: '' } },
  ]);

  const isComplete = () =>
    screens.every((screen) =>
      ['en', 'ar'].every(
        (locale) =>
          screen.title[locale as keyof LocalizedText].trim() &&
          screen.description[locale as keyof LocalizedText].trim(),
      ),
    );

  const submit = () => {
    if (!isComplete()) {
      messageType.value = 'validation';
      formMessage.value = t('onboarding.validation_required');
      return;
    }

    messageType.value = 'unavailable';
    formMessage.value = t('onboarding.api_unavailable');
  };
</script>

<template>
  <section class="onboarding-page" aria-labelledby="onboarding-form-title">
    <form class="onboarding-card" novalidate @submit.prevent="submit">
      <div class="onboarding-card__header">
        <span class="onboarding-card__icon" aria-hidden="true">
          <SidebarTerms />
        </span>
        <h2 id="onboarding-form-title">{{ $t('onboarding.form_title') }}</h2>
      </div>

      <div class="onboarding-card__body">
        <fieldset
          v-for="screen in screens"
          :key="screen.key"
          class="onboarding-screen"
          :aria-label="$t(`onboarding.${screen.key}_screen`)"
        >
          <MultiLangInput
            :field-key="`${screen.key}_title`"
            :label="$t(`onboarding.${screen.key}_title`)"
            :placeholder="$t(`onboarding.${screen.key}_title_placeholder`)"
            :model-value="screen.title"
            :languages="['en', 'ar']"
            type="title"
            @update:model-value="screen.title = $event as LocalizedText"
          />

          <MultiLangInput
            :field-key="`${screen.key}_description`"
            :label="$t(`onboarding.${screen.key}_description`)"
            :placeholder="$t(`onboarding.${screen.key}_description_placeholder`)"
            :model-value="screen.description"
            :languages="['en', 'ar']"
            type="description"
            @update:model-value="screen.description = $event as LocalizedText"
          />
        </fieldset>

        <p
          v-if="formMessage"
          class="onboarding-card__message"
          :class="`onboarding-card__message--${messageType}`"
          role="alert"
        >
          {{ formMessage }}
        </p>

        <button class="onboarding-card__save btn btn-primary" type="submit">
          {{ $t('onboarding.save') }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped lang="scss">
  .onboarding-page {
    width: 100%;
    padding-bottom: var(--xl-size-2);
  }

  .onboarding-card {
    overflow: hidden;
    width: 100%;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-xl);
    background: var(--bg-main);
    box-shadow: var(--shadow-sm);
  }

  .onboarding-card__header {
    display: flex;
    align-items: center;
    gap: var(--sm-size);
    padding: var(--md-size) var(--xl-size-base);
    border-bottom: 1px solid var(--border-weak);
    background: var(--bg-section);

    h2 {
      margin: 0;
      color: var(--gray-700);
      font-family: 'Bold';
      font-size: var(--md-size-2);
    }
  }

  .onboarding-card__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    background: var(--PrimaryColor-alpha-12);
    color: var(--PrimaryColor);

    :deep(path) {
      stroke: currentColor;
    }
  }

  .onboarding-card__body {
    padding: var(--xl-size-base);
  }

  .onboarding-screen {
    display: grid;
    gap: var(--md-size);
    min-width: 0;
    margin: 0;
    padding: 0 0 var(--xl-size-base);
    border: 0;

    & + & {
      padding-top: var(--xl-size-base);
      border-top: 1px dashed var(--border-strong);
    }
  }

  .onboarding-card__message {
    margin: 0 0 var(--md-size);
    padding: var(--sm-size) var(--md-size);
    border: 1px solid var(--warning);
    border-radius: var(--radius-md);
    background: var(--warning-light);
    color: var(--warning-dark);
    font-family: 'Medium';
    font-size: var(--sm-size);

    &--validation {
      border-color: var(--danger);
      background: var(--danger-light);
      color: var(--danger-dark);
    }
  }

  .onboarding-card__save {
    width: 100%;
    min-height: 44px;
  }

  @media (max-width: 600px) {
    .onboarding-card__header,
    .onboarding-card__body {
      padding: var(--md-size);
    }
  }
</style>
