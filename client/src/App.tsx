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

// Import Error Page..
import ErrorPage from './components/ErrorPage';

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



const App: React.FC = () =>
{
  return (
    <Router>
      <Routes>
        <Route element={ <MainLayout /> }>
          {/* Route: Home Page */ }
          <Route path="/home" element={ <HomePage /> } />
          <Route path="/" element={ <LandingPage /> } />

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

        {/* Route: Error Page */ }
        <Route path="/*" element={ <ErrorPage /> } />
      </Routes>
    </Router>
  );
};

// Export it so it can be used in the index.js file..
export default App;