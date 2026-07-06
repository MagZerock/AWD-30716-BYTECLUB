<!-- src/components/Home.vue -->

<template>
  <div class="home-container">
    <section class="hero">
      <div class="container hero-content">
        <h1>SABOR &<br>ELEGANCIA</h1>
        <p>Descubre la verdadera cocina gourmet en el corazón de la ciudad.</p>
        <div class="hero-buttons">
          <router-link to="/reservations" class="hero-link">RESERVAR AHORA</router-link>
          <router-link to="/menu" class="hero-btn-outline">VER LA CARTA</router-link>
        </div>
      </div>
    </section>

    <section class="featured-dishes">
      <div class="container">
        <h2>Platos Destacados</h2>
        <div class="dishes-grid">
          <div class="dish-card">
            <img src="@/assets/img/food1.jpg" alt="Plato 1" class="dish-image">
            <div class="dish-info">
              <h3>Plato Premium</h3>
              <p>Preparación exclusiva del chef</p>
              <span class="price">$28.90</span>
            </div>
          </div>
          <div class="dish-card">
            <img src="@/assets/img/food2.jpg" alt="Plato 2" class="dish-image">
            <div class="dish-info">
              <h3>Especialidad Gourmet</h3>
              <p>Con ingredientes frescos seleccionados</p>
              <span class="price">$32.50</span>
            </div>
          </div>
          <div class="dish-card">
            <img src="@/assets/img/food3.jpg" alt="Plato 3" class="dish-image">
            <div class="dish-info">
              <h3>Creación del Día</h3>
              <p>Chef's special de temporada</p>
              <span class="price">$25.00</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <div class="feature-grid">
          <div class="feature">
            <div class="icon">🎯</div>
            <h3>Calidad Premium</h3>
            <p>Ingredientes frescos y de la mejor calidad</p>
          </div>
          <div class="feature">
            <div class="icon">👨‍🍳</div>
            <h3>Chefs Expertos</h3>
            <p>Preparado con técnicas gourmet</p>
          </div>
          <div class="feature">
            <div class="icon">⚡</div>
            <h3>Servicio Rápido</h3>
            <p>Atención personalizada en cada momento</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta-section">
      <div class="container">
        <h2>¿Listo para una experiencia única?</h2>
        <p>Reserva tu mesa o realiza tu pedido ahora</p>
        <div class="button-group">
          <router-link to="/menu" class="btn btn-primary">Pedir Ahora</router-link>
          <router-link to="/reservations" class="btn btn-secondary">Hacer Reserva</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>

<!-- Import page styles -->
<style scoped src="@/styles/pages/home.css"></style>
