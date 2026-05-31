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
            return "mcq";
        case ArticleTypeEnum.ranking:
            return "ranking";
        case ArticleTypeEnum.true_false:
            return "true_false";
        case ArticleTypeEnum.complate:
            return "complate";
        default:
            return "N/A";
    }
};

</script>
<template>
    <div class="question_card">
        <div class="num-question" v-for="(value,index) in question" :key="value?.id">
            <div class="contant-card">
                <div class="header-card">
                     <div class="title"> <h6>questions {{ index + 1 }}</h6>   </div>  
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
                        <span class="value" :class="getDifficultyClass(value?.articledifficulty!)">{{ getDifficultyClass(value?.articledifficulty!) }}</span>
                        <span class="value-status" :class="getStatusClass(value?.status!)">{{ getStatusClass(value?.status!) }}</span>
                    </div>
                </div>
                <div class="question_text">
                   <p>{{ value?.questions }}</p> 
                </div>
                <div class="all_answers">
                    <div class="answer" v-for="(answer,index) in value?.answer" :key="index">
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
.question_card{
  
    .num-question{
          background-color: var(--bg-main);
    padding: $MdSize $XsSize;
    border-radius: $XlSize;
    margin: $XlSize2 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        .contant-card{
            .header-card{
                border-bottom: 1px dashed #D0D0D0;
                padding-bottom: $XsSize3;
                @include flex(row,wrap,space-between,center);
                margin-bottom:$XlSize2 ;
                .title{
                    h6{
                        font-size: $MdSize2;
                        font-family: "medium";
                        font-weight:$BaseFontSemiBoldWeight ;
                        color: #303030 ;
                    }
                }
                .actions{
                    icon{
                        cursor: pointer;
                    }
                }
            }
        }
        .types-date{
            @include flex(row,wrap,space-between,center);
            gap: $XsSize3;
            .date{
                .label{
                    color: var( --second-text);
                    font-family: "medium";
                    font-weight:$BaseFontMediumWeight ;
                    font-size: $SmSize;
                }
                .value{
                     color: var( --gray-5);
                    font-family: "medium";
                    font-weight:$BaseFontMediumWeight ;
                    font-size: $SmSize;
                }
            }
            .type{
                @include flex(row,wrap,end,center);
                gap: $XsSize3;
                .value{
                        padding: $XsSize5 $XlSize2;
                        border-radius: $XlSize4;
                        font-size: $MdSize;
                        font-family: "medium";
                        font-weight:$BaseFontMediumWeight ;
                }
                .easy{
                    background-color: #E9F9EE;
                    color: #18A957;
                    border: 1px solid #B7E9C9;
                }
                .value-status{
                     padding: $XsSize5 $XlSize2;
                        border-radius: $XlSize4;
                        font-size: $MdSize;
                        font-family: "medium";
                        font-weight:$BaseFontMediumWeight ;
                        border: 1px solid #6155F51A;
                        background-color: #6155F51A;
                        color: #6155F5;
                }
    
            }
        }
        .question_text{
            margin: $XsSize2 0;
            p{
                color: var( --standard-black);
                font-family: "bold";
                font-weight:$BaseFontWeightBold ;
                font-size: $XlSize2;
            }
        }
        .all_answers{
            border: 1px solid var(--border-color);
            border-radius: $XlSize2;
            padding: $MdSize;
            .answer{
                display: grid;
                grid-template-columns: 5fr 1fr;
                gap: $MdSize;
                margin-bottom:$XsSize2;
                .imge-text{
                    @include flex(row,wrap,space-between,center);
                    width: 100%;
                    gap: $MdSize;
                    .text{
                        .label{
                            font-size: $SmSize;
                            font-family: "medium";
                            font-weight:$BaseFontMediumWeight ;
                            color: var(--second-text) ;
                        }
                        .answer_text{
                            font-size: $MdSize;
                            font-family: "medium";
                            font-weight:$BaseFontMediumWeight ;
                            color: var(--Gray-6) ;
                        }
                    }
                    .imge{
                        width: 70px;
                        height: 60px; 
                        img{
                            width: 100%;
                            height: 100%;
                            object-fit: contain;
                        }
                    }
                }
                .count-answer{
                    text-align: center;
                    background-color: var(--gray-soft);
                    border-radius: $XsSize3;
                    margin:    auto;
                    padding: $XsSize;
                    width: 100%;
                    .corret{
                        font-size: $MdSize;
                        font-family: "bold";
                        font-weight:$BaseFontWeightBold ;
                        color: var(--standard-black) ;
                    }
                    .student{
                        font-size: $XsSize;
                        font-family: "medium";
                        font-weight:$BaseFontMediumWeight ;
                        color: var(--gray-5);
                    }
                }
            }
        }
    }
}
</style>