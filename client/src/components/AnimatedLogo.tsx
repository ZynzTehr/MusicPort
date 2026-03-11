import React, { useEffect, useState } from 'react';

// Import our specialized CSS containing the keyframe animations 
// (e.g., SVG path drawing, stroke-dasharray tricks, and fill transitions).
import '../styles/AnimatedLogo.css';

/**
 * AnimatedLogo Component
 * 
 * This component builds a visually appealing, animated SVG logo for the top-level application.
 * SVG text animations are a fantastic way to add premium polish to an app without heavily 
 * taxing the browser's rendering engine (unlike complex canvas or raster sequences).
 */
const AnimatedLogo: React.FC = () => {
    // We use React state to track when the initial "drawing" phase is complete.
    // `filled` starts as false (logo is just an outline being drawn).
    const [filled, setFilled] = useState<boolean>(false);

    /**
     * useEffect Hook
     * 
     * This hook runs exactly once after the component mounts (because of the empty dependency array `[]`).
     * It sets a timeout that waits 2.5 seconds (2500ms).
     * 
     * Why 2.5s? 
     * By coordinating this JavaScript timer with the CSS animation duration inside `AnimatedLogo.css`,
     * we know precisely when the SVG path drawing animation finishes. Once it finishes, we flip
     * the `filled` state to true, allowing the CSS to smoothly transition the text color from 
     * transparent/outline to a solid fill.
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilled(true);
        }, 2500); 
        
        // Cleanup function: If this component unmounts before 2.5s is up 
        // (e.g., user navigates away super fast), we clear the timeout to prevent memory leaks 
        // and React state updates on an unmounted component.
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="logo-container">
            {/* 
              * Inline SVG
              * We embed the SVG directly into the DOM instead of using an <img> tag.
              * This is critical because it allows our CSS to target the internal <text> 
              * and <path> elements for animation.
              */}
            <svg
                // We conditionally append the 'filled' class if our timer has popped.
                // This class triggers the CSS rule that fills in the logo color.
                className={`logo-svg ${filled ? 'filled' : ''}`}
                viewBox="0 0 500 150"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* 
                  * The actual text element. 
                  * Using dominantBaseline="middle" and textAnchor="middle" ensures 
                  * that no matter what the bounding box is, the text perfectly centers 
                  * exactly at the 50% x and y coordinates.
                  */}
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="logo-text">
                    MusicPort
                </text>
            </svg>
        </div>
    );
};

export default AnimatedLogo;
