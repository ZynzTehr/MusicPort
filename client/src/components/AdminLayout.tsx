import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import '../styles/AdminLayout.css'; // We'll create this css file next

const AdminLayout: React.FC = () =>
{
    return (
        <div className="bg-secondary admin-container">
            <aside className="admin-sidebar">
                <div className="admin-header">
                    <h2>Admin Panel</h2>
                </div>
                <nav className="admin-nav">
                    <Link to="/admin/dashboard" className="admin-nav-item">Dashboard</Link>
                    <Link to="/admin/users" className="admin-nav-item">Users</Link>
                    <Link to="/admin/products" className="admin-nav-item">Products</Link>
                    <Link to="/admin/shows" className="admin-nav-item">Shows</Link>
                    <Link to="/admin/lessons" className="admin-nav-item">Lessons</Link>
                    <Link to="/admin/chat" className="admin-nav-item">Chat</Link>
                    <Link to="/" className="admin-nav-item back-home">Back to Site</Link>
                </nav>
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
