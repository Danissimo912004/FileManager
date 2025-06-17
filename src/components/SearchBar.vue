<template>
  <div class="search-bar">
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Search files and folders..."
      @input="updateRoute"
    />
    <select v-model="selectedType" @change="updateRoute">
      <option value="">All types</option>
      <option value="folder">Folder</option>
      <option value="image">Image</option>
      <option value="video">Video</option>
      <option value="document">Document</option>
      <option value="music">Music</option>
      <option value="text">Text</option>
      <option value="pdf">PDF</option>
    </select>
  </div>
</template>

<script setup lang="ts">
// api import is no longer needed here for search
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { FileType } from "../types/types";

const route = useRoute();
const router = useRouter();

const searchQuery = ref("");
const selectedType = ref<FileType | "">("");

// This function will update the route query parameters
const updateRoute = () => {
  const query = {
    q: searchQuery.value || undefined,
    type: selectedType.value || undefined,
  };
  // Using router.replace to avoid adding to browser history excessively
  router.replace({ query: { ...route.query, ...query } }).catch(() => {
    // Ignore errors if the route cannot be updated 
  });
};
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  gap: 1rem;
  max-width: 600px;

  input,
  select {
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: #86b7fe;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
  }

  input {
    flex: 1;
  }

  select {
    width: 120px;
  }
}
</style>
