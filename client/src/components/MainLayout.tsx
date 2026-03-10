import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout: React.FC = () =>
{
    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    return (
        <>
            { !isLandingPage && <Navbar /> }
            <main className={ !isLandingPage ? "container my-4" : "" }>
                <Outlet />
            </main>
            { !isLandingPage && <Footer /> }
        </>
    );
};

export default MainLayout;
