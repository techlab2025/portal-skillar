<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import { useRoute, useRouter } from 'vue-router';
  import SubjectController from '../controllers/subject.controller';
  import IndexSubjectParams from '../../core/params/index.subject.params';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import DropList from '@/shared/HelpersComponents/DropList.vue';
  import { useI18n } from 'vue-i18n';
  import DeleteSubjectParams from '../../core/params/delete.subject.params';
  import ShowIcon from '@/shared/icons/ShowIcon.vue';
  import flattenBranchTree from '@/modules/document/core/TreeSelectHelper';
  import type StageModel from '@/modules/Stages/core/models/stage.model';
  import PricingIcon from '@/shared/icons/PricingIcon.vue';
  import SkillsDialog from '@/modules/EducationClassification/subComponent/EducationTree/SkillsDialog.vue';
  import RenameSubjectDialog from '@/modules/EducationClassification/subComponent/RenameSubjectDialog.vue';
  import EditIcon from '@/shared/icons/DropListIcons/EditIcon.vue';
  import type PaginationModel from '@/base/Core/Models/paginationModel';

  interface SubjectTableRow extends TitleInterface<number> {
    educationPath: string[];
    numberOfQuestions?: number;
  }

  const subjectcontroller = SubjectController.getInstance();
  const state = computed(() => subjectcontroller.listState.value);
  const route = useRoute();
  const { t } = useI18n();

  const headers = computed<TableHeader[]>(() => [
    { key: 'title', label: t('subject_table.subject'), width: '40%', sortable: true },
    {
      key: 'educationPath',
      label: t('subject_table.education_type'),
      width: '35%',
      sortable: true,
    },
    {
      key: 'numberOfQuestions',
      label: t('subject_table.number_of_questions'),
      width: '15%',
      align: 'center',
      sortable: true,
    },
  ]);

  const perPage = ref(10);
  const word = ref('');
  const TableTitle = ref<SubjectTableRow[]>([]);
  const pagination = ref<PaginationModel | null>(null);
  const activeParentId = ref<number>();

  const AllBranchesOptions = ref<TitleInterface<number>[]>([]);

  const fetchBranches = async (page: number = 1, word: string = '') => {
    const result = await subjectcontroller.fetchList(
      new IndexSubjectParams(
        word,
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
        0,
      ),
    );
    AllBranchesOptions.value = flattenBranchTree(result.data as StageModel[]).map((item) => {
      return new TitleInterface<number>({
        id: item.id,
        title: item.title,
      });
    });
  };

  onMounted(async () => {
    if (route.query.word) {
      word.value = String(route.query.word);
    }
    await FetchSubjects();
    await fetchBranches(route.query.page ? Number(route.query.page) : 1, word.value);
  });

  const formRoute = computed(() => '/subjects/add');

  const SelectedRow = ref<SubjectTableRow[]>([]);
  const setSelectef = (items: SubjectTableRow[]) => {
    SelectedRow.value = items;
  };
  const deleteSubject = async (id: number) => {
    await subjectcontroller.delete(new DeleteSubjectParams({ id }));

    await FetchSubjects();
  };
  const ShoweEditDialog = ref(false);
  const selectedSkillsSubject = ref<TitleInterface<number>>();
  const skillsDialogVisible = computed({
    get: () => selectedSkillsSubject.value !== undefined,
    set: (visible: boolean) => {
      if (!visible) selectedSkillsSubject.value = undefined;
    },
  });

  const router = useRouter();
  const actionList = (item: SubjectTableRow, deleteSubject: (item: number) => void) => [
    {
      text: t('delete'),
      icon: EditIcon,
      action: () => {
        deleteSubject(item.id);
      },
    },
    {
      text: t('show_question'),
      icon: ShowIcon,
      action: () => {
        router.push(`/Questions?subjectId=${item.id}`);
      },
    },
    {
      text: t('rename'),
      icon: EditIcon,
      action: () => {
        ShoweEditDialog.value = true;
        SelctedSubject.value = item.id;
      },
    },
    {
      text: t('skills'),
      icon: PricingIcon,
      action: () => {
        selectedSkillsSubject.value = item;
      },
    },
  ];

  const splitPath = (value?: string): string[] =>
    value
      ? value
          .split(/\s*(?:→|->)\s*/)
          .map((part) => part.trim())
          .filter(Boolean)
      : [];

  const explicitEducationPath = (node: StageModel): string[] => {
    const educationType = node.EducationType as unknown;
    if (typeof educationType === 'string') return splitPath(educationType);
    if (!educationType || typeof educationType !== 'object') return [];

    const value = educationType as { full_title?: string; title?: string };
    return splitPath(value.full_title || value.title);
  };

  const toSubjectRows = (nodes: StageModel[], parentTitles: string[] = []): SubjectTableRow[] =>
    nodes.flatMap((node) => {
      const nodeTitle = node.title?.trim() || '';
      const currentTitles = [...parentTitles, nodeTitle].filter(Boolean);
      const explicitPath = explicitEducationPath(node);

      if (node.children?.length) {
        return toSubjectRows(node.children, currentTitles);
      }

      const fullTitleParts = splitPath(node.full_title);
      const pathFromTree = currentTitles.slice(0, -1);
      const pathFromFullTitle = fullTitleParts.slice(0, -1);
      const resolvedEducationPath = pathFromTree.length
        ? pathFromTree
        : pathFromFullTitle.length
          ? pathFromFullTitle
          : explicitPath;
      const id = node.e_c_subject_id ?? node.e_c_branch_id ?? node.id;

      if (id === undefined) return [];

      return [
        {
          id,
          title: nodeTitle || fullTitleParts[fullTitleParts.length - 1] || '',
          educationPath: resolvedEducationPath,
          numberOfQuestions: Number.isFinite(node.numberOfQuestions)
            ? node.numberOfQuestions
            : undefined,
        },
      ];
    });

  const FetchSubjects = async (
    id: number | undefined = activeParentId.value,
    page: number = route.query.page ? Number(route.query.page) : 1,
  ) => {
    activeParentId.value = id;
    const result = await subjectcontroller.indexSubjects(
      new IndexSubjectParams(word.value, page, perPage.value, 1, id),
    );

    pagination.value = result?.pagination ?? null;
    TableTitle.value = toSubjectRows((result?.data ?? []) as StageModel[]);
  };
  const selectedFilter = ref<TitleInterface<number>>();
  const updateFilter = (filter: TitleInterface<number>) => {
    selectedFilter.value = filter;
    FetchSubjects(filter.id, 1);
  };
  const onPageChange = (page: number) => {
    FetchSubjects(activeParentId.value, page);
    router.push({
      query: {
        ...route.query,
        page: String(page),
      },
    });
  };
  const onPerPageChange = (count: number) => {
    perPage.value = count;
    FetchSubjects(activeParentId.value, 1);
    router.push({
      query: {
        ...route.query,
        page: '1',
      },
    });
  };
  const SelctedSubject = ref<number>();
  const Resest = () => {
    selectedFilter.value = null;
    FetchSubjects(null);
  };
