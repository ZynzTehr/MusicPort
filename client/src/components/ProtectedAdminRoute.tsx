import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// You might need to adjust this depending on how you store your user/auth state.
// Assuming we can get the user from localStorage or a context.
// For now, I'll check localStorage for a user object as a simple starting point.

const ProtectedAdminRoute: React.FC = () =>
{
    const userStr = sessionStorage.getItem( 'user' );
    let isAdmin = false;

    if ( userStr )
    {
        try
        {
            const user = JSON.parse( userStr );
            isAdmin = user.isAdmin === true;
        } catch ( e )
        {
            console.error( "Failed to parse user from local storage", e );
        }
    }

    return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedAdminRoute;
