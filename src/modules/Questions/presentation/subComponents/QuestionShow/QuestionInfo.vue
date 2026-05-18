<script setup lang="ts">
  import questionImage from '@/assets/images/question-image.png';
</script>

<template>
  <div class="question-info-wrapper">
    <div class="question-info-categories">
      <div v-for="item in 3" :key="item" class="question-info-item">
        <label for="category">question type:</label>
        <p>MsQ</p>
      </div>
    </div>
    <div class="question-show-body">
      <div class="question-body-text">
        <label for="category">question </label>
        <h2>What is the basic building block of a living organism?</h2>
      </div>
      <div class="question-body-img">
        <img :src="questionImage" alt="" />
      </div>
    </div>
  </div>
</template>
