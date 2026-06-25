<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import { useRoute, useRouter } from 'vue-router';
  import SubjectController from '../controllers/subject.controller';
  import IndexSubjectParams from '../../core/params/index.subject.params';
  import { getFullTitlesFromEducationResponse } from '@/shared/GeneralMethods/CreateBranchSubjectTree';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import DropList from '@/shared/HelpersComponents/DropList.vue';
  import EditIcon from '@/shared/icons/Privacy/EditIcon.vue';
  import { useI18n } from 'vue-i18n';
  import DeleteSubjectParams from '../../core/params/delete.subject.params';
  import ShowIcon from '@/shared/icons/ShowIcon.vue';

  type EducationTreeNode = {
    id?: number;
    title?: string;
    full_title?: string;
    e_c_branch_id?: number;
    e_c_subject_id?: number;
    branches?: EducationTreeNode[];
    subjects?: EducationTreeNode[];
    children?: EducationTreeNode[];
  };

  type FilterNodeType = 'classification' | 'branch' | 'subject';

  type EducationFilterOption = TitleInterface<number> & {
    node: EducationTreeNode;
    nodeType: FilterNodeType;
    rawTitle: string;
    pathTitles: string[];
  };

  const subjectcontroller = SubjectController.getInstance();
  const state = computed(() => subjectcontroller.listState.value);
  const route = useRoute();
  const cacheKey = 'subjects_full_education_classification_tree';

  const headers: TableHeader[] = [{ key: 'title', label: 'name', width: '90%', sortable: true }];

  const perPage = ref(10);
  const word = ref('');
  const TableTitle = ref<TitleInterface<number>[]>([]);
  const educationTree = ref<EducationTreeNode[]>([]);
  const currentFilterOptions = ref<EducationFilterOption[]>([]);
  const selectedFilter = ref<EducationFilterOption | null>(null);
  const selectedPath = ref<EducationFilterOption[]>([]);

  const fetchSubjects = async (page: number = 1, word: string = '') => {
    await subjectcontroller.fetchList(
      new IndexSubjectParams(
        word,
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
        0,
      ),
    );
  };

  const getNodeId = (node: EducationTreeNode): number => {
    return node.e_c_subject_id ?? node.e_c_branch_id ?? node.id ?? 0;
  };

  const getChildNodes = (node: EducationTreeNode): EducationTreeNode[] => {
    return [...(node.branches ?? []), ...(node.children ?? []), ...(node.subjects ?? [])];
  };

  const getNodeType = (node: EducationTreeNode, fallback: FilterNodeType): FilterNodeType => {
    if (node.e_c_subject_id) return 'subject';
    if (node.e_c_branch_id) return 'branch';
    return fallback;
  };

  const toFilterOption = (
    node: EducationTreeNode,
    fallbackType: FilterNodeType,
    parentTitles: string[] = [],
  ): EducationFilterOption => {
    const rawTitle = node.title ?? node.full_title ?? '';
    const pathTitles = [...parentTitles, rawTitle].filter(Boolean);

    return {
      id: getNodeId(node),
      title: pathTitles.join(' -> '),
      full_title: node.full_title,
      node,
      nodeType: getNodeType(node, fallbackType),
      rawTitle,
      pathTitles,
    };
  };

  const getClassificationOptions = (tree: EducationTreeNode[]): EducationFilterOption[] => {
    return tree.map((node) => toFilterOption(node, 'classification')).filter((item) => item.id);
  };

  const getNextOptions = (option: EducationFilterOption): EducationFilterOption[] => {
    return getChildNodes(option.node)
      .map((child) => toFilterOption(child, getNodeType(child, 'branch'), option.pathTitles))
      .filter((item) => item.id);
  };

  const getTableSource = (node?: EducationTreeNode): EducationTreeNode[] => {
    if (!node) return educationTree.value;
    if (node.e_c_subject_id) return [{ branches: [{ subjects: [node] }] }];
    if (node.e_c_branch_id) return [{ branches: [node] }];
    return [node];
  };

  const updateTableFromNode = (node?: EducationTreeNode) => {
    TableTitle.value = getFullTitlesFromEducationResponse(getTableSource(node));
  };

  const syncTreeFromState = () => {
    const data = state.value.data ?? [];
    educationTree.value = data as unknown as EducationTreeNode[];
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
    currentFilterOptions.value = getClassificationOptions(educationTree.value);
    selectedFilter.value = null;
    selectedPath.value = [];
    updateTableFromNode();
  };

  const loadCachedTree = () => {
    const cachedTree = sessionStorage.getItem(cacheKey);
    if (!cachedTree) return;

    try {
      const parsedTree = JSON.parse(cachedTree) as EducationTreeNode[];
      educationTree.value = parsedTree;
      currentFilterOptions.value = getClassificationOptions(parsedTree);
      selectedFilter.value = null;
      selectedPath.value = [];
      updateTableFromNode();
    } catch {
      sessionStorage.removeItem(cacheKey);
    }
  };

  const selectedPathTitle = computed(() => {
    return selectedPath.value
      .map((option) => option.rawTitle)
      .filter(Boolean)
      .join(' -> ');
  });

  const updateSelectedFilter = (option: EducationFilterOption | null) => {
    if (!option) {
      selectedFilter.value = null;
      selectedPath.value = [];
      currentFilterOptions.value = getClassificationOptions(educationTree.value);
      updateTableFromNode();
      return;
    }

    selectedPath.value = [...selectedPath.value, option];
    selectedFilter.value = null;
    updateTableFromNode(option.node);
    currentFilterOptions.value = getNextOptions(option);
  };

  const getFilterLabel = () => {
    if (selectedPath.value.length === 0) return 'education_classification';
    if (currentFilterOptions.value.length === 0) {
      return selectedPath.value[selectedPath.value.length - 1]?.nodeType ?? 'branch';
    }

    return currentFilterOptions.value.some((option) => option.nodeType === 'subject')
      ? 'subject'
      : 'branch';
  };

  const getFilterPlaceholder = () => {
    if (selectedPath.value.length === 0) return 'select_classification';
    if (currentFilterOptions.value.length === 0) return 'select_subject';

    return currentFilterOptions.value.some((option) => option.nodeType === 'subject')
      ? 'select_subject'
      : 'select_branch';
  };

  onMounted(async () => {
    if (route.query.word) {
      word.value = String(route.query.word);
    }
    loadCachedTree();
    await fetchSubjects(route.query.page ? Number(route.query.page) : 1, word.value);
    syncTreeFromState();
  });

  const formRoute = computed(() => '/subjects/add');

  const SelectedRow = ref<TitleInterface<number>[]>([]);
  const setSelectef = (items: TitleInterface<number>[]) => {
    SelectedRow.value = items;
  };
  const deleteSubject = async (id: number) => {
    await subjectcontroller.delete(new DeleteSubjectParams({ id: id }));
    await fetchSubjects();
    syncTreeFromState();
  };

  const { t } = useI18n();
  const router = useRouter();
  const actionList = (id: number, deleteSubject: (id: number) => void) => [
    {
      text: t('delete'),
      icon: EditIcon,
      action: () => {
        deleteSubject(id);
      },
    },
    {
      text: t('show_question'),
      icon: ShowIcon,
      action: () => router.push(`/Questions?subjectId=${id}`),
    },
  ];
  
</script>

<template>
  <div class="subject-page">
    <div class="index-header">
      <div class="toolbar">
        <UpdatedCustomInputSelect
          id="education-filter"
          v-model="selectedFilter"
          :label="getFilterLabel()"
          :static-options="currentFilterOptions"
          :placeholder="selectedPathTitle || $t(getFilterPlaceholder())"
          :reload="true"
          @update:model-value="
            (option: EducationFilterOption | null) => updateSelectedFilter(option)
          "
        />
      </div>
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

            <template #actions="{ item }">
              <div class="row-actions">
                <DropList
                  :action-list="actionList(item.id, deleteSubject)"
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
</template>

<style scoped>
  .p-select-label.p-placeholder {
    color: var(--primary-color) !important;
  }
</style>
