<template>
  <div class="file-viewer">
    <div v-if="error" class="error-container">
      <ErrorMessage :message="error" />
    </div>
    <div v-else class="viewer-content">
      <!-- Text Editor -->
      <div v-if="file.type === FileType.TEXT" class="text-editor">
        <textarea
          v-model="content"
          :disabled="saving"
          @input="handleTextChange"
          spellcheck="false"
        ></textarea>
        <div class="editor-actions">
          <button
            @click="saveContent"
            :disabled="!hasChanges || saving"
            class="save-button"
          >
            {{ saving ? "Saving..." : "Save Changes" }}
          </button>
        </div>
      </div>

      <!-- PDF Viewer -->
      <iframe
        v-else-if="file.type === FileType.PDF"
        :src="props.file.url"
        class="pdf-viewer"
      >
      </iframe>

      <!-- Image Viewer -->
      <img
        v-else-if="props.file.type === FileType.IMAGE && props.file.url"
        :src="props.file.url"
        :alt="props.file.name"
        class="image-viewer"
      />

      <!-- Video Player -->
      <video
        v-else-if="props.file.type === FileType.VIDEO && props.file.url"
        controls
        class="video-player"
      >
        <source :src="props.file.url" :type="file.mimeType" />
        Your browser does not support the video tag.
      </video>

      <!-- Audio Player -->
      <audio
        v-else-if="props.file.type === FileType.AUDIO && props.file.url"
        controls
        class="audio-player"
      >
        <source :src="props.file.url" :type="file.mimeType" />
        Your browser does not support the audio tag.
      </audio>

      <!-- Document Viewer -->
      <div
        v-else-if="props.file.type === FileType.DOCUMENT"
        class="document-viewer"
      >
        <div class="document-info">
          <p>Document preview is not available.</p>
          <p>File name: {{ file.name }}</p>
          <p>File type: {{ file.mimeType }}</p>
          <p>File size: {{ formatFileSize(file.size) }}</p>
          <a
            v-if="props.file.url"
            :href="props.file.url"
            :download="props.file.name"
            class="download-link"
            >Download Document</a
          >
        </div>
      </div>

      <!-- Unsupported Format -->
      <div v-else class="unsupported-format">
        <p>This file format is not supported for preview.</p>
        <p>File type: {{ file.type }}</p>
        <p>MIME type: {{ file.mimeType }}</p>
        <p>File size: {{ formatFileSize(file.size) }}</p>
        <a v-if="fileUrl" :href="fileUrl" target="_blank" class="download-link"
          >Download File</a
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { FileItem, ApiResponse, TextContent } from "../types/types";
import { FileType } from "../types/types";
import {
  getFileContent,
  downloadFile,
  updateFileContent,
} from "../services/api";
import ErrorMessage from "./ErrorMessage.vue";

const props = defineProps<{
  file: FileItem;
}>();

const emit = defineEmits<{
  (e: "update:file", file: FileItem): void;
}>();

const content = ref("");
const originalContent = ref("");
const saving = ref(false);
const error = ref("");
const fileUrl = ref("");

const hasChanges = computed(() => {
  return content.value !== originalContent.value;
});

const loadContent = async () => {
  try {
    if (props.file.type === FileType.TEXT) {
      const response = await getFileContent(props.file.id);
      if (response.error) {
        throw new Error(response.error);
      }
      const textContent = response.content?.content || "";
      content.value = textContent;
      originalContent.value = textContent;
    } else if (
      [
        FileType.PDF,
        FileType.IMAGE,
        FileType.VIDEO,
        FileType.AUDIO,
        FileType.DOCUMENT,
      ].includes(props.file.type)
    ) {
      const response = await downloadFile(props.file.id);
      if (response.error) {
        throw new Error(response.error);
      }
      fileUrl.value = response.url || "";
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load file";
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

onMounted(() => {
  loadContent();
});

const handleTextChange = () => {
  error.value = "";
};

const saveContent = async () => {
  if (!hasChanges.value) return;

  saving.value = true;
  error.value = "";

  try {
    const response = await updateFileContent(props.file.id, content.value);
    if (response.error) {
      throw new Error(response.error);
    }
    originalContent.value = content.value;
    emit("update:file", { ...props.file, content: content.value });
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to save changes";
  } finally {
    saving.value = false;
  }
};
</script>

<style lang="scss" scoped>
.file-viewer {
  width: 100%;
  height: calc(100vh - 120px);
  background: white;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.viewer-content {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.text-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;

  textarea {
    flex: 1;
    width: 100%;
    padding: 1rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-family: "Courier New", Courier, monospace;
    font-size: 14px;
    line-height: 1.5;
    resize: none;
    white-space: pre;
    overflow-wrap: normal;
    overflow-x: auto;

    &:focus {
      outline: none;
      border-color: #86b7fe;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    &:disabled {
      background-color: #e9ecef;
      cursor: not-allowed;
    }
  }
}

.editor-actions {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
}

.save-button {
  padding: 0.5rem 1rem;
  background-color: #0d6efd;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #0b5ed7;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
}

.pdf-viewer,
.image-viewer,
.video-player,
.audio-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.document-viewer,
.unsupported-format {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #6c757d;

  p {
    margin: 0.5rem 0;
  }
}

.download-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #0d6efd;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0b5ed7;
  }
}

.error-container {
  padding: 1rem;
}
</style>
