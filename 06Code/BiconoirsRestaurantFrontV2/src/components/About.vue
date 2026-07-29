<template>
  <div class="about-container">
    <div class="container">
      <h1>Sobre Nosotros</h1>

      <section class="about-section">
        <h2>Biconoir Gourmet</h2>
        <p>
          Somos un restaurante de primer nivel en Quito, Ecuador, dedicado a ofrecer una experiencia
          culinaria excepcional. Con más de 15 años de trayectoria, nos hemos
          posicionado como uno de los mejores establecimientos gastronómicos del país.
        </p>
      </section>

      <section class="about-section">
        <h2>Nuestra Misión</h2>
        <p>
          Proporcionar a nuestros clientes una experiencia gastronómica memorable,
          combinando ingredientes premium con técnicas culinarias innovadoras y
          un servicio excepcional.
        </p>
      </section>

      <section class="about-section">
        <h2>Nuestros Valores</h2>
        <ul class="values-list">
          <li>🎯 Excelencia en cada plato</li>
          <li>🌟 Dedicación al cliente</li>
          <li>🌱 Ingredientes frescos y de calidad</li>
          <li>👥 Equipo profesional apasionado</li>
          <li>💡 Innovación constante</li>
        </ul>
      </section>

      <section class="about-section">
        <h2>Contacto</h2>
        <div class="contact-info">
          <p><strong>Teléfono:</strong> +593 988344885</p>
          <p><strong>Email:</strong> info@bicoinoirgourmet.com</p>
          <p><strong>Dirección:</strong> Av. República de El Salvador N34-102, Quito, Ecuador</p>
          <p><strong>Horario:</strong> Lunes a Domingo, 12:00 PM - 11:00 PM</p>
        </div>
      </section>

      <section class="about-section">
        <h2>Cómo llegar</h2>
        <div class="map-container">
          <iframe
            :src="mapEmbedUrl"
            width="100%"
            height="100%"
            style="border:0"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <a :href="directionsUrl" target="_blank" rel="noopener" class="directions-link">
          📍 Cómo llegar en Google Maps
        </a>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const RESTAURANT_ADDRESS = 'Av. República de El Salvador N34-102, Quito, Ecuador'
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const mapEmbedUrl = computed(() => {
    const query = encodeURIComponent(RESTAURANT_ADDRESS)
    return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${query}`
  })

  const directionsUrl = computed(() => {
    const query = encodeURIComponent(RESTAURANT_ADDRESS)
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`
  })
</script>

<style scoped src="@/styles/pages/about.css"></style>
