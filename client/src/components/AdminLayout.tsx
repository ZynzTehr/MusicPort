import React from 'react';
import { Link, Outlet } from 'react-router-dom';

// Import the specific stylesheet for this layout.
// Keeping CSS scoped or component-specific helps prevent global style bleed and makes maintenance easier.
import '../styles/AdminLayout.css'; 

/**
 * AdminLayout Component
 * 
 * This component acts as a "wrapper" or "shell" for all of the administrative pages
 * in our application. As a senior engineer, I highly recommend this pattern (often called 
 * a Layout Component) for a few key reasons:
 * 
 * 1. Reusability: We write the sidebar and layout structure once.
 * 2. Consistency: Every single admin page will look and behave the same way.
 * 3. Separation of Concerns: This component only cares about the layout, not the data 
 *    on the specific admin pages.
 * 
 * We use React Router's `<Outlet />` component to tell React exactly where to render 
 * the "inside" or "child" page content.
 */
const AdminLayout: React.FC = () => {
    return (
        // The main container for the entire admin section. 
        // We use flexbox or grid (via CSS classes) here to position the sidebar and main content area.
        <div className="bg-secondary admin-container">
            
            {/* 
              * Sidebar Navigation (Aside)
              * The `<aside>` tag is semantic HTML. It tells screen readers and search engines 
              * that this content is tangentially related to the main content (perfect for sidebars).
              */}
            <aside className="admin-sidebar">
                <div className="admin-header">
                    <h2>Admin Panel</h2>
                </div>
                
                {/* 
                  * Navigation Menu
                  * We use React Router's `<Link>` component instead of standard `<a>` tags.
                  * Why? Because `<Link>` intercepts the click and uses JavaScript to update the URL 
                  * and switch the component *without* triggering a full browser page reload. 
                  * This is what makes a Single Page Application (SPA) feel incredibly fast.
                  */}
                <nav className="admin-nav">
                    <Link to="/admin/dashboard" className="admin-nav-item">Dashboard</Link>
                    <Link to="/admin/users" className="admin-nav-item">Users</Link>
                    <Link to="/admin/products" className="admin-nav-item">Products</Link>
                    <Link to="/admin/shows" className="admin-nav-item">Shows</Link>
                    <Link to="/admin/lessons" className="admin-nav-item">Lessons</Link>
                    <Link to="/admin/chat" className="admin-nav-item">Chat</Link>
                    
                    {/* A specific escape hatch to get back to the public-facing site */}
                    <Link to="/home" className="admin-nav-item back-home">Back to Site</Link>
                </nav>
            </aside>

            {/* 
              * Main Content Area
              * The `<main>` tag is also semantic HTML, indicating the primary content of the document.
              */}
            <main className="admin-content">
                {/* 
                  * <Outlet /> is the magic piece of React Router v6.
                  * It acts as a placeholder. When a user visits `/admin/users`, React Router looks at 
                  * our routing configuration, sees that `AdminLayout` is the parent, and renders it. 
                  * Then, it takes the child component (e.g., `AdminUsersPage`) and renders it exactly 
                  * where this `<Outlet />` is placed.
                  */}
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
