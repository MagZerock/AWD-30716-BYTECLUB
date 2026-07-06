import { ref } from 'vue';
import apiClient from '../utils/api';

export const useSurvey = () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const submitSurvey = async (rating: number, comments: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await apiClient.post('/surveys', { rating, comments });
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al enviar la encuesta';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    submitSurvey
  };
};
