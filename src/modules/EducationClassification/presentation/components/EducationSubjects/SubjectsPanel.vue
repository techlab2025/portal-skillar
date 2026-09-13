<script setup lang="ts">
  import { ref, provide, onMounted, computed, watch, nextTick } from 'vue';
  import { useI18n } from 'vue-i18n';
  import SubjectTreeNode from './SubjectTreeNode.vue';
  import type { SubjectNode } from './SubjectTreeNode.vue';
  import EducationSubjectController from '../../controllers/educationSubject/education.subject.controller';
  import EducationSubjectItemController from '../../controllers/educationSubject/education.subject.item.controller';
  import FetchSubjectParams from '@/modules/EducationClassification/core/params/EducationSubjects/fetch.subject.params';
  import AddSubjectItemParams from '@/modules/EducationClassification/core/params/EducationSubjects/add.subject.item.params';
  import type EducationSubjectModel from '@/modules/EducationClassification/core/models/EducationSubject/education.subject.model';
  import type EducationSubjectConfigurationModel from '@/modules/EducationClassification/core/models/EducationConfiguration/education.subject.configuration.model';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import AddEducationSubjectDialog, {
    type EducationSubjectFormData,
  } from '@/modules/EducationClassification/subComponent/EducationTree/AddEducationSubjectDialog.vue';
  import IndexEducationConfigurationParams from '@/modules/EducationClassification/core/params/EducationConfiguration/index.educationConfiguration.params co';
  import { useRoute } from 'vue-router';
  import TranslationParams from '@/modules/about/core/params/translation.params';
  import EducationSkillsController from '../../controllers/EducationSkills/education.skills.controller';
  import EducationTopicsController from '../../controllers/EducationTopics/education.topics.controller';
  import AddEducationSubjectSkillsParams from '@/modules/EducationClassification/core/params/EducationSkills/add.education.subject.skills.params';
  import SkillParams from '@/modules/EducationClassification/core/params/EducationSkills/skill.params';
  import AddEducationSubjectTopicParams from '@/modules/EducationClassification/core/params/EducationTopic/add.education.subject.topic.params';

  const props = defineProps<{
    stageId: number;
    stageName: string;
  }>();

  const { locale } = useI18n();
  const configController = EducationSubjectController.getInstance();
  const itemController = EducationSubjectItemController.getInstance();
  const skillsController = EducationSkillsController.getInstance();
  const topicsController = EducationTopicsController.getInstance();

  const subjectConfig = ref<EducationSubjectConfigurationModel[] | null>(null);
  const rootNodes = ref<SubjectNode[]>([]);
  const selectedNode = ref<SubjectNode | null>(null);
  const showAddSubjectDialog = ref(false);
  const subjectDialogParentId = ref<number | undefined>(undefined);
  const subjectDialogName = ref('');
  const isSubmittingSubject = ref(false);
  const stageExpanded = ref(true);

  const subjectMaxDepth = computed(() => {
    const configuredBranchCount = subjectConfig.value?.[0]?.numberOfBranches;
    return configuredBranchCount == null ? Infinity : configuredBranchCount + 1;
  });
  const refreshSubjectId = ref<number | null>(null);

  const subjectBranchLevelLabels = computed<Record<number, string>>(() => {
    const lang = locale.value === 'ar' ? 'ar' : 'en';
    return {
      0: getSubjectRootName(),
      ...Object.fromEntries(
        (subjectConfig.value?.[0]?.branches ?? []).map((branch) => [
          branch.levelNumber,
          branch.singularTitle[lang] ?? branch.singularTitle.en ?? `Level ${branch.levelNumber}`,
        ]),
      ),
    };
  });

  function getSubjectRootName(): string {
    const lang = locale.value === 'ar' ? 'ar' : 'en';
    const config = subjectConfig.value;
    if (!config || config.length === 0) return 'Subject';
    const firstConfig = config[0];
    return (
      firstConfig?.SingluarTitle?.[lang] ??
      firstConfig?.SingluarTitle?.en ??
      Object.values(firstConfig?.SingluarTitle ?? {}).find(Boolean) ??
      'Subject'
    );
  }

  function makeNode(subject: EducationSubjectModel, depth: number): SubjectNode {
    return { subject, children: [], isLoaded: false, isLoading: false, depth };
  }

  function findNode(nodes: SubjectNode[], id: number): SubjectNode | null {
    for (const n of nodes) {
      if (n.subject.subject_id === id) return n;
      const found = findNode(n.children, id);
      if (found) return found;
    }
    return null;
  }

  async function fetchRoot() {
    rootNodes.value = [];
    selectedNode.value = null;
    const params = new FetchSubjectParams({ stage_id: props.stageId });
    const result = await itemController.fetchList(params);
    if (result instanceof DataSuccess) {
      rootNodes.value = (result.data ?? []).map((s: EducationSubjectModel) => makeNode(s, 0));
    }
  }

  async function fetchChildren(parentId: number, callback: (children: SubjectNode[]) => void) {
    const parentNode = findNode(rootNodes.value, parentId);
    const params = new FetchSubjectParams({
      stage_id: props.stageId,
      parent_id: parentId,
    });
    const result = await itemController.fetchList(params);
    const children =
      result instanceof DataSuccess
        ? (result.data ?? []).map((s: EducationSubjectModel) =>
            makeNode(s, (parentNode?.depth ?? 0) + 1),
          )
        : [];
    if (parentNode) {
      parentNode.children = children;
      parentNode.isLoaded = true;
    }
    callback(children);
  }

  function selectNode(node: SubjectNode) {
    selectedNode.value = node;
  }

  function openAddChildDialog(subjectId: number, level: number) {
    subjectDialogParentId.value = subjectId;
    subjectDialogName.value = subjectBranchLevelLabels.value[level] ?? `Level ${level}`;
    showAddSubjectDialog.value = true;
  }

  async function addSubjectRelations(subjectId: number, data: EducationSubjectFormData) {
    if (data.skill) {
      await skillsController.create(
        new AddEducationSubjectSkillsParams({
          id: subjectId,
          skills: [
            new SkillParams({
              skillId: Number(data.skill.id),
              percentage: '100',
            }),
          ],
        }),
      );
    }

    for (const tag of data.tags) {
      await topicsController.create(
        new AddEducationSubjectTopicParams({
          id: subjectId,
          translations: new TranslationParams({
            title: { en: tag, ar: tag },
          }),
        }),
      );
    }
  }

  async function handleAddSubject(data: EducationSubjectFormData) {
    if (isSubmittingSubject.value) return;

    isSubmittingSubject.value = true;
    try {
      const parentId = subjectDialogParentId.value;
      const result = await itemController.create(
        new AddSubjectItemParams({
          translations: new TranslationParams({
            title: data.name,
            description: data.description,
          }),
          stage_id: props.stageId,
          parent_id: parentId,
          image: data.coverImage,
          isDraft: data.isDraft,
        }),
      );

      if (!(result instanceof DataSuccess) || !result.data) return;

      await addSubjectRelations(result.data.subject_id, data);
      showAddSubjectDialog.value = false;

      if (parentId) {
        refreshSubjectId.value = parentId;
        await nextTick();
        refreshSubjectId.value = null;
      } else {
        await fetchRoot();
      }
    } finally {
      isSubmittingSubject.value = false;
    }
  }

  provide('subjectOnSelect', selectNode);
  provide('subjectOnAddChild', openAddChildDialog);
  provide('subjectMaxDepth', subjectMaxDepth);
  provide('refreshSubjectId', refreshSubjectId);
  provide(
    'subjectStageId',
    computed(() => props.stageId),
  );

  async function handleDeleteBranch(parentId: number | null) {
    if (parentId === null) {
      await fetchRoot();
    } else {
      refreshSubjectId.value = parentId;
      await nextTick();
      refreshSubjectId.value = null;
    }
  }

  watch(
    () => props.stageId,
    async () => {
      stageExpanded.value = true;
      await fetchRoot();
    },
  );

  const route = useRoute();
  onMounted(async () => {
    const indexEducationConfigurationParams = new IndexEducationConfigurationParams({
      educationClassificatioId: Number(route.params.id),
      isLocale: true,
    });
    const configResult = await configController.fetchList(indexEducationConfigurationParams);
    if (configResult instanceof DataSuccess && configResult.data) {
      subjectConfig.value = configResult.data;
    }
    await fetchRoot();
  });

  const AddSubject = () => {
    subjectDialogParentId.value = undefined;
    subjectDialogName.value = getSubjectRootName();
    showAddSubjectDialog.value = true;
  };
