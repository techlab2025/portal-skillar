<script setup lang="ts">
import type { ArticleTypeEnum } from '../../core/constant/Article.type.enum';
import { AnswerTypeHelper } from './AnswersTypes/GetAnswerTypeHelper';

const { articleType } = defineProps<{
  articleType: ArticleTypeEnum
}>();

const emit = defineEmits(['update:data']);
</script>

<template>
  <component :is="AnswerTypeHelper(articleType)" @update:data="emit('update:data', $event)" />
</template>
