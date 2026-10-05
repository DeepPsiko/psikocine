# 🎬 PSIKOS CINE — Plataforma Oficial del Sábado de Películas

Bienvenido al repositorio oficial de **Psikos Cine**, la plataforma web moderna, cinematográfica y privada diseñada exclusivamente para el grupo **Psikos**. Su objetivo es gestionar nuestro catálogo de películas, calificar, comentar y organizar democráticamente el **Sábado de Películas** mediante un sistema de votación en tiempo real.

---

## 🚀 Características Principales

- **🎬 Hero del Sábado**: Cuenta regresiva interactiva, estado de la votación, candidatas activas y proclamación cinematográfica del ganador.
- **🗳️ Sistema de Votación Democrático**: Cada miembro de Psikos puede proponer candidatas y emitir o cambiar su voto en tiempo real antes de la fecha límite.
- **📚 Catálogo Completo**: Grid responsivo (hasta 6 columnas en desktop, 2 en móvil) con buscador instantáneo por título, director, actor o género, filtros por año, calificación mínima y múltiples criterios de ordenamiento.
- **⭐ Calificaciones**: Puntuación de 1 a 5 estrellas con desglose gráfico de porcentajes y distribución por estrellas.
- **💬 Opiniones y Debates**: Comentarios con menciones de calificación, botón de likes, respuestas anidadas y **protección de spoilers (⚠️ SPOILER con botón para revelar)**.
- **📌 Watchlist & Favoritos**: Guarda las películas que quieres ver, márcalas como vistas (👁️) o añádelas a tu lista de favoritas (❤️).
- **🏆 Rankings**: Tablas de honor con las películas mejor calificadas por Psikos, las más votadas, más debatidas y ranking de los cinéfilos más activos de la comunidad.
- **🔔 Notificaciones**: Campana interactiva con insignias en tiempo real para alertar sobre nuevas candidatas, likes recibidos y películas ganadoras.
- **🛡️ Panel de Administración (`/admin`)**: Gestión completa de películas (crear, editar, eliminar), moderación de opiniones, control de usuarios (cambio de rol y bloqueo) y creación/cierre de votaciones.
- **🎨 Diseño Cinematográfico Dark Mode**: Estética moderna con contrastes oscuros, acentos en oro cine (`#eab308`), rojo fílmico (`#e11d48`), efectos glassmorphism y transiciones suaves (`hover:scale(1.02)`).

---

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript (Modo estricto, sin `any`)
- **Estilos**: TailwindCSS con paleta personalizada
- **Iconografía**: Lucide React
- **Base de Datos & ORM**: PostgreSQL & SQLite con Prisma ORM
- **Autenticación**: Sesiones seguras mediante tokens JWT en cookies HTTP-only (`jose` + `bcryptjs`)
- **Validación de Datos**: Zod
- **Formularios**: React Hook Form

---

## 📋 Requisitos Previos

- **Node.js**: v18.17.0 o superior (Recomendado v20+ o v22+)
- **npm**: v9+ (incluido con Node.js)
- **Base de datos**:
  - Para **desarrollo local inmediato con cero configuración**: Viene listo con SQLite (`dev.db`).
  - Para **producción o servidor PostgreSQL**: Una instancia de PostgreSQL (local, Docker, Supabase o Neon).

---

## 📦 Instalación y Puesta en Marcha

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone <url-del-repositorio>
cd psikocine
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo de ejemplo:
```bash
cp .env.example .env
```
El archivo `.env` por defecto viene configurado para desarrollo local:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="psikos_super_secret_session_jwt_key_2026_xyz"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Generar el Cliente de Prisma
```bash
npx prisma generate
```

### 4. Sincronizar la Base de Datos
- **Para SQLite (Local listo para usar)**:
  ```bash
  npm run db:push
  ```
