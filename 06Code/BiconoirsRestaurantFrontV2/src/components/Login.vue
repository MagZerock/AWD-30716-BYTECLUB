<!-- src/components/Login.vue -->

<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Ingresar</h1>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="tu@email.com"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
          />
        </div>

        <div v-if="userStore.error" class="error-message">
          {{ userStore.error }}
        </div>

        <button
          type="submit"
          :disabled="userStore.isLoading"
          class="submit-btn"
        >
          {{ userStore.isLoading ? 'Cargando...' : 'Ingresar' }}
        </button>
      </form>

      <div class="signup-link">
        ¿No tienes cuenta? <router-link to="/register">Regístrate aquí</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';

const email = ref('');
const password = ref('');
const userStore = useUserStore();
const router = useRouter();

const handleLogin = async () => {
  const success = await userStore.login(email.value, password.value);
  if (success) {
    router.push('/');
  }
};
</script>

<style scoped src="@/styles/pages/login.css"></style>
