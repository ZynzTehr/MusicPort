import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * MainLayout Component
 * 
 * Architectural Pattern: Wrapper/HOC (Higher Order Component) Layout
 * Purpose: This component acts as the global skeleton for all public-facing pages.
 * By wrapping the React Router `<Outlet />`, we ensure the `Navbar` and `Footer` 
 * are persistent across route changes without needing to import them into every individual page.
 */
const MainLayout: React.FC = () =>
{
    // Tap into React Router's location context to read the current URL path.
    const location = useLocation();
    
    // We explicitly hide the global navigation/footer on the root Landing Page 
    // because it has its own highly-customized, immersive fullscreen design.
    const isLandingPage = location.pathname === '/';

    return (
        <>
            {/* Conditional Rendering: Only mount Navbar if we aren't on the splash page */}
            { !isLandingPage && <Navbar /> }
            
            {/* 
              * The <Outlet /> is where React Router dynamically injects the child component 
              * (e.g., HomePage, ShowsPage) matching the current URL.
              * We apply a standard Boostrap `.container` to constrain content width dynamically.
              */}
            <main className={ !isLandingPage ? "container my-4" : "" }>
                <Outlet />
            </main>
            
            {/* Conditional Rendering: Only mount Footer if we aren't on the splash page */}
            { !isLandingPage && <Footer /> }
        </>
    );
};

export default MainLayout;
