<script lang="ts" setup>
import { ArticleDifficultyEnum } from '@/modules/Articles/core/constant/Article.difficulty.enum';
import type ArticleCardModel from '../../../core/models/article.card';
import { ArticleTypeEnum } from '@/modules/Articles/core/constant/Article.type.enum';
import DropList from '@/shared/HelpersComponents/DropList.vue';
import EditIcon from '@/shared/icons/DropListIcons/EditIcon.vue';
import DeletIcon from '@/shared/icons/DropListIcons/DeletIcon.vue';
import { useI18n } from 'vue-i18n';
import ArticleController from '../../../presentation/controllers/Article.controller';
import DeleteArticlesParams from '../../../core/params/delet.Articles.params';
  import { ref } from 'vue';
const { question } = defineProps<{
    question: ArticleCardModel[];
}>()
 const controller = ArticleController.getInstance();
const { t } = useI18n();
const getDifficultyClass = (difficulty: ArticleDifficultyEnum) => {
    switch (difficulty) {
        case ArticleDifficultyEnum.easy:
            return t("easy");
        case ArticleDifficultyEnum.medium:
            return t("medium");
        case ArticleDifficultyEnum.hard:
            return t("hard");
        default:
            return "N/A";
    }
};

const getStatusClass = (status: ArticleTypeEnum) => {
    switch (status) {
        case ArticleTypeEnum.mcq:
            return t("MCQ");
        case ArticleTypeEnum.ranking:
            return t("Ranking");
        case ArticleTypeEnum.true_false:
            return t("True/False");
        case ArticleTypeEnum.complate:
            return t("Complate");
            case ArticleTypeEnum.matching:
            return t("Matching");
        default:
            return "N/A";
    }
};
  const ShoweEditDialog = ref<boolean>(false);
  const selectedItemId = ref<number>(0);
  const deleteArticleQuestion = async (id: number) => {
    await controller.delete(new DeleteArticlesParams(id)); 
  };
// droplist
const actionList = (id: number, deleteArticleQuestion: (id: number) => void) => [
    {
      text: t('Edit'),
      icon: EditIcon,
      action: () => {
        selectedItemId.value = id;
        ShoweEditDialog.value = true;
      },
    },
    {
      text: t('delete'),
      icon: DeletIcon,
      action: () => deleteArticleQuestion(id),
    },
  ];

</script>
<template>
    <div class="question_card">
        <div v-for="(value,index) in question" :key="value?.id" class="num-question">
            <div class="contant-card">
                <div class="header-card">
                     <div class="title"> <h6>questions {{ index + 1 }}</h6>   </div>  
            <div class="actions">
                 <DropList
                  :action-list="actionList(value.id, deleteArticleQuestion)"
                  :delete-dialog-title="
                    $t('are_you_sure_you_want_to_remove_this_education_classification')
                  "
                  :delete-dialog-message="
                    $t(
                      'Deleting_this_classification_will_remove_all_related_data_including_any_configurations_and_tree_structures_This_action_is_irreversible_and_the_classification_must_be_created_again_if_needed',
                    )
                  "
                />
            </div>
                </div>
                <div class="types-date">
                      <div class="date">
                        <span class="label">{{ $t('created_at') }}:</span>
                        <span class="value">{{ value?.createdAt }}</span>
                    </div>
                     <div class="type">
                        <span class="value" :class="getDifficultyClass(value?.articledifficulty!)">{{ getDifficultyClass(value?.articledifficulty!) }}</span>
                        <span class="value-status" :class="getStatusClass(value?.status!)">{{ getStatusClass(value?.status!) }}</span>
                    </div>
                </div>
                <div class="question_text">
                   <p>{{ value?.questions }}</p> 
                </div>
                <div class="all_answers">
                    <div v-for="(answer,index) in value?.answer" :key="index" class="answer">
                        <div class="imge-text">
                            <div class="text">
                                <span class="label">{{ $t('Answers') }} {{ index + 1 }}</span>
                                <p class="answer_text">{{ answer?.answer }}</p> 
                            </div>
                            <div class="imge">
                                <img :src="answer?.image" :alt="answer?.answer">
                            </div>
                        </div>
                        <div class="count-answer">
                            <p class="corret">{{ answer?.countCorrect }}%</p>
                            <p class="student">{{ answer?.countStudent }} stds</p>
                        </div>
                    </div>
                </div>
            </div>  
        </div>
    </div>
</template>
<style scoped lang="scss">
@use '../../../../../styles/variables' as *;
@use '../../../../../styles/mixins/flex' as *;

</style>