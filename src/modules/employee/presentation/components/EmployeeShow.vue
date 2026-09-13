<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import fallbackAvatar from '@/assets/images/user-image.png';
  import EmployeeController from '../controllers/employee.controller';
  import RoleController from '@/modules/Role/presentation/controllers/role.controller';
  import ShowEmployeeParams from '../../core/params/show.employee.params';
  import ShowRoleParams from '@/modules/Role/core/params/show.role.params';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { createAdminPermissions } from '@/modules/Permission/core/constants/admin.permissions';
  import { EmployeeStatusEnm } from '../../core/constant/employee.status.enum';
  import { EmployeeTypeEnum } from '../../core/constant/employee.type.enum';
  import { GenderENum } from '../../core/constant/gender.enum';
  import type EmployeeModel from '../../core/models/employee.model';

  const route = useRoute();
  const { locale, t } = useI18n();
  const employeeController = EmployeeController.getInstance();
  const roleController = RoleController.getInstance();
  const employeeId = computed(() => Number(route.params.id));
  const employeeState = computed(() => employeeController.itemState.value);
  const employee = computed(() => employeeController.itemData.value);
  const permissions = ref<string[]>([]);
  const permissionsLoading = ref(false);
  const permissionsUnavailable = ref(false);

  const fetchEmployeeDetails = async () => {
    if (!Number.isInteger(employeeId.value) || employeeId.value < 1) return;

    permissionsLoading.value = true;
    permissionsUnavailable.value = false;
    const employeeResult = await employeeController.fetchOne(
      new ShowEmployeeParams(employeeId.value),
    );
    if (!(employeeResult instanceof DataSuccess) || !employeeResult.data) {
      permissions.value = [];
      permissionsLoading.value = false;
      return;
    }

    const currentEmployee = employeeResult.data as EmployeeModel;
    const roleIds = currentEmployee.roles.map(({ id }) => id);
    if (!roleIds.length) {
      permissions.value = [];
      permissionsLoading.value = false;
      return;
    }

    const roleResults = await Promise.all(
      roleIds.map((roleId: number) => roleController.fetchOne(new ShowRoleParams(roleId))),
    );
    const loadedRoles = roleResults.flatMap((result) =>
      result instanceof DataSuccess && result.data ? [result.data] : [],
    );
    permissions.value = [...new Set(loadedRoles.flatMap((role) => role.permissions))];
    permissionsUnavailable.value = loadedRoles.length === 0;
    permissionsLoading.value = false;
  };

  const permissionLabels = computed(() => {
    const labels = new Map<string, string>();
    createAdminPermissions().forEach((module) => {
      module.permissions.forEach((group) => {
        labels.set(group.code, t(group.labelKey));
        group.permissions.forEach((permission) => {
          labels.set(permission.code, `${t(group.labelKey)} · ${t(permission.labelKey)}`);
        });
      });
    });

    return permissions.value.map((permission) => labels.get(permission) ?? permission);
  });

  const statusLabel = computed(() =>
    employee.value?.status === EmployeeStatusEnm.active
      ? t('employee_details.active')
      : t('employee_details.inactive'),
  );
  const employeeTypeLabel = computed(() =>
    employee.value?.employeeType === EmployeeTypeEnum.TEACHER
      ? t('employee_details.teacher')
      : t('employee_details.admin'),
  );
  const genderLabel = computed(() =>
    employee.value?.gender === GenderENum.female
      ? t('employee_details.female')
      : t('employee_details.male'),
  );
  const employeeReference = computed(() =>
    employee.value?.employeeId
      ? employee.value.employeeId
      : String(employee.value?.id ?? employeeId.value).padStart(2, '0'),
  );
  const teacherScope = computed(
    () =>
      employee.value?.subjects.flatMap((subject) =>
        String(subject.title ?? subject.id)
          .split(/\s*(?:->|→)\s*/)
          .filter(Boolean),
      ) ?? [],
  );

  const valueOrDash = (value?: string | number) =>
    value === undefined || value === null || value === ''
      ? t('employee_details.not_available')
      : String(value);

  const formatDate = (value?: string) => {
    if (!value) return t('employee_details.not_available');
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat(locale.value, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(parsed);
  };

  const formatTime = (value?: string) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';

    return new Intl.DateTimeFormat(locale.value, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsed);
  };

  const formatDateTime = (value?: string) => {
    if (!value) return t('employee_details.not_available');
    const date = formatDate(value);
    const time = formatTime(value);
    return time ? `${date} · ${time}` : date;
  };

  onMounted(fetchEmployeeDetails);
