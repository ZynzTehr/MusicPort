import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// You might need to adjust this depending on how you store your user/auth state.
// Assuming we can get the user from localStorage or a context.
// For now, I'll check localStorage for a user object as a simple starting point.

/**
 * ProtectedAdminRoute Component
 * 
 * Architectural Pattern: Route Guard / HOC (Higher-Order Component)
 * 
 * Purpose: This wrapper component sits between the React Router `<Routes>` configuration 
 * and the actual Admin components. It intercepts the rendering process.
 * 
 * Security Note: Client-side route guarding is fundamentally a UX (User Experience) tool, 
 * NOT a strict security boundary. A malicious user could manually bypass this by modifying 
 * their sessionStorage. However, the subsequent API calls made by the mocked Admin 
 * would still fundamentally fail because the backend verifies the JWT signature and role directly.
 */
const ProtectedAdminRoute: React.FC = () =>
{
    // Retrieve the raw stringified user payload stored during the login sequence.
    const userStr = sessionStorage.getItem( 'user' );
    let isAdmin = false;

    if ( userStr )
    {
        try
        {
            // Deserialize the JSON blob and verify the explicit role boolean.
            const user = JSON.parse( userStr );
            isAdmin = user.isAdmin === true;
        } catch ( e )
        {
            console.error( "Failed to parse user from local storage", e );
        }
    }

    /**
     * The Pivot Point:
     * If they have an admin flag, we render the `<Outlet />` (which passes them through 
     * to whatever child Admin route they requested).
     * If they don't, we forcibly redirect (Navigate) them back home, completely obscuring 
     * the existence of the Admin UI.
     */
    return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedAdminRoute;
