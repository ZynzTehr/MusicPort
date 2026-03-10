import React, { useEffect, useState } from 'react';
import AnimatedLogo from '../components/AnimatedLogo';
import AuthForm from '../components/AuthForm';

const LandingPage: React.FC = () =>
{
    // We can control the form visibility purely with CSS animation delays (as implemented in AuthForm.css)
    // or adding conditional rendering here. The CSS delay is 3s.

    return (
        <div style={ {
            height: '100vh',
            width: '100vw',
            backgroundImage: 'url(/assets/background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
        } }>
            <AnimatedLogo />
            <AuthForm />
        </div>
    );
};

export default LandingPage;
