<script setup lang="ts">
  import { computed, onMounted, ref, shallowRef, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';
  import InputSwitch from 'primevue/inputswitch';
  import RadioButton from 'primevue/radiobutton';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import HandleFilesUpload, { type UploadedFile } from '@/shared/FormInputs/HandleFilesUpload.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import EmployeeIcon from '@/shared/icons/EmployeeIcon.vue';
  import UplaodImageInput from '@/shared/icons/UploadImage/UplaodImageInput.vue';
  import { createAdminPermissions } from '@/modules/Permission/core/constants/admin.permissions';
  import flattenSubjectBranchTree from '@/modules/Questions/core/SubjectTreeSelectHelper';
  import type BranchesModel from '@/modules/Stages/core/models/branches.model';
  import type StageModel from '@/modules/Stages/core/models/stage.model';
  import IndexStageParams from '@/modules/Stages/core/params/index.stage.params';
  import StageController from '@/modules/Stages/presentation/controllers/stage.controller';
  import type RoleModel from '@/modules/Role/core/models/role.model';
  import IndexRoleParams from '@/modules/Role/core/params/index.role.params';
  import ShowRoleParams from '@/modules/Role/core/params/show.role.params';
  import RoleController from '@/modules/Role/presentation/controllers/role.controller';
  import { CustomToast } from '@/modules/Questions/presentation/subComponents/CustomTosat';
  import type EmployeeModel from '../../core/models/employee.model';
  import { EmployeeStatusEnm } from '../../core/constant/employee.status.enum';
  import { EmployeeTypeEnum } from '../../core/constant/employee.type.enum';
  import { GenderENum } from '../../core/constant/gender.enum';
  import AddEmployeeParams from '../../core/params/add.employee.params';
  import EditEmployeeParams from '../../core/params/edit.employee.params';

  interface BranchOption {
    option: TitleInterface<number>;
    branch: BranchesModel;
  }

  const emit = defineEmits(['updateData']);
  const props = defineProps<{
    employee?: EmployeeModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const { t } = useI18n();
  const route = useRoute();
  const stageController = StageController.getInstance();
  const roleController = RoleController.getInstance();

  const name = ref('');
  const lastName = ref('');
  const email = ref('');
  const phone = ref('');
  const password = ref('');
  const employeeId = ref('');
  const gender = ref<GenderENum>(GenderENum.male);
  const checked = ref(false);
  const uploadedImage = ref<string[]>([]);
  const imageRemoved = ref(false);

  const stages = shallowRef<StageModel[]>([]);
  const roles = shallowRef<RoleModel[]>([]);
  const selectedEducationType = ref<TitleInterface<number> | null>(null);
  const selectedConfigurations = ref<TitleInterface<number>[]>([]);
  const selectedSubjects = ref<TitleInterface<number>[]>([]);
  const selectedRoles = ref<TitleInterface<number>[]>([]);
  const rolePermissions = ref<Record<number, string[]>>({});
  const permissionsLoading = ref(false);
  let permissionRequest = 0;

  const createDefaultEmployeeType = () =>
    new TitleInterface<number>({
      id: EmployeeTypeEnum.ADMIN,
      title: t('employee_type_admin'),
    });
  const employeeTypeOptions = computed<TitleInterface<number>[]>(() => [
    createDefaultEmployeeType(),
    new TitleInterface({ id: EmployeeTypeEnum.TEACHER, title: t('employee_type_teacher') }),
  ]);
  const defaultEmployeeType = () => employeeTypeOptions.value[0] ?? createDefaultEmployeeType();
  const selectedEmployeeType = ref<TitleInterface<number>>(defaultEmployeeType());
  const isTeacher = computed(() => selectedEmployeeType.value.id === EmployeeTypeEnum.TEACHER);
  const educationTypeOptions = computed(() =>
    stages.value.flatMap((stage) =>
      stage.id == null ? [] : [new TitleInterface<number>({ id: stage.id, title: stage.title })],
    ),
  );
  const selectedStage = computed(() =>
    stages.value.find((stage) => stage.id === selectedEducationType.value?.id),
  );

  const flattenBranches = (branches: BranchesModel[], parents: string[] = []): BranchOption[] =>
    branches.flatMap((branch) => {
      const titles = [...parents, branch.title];
      const children = branch.children ?? [];
      if (children.length > 0) return flattenBranches(children, titles);
      if (branch.id == null) return [];
      return [
        {
          option: new TitleInterface<number>({ id: branch.id, title: titles.join(' → ') }),
          branch,
        },
      ];
    });

  const branchOptions = computed(() => flattenBranches(selectedStage.value?.branches ?? []));
  const configurationOptions = computed(() => branchOptions.value.map(({ option }) => option));
  const selectedBranches = computed(() => {
    const selectedIds = new Set(selectedConfigurations.value.map(({ id }) => id));
    return branchOptions.value
      .filter(({ option }) => selectedIds.has(option.id))
      .map(({ branch }) => branch);
  });
  const subjectOptions = computed(() => {
    const options = selectedBranches.value.flatMap((branch) =>
      flattenSubjectBranchTree(branch.subjects as unknown as StageModel[]),
    );
    return options.filter(
      (option, index) => options.findIndex((candidate) => candidate.id === option.id) === index,
    );
  });
  const roleOptions = computed(() => roles.value.map((role) => role.toOption()));

  const permissionLabelMap = computed(() => {
    const labels = new Map<string, string>();
    createAdminPermissions().forEach((module) => {
      module.permissions.forEach((group) => {
        labels.set(group.code, t(group.labelKey));
        group.permissions.forEach((permission) => {
          labels.set(permission.code, `${t(group.labelKey)} · ${t(permission.labelKey)}`);
        });
      });
    });
    return labels;
  });
  const effectivePermissions = computed(() => {
    const codes = selectedRoles.value.flatMap(({ id }) => rolePermissions.value[id] ?? []);
    return [...new Set(codes)].map((code) => permissionLabelMap.value.get(code) ?? code);
  });

  const educationTypeError = ref('');
  const configurationError = ref('');
  const subjectError = ref('');
  const roleError = ref('');

  const validate = (): boolean => {
    educationTypeError.value =
      isTeacher.value && !selectedEducationType.value
        ? t('employee_form.education_type_required')
        : '';
    configurationError.value =
      isTeacher.value && selectedConfigurations.value.length === 0
        ? t('employee_form.configured_education_required')
        : '';
    subjectError.value =
      isTeacher.value && selectedSubjects.value.length === 0
        ? t('employee_form.subject_required')
        : '';
    roleError.value = selectedRoles.value.length === 0 ? t('employee_form.role_required') : '';
    return !(
      educationTypeError.value ||
      configurationError.value ||
      subjectError.value ||
      roleError.value
    );
  };
  defineExpose({ validate });

  const mapOptions = (
    selected: TitleInterface<number>[],
    options: TitleInterface<number>[],
  ): TitleInterface<number>[] =>
    selected.map((item) => options.find((option) => option.id === item.id) ?? item);

  const updateData = () => {
    const imagePayload = imageRemoved.value
      ? '*'
      : props.employee && uploadedImage.value[0] === props.employee.image
        ? ''
        : uploadedImage.value[0] || '';
    const roleIds = selectedRoles.value.map(({ id }) => id);
    const data = {
      email: email.value,
      EmployeeRef: employeeId.value,
      firstname: name.value,
      gender: gender.value,
      image: imagePayload,
      lastname: lastName.value,
      phone: phone.value,
      employeeStatus: checked.value ? EmployeeStatusEnm.active : EmployeeStatusEnm.disavtive,
      password: password.value,
      employeeType: selectedEmployeeType.value.id as EmployeeTypeEnum,
      roleId: roleIds[0],
      roleIds,
      educationClassificationSubjectIds: isTeacher.value
        ? selectedSubjects.value.map(({ id }) => id)
        : [],
    };
    const params = route.params.id
      ? new EditEmployeeParams({ id: Number(route.params.id), ...data })
      : new AddEmployeeParams(data);
    emit('updateData', params);
  };

  const clearEducationScope = () => {
    selectedEducationType.value = null;
    selectedConfigurations.value = [];
    selectedSubjects.value = [];
    educationTypeError.value = '';
    configurationError.value = '';
    subjectError.value = '';
  };

  const findEducationContext = (subjectIds: number[]) => {
    const ids = new Set(subjectIds);
    for (const stage of stages.value) {
      const options = flattenBranches(stage.branches ?? []);
      const configurations = options.filter(({ branch }) =>
        flattenSubjectBranchTree(branch.subjects as unknown as StageModel[]).some((subject) =>
          ids.has(subject.id),
        ),
      );
      if (configurations.length > 0 && stage.id != null) {
        return { stageId: stage.id, configurations };
      }
    }
    return null;
  };

  const restoreEducationContext = (subjects: TitleInterface<number>[]) => {
    const context = findEducationContext(subjects.map(({ id }) => id));
    if (!context) return;
    selectedEducationType.value =
      educationTypeOptions.value.find(({ id }) => id === context.stageId) ?? null;
    selectedConfigurations.value = context.configurations.map(({ option }) => option);
    selectedSubjects.value = mapOptions(subjects, subjectOptions.value);
  };

  const loadRolePermissions = async () => {
    const request = ++permissionRequest;
    const selectedIds = selectedRoles.value.map(({ id }) => id);
    if (selectedIds.length === 0) {
      rolePermissions.value = {};
      permissionsLoading.value = false;
      return;
    }

    permissionsLoading.value = true;
    const results = await Promise.all(
      selectedIds.map((roleId) => roleController.fetchOne(new ShowRoleParams(roleId))),
    );
    if (request !== permissionRequest) return;
    rolePermissions.value = Object.fromEntries(
      results.flatMap((result, index) => {
        const roleId = selectedIds[index];
        return roleId !== undefined && result instanceof DataSuccess && result.data
          ? [[roleId, result.data.permissions] as const]
          : [];
      }),
    );
    permissionsLoading.value = false;
  };

  const applyEmployee = (employee: EmployeeModel) => {
    name.value = employee.firstname;
    lastName.value = employee.lastname;
    email.value = employee.email;
    phone.value = employee.phone;
    employeeId.value = employee.employeeId;
    gender.value = employee.gender;
    checked.value = Number(employee.status) === EmployeeStatusEnm.active;
    uploadedImage.value = employee.image ? [employee.image] : [];
    imageRemoved.value = false;
    selectedEmployeeType.value =
      employeeTypeOptions.value.find(({ id }) => id === employee.employeeType) ??
      defaultEmployeeType();
    const employeeRoles = employee.roles.length
      ? employee.roles
      : employee.roleId
        ? [
            new TitleInterface<number>({
              id: employee.roleId,
              title: employee.roleName || String(employee.roleId),
            }),
          ]
        : [];
    selectedRoles.value = mapOptions(employeeRoles, roleOptions.value);
    const employeeSubjects = employee.subjects.length
      ? employee.subjects
      : employee.educationClassificationSubjectIds.map(
          (id) => new TitleInterface<number>({ id, title: String(id) }),
        );
    selectedSubjects.value = employeeSubjects;
    restoreEducationContext(employeeSubjects);
    void loadRolePermissions();
    updateData();
  };

  watch(
    () => props.employee,
    (employee) => {
      if (employee) applyEmployee(employee);
    },
    { immediate: true },
  );

  const resetForm = () => {
    name.value = '';
    lastName.value = '';
    email.value = '';
    phone.value = '';
    password.value = '';
    employeeId.value = '';
    gender.value = GenderENum.male;
    checked.value = false;
    uploadedImage.value = [];
    imageRemoved.value = false;
    selectedEmployeeType.value = defaultEmployeeType();
    selectedRoles.value = [];
    rolePermissions.value = {};
    roleError.value = '';
    clearEducationScope();
    updateData();
  };

  const handleImageChange = (files: UploadedFile[]) => {
    if (files.length === 0) {
      uploadedImage.value = [];
      imageRemoved.value = Boolean(props.employee?.image);
    } else {
      uploadedImage.value = [files[0]?.base64 || files[0]?.url || ''];
      imageRemoved.value = false;
    }
    updateData();
  };

  const handleEmployeeTypeChange = (employeeType: TitleInterface<number> | null) => {
    selectedEmployeeType.value = employeeType ?? defaultEmployeeType();
    if (!isTeacher.value) clearEducationScope();
    updateData();
  };

  const handleEducationTypeChange = (educationType: TitleInterface<number> | null) => {
    selectedEducationType.value = educationType;
    selectedConfigurations.value = [];
    selectedSubjects.value = [];
    if (educationType) educationTypeError.value = '';
    configurationError.value = '';
    subjectError.value = '';
    updateData();
  };

  const handleConfigurationsChange = (configurations: TitleInterface<number>[] | null) => {
    selectedConfigurations.value = configurations ?? [];
    selectedSubjects.value = selectedSubjects.value.filter((subject) =>
      subjectOptions.value.some((option) => option.id === subject.id),
    );
    if (selectedConfigurations.value.length > 0) configurationError.value = '';
    updateData();
  };

  const handleSubjectsChange = (subjects: TitleInterface<number>[] | null) => {
    selectedSubjects.value = subjects ?? [];
    if (selectedSubjects.value.length > 0) subjectError.value = '';
    updateData();
  };

  const handleRolesChange = (selected: TitleInterface<number>[] | null) => {
    selectedRoles.value = selected ?? [];
    if (selectedRoles.value.length > 0) roleError.value = '';
    updateData();
    void loadRolePermissions();
  };

  const fetchStages = async () => {
    const result = await stageController.fetchList(new IndexStageParams('', 1, 100, 0));
    stages.value = result instanceof DataSuccess && result.data ? result.data : [];
    if (props.employee && isTeacher.value) {
      restoreEducationContext(selectedSubjects.value);
      updateData();
    }
  };

  const fetchRoles = async () => {
    const result = await roleController.fetchList(new IndexRoleParams('', 1, 100, 0));
    roles.value = result instanceof DataSuccess && result.data ? result.data : [];
    selectedRoles.value = mapOptions(selectedRoles.value, roleOptions.value);
    await loadRolePermissions();
    updateData();
  };

  const draftRef =
    !route.params.id && localStorage.getItem('employee-draft')
      ? CustomToast<AddEmployeeParams>('employee-draft')
      : null;

  if (draftRef) {
    watch(draftRef, (draft) => {
      if (!draft) return;
      name.value = draft.firstname;
      lastName.value = draft.lastname;
      email.value = draft.email;
      phone.value = draft.phone;
      password.value = draft.password;
      employeeId.value = draft.EmployeeRef;
      gender.value = draft.gender;
      checked.value = Boolean(draft.employeeStatus);
      uploadedImage.value = draft.image ? [draft.image] : [];
      imageRemoved.value = false;
      selectedEmployeeType.value =
        employeeTypeOptions.value.find(({ id }) => id === draft.employeeType) ??
        defaultEmployeeType();
      const roleIds = draft.roleIds ?? (draft.roleId == null ? [] : [draft.roleId]);
      selectedRoles.value = roleIds.map(
        (id) =>
          roleOptions.value.find((option) => option.id === id) ??
          new TitleInterface({ id, title: String(id) }),
      );
      const subjects = (draft.educationClassificationSubjectIds ?? []).map(
        (id) => new TitleInterface<number>({ id, title: String(id) }),
      );
      selectedSubjects.value = subjects;
      restoreEducationContext(subjects);
      void loadRolePermissions();
      updateData();
    });
  }

  onMounted(() => Promise.all([fetchStages(), fetchRoles()]));
</script>

<template>
  <div class="employee-details-form-card">
    <header class="form-header">
      <div class="form-title">
        <div class="header-text">
          <h3>
            {{ route.params.id ? $t('employee_form.edit_title') : $t('employee_form.add_title') }}
          </h3>
          <p class="header-subtitle">
            {{
              route.params.id
                ? $t('employee_form.edit_description')
                : $t('employee_form.add_description')
            }}
          </p>
        </div>
        <div class="employee-status">
          <div class="title">
            <h6>{{ $t('employee_form.status') }}</h6>
            <p :class="{ warn: !checked }">{{ checked ? $t('active') : $t('disactive') }}</p>
          </div>
          <InputSwitch v-model="checked" @change="updateData" />
        </div>
      </div>
    </header>

    <div class="employee-details-form">
      <p><EmployeeIcon /> {{ $t('employee_form.basic_info') }}</p>
      <button class="employee-form-reset" type="button" @click="resetForm">
        {{ $t('reset') }}
      </button>
    </div>

    <div class="form-fields">
      <div class="field-group required-field" :class="{ disabled: props.loading }">
        <label class="field-label" for="employee-first-name">{{ $t('First Name') }}</label>
        <div class="input-wrap">
          <input
            id="employee-first-name"
            v-model="name"
            type="text"
            :placeholder="$t('employee_form.first_name_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group required-field" :class="{ disabled: props.loading }">
        <label class="field-label" for="employee-last-name">{{ $t('Last Name') }}</label>
        <div class="input-wrap">
          <input
            id="employee-last-name"
            v-model="lastName"
            type="text"
            :placeholder="$t('employee_form.last_name_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group required-field" :class="{ disabled: props.loading }">
        <label class="field-label" for="employee-email">{{ $t('Email') }}</label>
        <div class="input-wrap">
          <input
            id="employee-email"
            v-model="email"
            type="email"
            :placeholder="$t('employee_form.email_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group required-field" :class="{ disabled: props.loading }">
        <label class="field-label" for="employee-phone">{{ $t('Phone') }}</label>
        <div class="input-wrap">
          <input
            id="employee-phone"
            v-model="phone"
            type="tel"
            :placeholder="$t('employee_form.phone_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group required-field col-span-2" :class="{ disabled: props.loading }">
        <label class="field-label" for="employee-password">{{ $t('password') }}</label>
        <div class="input-wrap">
          <input
            id="employee-password"
            v-model="password"
            type="password"
            :placeholder="$t('employee_form.password_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group col-span-2" :class="{ disabled: props.loading }">
        <label class="field-label">{{ $t('Gender') }}</label>
        <div class="gender-group">
          <div class="input-field">
            <RadioButton
              v-model="gender"
              input-id="male"
              name="gender"
              :value="GenderENum.male"
              @change="updateData"
            />
            <label for="male">{{ $t('male') }}</label>
          </div>
          <div class="input-field">
            <RadioButton
              v-model="gender"
              input-id="female"
              name="gender"
              :value="GenderENum.female"
              @change="updateData"
            />
            <label for="female">{{ $t('female') }}</label>
          </div>
        </div>
      </div>

      <div class="field-group col-span-2" :class="{ disabled: props.loading }">
        <HandleFilesUpload
          :label="$t('employee_form.upload_profile_image')"
          accept="image/*"
          :multiple="false"
          :index="1"
          :file="uploadedImage"
          :have-content="true"
          class="image-input"
          :max-files="1"
          @change="handleImageChange"
        >
          <template #content>
            <div class="add-imaegs-data">
              <UplaodImageInput />
              <p class="first-text">
                <span>{{ $t('employee_form.click_to_upload') }}</span>
                {{ $t('employee_form.or_drag_drop') }}
              </p>
              <p class="second-text">{{ $t('employee_form.image_hint') }}</p>
            </div>
          </template>
        </HandleFilesUpload>
      </div>

      <section class="employee-form-section col-span-2" :class="{ disabled: props.loading }">
        <UpdatedCustomInputSelect
          id="employee-type"
          v-model="selectedEmployeeType"
          :label="$t('employee_form.user_type')"
          :placeholder="$t('select_employee_type')"
          :static-options="employeeTypeOptions"
          required
          :reload="false"
          @update:model-value="handleEmployeeTypeChange"
        />
      </section>

      <section
        class="employee-form-section employee-education-section col-span-2"
        :class="{ disabled: props.loading || !isTeacher }"
        :aria-disabled="props.loading || !isTeacher"
      >
        <div>
          <UpdatedCustomInputSelect
            id="employee-education-type"
            v-model="selectedEducationType"
            :label="$t('employee_form.education_type')"
            :placeholder="$t('employee_form.select_education_type')"
            :static-options="educationTypeOptions"
            :disabled="!isTeacher"
            required
            :reload="false"
            @update:model-value="handleEducationTypeChange"
          />
          <small v-if="educationTypeError" class="employee-field-error" role="alert">
            {{ educationTypeError }}
          </small>
        </div>

        <div>
          <UpdatedCustomInputSelect
            id="employee-configured-education"
            v-model="selectedConfigurations"
            :type="2"
            :label="$t('employee_form.configured_education')"
            :placeholder="$t('employee_form.select_configured_education')"
            :static-options="configurationOptions"
            :disabled="!isTeacher || !selectedEducationType"
            required
            :reload="false"
            :max-selected-labels="2"
            @update:model-value="handleConfigurationsChange"
          />
          <small v-if="configurationError" class="employee-field-error" role="alert">
            {{ configurationError }}
          </small>
        </div>

        <div>
          <UpdatedCustomInputSelect
            id="employee-subjects"
            v-model="selectedSubjects"
            :type="2"
            :label="$t('employee_form.subject')"
            :placeholder="$t('employee_form.select_subject')"
            :static-options="subjectOptions"
            :disabled="!isTeacher || selectedConfigurations.length === 0"
            required
            :reload="false"
            :max-selected-labels="2"
            @update:model-value="handleSubjectsChange"
          />
          <small v-if="subjectError" class="employee-field-error" role="alert">
            {{ subjectError }}
          </small>
        </div>
      </section>

      <section
        class="employee-form-section employee-role-section col-span-2"
        :class="{ disabled: props.loading }"
      >
        <div>
          <UpdatedCustomInputSelect
            id="employee-roles"
            v-model="selectedRoles"
            :type="2"
            :label="$t('employee_form.roles')"
            :placeholder="$t('employee_form.select_roles')"
            :static-options="roleOptions"
            required
            :reload="false"
            :max-selected-labels="3"
            @update:model-value="handleRolesChange"
          />
          <small v-if="roleError" class="employee-field-error" role="alert">
            {{ roleError }}
          </small>
        </div>

        <div class="effective-permissions" aria-live="polite">
          <h4>{{ $t('employee_form.effective_permissions') }}</h4>
          <p v-if="permissionsLoading" class="effective-permissions__empty">
            {{ $t('employee_form.loading_permissions') }}
          </p>
          <div v-else-if="effectivePermissions.length" class="effective-permissions__list">
            <span v-for="permission in effectivePermissions" :key="permission">
              ✓ {{ permission }}
            </span>
          </div>
          <p v-else class="effective-permissions__empty">
            {{ $t('employee_form.no_permissions') }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .employee-form-reset {
    padding: 0;
    border: 0;
    border-bottom: 2px solid var(--danger-color);
    color: var(--danger-color);
    background: transparent;
    cursor: pointer;
    font: inherit;
  }

  .employee-form-section {
    width: 100%;
    padding: var(--md-size, 16px);
    border: 1px solid var(--input-border-color);
    border-radius: var(--xl-size-2, 16px);
    background: var(--standard-white);

    &.disabled {
      pointer-events: none;
      opacity: 0.65;
    }
  }

  .employee-education-section,
  .employee-role-section {
    display: grid;
    gap: var(--md-size, 16px);
  }

  .employee-field-error {
    display: block;
    margin-top: var(--xs-size-4, 4px);
    color: var(--danger-color);
    font-size: var(--xs-size, 0.8rem);
  }

  .effective-permissions {
    padding: var(--sm-size, 12px);
    border: 1px solid var(--border-weak);
    border-radius: var(--xl-size-1, 12px);
    background: var(--PrimaryColor-alpha-10);

    h4 {
      margin: 0 0 var(--xs-size-3, 8px);
      color: var(--title-color);
      font-size: var(--sm-size, 0.9rem);
    }
  }

  .effective-permissions__list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--xs-size-3, 8px);

    span {
      padding: var(--xs-size-4, 4px) var(--xs-size-2, 10px);
      border-radius: var(--xl-size-4, 999px);
      color: var(--PrimaryColor);
      background: var(--standard-white);
      font-size: var(--xs-size, 0.8rem);
    }
  }

  .effective-permissions__empty {
    margin: 0;
    color: var(--gray-500);
    font-size: var(--xs-size, 0.8rem);
  }

  @media (max-width: 600px) {
    .employee-details-form-card .form-fields .col-span-2 {
      grid-column: span 1;
    }
  }
</style>
