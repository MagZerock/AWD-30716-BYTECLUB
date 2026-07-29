<template>
  <div class="oauth-callback-container">
    <div class="oauth-callback-card">
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../stores/userStore'
import { useToast } from '../composables/useToast'

const router = useRouter()
const userStore = useUserStore()
const toast = useToast()
const message = ref('Procesando inicio de sesión...')

onMounted(async () => {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    message.value = 'Error al autenticar'
    toast.error(error.message)
    setTimeout(() => router.push('/login'), 2000)
    return
  }

  if (!data.session) {
    message.value = 'No se recibieron datos de autenticación'
    setTimeout(() => router.push('/login'), 2000)
    return
  }

  const supaUser = data.session.user
  const meta = supaUser.user_metadata

  const googleUser = {
    name: meta?.full_name || meta?.name || supaUser.email?.split('@')[0] || 'Usuario',
    email: supaUser.email || '',
    picture: meta?.avatar_url || meta?.picture || null,
  }

  userStore.setSupabaseSession(googleUser)

  message.value = 'Inicio de sesión exitoso'
  toast.success('Inicio de sesión con Google exitoso')
  setTimeout(() => router.push('/'), 1000)
})
</script>

<style scoped>
.oauth-callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 2.5rem 0;
}
.oauth-callback-card {
  background: rgba(255, 255, 255, 0.96);
  padding: 2.25rem;
  border-radius: 24px;
  box-shadow: 0 20px 36px rgba(17, 24, 39, 0.1);
  border: 1px solid var(--border);
  width: 100%;
  max-width: 420px;
  text-align: center;
  color: var(--text-secondary);
}
</style>
