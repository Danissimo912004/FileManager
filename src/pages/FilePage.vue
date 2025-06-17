<template>
  <div class="file-page">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="file-container">
      <div class="file-header">
        <h2>{{ file?.name }}</h2>
        <button @click="goBack" class="btn-back">Back</button>
      </div>
      <FileViewerWidget
        v-if="file"
        :file="file"
        @update:file="handleFileUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getFileById, getFileContent, downloadFile } from "@/services/api";
import FileViewerWidget from "@/components/FileViewerWidget.vue";
import { FileType } from "@/types/types";
import type { FileItem, ApiResponse, TextContent } from "@/types/types";

const route = useRoute();
const router = useRouter();
const file = ref<FileItem | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const loadFile = async () => {
  loading.value = true;
  error.value = null;

  try {
    const fileId = route.params.id as string;
    const response = await getFileById(fileId);

    if (response.error || !response.data) {
      throw new Error(response.error || "File not found");
    }

    file.value = response.data;

    // Get file content for text files
    if (file.value && file.value.type === FileType.TEXT) {
      const contentResponse = await getFileContent(fileId);
      if (contentResponse.error || !contentResponse.content) {
        throw new Error(contentResponse.error || "Failed to load file content");
      }
      if (file.value) {
        file.value.content = contentResponse.content.content;
      }
    } else if (file.value && file.value.type === FileType.PDF) {
      // Get download URL for PDF
      const downloadResponse = await downloadFile(fileId);
      if (!downloadResponse.data) {
        throw new Error("Failed to load file");
      }

      const blob = new Blob([downloadResponse.data], {
        type: "application/pdf",
      });
      file.value.url = URL.createObjectURL(blob);
    } else if (file.value) {
      // Get download URL for other file types
      const downloadResponse = await downloadFile(fileId);
      if (!downloadResponse.data) {
        throw new Error("Failed to load file");
      }

      const blob = new Blob([downloadResponse.data], {
        type: downloadResponse.content?.type,
      });
      file.value.url = URL.createObjectURL(blob);
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load file";
  } finally {
    loading.value = false;
  }
};

const handleFileUpdate = (updatedFile: FileItem) => {
  file.value = updatedFile;
};

const goBack = () => {
  router.back();
};

onMounted(loadFile);
</script>

<style scoped>
.file-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f8f9fa;
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 20px;
}

.file-container {
  flex: 1;
  overflow: hidden;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.loading {
  text-align: center;
  padding: 20px;
}

.error {
  color: #dc3545;
  padding: 20px;
  text-align: center;
}
</style>