</script>

<template>
  <div class="subject-page">
    <div class="index-header">
      <div class="toolbar">
        <UpdatedCustomInputSelect
          :label="'subject'"
          id="education-filter"
          v-model="selectedFilter"
          :static-options="AllBranchesOptions"
          :placeholder="`select subject `"
          :reload="true"
          @update:model-value="updateFilter"
          @reload="FetchSubjects"
          :enableReload="true"
          :hasHeader="true"
        />
      </div>
      <p class="reset-btn" @click="Resest">reset</p>
    </div>

    <DataStatusBuilder :controller="state">
      <template #success>
        <div class="table-frame">
          <AppTable
            :headers="headers"
            :items="TableTitle"
            selectable
            show-index
            hoverable
            striped
            @selection-change="setSelectef"
          >
            <template #cell-title="{ item }">
              <span class="subject-title-cell">{{ item.title }}</span>
            </template>

            <template #cell-educationPath="{ item }">
              <div v-if="item.educationPath.length" class="education-path-cell">
                <span v-for="part in item.educationPath" :key="part">{{ part }}</span>
              </div>
              <span v-else :aria-label="$t('subject_table.not_available')">—</span>
            </template>

            <template #cell-numberOfQuestions="{ item }">
              <span class="question-count-cell">{{ item.numberOfQuestions ?? '—' }}</span>
            </template>

            <template #actions="{ item }">
              <div class="row-actions">
                <DropList
                  :action-list="actionList(item, deleteSubject)"
                  :delete-dialog-title="$t('are_you_sure_you_want_to_remove_this_subject')"
                  :delete-dialog-message="
                    $t(
                      'Deleting_this_subject_will_remove_all_related_data_including_any_configurations_and_tree_structures_This_action_is_irreversible_and_the_subject_must_be_created_again_if_needed',
                    )
                  "
                />
              </div>
            </template>
          </AppTable>
        </div>

        <Pagination
          v-if="pagination"
          :pagination="pagination"
          @change-page="onPageChange"
          @count-per-page="onPerPageChange"
        />
      </template>
      <template #empty>
        <div class="empty-state">
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <h3>{{ $t('no_subjects') }}</h3>
          <p>{{ $t('add_the_first_subject_to_get_started') }}</p>
          <router-link :to="formRoute" class="btn-add empty-cta">
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
            <span>{{ $t('add_email') }}</span>
          </router-link>
        </div>
      </template>
    </DataStatusBuilder>
  </div>
  <SkillsDialog
    v-if="selectedSkillsSubject"
    v-model:visible="skillsDialogVisible"
    :level="1"
    :branch-name="selectedSkillsSubject.title!"
    :branch-id="selectedSkillsSubject.id"
  />
  <RenameSubjectDialog
    v-model:visable="ShoweEditDialog"
    :item-id="SelctedSubject!"
    :stage-id="selectedFilter?.id! || null"
    @update:name="FetchSubjects"
  />
</template>
<style scoped>
  .toolbar {
    width: 50%;
  }

  .education-path-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: var(--gray-600);
    line-height: 1.35;
  }

  .question-count-cell {
    display: inline-block;
    min-width: 2ch;
    text-align: center;
  }
  .index-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