</script>

<template>
  <DataStatusBuilder :controller="employeeState" :on-retry="fetchEmployeeDetails" use-skeleton>
    <template #loader>
      <div class="employee-show-skeleton" aria-hidden="true">
        <div class="employee-show-skeleton__header"></div>
        <div class="employee-show-skeleton__layout">
          <div class="employee-show-skeleton__content"></div>
          <div class="employee-show-skeleton__history"></div>
        </div>
      </div>
    </template>

    <template #success>
      <main v-if="employee" class="employee-show-page">
        <header class="employee-show-page__profile">
          <img
            class="employee-show-page__avatar"
            :src="employee.image || fallbackAvatar"
            :alt="$t('employee_details.avatar_alt', { name: employee.name })"
          />
          <div class="employee-show-page__identity">
            <div class="employee-show-page__name-row">
              <h1>{{ employee.name }}</h1>
              <span
                class="employee-show-page__status"
                :class="{
                  'employee-show-page__status--inactive':
                    employee.status !== EmployeeStatusEnm.active,
                }"
              >
                {{ statusLabel }}
              </span>
            </div>
            <p>{{ employeeReference }} · {{ employeeTypeLabel }}</p>
          </div>
          <router-link
            class="employee-show-page__profile-action"
            :to="{ name: 'Edit Employee', params: { id: employee.id } }"
            :title="$t('employee_details.edit')"
            :aria-label="$t('employee_details.edit_employee', { name: employee.name })"
          >
            ⋮
          </router-link>
        </header>

        <div class="employee-show-page__layout">
          <div class="employee-show-page__content">
            <section class="employee-detail-card" aria-labelledby="employee-basic-info-title">
              <header>
                <h2 id="employee-basic-info-title">
                  {{ $t('employee_details.basic_information') }}
                </h2>
                <p>{{ $t('employee_details.basic_information_description') }}</p>
              </header>
              <dl class="employee-detail-grid">
                <div>
                  <dt>{{ $t('employee_details.employee_id') }}</dt>
                  <dd>{{ employeeReference }}</dd>
                </div>
                <div>
                  <dt>{{ $t('employee_details.email') }}</dt>
                  <dd>{{ valueOrDash(employee.email) }}</dd>
                </div>
                <div>
                  <dt>{{ $t('employee_details.phone') }}</dt>
                  <dd>{{ valueOrDash(employee.phone) }}</dd>
                </div>
                <div>
                  <dt>{{ $t('employee_details.gender') }}</dt>
                  <dd>{{ genderLabel }}</dd>
                </div>
                <div>
                  <dt>{{ $t('employee_details.user_type') }}</dt>
                  <dd>{{ employeeTypeLabel }}</dd>
                </div>
                <div>
                  <dt>{{ $t('employee_details.status') }}</dt>
                  <dd>{{ statusLabel }}</dd>
                </div>
              </dl>
            </section>

            <section class="employee-detail-card" aria-labelledby="employee-roles-title">
              <header>
                <h2 id="employee-roles-title">{{ $t('employee_details.assigned_roles') }}</h2>
                <p>{{ $t('employee_details.assigned_roles_description') }}</p>
              </header>
              <div
                v-if="employee.roles.length"
                class="employee-detail-pills employee-detail-pills--neutral"
              >
                <span v-for="role in employee.roles" :key="role.id">
                  {{ role.title || `#${role.id}` }}
                </span>
              </div>
              <p v-else class="employee-detail-card__empty">
                {{ $t('employee_details.no_roles') }}
              </p>
            </section>

            <section class="employee-detail-card" aria-labelledby="employee-permissions-title">
              <header>
                <h2 id="employee-permissions-title">
                  {{ $t('employee_details.effective_permissions') }}
                </h2>
                <p>{{ $t('employee_details.effective_permissions_description') }}</p>
              </header>
              <p v-if="permissionsLoading" class="employee-detail-card__empty" role="status">
                {{ $t('employee_details.loading_permissions') }}
              </p>
              <p v-else-if="permissionsUnavailable" class="employee-detail-card__empty">
                {{ $t('employee_details.permissions_unavailable') }}
              </p>
              <div v-else-if="permissionLabels.length" class="employee-detail-pills">
                <span v-for="permission in permissionLabels" :key="permission">
                  ✓ {{ permission }}
                </span>
              </div>
              <p v-else class="employee-detail-card__empty">
                {{ $t('employee_details.no_permissions') }}
              </p>
            </section>

            <section class="employee-detail-card" aria-labelledby="employee-teacher-scope-title">
              <header>
                <h2 id="employee-teacher-scope-title">
                  {{ $t('employee_details.teacher_scope') }}
                </h2>
                <p>{{ $t('employee_details.teacher_scope_description') }}</p>
              </header>
              <p
                v-if="employee.employeeType !== EmployeeTypeEnum.TEACHER"
                class="employee-detail-card__empty"
              >
                {{ $t('employee_details.teacher_scope_not_applicable') }}
              </p>
              <div
                v-else-if="teacherScope.length"
                class="employee-detail-pills employee-detail-pills--scope"
              >
                <template v-for="(scope, index) in teacherScope" :key="`${scope}-${index}`">
                  <span>{{ scope }}</span>
                  <b v-if="index < teacherScope.length - 1" aria-hidden="true">→</b>
                </template>
              </div>
              <p v-else class="employee-detail-card__empty">
                {{ $t('employee_details.no_subjects') }}
              </p>
            </section>

            <section class="employee-detail-card" aria-labelledby="employee-record-title">
              <header>
                <h2 id="employee-record-title">{{ $t('employee_details.record_information') }}</h2>
                <p>{{ $t('employee_details.record_information_description') }}</p>
              </header>
              <dl class="employee-detail-grid employee-detail-grid--record">
                <div>
                  <dt>{{ $t('employee_details.created_by') }}</dt>
                  <dd>{{ valueOrDash(employee.createdBy) }}</dd>
                </div>
                <div>
                  <dt>{{ $t('employee_details.created_at') }}</dt>
                  <dd>{{ formatDateTime(employee.createdAt) }}</dd>
                </div>
                <div>
                  <dt>{{ $t('employee_details.updated_by') }}</dt>
                  <dd>{{ valueOrDash(employee.updatedBy) }}</dd>
                </div>
                <div>
                  <dt>{{ $t('employee_details.last_updated') }}</dt>
                  <dd>{{ formatDateTime(employee.updatedAt) }}</dd>
                </div>
              </dl>
            </section>
          </div>

          <aside class="employee-history-card" aria-labelledby="employee-history-title">
            <h2 id="employee-history-title">{{ $t('employee_details.history_log') }}</h2>
            <ol v-if="employee.history.length" class="employee-history-card__timeline">
              <li v-for="entry in employee.history" :key="entry.id">
                <time class="employee-history-card__date" :datetime="entry.createdAt">
                  {{ formatDate(entry.createdAt) }}
                </time>
                <div class="employee-history-card__event">
                  <strong>{{ valueOrDash(entry.action) }}</strong>
                  <span v-if="entry.actor">
                    {{ $t('employee_details.history_by', { name: entry.actor }) }}
                  </span>
                </div>
                <time class="employee-history-card__time" :datetime="entry.createdAt">
                  {{ formatTime(entry.createdAt) }}
                </time>
              </li>
            </ol>
            <p v-else class="employee-history-card__empty">
              {{ $t('employee_details.no_history') }}
            </p>
          </aside>
        </div>
      </main>
    </template>

    <template #empty>
      <section class="employee-show-state">
        <h1>{{ $t('employee_details.not_found_title') }}</h1>
        <p>{{ $t('employee_details.not_found_description') }}</p>
      </section>
    </template>

    <template #failed>
      <section class="employee-show-state">
        <h1>{{ $t('employee_details.error_title') }}</h1>
        <p>{{ $t('employee_details.error_description') }}</p>
        <button type="button" class="btn btn-primary" @click="fetchEmployeeDetails">
          {{ $t('employee_details.retry') }}
        </button>
      </section>
    </template>

    <template #no-network>
      <section class="employee-show-state">
        <h1>{{ $t('employee_details.error_title') }}</h1>
        <p>{{ $t('employee_details.error_description') }}</p>
        <button type="button" class="btn btn-primary" @click="fetchEmployeeDetails">
          {{ $t('employee_details.retry') }}
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
    margin-inline: auto;
  }

  .employee-show-page__profile {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
    min-height: 112px;
    padding: 20px;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-xl);
    background: var(--standard-white);
    box-shadow: var(--shadow-sm);
  }

  .employee-show-page__avatar {
    width: 72px;
    height: 72px;
    flex: 0 0 72px;
    border: 3px solid var(--standard-white);
    border-radius: 50%;
    box-shadow: var(--shadow-sm);
    object-fit: cover;
  }

  .employee-show-page__identity {
    min-width: 0;

    h1,
    p {
      margin: 0;
    }

    p {
      margin-top: 6px;
      color: var(--gray-500);
      font-size: 14px;
    }
  }

  .employee-show-page__name-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;

    h1 {
      color: var(--gray-900);
      font-size: clamp(20px, 3vw, 26px);
      font-weight: 700;
    }
  }

  .employee-show-page__status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: var(--radius-full);
    background: var(--success-light);
    color: var(--success-dark);
    font-size: 12px;
    font-weight: 700;

    &::before {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
      content: '';
    }

    &--inactive {
      background: var(--warning-light);
      color: var(--warning-dark);
    }
  }

  .employee-show-page__profile-action {
    display: grid;
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    place-items: center;
    margin-inline-start: auto;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--standard-white);
    color: var(--gray-600);
    font-size: 22px;
    line-height: 1;
    text-decoration: none;

    &:hover,
    &:focus-visible {
      border-color: var(--primary-green);
      color: var(--primary-green);
    }
  }

  .employee-show-page__layout,
  .employee-show-skeleton__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
    align-items: start;
    gap: 20px;
  }

  .employee-show-page__content {
    display: grid;
    gap: 16px;
  }

  .employee-detail-card,
  .employee-history-card,
  .employee-show-state {
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    background: var(--standard-white);
    box-shadow: var(--shadow-sm);
  }

  .employee-detail-card {
    overflow: hidden;

    > header {
      padding: 14px 18px;
      background: var(--gray-50);

      h2,
      p {
        margin: 0;
      }

      h2 {
        color: var(--gray-900);
        font-size: 17px;
        font-weight: 700;
      }

      p {
        margin-top: 5px;
        color: var(--gray-500);
        font-size: 12px;
      }
    }

    > .employee-detail-grid,
    > .employee-detail-pills,
    > .employee-detail-card__empty {
      padding: 16px 18px;
    }
  }

  .employee-detail-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px 32px;
    margin: 0;

    &--record {
      grid-template-columns: repeat(2, minmax(0, 1fr));

      div {
        padding: 10px;
        border: 1px solid var(--border-weak);
        border-radius: var(--radius-sm);
        background: var(--gray-50);
      }
    }

    div {
      min-width: 0;
    }

    dt {
      margin-bottom: 5px;
      color: var(--gray-500);
      font-size: 12px;
      font-weight: 600;
    }

    dd {
      overflow-wrap: anywhere;
      margin: 0;
      color: var(--gray-900);
      font-size: 14px;
      font-weight: 600;
    }
  }

  .employee-detail-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    span {
      padding: 7px 10px;
      border: 1px solid var(--PrimaryColor-alpha-20);
      border-radius: var(--radius-full);
      background: var(--success-light);
      color: var(--success-dark);
      font-size: 12px;
      font-weight: 600;
    }

    &--neutral span,
    &--scope span {
      border-color: var(--border-weak);
      background: var(--gray-50);
      color: var(--gray-800);
    }

    &--scope {
      align-items: center;

      b {
        color: var(--gray-400);
        font-size: 13px;
        font-weight: 400;
      }
    }
  }

  .employee-detail-card__empty,
  .employee-history-card__empty {
    margin: 0;
    color: var(--gray-500);
    font-size: 13px;
  }

  .employee-history-card {
    position: sticky;
    top: 16px;
    overflow: hidden;

    > h2 {
      padding: 16px;
      margin: 0;
      background: var(--gray-50);
      color: var(--gray-900);
      font-size: 17px;
    }
  }

  .employee-history-card__timeline {
    display: grid;
    gap: 20px;
    padding: 18px 16px;
    margin: 0;
    list-style: none;

    li {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: start;
      gap: 9px;
    }
  }

  .employee-history-card__date {
    width: fit-content;
    padding: 5px 8px;
    border-radius: var(--radius-md);
    background: var(--primary-green);
    color: var(--standard-white);
    font-size: 9px;
    font-weight: 700;
    white-space: nowrap;
  }

  .employee-history-card__event {
    display: grid;
    gap: 4px;

    strong {
      color: var(--gray-800);
      font-size: 11px;
      line-height: 1.35;
    }

    span {
      color: var(--gray-500);
      font-size: 9px;
    }
  }

  .employee-history-card__time {
    color: var(--gray-500);
    font-size: 8px;
    white-space: nowrap;
  }

  .employee-history-card__empty {
    padding: 18px 16px;
  }

  .employee-show-state {
    display: grid;
    justify-items: center;
    gap: 12px;
    min-height: 320px;
    padding: 48px 24px;
    text-align: center;

    h1,
    p {
      margin: 0;
    }

    p {
      color: var(--gray-500);
    }
  }

  .employee-show-skeleton__header,
  .employee-show-skeleton__content,
  .employee-show-skeleton__history {
    border-radius: var(--radius-lg);
    background: var(--gray-100);
    animation: employee-show-pulse 1.4s ease-in-out infinite;
  }

  .employee-show-skeleton__header {
    width: min(360px, 100%);
    height: 76px;
  }

  .employee-show-skeleton__content,
  .employee-show-skeleton__history {
    min-height: 620px;
  }

  @keyframes employee-show-pulse {
    50% {
      opacity: 0.55;
    }
  }

  @media (max-width: 800px) {
    .employee-show-page__layout,
    .employee-show-skeleton__layout {
      grid-template-columns: 1fr;
    }

    .employee-history-card {
      position: static;
    }
  }

  @media (max-width: 540px) {
    .employee-show-page,
    .employee-show-skeleton {
      gap: 18px;
    }

    .employee-show-page__avatar {
      width: 58px;
      height: 58px;
      flex-basis: 58px;
    }

    .employee-detail-card,
    .employee-history-card {
      border-radius: var(--radius-md);
    }

    .employee-detail-grid,
    .employee-detail-grid--record {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
</style>
