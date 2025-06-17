<template>
  <div class="login-page">
    <h2>Login</h2>
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          id="username"
          v-model="credentials.username"
          type="text"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input
          id="password"
          v-model="credentials.password"
          type="password"
          required
        />
      </div>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? "Loading..." : "Login" }}
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { authService } from "../services/auth.service";
import type { LoginCredentials } from "../types/auth";

export default defineComponent({
  name: "LoginPage",
  setup() {
    const router = useRouter();
    const credentials = ref<LoginCredentials>({
      username: "",
      password: "",
    });
    const loading = ref(false);
    const error = ref("");

    const handleSubmit = async () => {
      try {
        loading.value = true;
        error.value = "";
        const response = await authService.login(credentials.value);

        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(response.user));

        // Redirect based on user role
        if (response.user.isAdmin) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } catch (err: any) {
        error.value = err.message || "Login failed";
      } finally {
        loading.value = false;
      }
    };

    return {
      credentials,
      loading,
      error,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 0.5rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
}

.error-message {
  color: red;
  margin-bottom: 1rem;
}
</style>

