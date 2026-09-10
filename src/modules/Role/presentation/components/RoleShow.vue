<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import DropList from '@/shared/HelpersComponents/DropList.vue';
  import PermissionSelector from '@/modules/Permission/presentation/components/PermissionSelector.vue';
  import EditIcon from '@/shared/icons/DropListIcons/EditIcon.vue';
  import DeleteIcon from '@/shared/icons/DropListIcons/DeletIcon.vue';
  import roleShieldIcon from '@/assets/icons/role-shield-tick.svg';
  import DeleteRoleParams from '../../core/params/delete.role.params';
  import ShowRoleParams from '../../core/params/show.role.params';
  import RoleController from '../controllers/role.controller';
  import RoleFeedbackDialog from './RoleFeedbackDialog.vue';

  const route = useRoute();
  const router = useRouter();
  const { locale, t } = useI18n();
  const controller = RoleController.getInstance();
  const roleId = computed(() => Number(route.params.id));
  const role = computed(() => controller.itemData.value);
  const state = computed(() => controller.itemState.value);
  const deleteDialogVisible = ref(false);
  const deleteDialogVariant = ref<'delete-confirm' | 'delete-error'>('delete-confirm');
  const deleteErrorMessage = ref('');
  const deleteLoading = ref(false);

  const fetchRole = () => controller.fetchOne(new ShowRoleParams(roleId.value));
  const roleReference = computed(() => String(role.value?.id ?? roleId.value).padStart(2, '0'));
  const roleTitle = computed(() => {
    const currentRole = role.value;
    if (!currentRole) return '';

    const currentLocale = locale.value.split('-')[0];
    return (
      currentRole.titleTranslations.find(({ locale: itemLocale }) => itemLocale === currentLocale)
        ?.display_name ?? currentRole.title
    );
  });

  const requestDelete = () => {
    deleteDialogVariant.value = 'delete-confirm';
    deleteErrorMessage.value = '';
    deleteDialogVisible.value = true;
  };

  const removeRole = async () => {
    const currentRole = role.value;
    if (!currentRole || deleteLoading.value) return;

    deleteLoading.value = true;
    try {
      const result = await controller.delete(new DeleteRoleParams(currentRole.id));
      if (!result || result.hasError) {
        deleteDialogVariant.value = 'delete-error';
        deleteErrorMessage.value = result?.error?.displayMessage ?? '';
        return;
      }

      deleteDialogVisible.value = false;
      await router.replace({ name: 'Roles' });
    } finally {
      deleteLoading.value = false;
    }
  };

  const actionList = computed(() => {
    if (!role.value) return [];

    return [
      {
        text: t('role.actions.edit'),
        icon: EditIcon,
        link: `/roles/${role.value.id}/edit`,
      },
      {
        text: t('role.actions.delete'),
        icon: DeleteIcon,
        action: requestDelete,
        skipDeleteConfirmation: true,
        danger: true,
      },
    ];
  });

  onMounted(fetchRole);
</script>

<template>
  <DataStatusBuilder
    :controller="state"
    :on-retry="async () => void (await fetchRole())"
    use-skeleton
  >
    <template #loader>
      <div class="role-show-skeleton" aria-hidden="true">
        <div class="role-show-skeleton__summary"></div>
        <div class="role-show-skeleton__permissions"></div>
      </div>
    </template>

    <template #success>
      <main v-if="role" class="role-show-page">
        <section class="role-show-page__summary" :aria-label="$t('role.show_title')">
          <div class="role-show-page__identity">
            <img :src="roleShieldIcon" alt="" aria-hidden="true" />
            <div>
              <h1>{{ roleTitle }}</h1>
              <p>{{ $t('role.reference', { id: roleReference }) }}</p>
            </div>
          </div>

          <DropList :action-list="actionList" />
        </section>

        <PermissionSelector :permissions="role.permissions" read-only />
      </main>
    </template>

    <template #empty>
      <section class="role-show-page__state">
        <h1>{{ $t('role.details_error_title') }}</h1>
        <p>{{ $t('role.details_error_description') }}</p>
        <button type="button" class="btn btn-primary" @click="fetchRole">
          {{ $t('role.retry') }}
        </button>
      </section>
    </template>

    <template #failed>
      <section class="role-show-page__state">
        <h1>{{ $t('role.details_error_title') }}</h1>
        <p>{{ $t('role.details_error_description') }}</p>
        <button type="button" class="btn btn-primary" @click="fetchRole">
          {{ $t('role.retry') }}
        </button>
      </section>
    </template>

    <template #no-network>
      <section class="role-show-page__state">
        <h1>{{ $t('role.details_error_title') }}</h1>
        <p>{{ $t('role.details_error_description') }}</p>
        <button type="button" class="btn btn-primary" @click="fetchRole">
          {{ $t('role.retry') }}
        </button>
      </section>
    </template>
  </DataStatusBuilder>

  <RoleFeedbackDialog
    v-model="deleteDialogVisible"
    :variant="deleteDialogVariant"
    :message="deleteErrorMessage"
    :loading="deleteLoading"
    @confirm="removeRole"
  />
</template>

<style scoped lang="scss">
  .role-show-page,
  .role-show-skeleton {
    --role-heading-font: 'Demi';

    display: grid;
    gap: 24px;
    width: 100%;
    margin-inline: auto;
  }

  .role-show-page__summary {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    min-height: 87px;
    padding: 16px;
    border-radius: 20px;
    background: var(--background-color-soft-light);
  }

  .role-show-page__identity {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    min-width: 0;

    > img {
      width: 24px;
      height: 24px;
      flex: 0 0 24px;
    }

    h1,
    p {
      margin: 0;
    }

    h1 {
      color: var(--table-header-color);
      font-family: var(--role-heading-font);
      font-size: 20px;
      font-weight: 600;
      line-height: normal;
    }

    p {
      margin-top: 8px;
      color: var(--second-text);
      font-family: var(--role-heading-font);
      font-size: 16px;
      line-height: normal;
    }
  }

  .role-show-page__summary :deep(.list-trigger) {
    width: 32px;
    height: 32px;
    flex: 0 0 32px;
    background: transparent;
  }

  .role-show-page__summary :deep(.list-trigger svg) {
    width: 32px;
    height: 32px;
  }

  .role-show-page__state {
    display: grid;
    justify-items: center;
    gap: 12px;
    min-height: 320px;
    padding: 48px 24px;
    border-radius: 20px;
    background: var(--background-color-soft-light);
    text-align: center;

    h1,
    p {
      margin: 0;
    }

    p {
      color: var(--gray-500);
    }
  }

  .role-show-skeleton__summary,
  .role-show-skeleton__permissions {
    border-radius: 20px;
    background: var(--gray-100);
    animation: role-show-pulse 1.4s ease-in-out infinite;
  }

  .role-show-skeleton__summary {
    min-height: 87px;
  }

  .role-show-skeleton__permissions {
    min-height: 680px;
  }

  @keyframes role-show-pulse {
    50% {
      opacity: 0.55;
    }
  }

  @media (max-width: 600px) {
    .role-show-page,
    .role-show-skeleton {
      gap: 16px;
    }

    .role-show-page__summary {
      min-height: 80px;
    }
  }
</style>
