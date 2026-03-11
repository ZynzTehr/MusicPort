import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Context Providers
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/index.css';

/**
 * main.tsx (Entry Point)
 * 
 * Architectural Pattern: Application Bootstrapper.
 * 
 * Purpose: This is the very first file the Vite bundler executes. 
 * It locates the physical `<div id="root">` inside the `index.html` file and 
 * physically injects the entire React Virtual DOM application into it.
 */
const rootElement = document.getElementById( 'root' );

if ( rootElement )
{
    // Utilizes React 18's highly performant concurrent renderer.
    const root = ReactDOM.createRoot( rootElement );

    /**
     * Global Provider Matryoshka Pattern:
     * App is deeply nested inside specialized "Providers". 
     * 1. AuthProvider sits on the absolute outside, ensuring all child components 
     *    (including the Cart) know exactly who the user is before they mount.
     * 2. CartProvider sits inside AuthProvider, enabling it to potentially save
     *    a user's cart strictly tied to their active session if needed later on.
     */
    root.render(
        <AuthProvider>
            <CartProvider>
                <App />
            </CartProvider>
        </AuthProvider>
    );
} else
{
    console.error( 'Critical Failure: React cannot find the physical HTML mount anchor.' );
}
