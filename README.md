# SPOTIFORK

> **Cliente no oficial de Spotify: El catálogo infinito de música y podcast en una sola app.**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.2.0-green.svg)]()
[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)]()
[![Vite](https://img.shields.io/badge/Vite-5.0-purple?logo=vite)]()

---

## 📖 Descripción Detallada

**SPOTIFORK** es un cliente no oficial de Spotify diseñado para ofrecer una experiencia de usuario única y mejorada. Esta aplicación permite acceder al vasto catálogo de música y podcasts de Spotify a través de una interfaz moderna, intuitiva y altamente personalizable.

Nuestro objetivo es proporcionar una alternativa que combine la potencia del catálogo de Spotify con características adicionales que mejoran la descubrimiento musical, la gestión de playlists y la interacción social, todo manteniendo un rendimiento óptimo y una experiencia de usuario fluida.

### ¿Por qué SPOTIFORK?

- **Interfaz Moderna**: Diseño limpio y actualizado que prioriza la usabilidad
- **Rendimiento Optimizado**: Carga rápida y navegación fluida
- **Características Exclusivas**: Funcionalidades que van más allá del cliente oficial
- **Código Abierto**: Transparente y community-driven
- **Multiplataforma**: Accesible desde cualquier dispositivo con navegador web

---

## ✨ Características y Funciones Principales

### 🎵 Reproducción de Música
- **Streaming de Alta Calidad**: Acceso a todo el catálogo de Spotify con calidad de audio optimizada
- **Controles Avanzados**: Play, pause, skip, repeat, shuffle y control de volumen
- **Cola de Reproducción**: Gestión inteligente de la cola con reordenamiento drag-and-drop
- **Historial de Reproducción**: Accede a tu historial completo de canciones escuchadas

### 🔍 Búsqueda y Descubrimiento
- **Búsqueda Universal**: Encuentra canciones, álbumes, artistas y playlists en un solo lugar
- **Filtros Avanzados**: Filtra por género, año, popularidad, duración y más
- **Exploración por Categorías**: Navega por géneros musicales organizados visualmente
- **Resultados en Tiempo Real**: Búsqueda instantánea mientras escribes

### 📚 Gestión de Bibliotecas
- **Playlists Personalizadas**: Crea, edita y organiza tus playlists ilimitadas
- **Biblioteca Organizada**: Pestañas separadas para Playlists, Artistas y Álbumes
- **Estado Vacío Inteligente**: Mensajes claros cuando no hay contenido

### ⚙️ Ajustes y Personalización
- **Modo Oscuro/Claro**: Cambia entre temas según tu preferencia
- **Calidad de Audio**: Selecciona entre baja (96 kbps), normal (160 kbps) o alta (320 kbps)
- **Control de Volumen**: Ajusta el volumen por defecto con slider interactivo
- **Reproducción Automática**: Activa/desactiva la reproducción automática de siguiente canción

### 🎨 Interfaz Intuitiva
- **Navegación Lateral**: Menú fijo con acceso rápido a todas las secciones
- **Player Bar Persistente**: Controles de reproducción siempre visibles
- **Tarjetas Interactivas**: Hover effects y animaciones suaves
- **Ecualizador Animado**: Indicador visual de reproducción activa
- **Diseño Responsivo**: Se adapta a diferentes tamaños de pantalla

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18.2 + TypeScript
- **Build Tool**: Vite 5.0
- **Estilos**: CSS3 con Variables CSS
- **Iconos**: Emojis nativos
- **Animaciones**: CSS Keyframes

---

## 📦 Guía de Instalación y Uso

### Prerrequisitos
- Node.js 18+ instalado
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/fazeurru/spotifork.git
cd spotifork

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build para Producción

```bash
# Compilar para producción
npm run build

# Vista previa del build
npm run preview
```

---

## 🏗️ Estructura del Proyecto

```
spotifork/
├── src/
│   ├── App.tsx          # Componente principal con toda la lógica
│   ├── App.css          # Estilos completos de la aplicación
│   ├── main.tsx         # Punto de entrada
│   └── assets/          # Recursos estáticos
├── public/              # Archivos públicos
├── index.html           # HTML base
├── package.json         # Dependencias y scripts
├── tsconfig.json        # Configuración TypeScript
├── vite.config.ts       # Configuración Vite
├── README.md            # Documentación
└── LICENSE              # Licencia MIT
```

---

## 🚀 Roadmap

### ✅ Completado (v1.2.0)
- [x] Interfaz de usuario moderna e intuitiva
- [x] Navegación por pestañas (Inicio, Buscar, Biblioteca, Ajustes)
- [x] Modo oscuro/claro
- [x] Reproductor de música funcional
- [x] Búsqueda en tiempo real
- [x] Sistema de categorías
- [x] Controles de volumen
- [x] Ecualizador animado
- [x] Diseño responsivo
- [x] Animaciones y transiciones suaves
- [x] Función de reseteo de aplicación
- [x] Limpieza de localStorage
- [x] Confirmación de acciones críticas

### 🔄 En Desarrollo
- [ ] Integración con API de Spotify
- [ ] Autenticación de usuarios
- [ ] Guardado de preferencias en localStorage
- [ ] Soporte para podcasts

### 📋 Planeado
- [ ] Playlists colaborativas
- [ ] Modo offline
- [ ] Letras de canciones
- [ ] Compartir en redes sociales
- [ ] Notificaciones push

### 🔮 Futuro
- [ ] Aplicación móvil (React Native)
- [ ] Extensión de navegador
- [ ] Integración con otros servicios de streaming
- [ ] Modo fiesta multiusuario

---

## 📝 Changelog

### v1.2.0 (Actual) - 2024
**Nuevas Características**
- 🔄 Función de reseteo de aplicación completa
- 🗑️ Limpieza de localStorage (favoritos, historial, ajustes)
- ⚠️ Confirmación de acciones críticas con diálogo
- 🎯 Botón "Resetear Aplicación" en Ajustes > Cuenta

**Mejoras de Interfaz**
- ✨ Interfaz aún más intuitiva y pulida
- 🎨 Sistema de temas (oscuro/claro) completamente funcional
- 🎯 Navegación mejorada con 4 secciones principales
- 🎵 Player bar persistente con controles completos
- ⚡ Animaciones optimizadas y transiciones suaves

**Características Existentes**
- 🔍 Búsqueda en tiempo real con filtrado instantáneo
- 📂 Exploración por categorías musicales
- ⚙️ Panel de ajustes completo con múltiples opciones
- 🎚️ Control de volumen independiente
- 🎼 Ecualizador animado para tracks en reproducción

**Mejoras Técnicas**
- 📱 Diseño completamente responsivo
- ♿ Mejor accesibilidad
- 🚀 Rendimiento optimizado
- 🧹 Código refactorizado y limpio

### v1.1.0 - Actualización de Interfaz
- ✨ Nueva interfaz más intuitiva y moderna
- 🎨 Sistema de temas (oscuro/claro) completamente funcional
- 🎯 Navegación mejorada con 4 secciones principales
- 🎵 Player bar persistente con controles completos
- ⚡ Animaciones optimizadas y transiciones suaves
- 🔍 Búsqueda en tiempo real con filtrado instantáneo
- 📂 Exploración por categorías musicales

### v1.0.0 - Lanzamiento Inicial
- Primera versión funcional
- Interfaz básica de reproducción
- Navegación simple

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Sigue estos pasos:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guidelines para Contribuir
- Sigue el estilo de código existente
- Añade comentarios cuando sea necesario
- Actualiza la documentación si es relevante
- Asegúrate de que tu código no tenga errores de TypeScript

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Contacto y Soporte

- **GitHub**: [@fazeurru](https://github.com/fazeurru)
- **Repositorio**: [github.com/fazeurru/spotifork](https://github.com/fazeurru/spotifork)
- **Issues**: [Reportar bugs o sugerencias](https://github.com/fazeurru/spotifork/issues)

---

## 🙏 Agradecimientos

- A la comunidad de React y TypeScript
- A todos los contribuidores del proyecto
- A los usuarios que reportan bugs y sugieren mejoras

---

<div align="center">

**Hecho con ❤️ usando React + TypeScript + Vite**

⭐ ¡Si te gusta este proyecto, dale una estrella en GitHub!

</div>
