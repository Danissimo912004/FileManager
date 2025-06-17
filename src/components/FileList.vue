<template>
  <div class="file-list">
    <div v-if="error" class="error-container">
      <ErrorMessage :message="error" :retry="true" @retry="$emit('retry')" />
    </div>
    <div v-else-if="!files.length" class="empty-state">
      <p>No files found</p>
    </div>
    <div v-else class="files-grid">
      <FileItem
        v-for="file in files"
        :key="file.id"
        :file="file"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FileItem as FileItemType } from '../types/types'
import FileItem from './FileItem.vue'
import ErrorMessage from './ErrorMessage.vue'

defineProps<{
  files: FileItemType[]
  error?: string
}>()

defineEmits<{
  (e: 'retry'): void
}>()
</script>

<style lang="scss" scoped>
.file-list {
  margin-top: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #6c757d;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.error-container {
  max-width: 500px;
  margin: 0 auto;
}
</style> 