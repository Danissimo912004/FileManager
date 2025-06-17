<template>
  <div class="admin-page">
    <h2>Admin Panel</h2>
    <div class="admin-content">
      <div class="stats-section">
        <h3>Statistics</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <h4>Total Users</h4>
            <p>{{ stats.totalUsers }}</p>
          </div>
          <div class="stat-card">
            <h4>Total Files</h4>
            <p>{{ stats.totalFiles }}</p>
          </div>
          <div class="stat-card">
            <h4>Storage Used</h4>
            <p>{{ formatStorage(stats.storageUsed) }}</p>
          </div>
        </div>
      </div>

      <div class="users-section">
        <h3>Users Management</h3>
        <div class="users-list">
          <div v-if="loading" class="loading">Loading...</div>
          <div v-else-if="error" class="error-message">{{ error }}</div>
          <table v-else>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.isAdmin ? "Admin" : "User" }}</td>
                <td>
                  <button @click="deleteUser(user.id)" class="delete-btn">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import axios from "axios";
import type { User } from "../types/auth";

interface Stats {
  totalUsers: number;
  totalFiles: number;
  storageUsed: number;
}

export default defineComponent({
  name: "AdminPage",
  setup() {
    const users = ref<User[]>([]);
    const stats = ref<Stats>({
      totalUsers: 0,
      totalFiles: 0,
      storageUsed: 0,
    });
    const loading = ref(false);
    const error = ref("");

    const fetchUsers = async () => {
      try {
        loading.value = true;

        const accessToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("access-token="))
          ?.split("=")[1];

        const response = await axios.get(
          "http://localhost:3000/api/admin/users",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        users.value = response.data.users;
      } catch (err: any) {
        error.value = err.response?.data?.message || "Failed to fetch users";
      } finally {
        loading.value = false;
      }
    };

    const fetchStats = async () => {
      try {
        const token = document.cookie.replace(
          /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
          "$1",
        );
        const response = await axios.get(
          "http://localhost:3000/api/admin/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        stats.value = response.data;
      } catch (err: any) {
        console.error("Failed to fetch stats:", err);
      }
    };

    const deleteUser = async (userId: number) => {
      if (!confirm("Are you sure you want to delete this user?")) return;

      try {
        const token = document.cookie.replace(
          /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
          "$1",
        );
        await axios.delete(`http://localhost:3000/api/admin/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        await fetchUsers();
        await fetchStats();
      } catch (err: any) {
        error.value = err.response?.data?.message || "Failed to delete user";
      }
    };

    const formatStorage = (bytes: number): string => {
      const sizes = ["Bytes", "KB", "MB", "GB"];
      if (bytes === 0) return "0 Bytes";
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
    };

    onMounted(() => {
      fetchUsers();
      fetchStats();
    });

    return {
      users,
      stats,
      loading,
      error,
      deleteUser,
      formatStorage,
    };
  },
});
</script>

<style scoped>
.admin-page {
  padding: 2rem;
}

.admin-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-card {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-card h4 {
  margin: 0;
  color: #666;
}

.stat-card p {
  margin: 0.5rem 0 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.users-list {
  margin-top: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.delete-btn {
  padding: 0.25rem 0.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #c82333;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.error-message {
  color: #dc3545;
  padding: 1rem;
  background-color: #f8d7da;
  border-radius: 4px;
}
</style>

