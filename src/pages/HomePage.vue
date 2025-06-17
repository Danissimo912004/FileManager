<template>
  <div class="home-page">
    <h1>File Manager</h1>
    <!-- SearchBar now only updates the URL query params -->
    <SearchBar />
    <div class="content">
      <div class="actions">
        <button @click="createFolder" class="btn">Create Folder</button>
        <input
          type="file"
          ref="fileInput"
          @change="handleFileUpload"
          style="display: none"
        />
        <button @click="triggerFileUpload" class="btn">Upload File</button>
      </div>

      <div class="files-list">
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="files.length === 0" class="empty">No files found</div>
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
              <button @click.stop="deleteFile(file)" class="btn-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
// Make sure you have an `api` object or import `api.get` specifically for search
import {
  getFiles,
  createFolder,
  uploadFile,
  deleteFile,
  api,
} from "@/services/api"; // Assuming 'api' is exported
import type { FileItem, FileType } from "@/types/types";
import SearchBar from "@/components/SearchBar.vue";

export default defineComponent({
  name: "HomePage",
  components: { SearchBar },
  setup() {
    const router = useRouter();
    const route = useRoute(); // Access the current route
    const files = ref<FileItem[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const fileInput = ref<HTMLInputElement | null>(null);

    // This function will now take care of fetching based on query params
    const fetchFilesBasedOnRoute = async () => {
      loading.value = true;
      error.value = null;

      const q = route.query.q as string | undefined;
      const type = route.query.type as FileType | undefined;

      console.log(q + " " + type); // debug

      try {
        let response;
        if (q || type) {
          // If search parameters exist, call the search API
          response = await api.get("/files/search", {
            params: { q, type },
          });
        } else {
          // Otherwise, fetch all files
          response = await getFiles();
        }

        files.value = response.data || [];
      } catch (err) {
        console.error("Error fetching files:", err);
        error.value = "Failed to load files.";
        files.value = [];
      } finally {
        loading.value = false;
      }
    };

    // Watch for changes in route.query and refetch files
    watch(
      () => route.query,
      fetchFilesBasedOnRoute, // Call the fetch function whenever query changes
      { immediate: true }, // Run immediately on component mount
    );

    // Existing functions...
    const handleFileClick = (file: FileItem) => {
      if (file.type === "folder") {
        router.push(`/folders/${file.id}`);
      } else {
        router.push(`/files/${file.id}`);
      }
    };

    const handleCreateFolder = async () => {
      const name = prompt("Enter folder name:");
      if (!name) return;

      const response = await createFolder(name);
      if (response.error) {
        error.value = response.error;
      } else {
        fetchFilesBasedOnRoute(); // Re-fetch files after creation (respecting current search)
      }
    };

    const triggerFileUpload = () => {
      fileInput.value?.click();
    };

    const handleFileUpload = async (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input.files?.length) return;

      const file = input.files[0];
      const response = await uploadFile(file);
      if (response.error) {
        error.value = response.error;
      } else {
        fetchFilesBasedOnRoute(); // Re-fetch files after upload
      }
      input.value = ""; // Reset input
    };

    const handleDeleteFile = async (file: FileItem) => {
      if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;

      const response = await deleteFile(file.id);
      if (response.error) {
        error.value = response.error;
      } else {
        fetchFilesBasedOnRoute(); // Re-fetch files after deletion
      }
    };

    const getFileIcon = (file: FileItem) => {
      return file.type === "folder" ? "folder-icon" : "file-icon";
    };

    // onMounted is now redundant because `watch` with `immediate: true` handles initial fetch
    // onMounted(fetchFilesBasedOnRoute); // Removed

    return {
      files,
      loading,
      error,
      fileInput,
      createFolder: handleCreateFolder,
      handleFileUpload,
      triggerFileUpload,
      handleFileClick,
      deleteFile: handleDeleteFile,
      getFileIcon,
    };
  },
});
</script>

<style scoped>
.home-page {
  padding: 20px;
}

.content {
  margin-top: 20px;
}

.actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn:hover {
  background-color: #45a049;
}

.btn-delete {
  padding: 4px 8px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-delete:hover {
  background-color: #da190b;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.file-item {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-item:hover {
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.file-icon {
  text-align: center;
  font-size: 24px;
  margin-bottom: 10px;
}

.file-name {
  text-align: center;
  word-break: break-word;
}

.loading, .error, .empty {
  text-align: center;
  padding: 20px;
}

.error {
  color: #f44336;
}
</style>

