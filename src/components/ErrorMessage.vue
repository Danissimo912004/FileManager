<template>
  <div class="error-message">
    <div class="error-icon">⚠️</div>
    <p>{{ message || 'An error occurred' }}</p>
    <button v-if="retry" @click="$emit('retry')" class="retry-button">
      Try Again
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
  retry?: boolean
}>()

defineEmits<{
  (e: 'retry'): void
}>()
</script>

<style lang="scss" scoped>
.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  text-align: center;
  background-color: #fff3f3;
  border-radius: 8px;
  margin: 1rem 0;

  .error-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  p {
    color: #dc3545;
    margin: 0 0 1rem;
  }
}

.retry-button {
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    background-color: #bb2d3b;
  }
}
</style> 