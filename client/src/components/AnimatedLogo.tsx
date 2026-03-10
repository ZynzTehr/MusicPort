import React, { useEffect, useState } from 'react';
import '../styles/AnimatedLogo.css';

const AnimatedLogo: React.FC = () =>
{
    const [ filled, setFilled ] = useState<boolean>( false );

    useEffect( () =>
    {
        const timer = setTimeout( () =>
        {
            setFilled( true );
        }, 2500 ); // Start filling shortly before drawing ends
        return () => clearTimeout( timer );
    }, [] );

    return (
        <div className="logo-container">
            <svg
                className={ `logo-svg ${ filled ? 'filled' : '' }` }
                viewBox="0 0 500 150"
                xmlns="http://www.w3.org/2000/svg"
            >
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="logo-text">
                    MusicPort
                </text>
            </svg>
        </div>
    );
};

export default AnimatedLogo;
