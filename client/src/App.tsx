// Import necessary React tools, and routing utilities..
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import top-level Pages..
import HomePage from './pages/HomePage';
import ShowsPage from './pages/ShowsPage';
import ShopPage from './pages/ShopPage';
import ChatPage from './pages/ChatPage';
import LessonsPage from './pages/LessonsPage';
import LandingPage from './pages/LandingPage';
import InstrumentHub from './pages/InstrumentHub';
import LessonPage from './pages/LessonPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Import Error Page..
import ErrorPage from './pages/ErrorPage';

// Import shared layout components..
// Import shared layout components..
import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

// Import Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminShowsPage from './pages/AdminShowsPage';
import AdminLessonsPage from './pages/AdminLessonsPage';
import AdminChatPage from './pages/AdminChatPage';



/**
 * App Component
 * 
 * Architectural Pattern: Global Routing Engine.
 * 
 * Purpose: Acts as the absolute traffic switchboard for the entire Single Page Application (SPA).
 * It leverages React Router v6 to map browser URLs to specific React Virtual DOM components.
 * 
 * Key Routing Concepts Utilized here:
 * 1. Layout Routes: Components like `<MainLayout>` and `<ProtectedAdminRoute>` are used as wrapper elements
 *    (via the `element` prop) around nested children routes. This avoids duplicating standard UI 
 *    elements (like Navbars and Footers) across every single page component.
 * 2. Protected Routes: The `/admin` paths are hidden behind a specialized guardian component 
 *    that instantly verifies authentication before attempting to render any nested admin dashboards.
 */
const App: React.FC = () =>
{
  return (
    <Router>
      <Routes>
        <Route element={ <MainLayout /> }>
          {/* Route: Home Page */ }
          <Route path="/home" element={ <HomePage /> } />
          <Route path="/" element={ <LandingPage /> } />

          {/* Corporate Pages */}
          <Route path="/about" element={ <AboutPage /> } />
          <Route path="/contact" element={ <ContactPage /> } />

          {/* Route: Shows Page */ }
          <Route path="/venues" element={ <ShowsPage /> } />

          {/* Route: Lessons Page */ }
          <Route path="/lessons" element={ <LessonsPage /> } />
          <Route path="/lessons/:instrument" element={ <InstrumentHub /> } />
          <Route path="/lessons/:instrument/:lessonId" element={ <LessonPage /> } />

          {/* Route: Chat Page */ }
          <Route path="/chat" element={ <ChatPage /> } />

          {/* Route: Shop Page */ }
          <Route path="/shop" element={ <ShopPage /> } />
        </Route>

        {/* Admin Routes */ }
        <Route element={ <ProtectedAdminRoute /> }>
          <Route path="/admin" element={ <AdminLayout /> }>
            <Route index element={ <Navigate to="/admin/dashboard" replace /> } />
            <Route path="dashboard" element={ <AdminDashboard /> } />
            <Route path="users" element={ <AdminUsersPage /> } />
            <Route path="products" element={ <AdminProductsPage /> } />
            <Route path="shows" element={ <AdminShowsPage /> } />
            <Route path="lessons" element={ <AdminLessonsPage /> } />
            <Route path="chat" element={ <AdminChatPage /> } />
            {/* Add more admin routes here */ }
          </Route>
        </Route>

        {/* 
          Fallback Route Strategy (404 Handling)
          The `/*` essentially functions as an "else" statement for the router.
          If a user requests a URL that fails to match any of the explicit paths above,
          they are gracefully caught here and presented with the `<ErrorPage />`.
        */}
        <Route path="/*" element={ <ErrorPage /> } />
      </Routes>
    </Router>
  );
};

// Export it so it can be used in the index.js file..
export default App;