</script>

<template>
  <!-- {{ subjectConfig }} -->
  <div class="subjects-panel">
    <!-- Left panel: stage as root branch + subject tree -->
    <div class="subjects-left">
      <!-- Stage root node (the deepest stage is the first subject branch) -->
      <div class="stage-root-row" @click="stageExpanded = !stageExpanded">
        <button class="toggle-btn" @click.stop="stageExpanded = !stageExpanded">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            width="14"
            height="14"
            :style="{
              transform: stageExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
            }"
          >
            <path
              d="M5 7l5 5 5-5"
              stroke="#4caf50"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <svg viewBox="0 0 20 20" fill="none" width="16" height="16" class="node-icon">
          <path
            d="M3 7a2 2 0 012-2h3.5l1.5 1.5H15a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            stroke="#4caf50"
            stroke-width="1.3"
            fill="none"
          />
        </svg>
        <span class="stage-root-name">{{ stageName }}</span>
        <span class="spacer" />
        <button
          v-if="subjectConfig && (subjectConfig as any)?.[0]?.numberOfBranches > 0"
          class="icon-btn"
          title="Add Subject"
          @click.stop="AddSubject"
        >
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
            <circle cx="10" cy="10" r="8" stroke="#4caf50" stroke-width="1.4" />
            <path d="M10 7v6M7 10h6" stroke="#4caf50" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <!-- Subject tree nodes under the stage root -->
      <transition name="slide-down">
        <div v-if="stageExpanded" class="stage-children-wrapper">
          <div v-if="rootNodes.length === 0" class="hint-text">
            {{ $t('No subjects yet. Click + to add.') }}
          </div>
          <div v-else class="subject-tree-list">
            <SubjectTreeNode
              v-for="node in rootNodes"
              :key="node.subject.subject_id"
              :node="node"
              :max-depth="subjectMaxDepth"
              :level-labels="subjectBranchLevelLabels"
              :selected-subject-id="selectedNode?.subject.subject_id ?? null"
              :parent-id="null"
              @fetch-children="fetchChildren"
              @add-child="openAddChildDialog"
              @select="selectNode"
              @delete-branch="handleDeleteBranch"
            />
          </div>
        </div>
      </transition>
    </div>
  </div>

  <AddEducationSubjectDialog
    v-if="showAddSubjectDialog"
    v-model:visible="showAddSubjectDialog"
    :subject-name="subjectDialogName || getSubjectRootName()"
    :loading="isSubmittingSubject"
    @confirm="handleAddSubject"
  />
</template>
