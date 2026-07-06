<!-- src/components/layouts/MainLayout.vue -->

<template>
  <div class="main-layout">
    <nav class="navbar">
      <div class="container nav-container">
        <router-link to="/" class="logo-section">
          <img src="@/assets/img/logoRestaurantGreen.png" alt="Biconoir's" class="logo-image" />
        </router-link>

        <ul class="nav-links">
          <li><router-link to="/">Inicio</router-link></li>
          <li><router-link to="/menu">Menú</router-link></li>
          <li><router-link to="/about">Sobre Nosotros</router-link></li>
          <li><router-link to="/reservations">Reservar</router-link></li>
          <li><router-link to="/survey">Encuesta</router-link></li>
          <li><router-link to="/orders">Mis Pedidos</router-link></li>
        </ul>

        <div class="user-actions">
          <router-link class="cart-icon" to="/cart" aria-label="Carrito">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </router-link>
          <div v-if="!userStore.isAuthenticated">
            <router-link to="/login" class="login-btn">Entrar</router-link>
          </div>
          <div v-else class="user-menu">
            <span class="user-name">{{ userStore.user?.name || 'Usuario' }}</span>
            <button class="logout-btn" @click="userStore.logout()">Salir</button>
          </div>
        </div>
      </div>
    </nav>

    <main class="content">
      <router-view />
    </main>

    <footer class="footer">
      <div class="container footer-content">
        <div class="footer-section">
          <h4>Contacto</h4>
          <p>Dirección ficticia · Tel: 000-000-000</p>
        </div>
        <div class="footer-section">
          <h4>Enlaces</h4>
          <p><router-link to="/about">Sobre Nosotros</router-link></p>
        </div>
        <div class="footer-section">
          <h4>Síguenos</h4>
          <p>Redes sociales ficticias</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
</script>

<style src="@/styles/pages/mainlayout.css"></style>
