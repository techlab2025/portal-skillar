<script lang="ts" setup>
import { ArticleDifficultyEnum } from '@/modules/Articles/core/constant/Article.difficulty.enum';
import ArticleCardModel from '../../../core/models/article.card';
import { ArticleTypeEnum } from '@/modules/Articles/core/constant/Article.type.enum';

const {question} = defineProps<{
    question : ArticleCardModel[];
}>()

const getDifficultyClass = (difficulty: ArticleDifficultyEnum) => {
    switch (difficulty) {
        case ArticleDifficultyEnum.easy:
            return "easy";
        case ArticleDifficultyEnum.medium:
            return "medium";
        case ArticleDifficultyEnum.hard:
            return "hard";
        default:
            return "N/A";
    }
};

const getStatusClass = (status: ArticleTypeEnum) => {
    switch (status) {
        case ArticleTypeEnum.mcq:
            return "approved";
        case ArticleTypeEnum.ranking:
            return "under_review";
        case ArticleTypeEnum.true_false:
            return "rejected";
        case ArticleTypeEnum.complate:
            return "not_Reviewd";
        default:
            return "N/A";
    }
};

</script>
<template>
    <div class="question_card">
        <div class="num-question" v-for="value in question" :key="value?.id">
            <div class="contant-card">
                <div class="header">
                     <div class="title">
                <h6>questions {{ value?.id }}</h6>  
            </div> 
            <div class="actions">
                icon
            </div>
                </div>
                <div class="types-date">
                      <div class="date">
                        <span class="label">{{ $t('created_at') }}:</span>
                        <span class="value">{{ value?.createdAt }}</span>
                    </div>
                     <div class="type">
                        <span class="value">{{ getDifficultyClass(value?.articledifficulty) }}</span>
                        <span class="value">{{ getStatusClass(value?.status) }}</span>
                    </div>
                </div>
            </div>  
        </div>
    </div>
</template>
<style scoped lang="scss">
@use '../../../../../styles/variables' as *;
@use '../../../../../styles/mixins/flex' as *;
.question_card{

}
</style>