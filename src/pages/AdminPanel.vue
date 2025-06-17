<template>
  <div class="admin-panel">
    <h1 class="title">Admin Panel</h1>

    <!-- Error Alert -->
    <div v-if="error" class="error-alert">
      {{ error }}
    </div>

    <!-- User Management Section -->
    <div class="users-section">
      <h2>User Management</h2>
      <table class="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.isAdmin ? "Admin" : "User" }}</td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <button
                v-if="!user.isAdmin"
                @click="toggleAdmin(user)"
                :class="[
                  'action-btn',
                  user.isAdmin ? 'remove-admin' : 'make-admin',
                ]"
              >
                {{ user.isAdmin ? "Remove Admin" : "Make Admin" }}
              </button>
              <button
                v-if="!user.isAdmin"
                @click="deleteUser(user.id)"
                class="action-btn delete"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- System Logs Section -->
    <div class="logs-section">
      <h2>System Logs</h2>
      <div class="logs-container">
        <table class="logs-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Name</th>
              <th>Size</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td>{{ log.id }}</td>
              <td>{{ log.type }}</td>
              <td>{{ log.name }}</td>
              <td>{{ formatSize(log.size) }}</td>
              <td>{{ formatDate(log.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { adminService } from "@/services/admin.service";
import type { User, SystemStats, Log, PaginatedResponse } from "@/types/admin";
import { formatDate, formatSize } from "@/utils/formatters";
import { FileItem } from "@/types/types";

export default defineComponent({
  name: "AdminPanel",

  setup() {
    const users = ref<User[]>([]);
    const logs = ref<FileItem[]>([]);
    const currentPage = ref(1);
    const totalPages = ref(1);
    const error = ref<string | null>(null);

    const fetchUsers = async () => {
      try {
        const response = await adminService.getUsers();
        if (response.error) {
          throw new Error(response.error);
        }
        users.value = response.data;
        error.value = null;
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Error fetching users";
        console.error("Error fetching users:", err);
      }
    };

    const fetchLogs = async () => {
      try {
        const response = await adminService.getLogs();
        if (response.error) {
          throw new Error(response.error);
        }
        logs.value = response.data;
        error.value = null;
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Error fetching logs";
        console.error("Error fetching logs:", err);
      }
    };

    const toggleAdmin = async (user: User) => {
      try {
        const response = await adminService.updateUser(user.id, {
          isAdmin: !user.isAdmin,
        });
        if (response.error) {
          throw new Error(response.error);
        }
        await fetchUsers();
        error.value = null;
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Error updating user";
        console.error("Error updating user:", err);
      }
    };

    const deleteUser = async (userId: string) => {
      if (!confirm("Are you sure you want to delete this user?")) return;

      try {
        const response = await adminService.deleteUser(userId);
        if (response.error) {
          throw new Error(response.error);
        }
        await fetchUsers();
        error.value = null;
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Error deleting user";
        console.error("Error deleting user:", err);
      }
    };

    onMounted(() => {
      fetchUsers();
      fetchLogs();
    });

    return {
      users,
      logs,
      currentPage,
      totalPages,
      error,
      toggleAdmin,
      deleteUser,
      formatDate,
      formatSize,
    };
  },
});
</script>

<style scoped>
.admin-panel {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.error-alert {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

.title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.stats-section,
.users-section,
.logs-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 6px;
  text-align: center;
}

.stat-card h3 {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.stat-card p {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.file-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.file-type-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
}

.file-type-card h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-transform: capitalize;
}

.users-table,
.logs-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

th {
  background: #f8f9fa;
  font-weight: 600;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.action-btn:hover {
  opacity: 0.9;
}

.make-admin {
  background: #28a745;
  color: white;
}

.remove-admin {
  background: #ffc107;
  color: #212529;
}

.delete {
  background: #dc3545;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: #f8f9fa;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

