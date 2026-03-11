# MusicPort

> An enterprise-grade music discovery and educational platform engineered for the modern web.

![Project Banner](./assets-readme/gifs/banner.webp)

## Project Overview

**MusicPort** is a cutting-edge full-stack web application architected to cultivate a vibrant, interactive community for music enthusiasts. It operates as a centralized nexus where users can seamlessly discover localized live performances, master instrumentation through dynamic curriculum modules, acquire professional gear via the integrated storefront, and network with driven creatives.

This platform serves as a definitive showcase of advanced full-stack engineering paradigms, implementing rigorous security perimeters, deterministic role-based access controls, and highly scalable data architectures.

## The Developer Journey: Evolution of MusicPort

MusicPort represents the culmination of a rigorous, multi-staged engineering journey, evolving from a standard monolithic curriculum assignment into a definitively modern, decoupled full-stack architecture:

1. **Phase 1: The Monolithic Foundation**
   - The platform originated as a foundational competency project, engineered to prove mastery over Express.js routing infrastructure. The original project utilized MongoDB and Mongoose for its database architecture.
2. **Phase 2: The Security Hardening**
   - The architecture was subsequently expanded to meet graduation-thesis level requirements. True cryptographic security was achieved by integrating hardware-intensive `bcrypt` hashing algorithms and strictly managed stateless session mapping. Intricate file-system buffering for dynamic user profile avatars was also engineered entirely from scratch.
3. **Phase 3: The Definitive Decoupled Architecture**
   - To truly modernize the application visually and structurally, the presentation layer was brutally decoupled from the monolithic backend server. The entire client interface was fundamentally rebuilt utilizing **React** and **Vite** for lightning-fast Hot Module Replacement (HMR) bundling, strictly typed with **TypeScript** for absolute compile-time safety, and wrapped entirely in a custom, responsive Glassmorphism design system.
4. **Phase 4: Optimization, Documentation & Hardening (Current)**
   - The platform recently underwent a massive architectural audit. Every single functional React component, global Context provider, and backend Express API controller was meticulously documented with senior-level educational and structural annotations. Furthermore, strict impenetrable Regex validation (`Min 8 chars, 1 uppercase, 1 lowercase, 1 numeric, 1 special character`) was universally synchronized across both the frontend UI boundary and the backend data access layer to ensure absolute password security.

## Key Features

## Core Infrastructure & Features

### Identity & Access Management
- **Cryptographic Authentication**: Zero-trust login perimeters implemented via **Passport.js**, leveraging salting, **BCrypt** hashing, and impenetrable **JWT** (JSON Web Tokens) handshakes.
- **SSO Federation**: Integrated **Google** and **Apple** OAuth 2.0 strategies bridging seamless, one-click social authentication pipelines.
- **Stateless Persistence**: Secure, decentralized persistence of authorized boundary sessions.

![Authentication Flow](./assets-readme/gifs/auth_flow.webp)

### Command Center (Admin Portal)
- **Role-Based Access Control (RBAC)**: Dedicated, heavily protected Admin routing boundaries guarding privileged execution pathways.
- **Fleet Management**: Aggregate observability over the entire registered user-base.
- **Relational Operations**: Highly scalable, dynamic CRUD architecture allowing root-administrators to seamlessly manage product inventories, curriculum modules, and global venue charting.

![Admin Dashboard](./assets-readme/gifs/admin_dashboard.webp)

### Community & Global Discovery
- **Geofenced Tour Routing**: Raw mathematical geolocation processing (Haversine formula) exposing localized live-music events directly to the user's viewport.
- **Real-Time Forum**: High-velocity message boards enabling rich community networking.
- **Curriculum HUD**: Interactive, filterable educational platform branching Guitar, Bass, Drums, and Keys disciplines.

![Shows and Community](./assets-readme/gifs/shows_community.webp)

### Digital Storefront E-Commerce
- **Dynamic Merchandising**: Algorithmically filtered product showcases highlighted seamlessly on the storefront.
- **Complex Transacting**: Intricate cart tracking workflows finalizing nested checkout payloads dynamically joined in the database.

![Shop Demo](./assets-readme/gifs/shop_demo.webp)

---

## Technology Stack

**Frontend:**
- **React** (Vite)
- **TypeScript**
- **Bootstrap / React-Bootstrap**
- **CSS3** (Custom Glassmorphism Design)