- **Para PostgreSQL**:
  Reemplaza en `prisma/schema.prisma` `provider = "sqlite"` por `provider = "postgresql"` (o copia `prisma/schema.postgresql.prisma`), ajusta tu `DATABASE_URL` en `.env` y corre:
  ```bash
  npx prisma migrate dev --name init
  ```

### 5. Cargar Datos de Ejemplo (Seed)
El script crea 12 películas con portadas oficiales, trailers y sinopsis, usuarios de prueba, opiniones con y sin spoilers, calificaciones, favoritos y un evento activo de Sábado de Películas con votación:
```bash
npm run seed
```

### 6. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 👥 Credenciales de Prueba

Todas las cuentas de prueba tienen la contraseña: `password123`

| Rol | Usuario | Correo | Función |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `admin@psikos.cine` | Acceso a `/admin`, crear/editar películas, moderar |
| **Miembro** | `usuario1` | `usuario1@psikos.cine` | Calificar, votar, comentar, favoritos, watchlist |
| **Miembro** | `usuario2` | `usuario2@psikos.cine` | Fan del terror de los 80s y thrillers psicológicos |
| **Miembro** | `mateo_cult` | `mateo@psikos.cine` | Cinéfilo clásico y defensor del celuloide |

> *Nota: En la pantalla de login (`/login`) encontrarás botones de acceso directo de 1-Click con estas credenciales.*

---

## 🗄️ Configuración para PostgreSQL en Producción

Si deseas conectar la plataforma a una base de datos PostgreSQL alojada en la nube (ej. **Supabase**, **Neon**, **Render** o local):

1. Abre `.env` y configura tu cadena de conexión PostgreSQL:
   ```env
   DATABASE_URL="postgresql://usuario:password@host:5432/psikocine?schema=public&sslmode=require"
   ```
2. Reemplaza el contenido de `prisma/schema.prisma` con `prisma/schema.postgresql.prisma` (donde `provider = "postgresql"`).
3. Ejecuta la migración y regenera el cliente:
   ```bash
   npx prisma migrate dev --name init_postgres
   npx prisma generate
   npm run seed
   ```

---

## 🏗️ Construcción para Producción

Para compilar la aplicación optimizada para producción:

```bash
npm run build
npm run start
```

---

## 📁 Estructura del Proyecto

```text
psikocine/
├── prisma/
│   ├── schema.prisma            # Esquema Prisma (SQLite dev / Postgres prod)
│   ├── schema.postgresql.prisma # Esquema preparado para PostgreSQL
│   └── seed.ts                  # Seed con 12 películas, usuarios y eventos
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # Endpoints REST (auth, movies, reviews, saturday, etc.)
│   │   ├── movies/              # Catálogo con buscador, filtros y ficha cinematográfica
│   │   ├── saturday/            # Votación del sábado y cronología histórica (/history)
│   │   ├── rankings/            # Rankings de películas y comunidad
│   │   ├── watchlist/           # Gestión de películas pendientes y vistas
│   │   ├── users/               # Perfiles de los miembros de Psikos
│   │   ├── profile/             # Edición de perfil del usuario
│   │   ├── admin/               # Panel de control administrativo y nuevo film
│   │   ├── login/ & register/   # Autenticación de usuarios
│   │   ├── layout.tsx           # Layout con Navbar, Footer y ToastProvider
│   │   └── page.tsx             # Dashboard principal con 7 secciones temáticas
│   ├── components/              # Componentes reutilizables (Cards, Hero, Countdown, etc.)
│   ├── lib/                     # Autenticación JWT, Prisma singleton y validaciones Zod
│   └── types/                   # Tipos e interfaces TypeScript estrictas
├── tailwind.config.ts           # Configuración de estilos y paleta Psikos
└── tsconfig.json                # Configuración TypeScript estricta
```

---

## 🍿 ¡Que comience la función!

Hecho para el grupo **Psikos**.
Cualquier duda o sugerencia de película, ¡vótala en el próximo **Sábado de Películas**!
