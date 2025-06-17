<template>
  <div class="file-item" @click="navigateToFile">
    <div class="file-icon">{{ getFileIcon }}</div>
    <div class="file-info">
      <h3>{{ file.name }}</h3>
      <p>{{ formatDate(file.modifiedDate) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { FileItem } from '../types/types'

const props = defineProps<{
  file: FileItem
}>()

const router = useRouter()

const getFileIcon = computed(() => {
  switch (props.file.type) {
    case 'folder':
      return '📁'
    case 'image':
      return '🖼️'
    case 'video':
      return '🎥'
    case 'document':
      return '📄'
    case 'music':
      return '🎵'
    case 'text':
      return '📝'
    case 'pdf':
      return '📑'
    default:
      return '📎'
  }
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const navigateToFile = () => {
  const route = props.file.type === 'folder' ? 'folder' : 'file'
  router.push({ name: route, params: { id: props.file.id } })
}
</script>

<style lang="scss" scoped>
.file-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .file-icon {
    font-size: 2rem;
    margin-right: 1rem;
  }

  .file-info {
    h3 {
      margin: 0;
      font-size: 1rem;
      color: #212529;
    }

    p {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: #6c757d;
    }
  }
}
</style> 