**Backend:**
- **Node.js** & **Express**
- **PostgreSQL** (Prisma ORM)
- **Passport.js** (Local, Google, Apple)
- **JWT** Authentication

---

---

## Bootstrapping Guide

Execute the following directives to mount the local development environment seamlessly.

### Prerequisites Ecosystem
Ensure your machine is equipped with the following dependencies:
- **Node.js** (v16.0.0 or higher)
- **PostgreSQL** (Active local daemon)

### Deployment Architecture

1.  **Clone the Source Repository**
    ```bash
    git clone https://github.com/ZynzTehr/musicport.git
    cd musicport
    ```

2.  **Hydrate Dependencies**
    You must independently hydrate the Node modules for both the decoupled client and backend servers. Open two discrete terminal sessions:

    *Terminal 1 (Backend Data Layer):*
    ```bash
    cd server
    npm install
    ```

    *Terminal 2 (Frontend Presentation Layer):*
    ```bash
    cd client
    npm install
    ```

3.  **Environment Variable Injection**
    Establish a secure `.env` file cleanly inside the `server` root directory:
    ```env
    PORT=5000
    DATABASE_URL=postgresql://user:password@localhost:5432/musicport
    JWT_SECRET=your_super_secret_key
    GOOGLE_CLIENT_ID=your_google_id
    GOOGLE_CLIENT_SECRET=your_google_secret
    APPLE_CLIENT_ID=your_apple_id
    ```

4.  **Database Seeding Protocol**
    Programmatically flood the database with initialization variants (Products, Venues) alongside the Master **Admin Account**:
    ```bash
    # Execute within the /server directory layout
    npm run seed
    ```

5.  **Ignition Instructions**
    Launch the dual-server architecture:

    *Terminal 1 (Backend Initialization):*
    ```bash
    npm run dev
    ```

    *Terminal 2 (Frontend Initialization):*
    ```bash
    npm run dev
    ```

---

## Privileged Admin Portal Architecture

The Command Center provides superuser access to manage the platform's user fleet and digital content. Both the presentation layer and backend APIs are heavily guarded by specialized middleware and routing boundaries.

### 1. Database Seeded Credentials
A deterministic seed script generates the default root Super Admin user required to breach the perimeter. Walk through the frontend UI Login modal using exactly:
- **Email**: `admin@musicport.com`
- **Password**: `Admin@123!`
- **Role**: `isAdmin: true`

*(To forcibly reset or recreate this root user manually, execute `npm run seed:admin` or `npx ts-node seed/admin.ts` inside the `/server` directory).*

### 2. Backend Security Implementation

#### Middleware: `adminAuth` (`server/middleware/adminAuth.ts`)
- **Pipeline Strategy**: Must be chained sequentially *after* the standard `auth` middleware (e.g., `router.get( '/users', auth, adminAuth, getAllUsers)`).
- **Function**: Cryptographically resolves the JWT payload and verifies `req.user.isAdmin === true`. Violations instantly terminate with `403 Forbidden`.

#### Core Model Expansions
The Prisma/PostgreSQL `User` schema natively bounds:
- `isAdmin`: Boolean truth flag (defaults safely to `false`).
- `password`, `googleId`, `appleId`: Flexibly mapped to handle both standard BCrypt and OAuth.

### 3. Frontend Integration Security

1. **Routing Wrapper (`ProtectedAdminRoute.tsx`)**:
   Automatically intercepts unauthorized DOM tree mounting requests. Standard user JWTs are firmly rejected, causing an instantaneous redirect to the safe `/home` route.
2. **Interceptor Authorization**:
   A global Axios interceptor dynamically injects the active `sessionStorage` token into the `Authorization` header for all protected outbound dispatches (`/api/users`, `/api/products` etc).
3. **UI Aggregation (`AdminDashboard.tsx`)**:
   Provides full CRUD manipulation across User arrays, live Show routing arrays, and the E-commerce merchandise control vectors.

---

## Design & UX Strategy

"Simplicity scales." The overarching design language strategically blends absolute symmetry with premium Glassmorphism refractions to compose an engaging, immersive user journey. The HSL color palette vectors have been strictly tailored and curated specifically to stand out as robust and aggressively modern while remaining entirely comfortable and accessible for deeply extended viewing sessions.

---

*Engineered by Jorge Bucio — Enterprise Full Stack Developer 2026*