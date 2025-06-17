<template>
  <div class="folder-page">
    <div class="folder-header">
      <button @click="goBack" class="btn-back">← Back</button>
      <h2>{{ folderName }}</h2>
    </div>

    <div class="content">
      <div class="actions">
        <button @click="handleCreateFolder" class="btn">Create Folder</button>
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileUpload" 
          style="display: none"
          multiple
          accept="*/*"
        >
        <button @click="triggerFileUpload" class="btn">Upload File</button>
      </div>

      <div class="files-list">
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="files.length === 0" class="empty">This folder is empty</div>
        <div v-else class="files-grid">
          <div 
            v-for="file in files" 
            :key="file.id" 
            class="file-item"
            @click="handleFileClick(file)"
          >
            <div class="file-icon">
              <i :class="getFileIcon(file)"></i>
            </div>
            <div class="file-name">{{ file.name }}</div>
            <div class="file-actions">
              <button @click.stop="handleDeleteFile(file)" class="btn-delete">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getFiles, getFileById, createFolder, uploadFile, deleteFile } from '@/services/api';
import { FileType } from '@/types/types';
import type { FileItem } from '@/types/types';

const router = useRouter();
const route = useRoute();
const files = ref<FileItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const folderName = ref('Folder');

const folderId = route.params.id as string;

const FILE_ICONS = {
  [FileType.FOLDER]: 'fas fa-folder',
  [FileType.TEXT]: 'fas fa-file-alt',
  [FileType.PDF]: 'fas fa-file-pdf',
  [FileType.IMAGE]: 'fas fa-file-image',
  [FileType.VIDEO]: 'fas fa-file-video',
  [FileType.AUDIO]: 'fas fa-file-audio',
  [FileType.OTHER]: 'fas fa-file'
} as const;

const loadFolder = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Get folder details
    const folderResponse = await getFileById(folderId);
    if (folderResponse.error || !folderResponse.data) {
      throw new Error(folderResponse.error || 'Failed to load folder');
    }
    folderName.value = folderResponse.data.name;

    // Get folder contents
    const response = await getFiles(folderId);
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to load files');
    }
    files.value = response.data;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load folder';
  } finally {
    loading.value = false;
  }
};

const handleFileClick = (file: FileItem) => {
  if (file.type === FileType.FOLDER) {
    router.push(`/folder/${file.id}`);
  } else {
    router.push(`/files/${file.id}`);
  }
};

const handleCreateFolder = async () => {
  const name = prompt('Enter folder name:');
  if (!name) return;

  try {
    const response = await createFolder(name, folderId);
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to create folder');
    }
    await loadFolder();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create folder';
  }
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  try {
    const uploadPromises = Array.from(input.files).map(file => 
      uploadFile(file, folderId)
    );

    const responses = await Promise.all(uploadPromises);
    const errors = responses
      .filter((r): r is { error: string } => r.error !== undefined)
      .map(r => r.error);
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    await loadFolder();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to upload files';
  } finally {
    input.value = ''; // Reset input
  }
};

const handleDeleteFile = async (file: FileItem) => {
  if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;

  try {
    const response = await deleteFile(file.id);
    if (response.error) {
      throw new Error(response.error);
    }
    await loadFolder();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to delete file';
  }
};

const getFileIcon = (file: FileItem): string => {
  return FILE_ICONS[file.type] || FILE_ICONS[FileType.OTHER];
};

const goBack = () => {
  router.back();
};

onMounted(loadFolder);
</script>

<style scoped>
.folder-page {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.folder-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 0 20px;
}

.content {
  flex: 1;
  overflow: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
}

.actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  background-color: #0d6efd;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #0b5ed7;
}

.btn-back {
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-back:hover {
  background-color: #5a6268;
}

.btn-delete {
  padding: 4px 8px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-item:hover .btn-delete {
  opacity: 1;
}

.btn-delete:hover {
  background-color: #bb2d3b;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.file-item {
  padding: 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.file-item:hover {
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.file-icon {
  text-align: center;
  font-size: 32px;
  margin-bottom: 10px;
  color: #0d6efd;
}

.file-name {
  text-align: center;
  word-break: break-word;
  margin-bottom: 10px;
  font-size: 14px;
}

.file-actions {
  text-align: center;
}

.loading, .error, .empty {
  text-align: center;
  padding: 20px;
}

.error {
  color: #dc3545;
}

.empty {
  color: #6c757d;
}
</style> 
