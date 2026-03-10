# Admin Role Documentation

This document outlines the implementation and usage of the Admin role in the MusicPort application.

## 1. Overview
The Admin role provides privileged access to manage the platform's users and content. This backend implementation secures these privileges using a dedicated middleware (`adminAuth`) and specific routing.

## 2. Admin Credentials
A seed script has been created to generate a default Super Admin user.

- **Email**: `admin@musicport.com`
- **Password**: `admin123`
- **Role**: `isAdmin: true`

To reset or create this user, run:
```bash
npm run seed:admin
# OR directly via ts-node
npx ts-node seed/admin.ts
```

## 3. Backend Implementation

### Middleware: `adminAuth`
Located at `server/middleware/adminAuth.ts`.
- **Usage**: Must be placed *after* the standard `auth` middleware.
- **Function**: dataChecks if `req.user.isAdmin` is true. If not, returns `403 Forbidden`.

```typescript
router.get('/users', auth, adminAuth, getAllUsers);
```

### User Model Updates
The `User` model now includes:
- `isAdmin`: Boolean (default `false`).
- `password`: Optional (to support OAuth-only users).
- `googleId` / `appleId`: For OAuth support.

### New Endpoints
- **GET /api/users**: Retrieves a paginated list of all users.
  - **Auth Required**: Yes (`Bearer TOKEN`) + Admin Privileges.
  - **Query Params**: `?page=1&limit=20`

## 4. Frontend Integration Guide (Next Steps)

To implement the frontend Admin Dashboard, follow this structure:

1.  **Admin Route Wrapper**:
    Create a `ProtectedAdminRoute` component that checks `user.isAdmin`. If false, redirect to home.

2.  **API Requests**:
    Ensure the `token` from localStorage is included in the `Authorization` header for all requests to `/api/users` and other admin routes.

3.  **UI Components**:
    - **Sidebar**: For navigation between "Dashboard", "Users", "Products".
    - **User Table**: Display user data from `GET /api/users`.

## 5. Security Note
- The `adminAuth` middleware relies on `req.user` being populated by the `auth` middleware. Always chain them: `[auth, adminAuth]`.
- Ensure the `JWT_SECRET` is secure in production.
