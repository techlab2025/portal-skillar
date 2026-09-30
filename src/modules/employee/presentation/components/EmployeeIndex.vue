<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import DropList from '@/shared/HelpersComponents/DropList.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import EmployeeController from '../controllers/employee.controller';
  import IndexEmployeeParams from '../../core/params/index.employee.params';
  import DeleteEmployeeParams from '../../core/params/delete.employee.params';
  import EditEmployeeParams from '../../core/params/edit.employee.params';
  import ShowEmployeeParams from '../../core/params/show.employee.params';
  import type EmployeeModel from '../../core/models/employee.model';
  import { useFormsStore } from '@/stores/formsStore';
  import IndexPluseIcon from '@/shared/icons/IndexPluseIcon.vue';
  import * as XLSX from 'xlsx';
  import { saveAs } from 'file-saver';
  import ExportExcelIcon from '@/shared/icons/ExportExcelIcon.vue';
  import IndexSearchIcon from '@/shared/icons/IndexSearchIcon.vue';
  import { EmployeeStatusEnm } from '../../core/constant/employee.status.enum';
  import { EmployeeTypeEnum } from '../../core/constant/employee.type.enum';
  import { useI18n } from 'vue-i18n';
  import FilterDialog from '@/shared/HelpersComponents/FilterDialog/FilterDialog.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import ShowIcon from '@/shared/icons/ShowIcon.vue';
  import EditIcon from '@/shared/icons/DropListIcons/EditIcon.vue';
  import DeleteIcon from '@/shared/icons/DropListIcons/DeletIcon.vue';
  import DeleteIllustration from '@/shared/icons/DeleteDialogIcons/DeleteIcon.vue';
  import ReloadIcon from '@/shared/icons/CustomSelect/ReloadIcon.vue';
  import warningImage from '@/assets/images/PLan/PlanDeleteWarning.gif';
  import { IndexRoleParams, RoleController } from '@/modules/Role';
  import IndexSubjectParams from '@/modules/Subjects/core/params/index.subject.params';
  import SubjectController from '@/modules/Subjects/presentation/controllers/subject.controller';
  import type StageModel from '@/modules/Stages/core/models/stage.model';
  import flattenBranchTree from '@/modules/document/core/TreeSelectHelper';

  // Controller instance
  const controller = EmployeeController.getInstance();
  const roleController = RoleController.getInstance();
  const subjectController = SubjectController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();
  const { locale, t } = useI18n();

  const FormStore = useFormsStore();
  const formRoute = computed(() => '/employees/add');
  const featureHeaderActionsTarget = ref<HTMLElement | null>(null);

  // Pagination state
  const perPage = ref(10);
  const word = ref('');
  const FilterDialogShow = ref(false);
  const selectedEmployeeType = ref<TitleInterface<number> | null>(null);
  const selectedRole = ref<TitleInterface<number> | null>(null);
  const selectedSubject = ref<TitleInterface<number> | null>(null);
  const selectedStatuses = ref<EmployeeStatusEnm[]>([]);
  const appliedEmployeeType = ref<TitleInterface<number> | null>(null);
  const appliedRole = ref<TitleInterface<number> | null>(null);
  const appliedSubject = ref<TitleInterface<number> | null>(null);
  const appliedStatuses = ref<EmployeeStatusEnm[]>([]);
  const subjectOptions = ref<TitleInterface<number>[]>([]);
  const indexRoleParams = new IndexRoleParams('', 1, 100, 0);

  const headers = computed<TableHeader[]>(() => [
    { key: 'firstname', label: t('employee_table.employee_name'), width: '20%', sortable: true },
    { key: 'email', label: t('employee_table.email'), width: '17%' },
    { key: 'phone', label: t('employee_table.phone'), width: '13%' },
    { key: 'employeeType', label: t('employee_table.user_type'), width: '11%' },
    { key: 'status', label: t('employee_table.status'), width: '10%' },
    { key: 'createdAt', label: t('employee_table.created_at'), width: '14%' },
    { key: 'createdBy', label: t('employee_table.created_by'), width: '15%' },
  ]);
  const employeeTypeOptions = computed<TitleInterface<number>[]>(() => [
    new TitleInterface({ id: EmployeeTypeEnum.ADMIN, title: t('employee_filter.admin') }),
    new TitleInterface({ id: EmployeeTypeEnum.TEACHER, title: t('employee_filter.teacher') }),
  ]);
  const statusOptions = computed(() => [
    {
      id: EmployeeStatusEnm.disavtive,
      title: t('employee_filter.inactive'),
      modifier: 'inactive',
    },
    { id: EmployeeStatusEnm.active, title: t('employee_filter.active'), modifier: 'active' },
    { id: EmployeeStatusEnm.draft, title: t('employee_filter.draft'), modifier: 'draft' },
  ]);

  const fetchEmployees = async (page: number = 1, wordStr: string = '') => {
    await controller.fetchList(
      new IndexEmployeeParams({
        word: wordStr || word.value,
        pageNumber: page,
        perPage: perPage.value,
        withPage: 1,
        status: appliedStatuses.value.length ? appliedStatuses.value : null,
        employeeType: appliedEmployeeType.value?.id as EmployeeTypeEnum | undefined,
        roleId: appliedRole.value?.id,
        subjectId: appliedSubject.value?.id,
      }),
    );
  };

  const fetchSubjectOptions = async () => {
    const result = await subjectController.indexSubjects(new IndexSubjectParams('', 1, 100, 0));
    const options = flattenBranchTree((result?.data ?? []) as StageModel[]);
    subjectOptions.value = options.filter(
      (option, index) => options.findIndex((item) => item.id === option.id) === index,
    );
  };

  const Search = debounce(() => {
    router.push({
      query: {
        ...route.query,
        page: 1,
        word: word.value || undefined,
      },
    });
    fetchEmployees(1, word.value);
  });

  const onPageChange = (page: number) => {
    fetchEmployees(page);
    router.push({
      query: {
        ...route.query,
        page: String(page),
        word: word.value,
      },
    });
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    fetchEmployees(1);
  };

  onMounted(async () => {
    featureHeaderActionsTarget.value = document.querySelector<HTMLElement>(
      '#feature-header-page-actions',
    );
    if (route.query.word) {
      word.value = String(route.query.word);
    }
    await Promise.all([
      fetchEmployees(route.query.page ? Number(route.query.page) : 1, word.value),
      fetchSubjectOptions(),
    ]);
  });

  const selectedEmployee = ref<EmployeeModel>();
  const employeeDialogVisible = ref(false);
  const employeeActionPending = ref(false);
  const canDeleteEmployee = computed(
    () => Number(selectedEmployee.value?.status) === EmployeeStatusEnm.disavtive,
  );

  const openEmployeeDialog =async  (employee: EmployeeModel) => {
    selectedEmployee.value = employee;
    await controller.delete(new DeleteEmployeeParams(employee.id!));
    fetchEmployees();
    employeeDialogVisible.value = true;
  };

  const confirmEmployeeAction = async () => {
    const employee = selectedEmployee.value;
    if (employeeActionPending.value || employee?.id == null) return;
    const deleting = canDeleteEmployee.value;
    employeeActionPending.value = true;
    try {
      // Read the full, current record before changing status or allowing deletion.
      const current = await controller.fetchOne(new ShowEmployeeParams(employee.id));
      if (!(current instanceof DataSuccess) || !current.data) return;
      selectedEmployee.value = current.data;
      let result;
      if (deleting) {
        if (Number(current.data.status) !== EmployeeStatusEnm.disavtive) return;
        result = await controller.delete(new DeleteEmployeeParams(employee.id));
      } else {
        if (Number(current.data.status) !== EmployeeStatusEnm.active) return;
        if (current.data.gender == null) return;
        result = await controller.update(
          new EditEmployeeParams({
            id: employee.id,
            firstname: current.data.firstname,
            lastname: current.data.lastname,
            email: current.data.email,
            phone: current.data.phone,
            image: current.data.image,
            EmployeeRef: current.data.employeeId,
            gender: current.data.gender,
            employeeStatus: EmployeeStatusEnm.disavtive,
            password: '',
            employeeType: current.data.employeeType,
            roleId: current.data.roleId,
            roleIds: current.data.roles.map(({ id }: TitleInterface<number>) => id),
            educationClassificationSubjectIds: current.data.educationClassificationSubjectIds,
          }),
        );
      }
      if (result instanceof DataSuccess) {
        employeeDialogVisible.value = false;
        await fetchEmployees();
      }
    } finally {
      employeeActionPending.value = false;
    }
  };

  const actionList = (employee: EmployeeModel) => {
    if (!employee.id) return [];

    const employeeId = employee.id;
    return [
      {
        text: t('view'),
        icon: ShowIcon,
        link: `/employees/${employeeId}`,
      },
      {
        text: t('edit'),
        icon: EditIcon,
        link: `/employees/edit/${employeeId}`,
      },
      {
        text: t('delete'),
        icon: DeleteIcon,
        action: () => openEmployeeDialog(employee),
        danger: true,
      },
    ];
  };

  const isDraft = computed(() => {
    const data = FormStore?.formData[formRoute.value] ?? {};
    return Object.keys(data).length === 0 || Object.values(data).every((v) => v == null);
  });

  const exportExcel = () => {
    if (!state.value.data || state.value.data.length === 0) {
      alert('No data available to export');
      return;
    }
    const worksheetData = state.value.data.map((item) => {
      return {
        name: item.name || 'N/A',
        email: item.email || null,
        phone: item.phone || null,
        password: '',
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'Employees.xlsx');
  };

  const GetEmployeeStatus = (status: number) => {
    switch (Number(status)) {
      case EmployeeStatusEnm.active:
        return t('active');
      case EmployeeStatusEnm.disavtive:
        return t('inactive');
      case EmployeeStatusEnm.draft:
        return t('employee_filter.draft');
      default:
        return '—';
    }
  };

  const getEmployeeType = (employee: EmployeeModel) => {
    if (!employee.hasEmployeeType) return '—';
    return employee.employeeType === EmployeeTypeEnum.TEACHER
      ? t('employee_filter.teacher')
      : t('employee_filter.admin');
  };

  const formatCreatedAt = (value: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const applyFilters = async () => {
    appliedEmployeeType.value = selectedEmployeeType.value;
    appliedRole.value = selectedRole.value;
    appliedSubject.value = selectedSubject.value;
    appliedStatuses.value = [...selectedStatuses.value];
    FilterDialogShow.value = false;
    await fetchEmployees(1);
  };

  const resetFilters = async () => {
    selectedEmployeeType.value = null;
    selectedRole.value = null;
    selectedSubject.value = null;
    selectedStatuses.value = [];
    appliedEmployeeType.value = null;
    appliedRole.value = null;
    appliedSubject.value = null;
    appliedStatuses.value = [];
    FilterDialogShow.value = false;
    await fetchEmployees(1);
  };
</script>

<template>
  <div class="employee-page">
    <div class="index-header">
      <div class="search-field">
        <span class="search-icon">
          <IndexSearchIcon />
        </span>
        <input
          v-model="word"
          placeholder="Search by employee name or email…"
          class="search-input"
          type="text"
          @input="Search"
        />
      </div>
      <div class="btns-container">
        <Teleport
          :to="featureHeaderActionsTarget ?? 'body'"
          :disabled="!featureHeaderActionsTarget"
        >
          <div class="employee-feature-header-actions">
            <button
              class="btn btn-secondary feature-header__action feature-header__action--secondary"
              type="button"
              @click="exportExcel"
            >
              <ExportExcelIcon aria-hidden="true" />
              <span>{{ $t('employee_export') }}</span>
            </button>
            <router-link :to="formRoute" class="btn btn-primary btn-add feature-header__action">
              <IndexPluseIcon aria-hidden="true" />
              <span>{{ $t(isDraft ? 'add_employee' : 'continue_adding') }}</span>
            </router-link>
          </div>
        </Teleport>
        <FilterDialog
          v-model="FilterDialogShow"
          dialog-class="employee-filter-dialog"
          width="25rem"
        >
          <template #content>
            <div class="employee-filter">
              <section class="employee-filter__section">
                <div class="employee-filter__heading">
                  <h2>{{ $t('employee_filter.user_type') }}</h2>
                  <button
                    type="button"
                    :aria-label="
                      $t('employee_filter.reset_field', {
                        field: $t('employee_filter.user_type'),
                      })
                    "
                    @click="selectedEmployeeType = null"
                  >
                    <ReloadIcon aria-hidden="true" />
                  </button>
                </div>
                <UpdatedCustomInputSelect
                  id="employee-filter-type"
                  v-model="selectedEmployeeType"
                  :placeholder="$t('employee_filter.select_user_type')"
                  :static-options="employeeTypeOptions"
                  :reload="false"
                  :has-header="true"
                />
              </section>

              <section class="employee-filter__section">
                <div class="employee-filter__heading">
                  <h2>{{ $t('employee_filter.role') }}</h2>
                  <button
                    type="button"
                    :aria-label="
                      $t('employee_filter.reset_field', {
                        field: $t('employee_filter.role'),
                      })
                    "
                    @click="selectedRole = null"
                  >
                    <ReloadIcon aria-hidden="true" />
                  </button>
                </div>
                <UpdatedCustomInputSelect
                  id="employee-filter-role"
                  v-model="selectedRole"
                  :placeholder="$t('employee_filter.select_role')"
                  :controller="roleController"
                  :params="indexRoleParams"
                  :reload="false"
                  :has-header="true"
                />
              </section>

              <!-- <section class="employee-filter__section">
                <div class="employee-filter__heading">
                  <h2>{{ $t('employee_filter.subject_scope') }}</h2>
                  <button
                    type="button"
                    :aria-label="
                      $t('employee_filter.reset_field', {
                        field: $t('employee_filter.subject_scope'),
                      })
                    "
                    @click="selectedSubject = null"
                  >
                    <ReloadIcon aria-hidden="true" />
                  </button>
                </div>
                <UpdatedCustomInputSelect
                  id="employee-filter-subject"
                  v-model="selectedSubject"
                  :placeholder="$t('employee_filter.select_subject_scope')"
                  :static-options="subjectOptions"
                  :reload="false"
                  :has-header="true"
                />
              </section> -->

              <section class="employee-filter__section">
                <div class="employee-filter__heading">
                  <h2>{{ $t('employee_filter.status') }}</h2>
                </div>
                <div class="employee-filter__statuses">
                  <label
                    v-for="option in statusOptions"
                    :key="option.id"
                    :class="`employee-filter__status employee-filter__status--${option.modifier}`"
                  >
                    <input v-model="selectedStatuses" type="checkbox" :value="option.id" />
                    <span class="employee-filter__checkbox" aria-hidden="true"></span>
                    <span>{{ option.title }}</span>
                  </label>
                </div>
              </section>
            </div>
          </template>

          <template #footer>
            <div class="employee-filter__actions">
              <button class="btn btn-primary" type="button" @click="applyFilters">
                {{ $t('employee_filter.apply') }}
              </button>
              <button class="btn btn-cancel" type="button" @click="resetFilters">
                {{ $t('employee_filter.reset') }}
              </button>
            </div>
          </template>
        </FilterDialog>
      </div>
    </div>

    <Dialog
      v-model:visible="employeeDialogVisible"
      modal
      :closable="false"
      :close-on-escape="!employeeActionPending"
      aria-labelledby="employee-delete-title"
      aria-describedby="employee-delete-message"
      :style="{ width: 'min(35rem, calc(100vw - 2rem))' }"
    >
      <template #container>
        <section
          class="delete-dialog employee-delete-dialog"
          :aria-busy="employeeActionPending"
          aria-live="polite"
        >
          <DeleteIllustration v-if="canDeleteEmployee" aria-hidden="true" />
          <img v-else class="employee-delete-warning" :src="warningImage" alt="" />
          <h2 id="employee-delete-title" class="dialog-title">
            {{
              $t(
                canDeleteEmployee
                  ? 'employee_delete.confirm_title'
                  : 'employee_delete.blocked_title',
              )
            }}
          </h2>
          <p id="employee-delete-message" class="dialog-message">
            {{
              $t(
                canDeleteEmployee
                  ? 'employee_delete.confirm_message'
                  : 'employee_delete.blocked_message',
              )
            }}
          </p>
          <div class="btns">
            <button
              type="button"
              class="btn"
              :class="canDeleteEmployee ? 'btn-delete-danger' : 'btn-primary'"
              data-testid="confirm-employee-action"
              :disabled="employeeActionPending"
              @click="confirmEmployeeAction"
            >
              {{ $t(canDeleteEmployee ? 'employee_delete.confirm' : 'deactivate') }}
            </button>
            <button
              type="button"
              class="btn btn-third"
              data-testid="cancel-employee-action"
              :disabled="employeeActionPending"
              @click="employeeDialogVisible = false"
            >
              {{ $t('cancel') }}
            </button>
          </div>
        </section>
      </template>
    </Dialog>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchEmployees()">
      <template #success="{ data }">
        <div class="table-frame">
          <AppTable
            :headers="headers"
            :items="data as EmployeeModel[]"
            :hoverable="true"
            :striped="true"
            show-index
          >
            <template #cell-status="{ item }">
              <p
                class="employee-status"
                :class="{
                  'dis-active': item.status == EmployeeStatusEnm.disavtive,
                  draft: item.status == EmployeeStatusEnm.draft,
                }"
              >
                {{ GetEmployeeStatus(item.status) }}
              </p>
            </template>
            <template #cell-employeeType="{ item }">
              {{ getEmployeeType(item) }}
            </template>
            <template #cell-createdAt="{ item }">
              {{ formatCreatedAt(item.createdAt) }}
            </template>
            <template #cell-createdBy="{ item }">
              {{ item.createdBy || '—' }}
            </template>
            <template #cell-firstname="{ item }">
              <div class="employee-name">
                <img
                  :src="item.image || `https://cyber.comolho.com/static/img/avatar.png`"
                  :alt="$t('employee_details.avatar_alt', { name: item.name })"
                />
                <span>{{ item.name }}</span>
              </div>
            </template>

            <template #actions="{ item }">
              <div class="row-actions">
                <DropList
                  :action-list="actionList(item)"
                  :delete-dialog-title="$t('employee_show.delete_title')"
                  :delete-dialog-message="$t('employee_show.delete_message')"
                />
              </div>
            </template>
          </AppTable>
        </div>

        <Pagination
          v-if="controller.pagination.value"
          :pagination="controller.pagination.value"
          @change-page="onPageChange"
          @count-per-page="onPerPageChange"
        />
      </template>

      <template #empty>
        <div class="employee-empty-state">
          <svg
            class="employee-empty-state__icon"
            aria-hidden="true"
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h3>{{ $t('employee_empty.title') }}</h3>
          <p>{{ $t('employee_empty.description') }}</p>
          <router-link :to="formRoute" class="btn btn-primary employee-empty-state__cta">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>{{ $t('employee_empty.action') }}</span>
          </router-link>
        </div>
      </template>
      <template #loader>
        <TableSkelaton
          :rows="5"
          :columns="headers.length"
          :has-actions="true"
          :show-index="true"
          :selectable="true"
        >
        </TableSkelaton>
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss">
  .employee-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    min-height: clamp(320px, calc(100dvh - 300px), 720px);
    padding: 40px 20px;
    box-sizing: border-box;
    text-align: center;

    h3 {
      margin: 0;
      color: var(--title-card-color);
      font-size: 20px;
      line-height: 1.4;
    }

    p {
      max-width: 360px;
      margin: 0;
      color: var(--gray-600);
      font-size: 14px;
      line-height: 1.6;
      text-transform: none;
    }
  }

  .employee-empty-state__icon {
    box-sizing: content-box;
    flex-shrink: 0;
    padding: 20px;
    margin-block-end: 8px;
    border-radius: var(--radius-full);
    background: var(--PrimaryColor-alpha-8);
    color: var(--primary-green);
  }

  .employee-empty-state__cta {
    gap: 8px;
    max-width: 100%;
    min-height: 44px;
    margin-block-start: 12px;

    &:focus-visible {
      outline: 3px solid var(--PrimaryColor);
      outline-offset: 4px;
    }
  }

  :global(.employee-filter-dialog) {
    width: min(25rem, calc(100vw - 2rem));
    max-height: calc(100vh - 2rem);
    border-radius: var(--radius-lg);
  }

  :global(.employee-filter-dialog .p-dialog-content) {
    padding-block-start: 0;
  }

  .employee-filter {
    display: grid;
    gap: 20px;
  }

  .employee-filter__section {
    display: grid;
    gap: 8px;
  }

  .employee-filter__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    h2 {
      margin: 0;
      color: var(--Title-input-Color);
      font-size: 14px;
      font-weight: 600;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      border: 0;
      border-radius: var(--radius-full);
      background: transparent;
      color: var(--gray-500);
      cursor: pointer;

      &:hover {
        background: var(--gray-100);
        color: var(--PrimaryColor);
      }

      &:focus-visible {
        outline: 3px solid var(--PrimaryColor-alpha-20);
        outline-offset: 2px;
      }
    }
  }

  .employee-filter__statuses {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 18px;
    padding-top: 8px;
  }

  .employee-filter__status {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--gray-600);
    font-size: 13px;
    cursor: pointer;

    input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
    }

    input:focus-visible + .employee-filter__checkbox {
      outline: 3px solid var(--PrimaryColor-alpha-20);
      outline-offset: 2px;
    }

    input:checked + .employee-filter__checkbox {
      border-color: currentColor;
      background: currentColor;

      &::after {
        display: block;
      }
    }
  }

  .employee-filter__status--inactive {
    color: var(--warning);
  }

  .employee-filter__status--active {
    color: var(--PrimaryColor);
  }

  .employee-filter__status--draft {
    color: var(--info);
  }

  .employee-filter__checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 15px;
    height: 15px;
    flex: 0 0 15px;
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-xs);
    background: var(--standard-white);

    &::after {
      display: none;
      width: 4px;
      height: 8px;
      border: solid var(--standard-white);
      border-width: 0 2px 2px 0;
      content: '';
      transform: translateY(-1px) rotate(45deg);
    }
  }

  .employee-filter__actions {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: 12px;
    width: 100%;

    .btn {
      width: 100%;
      min-height: 42px;
      border-radius: var(--radius-full);
    }
  }

  .action-btn.view:hover {
    border-color: var(--primary-green);
    color: var(--primary-green);
  }

  .employee-status.draft {
    color: var(--info);
  }

  .employee-delete-dialog {
    width: 100%;
    padding: clamp(1.5rem, 5vw, 3rem);

    .employee-delete-warning {
      width: 180px;
      max-width: 100%;
      padding: 0;
      margin-inline: auto;
    }

    .dialog-title,
    .dialog-message {
      margin: 0;
    }

    button:disabled {
      cursor: wait;
      opacity: 0.6;
    }
  }
</style>
