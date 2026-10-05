# 🍿 PSIKOS CLUB — Plataforma Oficial del Sábado de Películas

Bienvenido al repositorio oficial de **Psikos Club**, la plataforma web moderna, cinematográfica y privada diseñada exclusivamente para los **Psikos**. Su objetivo es gestionar nuestro catálogo de películas, calificar, opinar y organizar democráticamente el **Sábado de Películas** mediante un sistema de votación en tiempo real.

---

## 🚀 Características Principales

- **🎬 Hero del Sábado**: Cuenta regresiva interactiva, estado de la votación, candidatas activas y proclamación cinematográfica de la película ganadora.
- **🗳️ Sistema de Votación Democrático**: Cada miembro de Psikos puede postular candidatas y emitir o cambiar su voto en tiempo real antes de la fecha límite.
- **📚 Catálogo Completo**: Grid responsivo con buscador instantáneo por título, director, actor o género, filtros de calificación mínima y múltiples criterios de ordenación.
- **➕ Gestión de Películas**: Los miembros pueden registrar nuevas películas cargando pósters e imágenes de fondo directamente desde sus archivos locales (con herramienta interactiva de recorte/encuadre) o mediante enlace web.
- **⭐ Calificaciones**: Puntuación de 1 a 5 estrellas con desglose interactivo de porcentajes y distribución por estrellas.
- **💬 Opiniones y Debates**: Comentarios detallados con calificación, botón de likes, respuestas en hilo y **protección de spoilers (⚠️ SPOILER con botón para revelar)**.
- **📌 Watchlist & Favoritos**: Guarda las películas que tienes pendientes, márcalas como vistas (👁️) o añádelas a tu lista de favoritas (❤️).
- **🏆 Rankings**: Tablas de honor con las películas mejor calificadas por Psikos, las más votadas, más debatidas y el ranking de miembros más activos.
- **🔔 Notificaciones**: Campana interactiva con insignias en tiempo real para avisar sobre nuevas películas propuestas, votos, opiniones y películas ganadoras.
- **🛡️ Sistema de Roles (`USER` y `ADMIN`)**:
  - **Usuario (`USER`)**: Acceso total a explorar el catálogo, proponer y agregar películas, emitir votos en las sesiones de sábado, calificar, escribir reseñas y personalizar su perfil.
  - **Administrador (`ADMIN`)**: Acceso a todo lo anterior más el **Panel de Control (`/admin`)** para gestión y edición de películas, control de miembros y asignación/revocación de roles de administrador.
- **👤 Perfiles y Carga de Fotos**: Registro simple con Nickname, @usuario y contraseña (sin necesidad de correo electrónico). Inicial generada automáticamente con gradiente elegante o carga de foto de perfil desde archivos locales con recorte circular interactivo.
- **🎨 Diseño Cinematográfico Dark Mode**: Interfaz en tonos oscuros con acentos en color Índigo (`indigo-500`/`indigo-600`), efectos glassmorphism y transiciones cuidadas.

---

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript (Modo estricto)
- **Estilos**: TailwindCSS con paleta personalizada e integración de temas oscuros
- **Iconografía**: Lucide React
- **Base de Datos & ORM**: PostgreSQL (ej. Neon, Supabase, Railway) con Prisma ORM
- **Autenticación**: Sesiones seguras mediante tokens JWT en cookies HTTP-only (`jose` + `bcryptjs`)
- **Validación de Datos**: Zod
- **Formularios**: React Hook Form

---

## 📋 Requisitos Previos

- **Node.js**: v18.17.0 o superior (Recomendado v20+)
- **npm**: v9+ (incluido con Node.js)
- **Base de Datos PostgreSQL**: Cadena de conexión de una base de datos PostgreSQL en la nube (como [Neon](https://neon.tech/), [Supabase](https://supabase.com/)) o local.

---

## 📦 Instalación y Puesta en Marcha

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone <url-del-repositorio>
cd psikocine
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo de ejemplo o crea tu `.env`:
```bash
cp .env.example .env
```
Configura tus variables en `.env`:
```env
# Conexión a PostgreSQL (ejemplo con Neon)
DATABASE_URL="postgresql://usuario:password@ep-sample.aws.neon.tech/neondb?sslmode=require"

# Secreto para sesiones JWT
AUTH_SECRET="tu_clave_secreta_jwt_para_sesiones_2026"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Generar el Cliente de Prisma y Sincronizar Esquema
```bash
npm run db:generate
npm run db:push
```

### 4. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 🏗️ Construcción y Despliegue

Para compilar la aplicación para producción:

```bash
npm run build
npm run start
```

### Variables requeridas en despliegues (Vercel, Render, Railway, etc.):
- `DATABASE_URL`: Cadena de conexión a PostgreSQL.
- `AUTH_SECRET`: Cadena aleatoria segura para firmar los tokens JWT de sesión.
- `NEXTAUTH_URL`: URL canónica del despliegue (ej. `https://psikocine.vercel.app`).

---

## 📁 Estructura del Proyecto

```text
psikocine/
├── prisma/
│   └── schema.prisma            # Esquema Prisma conectado a PostgreSQL
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # Endpoints REST (auth, movies, reviews, saturday, users, etc.)
│   │   ├── movies/              # Catálogo de películas, filtros y formulario para agregar films
│   │   ├── saturday/            # Votación del sábado de películas y archivo histórico
│   │   ├── rankings/            # Tablas de clasificación de películas y miembros
│   │   ├── watchlist/           # Películas pendientes y marcadas como vistas
│   │   ├── users/               # Directorio y perfiles de los miembros de Psikos
│   │   ├── profile/             # Edición de perfil, bio y carga de foto con recorte circular
│   │   ├── admin/               # Panel de control (gestión de catálogo, miembros y roles)
│   │   ├── login/ & register/   # Autenticación sin correo (Nickname, @usuario y contraseña)
│   │   ├── layout.tsx           # Layout principal (Navbar, Footer, Providers)
│   │   └── page.tsx             # Dashboard principal del club
│   ├── components/              # Componentes UI (Navbar, Footer, Modales de recorte, Cards, etc.)
│   ├── lib/                     # Utilidades (auth JWT, cliente Prisma singleton, validaciones Zod)
│   └── types/                   # Tipos e interfaces TypeScript del sistema
├── tailwind.config.ts           # Configuración de estilos y tema Índigo
└── tsconfig.json                # Configuración TypeScript
```

---

## 🍿 ¡Que comience la función!

Diseñado con ❤️ para los **Psikos**.  
© 2026 Psikos Club. Todos los derechos reservados.
