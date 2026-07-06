<!-- src/components/Survey.vue -->

<template>
  <div class="survey-container">
    <div class="container">
      <h1>Cuéntanos Tu Experiencia</h1>
      <p class="subtitle">Tu opinión es muy importante para nosotros</p>

      <div class="survey-card">
        <form @submit.prevent="submitSurvey">
          <div class="form-group">
            <label>Calificación</label>
            <div class="rating">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                @click="formData.rating = star"
                :class="{ active: formData.rating >= star }"
                class="star-btn"
              >
                ⭐
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="comments">Comentarios</label>
            <textarea
              id="comments"
              v-model="formData.comments"
              placeholder="Comparte tus comentarios sobre tu experiencia..."
              rows="5"
            ></textarea>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="success" class="success-message">
            ¡Gracias por tu comentario!
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="submit-btn"
          >
            {{ isLoading ? 'Enviando...' : 'Enviar Encuesta' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import apiClient from '../utils/api';
import { useUserStore } from '../stores/userStore';

const userStore = useUserStore();
const formData = ref({
  rating: 0,
  comments: ''
});
const isLoading = ref(false);
const error = ref('');
const success = ref(false);

const submitSurvey = async () => {
  if (!userStore.isAuthenticated) {
    error.value = 'Debes iniciar sesión para enviar una encuesta';
    return;
  }

  if (formData.value.rating === 0) {
    error.value = 'Por favor selecciona una calificación';
    return;
  }

  isLoading.value = true;
  error.value = '';
  success.value = false;

  try {
    await apiClient.post('/surveys', {
      rating: formData.value.rating,
      comments: formData.value.comments
    });
    success.value = true;
    formData.value = { rating: 0, comments: '' };
    setTimeout(() => {
      success.value = false;
    }, 3000);
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Error al enviar la encuesta';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped src="@/styles/pages/survey.css"></style>
