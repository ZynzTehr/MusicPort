# MusicPort

> A comprehensive platform connecting musicians, fans, and educators.

![Project Banner](./assets-readme/gifs/banner.webp)

## Project Background

**MusicPort** is a full-stack web application designed to create a vibrant community for music enthusiasts. It serves as a central hub where users can discover local shows, learn instruments through interactive lessons, purchase equipment, and connect with like-minded individuals.

This project demonstrates advanced full-stack development skills, implementing secure authentication, role-based access control, and dynamic content management.

## The Developer Journey: Evolution of MusicPort

MusicPort represents the culmination of a rigorous, multi-staged learning journey, evolving from a standard curriculum assignment into an advanced, independent full-stack architecture:

1. **Phase 1: The Competency Project**
   - The application began as a basic monolithic competency project designed to prove foundational backend routing and structural database schema understanding.
2. **Phase 2: The Thesis Upgrade**
   - The project was heavily expanded for a graduation thesis. In this phase, true security was achieved by integrating `bcrypt` for password hashing and robust session management. Additionally, dynamic user profile image handling was engineered from scratch.
3. **Phase 3: The Definitive Architecture (Current)**
   - To truly modernize the application visually and structurally, the frontend was completely decoupled from the monolithic server. The entire client was rebuilt utilizing **React** and **Vite** for lightning-fast bundling, heavily typed with **TypeScript** for strict compile-time safety, and wrapped in a custom Glassmorphism CSS design system.

## Key Features

### Advanced Authentication
- **Secure Login**: Implemented using **Passport.js** with **BCrypt** hashing and **JWT** (JSON Web Tokens).
- **Social Login**: Integrated **Google** and **Apple** OAuth strategies for seamless one-click sign-in.
- **Session Management**: Secure persistence of user sessions.

![Authentication Flow](./assets-readme/gifs/auth_flow.webp)

### Admin Dashboard
- **Role-Based Access**: Dedicated Admin role with privileged access.
- **User Management**: View, track, and manage all registered users.
- **Content Control**: Scalable architecture allow admins to manage products, lessons, and venues.

![Admin Dashboard](./assets-readme/gifs/admin_dashboard.webp)

### Community & Discovery
- **Local Shows**: Geolocation-based event discovery to find venues near you.
- **Chatroom**: Real-time communication for community members.
- **Instrument Hub**: Interactive lesson platform for Guitar, Bass, Drums, and Keys.

![Shows and Community](./assets-readme/gifs/shows_community.webp)

### E-Commerce Shop
- **Featured Products**: Dynamic product showcasing based on user preferences.
- **Cart System**: Fully functional shopping cart and checkout flow.
- **Payment Integration**: (Placeholder for Stripe/Payment implementation).

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
- **MongoDB** (Mongoose ODM)
- **Passport.js** (Local, Google, Apple)
- **JWT** Authentication

---

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- Node.js (v16+)
- MongoDB (Running locally)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/musicport.git
    cd musicport
    ```

2.  **Install Dependencies**
    Open two terminals:

    *Terminal 1 (Server):*
    ```bash
    cd server
    npm install
    ```

    *Terminal 2 (Client):*
    ```bash
    cd client
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the `server` directory:
    ```env
    PORT=4000
    MONGODB_URI=mongodb://localhost:27017/musicport
    JWT_SECRET=your_super_secret_key
    GOOGLE_CLIENT_ID=your_google_id
    GOOGLE_CLIENT_SECRET=your_google_secret
    APPLE_CLIENT_ID=your_apple_id
    ```

4.  **Seed the Database**
    Populate the database with initial products, shows, and the **Admin User**.
    ```bash
    # Inside /server directory
    npm run seed
    npm run seed:admin
    ```

5.  **Run the Application**
    *Terminal 1 (Server):*
    ```bash
    npm start
    ```

    *Terminal 2 (Client):*
    ```bash
    npm stop # if running
    npm run dev
    ```

---

## Admin Access

To access the new Admin Dashboard:
1.  Navigate to `/api/users/login` (via the frontend Login modal).
2.  Log in with the Super Admin credentials:
    - **Email**: `admin@musicport.com`
    - **Password**: `admin123`
3.  You will be redirected to the Admin Dashboard.

---

## Design Philosophy

"Less is more." The design combines symmetry and modern glassmorphism effects to create a premium, immersive user experience. The color palette is curated to be visually striking yet comfortable for extended use.

---

*Developed by Jorge Bucio - Full Stack Developer 2026*