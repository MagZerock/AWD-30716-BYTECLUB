import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiBff, apiOps } from '../utils/api';
import { User } from '@/types/index';
import { supabase } from '../lib/supabase';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const picture = ref<string | null>(localStorage.getItem('user_picture'));
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isSupabaseAuth = computed(() => token.value === 'supabase_oauth');

  const isAuthenticated = computed(() => isSupabaseAuth.value || (!!token.value && !!user.value));
  const isAdmin = computed(() => user.value?.role === 'admin');

  const setToken = (newToken: string | null) => {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem('auth_token', newToken);
      apiBff.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      apiOps.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_picture');
      delete apiBff.defaults.headers.common['Authorization'];
      delete apiOps.defaults.headers.common['Authorization'];
    }
  };

  const saveUserId = (id: string) => {
    localStorage.setItem('user_id', id);
    apiBff.defaults.headers.common['x-user-id'] = id;
    apiOps.defaults.headers.common['x-user-id'] = id;
  };

  const mapUserFromApi = (apiUser: any): User => ({
    user_id: apiUser.userId ?? apiUser.user_id,
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone,
    role: apiUser.role ?? 'customer',
    picture: apiUser.picture ?? null,
    created_at: apiUser.createdAt ?? apiUser.created_at ?? new Date(),
    updated_at: apiUser.updatedAt ?? apiUser.updated_at ?? new Date(),
  });

  const login = async (email: string, password: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await apiBff.post('/auth/login', {
        email,
        password
      });
      const payload = response.data.data ?? response.data;
      const accessToken = payload.token;
      const userData = payload.user;
      setToken(accessToken);
      user.value = mapUserFromApi(userData);
      saveUserId(userData.userId ?? userData.user_id);
      return true;
    } catch (err: any) {
      error.value = err.message || 'Usuario o contraseña incorrectos';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await apiBff.post('/auth/signup', {
        name,
        email,
        passwordHash: password,
        phone
      });
      const payload = response.data.data ?? response.data;
      const accessToken = payload.token;
      const userData = payload.user;
      setToken(accessToken);
      user.value = mapUserFromApi(userData);
      saveUserId(userData.userId ?? userData.user_id);
      return true;
    } catch (err: any) {
      error.value = err.message || 'Error al registrarse';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const setSupabaseSession = (googleUser: { name: string; email: string; picture: string | null }) => {
    user.value = {
      user_id: googleUser.email,
      name: googleUser.name,
      email: googleUser.email,
      role: 'customer',
      picture: googleUser.picture,
      created_at: new Date(),
      updated_at: new Date(),
    }
    token.value = 'supabase_oauth'
    picture.value = googleUser.picture
    localStorage.setItem('auth_token', 'supabase_oauth')
    localStorage.setItem('user_id', googleUser.email)
    if (googleUser.picture) {
      localStorage.setItem('user_picture', googleUser.picture)
    }
  }

  const loginWithGoogleSupabase = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      error.value = error.message
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      await apiBff.post('/auth/logout')
    } catch {
      // session already invalid
    }
    user.value = null
    picture.value = null
    setToken(null)
  };

  const getCurrentUser = async () => {
    if (!token.value) return;
    isLoading.value = true;
    try {
      const response = await apiOps.get('/auth/me');
      user.value = mapUserFromApi(response.data);
    } catch (err) {
      logout();
    } finally {
      isLoading.value = false;
    }
  };

  if (token.value && token.value !== 'supabase_oauth') {
    apiBff.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    apiOps.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    getCurrentUser();
  }

  return {
    user,
    token,
    picture,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    getCurrentUser,
    setSupabaseSession,
    loginWithGoogleSupabase,
  };
});
