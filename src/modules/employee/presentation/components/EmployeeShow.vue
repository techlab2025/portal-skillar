<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import DropList from '@/shared/HelpersComponents/DropList.vue';
  import EditIcon from '@/shared/icons/DropListIcons/EditIcon.vue';
  import DeleteIcon from '@/shared/icons/DropListIcons/DeletIcon.vue';
  import { createAdminPermissions } from '@/modules/Permission/core/constants/admin.permissions';
  import { EmployeeStatusEnm } from '../../core/constant/employee.status.enum';
  import { EmployeeTypeEnum } from '../../core/constant/employee.type.enum';
  import { GenderENum } from '../../core/constant/gender.enum';
  import type { EmployeeHistoryEntry, EmployeePermission } from '../../core/models/employee.model';
  import DeleteEmployeeParams from '../../core/params/delete.employee.params';
  import ShowEmployeeParams from '../../core/params/show.employee.params';
  import EmployeeController from '../controllers/employee.controller';

  const route = useRoute();
  const router = useRouter();
  const { locale, t } = useI18n();
  const controller = EmployeeController.getInstance();
  const employee = computed(() => controller.itemData.value);
  const itemState = computed(() => controller.itemState.value);
  const employeeId = computed(() => Number(route.params.id));

  const fetchEmployee = () => controller.fetchOne(new ShowEmployeeParams(employeeId.value));
  const retryEmployee = async () => {
    await fetchEmployee();
  };
  const valueOrDash = (value: unknown): string =>
    value === null || value === undefined || value === '' ? '—' : String(value);
  const employeeTypeLabel = computed(() =>
    employee.value?.employeeType === EmployeeTypeEnum.TEACHER
      ? t('employee_type_teacher')
      : t('employee_type_admin'),
  );
  const genderLabel = computed(() => {
    if (employee.value?.gender === GenderENum.male) return t('employee_show.male');
    if (employee.value?.gender === GenderENum.female) return t('employee_show.female');
    return '—';
  });
  const statusLabel = computed(() => {
    if (employee.value?.status === EmployeeStatusEnm.active) return t('employee_show.active');
    if (employee.value?.status === EmployeeStatusEnm.disavtive) return t('employee_show.inactive');
    return '—';
  });
  const initials = computed(() =>
    employee.value?.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase(),
  );
  const basicInformation = computed(() => [
    { label: t('employee_show.user_id'), value: valueOrDash(employee.value?.employeeId) },
    { label: t('employee_show.email_address'), value: valueOrDash(employee.value?.email) },
    { label: t('employee_show.phone_number'), value: valueOrDash(employee.value?.phone) },
    { label: t('employee_show.gender'), value: genderLabel.value },
    { label: t('employee_show.user_type'), value: employeeTypeLabel.value },
  ]);

  const permissionLabels = computed(
    () =>
      new Map<string, string>(
        createAdminPermissions().flatMap((module) =>
          module.permissions.flatMap((group) =>
            group.permissions.map(
              (permission) =>
                [permission.code, `${t(permission.labelKey)} ${t(group.labelKey)}`] as [
                  string,
                  string,
                ],
            ),
          ),
        ),
      ),
  );
  const permissionLabel = (permission: EmployeePermission): string => {
    if (permission.title && permission.title !== permission.code) return permission.title;
    return permissionLabels.value.get(permission.code) ?? permission.code;
  };

  const parseDate = (value: string): Date | null => {
    if (!value) return null;
    const date = new Date(value.includes(' ') ? value.replace(' ', 'T') : value);
    return Number.isNaN(date.getTime()) ? null : date;
  };
  const formatHistoryDate = (entry: EmployeeHistoryEntry): string => {
    if (entry.date) return entry.date;
    const date = parseDate(entry.occurredAt);
    if (!date) return '—';
    return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
      .format(date)
      .replace(/\//g, '-');
  };
  const formatHistoryTime = (entry: EmployeeHistoryEntry): string => {
    if (entry.time) return entry.time;
    const date = parseDate(entry.occurredAt);
    if (!date) return '—';
    return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };
  const formatAuditDate = (value: string): string => {
    const date = parseDate(value);
    if (!date) return valueOrDash(value);
    return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };
  const historyAction = (action: string): string => {
    const normalized = action.toLowerCase().replace(/[_-]+/g, ' ');
    if (normalized.includes('profile') && normalized.includes('updat')) {
      return t('employee_show.history_actions.profile_updated');
    }
    if (normalized.includes('role') && normalized.includes('updat')) {
      return t('employee_show.history_actions.role_updated');
    }
    if (normalized.includes('activat')) {
      return t('employee_show.history_actions.account_activated');
    }
    if (normalized.includes('creat')) return t('employee_show.history_actions.employee_created');
    return valueOrDash(action);
  };
  const recordInformation = computed(() =>
    [
      {
        label: t('employee_show.created_by'),
        value: employee.value?.createdBy ?? '',
      },
      {
        label: t('employee_show.created_at'),
        value: employee.value?.createdAt ? formatAuditDate(employee.value.createdAt) : '',
      },
      {
        label: t('employee_show.updated_by'),
        value: employee.value?.updatedBy ?? '',
      },
      {
        label: t('employee_show.updated_at'),
        value: employee.value?.updatedAt ? formatAuditDate(employee.value.updatedAt) : '',
      },
    ].filter((item) => item.value),
  );

  const deleteEmployee = async () => {
    if (!employee.value?.id) return;
    const result = await controller.delete(new DeleteEmployeeParams(employee.value.id));
    if (!result || result.hasError) return;
    await router.replace({ name: 'Employees' });
  };
  const actionList = computed(() => {
    if (!employee.value?.id) return [];

    return [
      {
        text: t('edit'),
        icon: EditIcon,
        link: `/employees/edit/${employee.value.id}`,
      },
      {
        text: t('delete'),
        icon: DeleteIcon,
        action: deleteEmployee,
        danger: true,
      },
    ];
  });
  const scopeArrow = computed(() => (locale.value.startsWith('ar') ? '←' : '→'));

  onMounted(fetchEmployee);
</script>

<template>
  <DataStatusBuilder :controller="itemState" :on-retry="retryEmployee" use-skeleton>
    <template #loader>
      <div class="employee-show-skeleton" aria-hidden="true">
        <div class="employee-show-skeleton__summary"></div>
        <div class="employee-show-skeleton__content">
          <div v-for="index in 5" :key="index"></div>
        </div>
      </div>
    </template>

    <template #success>
      <main v-if="employee" class="employee-show-page">
        <section class="employee-show-summary" :aria-label="$t('employee_show.title')">
          <div class="employee-show-summary__identity">
            <img v-if="employee.image" :src="employee.image" :alt="employee.name" />
            <span v-else class="employee-show-summary__avatar" aria-hidden="true">
              {{ initials || '?' }}
            </span>
            <div class="employee-show-summary__text">
              <div class="employee-show-summary__name-row">
                <h1>{{ valueOrDash(employee.name) }}</h1>
                <span
                  class="employee-show-summary__status"
                  :data-active="employee.status === EmployeeStatusEnm.active"
                >
                  {{ statusLabel }}
                </span>
              </div>
              <p>
                {{ valueOrDash(employee.employeeId) }}
                <span aria-hidden="true">·</span>
                {{ employeeTypeLabel }}
              </p>
            </div>
          </div>

          <DropList
            :action-list="actionList"
            :delete-dialog-title="$t('employee_show.delete_title')"
            :delete-dialog-message="$t('employee_show.delete_message')"
          />
        </section>

        <div class="employee-show-layout">
          <div class="employee-show-layout__main">
            <article class="employee-show-card">
              <header class="employee-show-card__header">
                <h2>{{ $t('employee_show.basic_information') }}</h2>
                <p>{{ $t('employee_show.basic_description') }}</p>
              </header>
              <dl class="employee-show-card__details">
                <div v-for="item in basicInformation" :key="item.label">
                  <dt>{{ item.label }}</dt>
                  <dd>{{ item.value }}</dd>
                </div>
              </dl>
            </article>

            <article class="employee-show-card">
              <header class="employee-show-card__header">
                <h2>{{ $t('employee_show.assigned_roles') }}</h2>
                <p>{{ $t('employee_show.assigned_roles_description') }}</p>
              </header>
              <div v-if="employee.roles.length" class="employee-show-card__chips">
                <span v-for="role in employee.roles" :key="role.id">{{ role.title }}</span>
              </div>
              <p v-else class="employee-show-card__empty">
                {{ $t('employee_show.no_roles') }}
              </p>
            </article>

            <article class="employee-show-card">
              <header class="employee-show-card__header">
                <h2>{{ $t('employee_show.effective_permissions') }}</h2>
                <p>{{ $t('employee_show.effective_permissions_description') }}</p>
              </header>
              <div
                v-if="employee.permissions.length"
                class="employee-show-card__chips --permissions"
              >
                <span v-for="permission in employee.permissions" :key="permission.code">
                  <span aria-hidden="true">✓</span>
                  {{ permissionLabel(permission) }}
                </span>
              </div>
              <p v-else class="employee-show-card__empty">
                {{ $t('employee_show.no_permissions') }}
              </p>
            </article>

            <article
              v-if="employee.employeeType === EmployeeTypeEnum.TEACHER"
              class="employee-show-card"
            >
              <header class="employee-show-card__header">
                <h2>{{ $t('employee_show.teacher_scope') }}</h2>
                <p>{{ $t('employee_show.teacher_scope_description') }}</p>
              </header>
              <div v-if="employee.scopeLabels.length" class="employee-show-card__scope">
                <template v-for="(label, index) in employee.scopeLabels" :key="`${label}-${index}`">
                  <span>{{ label }}</span>
                  <b v-if="index < employee.scopeLabels.length - 1" aria-hidden="true">
                    {{ scopeArrow }}
                  </b>
                </template>
              </div>
              <p v-else class="employee-show-card__empty">
                {{ $t('employee_show.no_scope') }}
              </p>
            </article>

            <article class="employee-show-card">
              <header class="employee-show-card__header">
                <h2>{{ $t('employee_show.record_information') }}</h2>
                <p>{{ $t('employee_show.record_information_description') }}</p>
              </header>
              <dl v-if="recordInformation.length" class="employee-show-card__record">
                <div v-for="item in recordInformation" :key="item.label">
                  <dt>{{ item.label }}</dt>
                  <dd>{{ item.value }}</dd>
                </div>
              </dl>
              <p v-else class="employee-show-card__empty">
                {{ $t('employee_show.no_record_information') }}
              </p>
            </article>
          </div>

          <aside class="employee-show-card employee-show-history">
            <header class="employee-show-card__header">
              <h2>{{ $t('employee_show.history_log') }}</h2>
            </header>
            <ol v-if="employee.history.length" class="employee-show-history__list">
              <li v-for="entry in employee.history" :key="entry.id">
                <time :datetime="entry.occurredAt">{{ formatHistoryDate(entry) }}</time>
                <div>
                  <strong>{{ historyAction(entry.action) }}</strong>
                  <p>
                    {{ $t('employee_show.by_actor', { name: valueOrDash(entry.actor) }) }}
                  </p>
                </div>
                <small>{{ formatHistoryTime(entry) }}</small>
              </li>
            </ol>
            <p v-else class="employee-show-card__empty">
              {{ $t('employee_show.no_history') }}
            </p>
          </aside>
        </div>
      </main>
    </template>

    <template #empty>
      <section class="employee-show-state">
        <h1>{{ $t('employee_show.error_title') }}</h1>
        <p>{{ $t('employee_show.error_description') }}</p>
        <button class="btn btn-primary" type="button" @click="fetchEmployee">
          {{ $t('employee_show.retry') }}
        </button>
      </section>
    </template>

    <template #failed>
      <section class="employee-show-state">
        <h1>{{ $t('employee_show.error_title') }}</h1>
        <p>{{ $t('employee_show.error_description') }}</p>
        <button class="btn btn-primary" type="button" @click="fetchEmployee">
          {{ $t('employee_show.retry') }}
        </button>
      </section>
    </template>

    <template #no-network>
      <section class="employee-show-state">
        <h1>{{ $t('employee_show.error_title') }}</h1>
        <p>{{ $t('employee_show.error_description') }}</p>
        <button class="btn btn-primary" type="button" @click="fetchEmployee">
          {{ $t('employee_show.retry') }}
        </button>
      </section>
    </template>
  </DataStatusBuilder>
</template>

<style scoped lang="scss">
  .employee-show-page,
  .employee-show-skeleton {
    display: grid;
    gap: 24px;
    width: 100%;
  }

  .employee-show-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    min-height: 116px;
    padding: 20px;
    overflow: hidden;
    border: 1px solid var(--border-weak);
    border-radius: 20px;
    background: var(--background-color-soft-light);

    &__identity,
    &__name-row {
      display: flex;
      align-items: center;
    }

    &__identity {
      gap: 16px;
      min-width: 0;

      > img,
      > .employee-show-summary__avatar {
        width: 64px;
        height: 64px;
        flex: 0 0 64px;
        border-radius: 50%;
      }

      > img {
        object-fit: cover;
      }
    }

    &__avatar {
      display: grid;
      place-items: center;
      background: var(--PrimaryColor-alpha-15);
      color: var(--PrimaryColor);
      font-size: 20px;
      font-weight: 700;
    }

    &__text {
      min-width: 0;

      h1,
      p {
        margin: 0;
      }

      h1 {
        overflow: hidden;
        color: var(--title-card-color);
        font-size: 22px;
        font-weight: 700;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      p {
        display: flex;
        gap: 6px;
        align-items: center;
        margin-top: 7px;
        color: var(--gray-500);
        font-size: 13px;
      }
    }

    &__name-row {
      gap: 10px;
      min-width: 0;
    }

    &__status {
      flex: 0 0 auto;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      background: var(--warning-light);
      color: var(--warning-dark);
      font-size: 12px;
      font-weight: 600;

      &[data-active='true'] {
        background: var(--success-light);
        color: var(--success-dark);
      }
    }

    :deep(.list-trigger) {
      width: 36px;
      height: 36px;
      flex: 0 0 36px;
    }
  }

  .employee-show-layout {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(280px, 0.9fr);
    gap: 20px;
    align-items: start;

    &__main {
      display: grid;
      gap: 20px;
      min-width: 0;
    }
  }

  .employee-show-card {
    overflow: hidden;
    border: 1px solid var(--border-weak);
    border-radius: 16px;
    background: var(--bg-card);

    &__header {
      padding: 16px 18px;
      background: var(--background-color-soft-light);

      h2,
      p {
        margin: 0;
      }

      h2 {
        color: var(--title-card-color);
        font-size: 17px;
        font-weight: 700;
      }

      p {
        margin-top: 4px;
        color: var(--gray-500);
        font-size: 12px;
      }
    }

    &__details,
    &__record {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px 30px;
      margin: 0;
      padding: 18px;

      div {
        min-width: 0;
      }

      dt {
        color: var(--gray-500);
        font-size: 11px;
      }

      dd {
        margin: 3px 0 0;
        overflow-wrap: anywhere;
        color: var(--title-card-color);
        font-size: 14px;
        font-weight: 600;
      }
    }

    &__record {
      gap: 10px;

      div {
        padding: 12px;
        border: 1px solid var(--border-weak);
        border-radius: 9px;
        background: var(--background-color-soft-light);
      }
    }

    &__chips,
    &__scope {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
      padding: 18px;

      span {
        padding: 6px 12px;
        border: 1px solid var(--border-weak);
        border-radius: var(--radius-full);
        background: var(--background-color-soft-light);
        color: var(--title-card-color);
        font-size: 12px;
      }
    }

    &__chips.--permissions span {
      border-color: var(--PrimaryColor-alpha-15);
      background: var(--success-light);
      color: var(--success-dark);
    }

    &__scope b {
      color: var(--gray-400);
      font-weight: 400;
    }

    &__empty {
      margin: 0;
      padding: 18px;
      color: var(--gray-500);
      font-size: 13px;
    }
  }

  .employee-show-history {
    position: sticky;
    top: 20px;

    &__list {
      display: grid;
      gap: 0;
      margin: 0;
      padding: 18px;
      list-style: none;

      li {
        position: relative;
        display: grid;
        grid-template-columns: 86px minmax(0, 1fr) auto;
        gap: 12px;
        align-items: start;
        min-height: 76px;
        padding-bottom: 18px;

        &:not(:last-child)::after {
          position: absolute;
          top: 32px;
          bottom: 0;
          inset-inline-start: 42px;
          width: 1px;
          background: var(--border-weak);
          content: '';
        }
      }

      time {
        position: relative;
        z-index: 1;
        padding: 6px 8px;
        border-radius: 8px;
        background: var(--PrimaryColor);
        color: var(--BgWhite);
        font-size: 11px;
        text-align: center;
        white-space: nowrap;
      }

      strong {
        display: block;
        color: var(--title-card-color);
        font-size: 13px;
        line-height: 1.35;
      }

      p,
      small {
        color: var(--gray-500);
        font-size: 10px;
      }

      p {
        margin: 5px 0 0;
      }

      small {
        white-space: nowrap;
      }
    }
  }

  .employee-show-state {
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

  .employee-show-skeleton {
    &__summary,
    &__content > div {
      border-radius: 16px;
      background: var(--gray-100);
      animation: employee-show-pulse 1.4s ease-in-out infinite;
    }

    &__summary {
      min-height: 116px;
    }

    &__content {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;

      > div {
        min-height: 170px;
      }
    }
  }

  @keyframes employee-show-pulse {
    50% {
      opacity: 0.55;
    }
  }

  @media (max-width: 980px) {
    .employee-show-layout {
      grid-template-columns: 1fr;
    }

    .employee-show-history {
      position: static;
    }
  }

  @media (max-width: 640px) {
    .employee-show-summary {
      align-items: flex-start;
      padding: 16px;

      &__identity {
        align-items: flex-start;
      }

      &__name-row {
        align-items: flex-start;
        flex-direction: column;
      }
    }

    .employee-show-card {
      &__details,
      &__record {
        grid-template-columns: 1fr;
      }
    }

    .employee-show-history__list li {
      grid-template-columns: 78px minmax(0, 1fr);

      small {
        grid-column: 2;
      }
    }

    .employee-show-skeleton__content {
      grid-template-columns: 1fr;
    }
  }
</style>
