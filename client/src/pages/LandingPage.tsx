import React, { useEffect, useState } from 'react';
import AnimatedLogo from '../components/AnimatedLogo';
import AuthForm from '../components/AuthForm';

/**
 * LandingPage Component
 * 
 * Architectural Pattern: Entry Point / Aesthetic Portal.
 * 
 * Purpose: This is the very first visual element an unauthenticated user sees at `/`. 
 * It focuses entirely on a high-impact aesthetic experience, wrapping the animated 
 * logo and the authentication gatekeeper (`<AuthForm>`).
 */
const LandingPage: React.FC = () =>
{
    /**
     * Animation Nuance:
     * The form visibility is controlled purely with CSS animation delays (implemented in AuthForm.css).
     * The React DOM paints everything simultaneously, but CSS Opacity and Translate delay 
     * the form's appearance until 3 seconds after the logo animation fires.
     */

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
