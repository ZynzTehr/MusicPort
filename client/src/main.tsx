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

const rootElement = document.getElementById( 'root' );

if ( rootElement )
{
    const root = ReactDOM.createRoot( rootElement );

    root.render(
        <AuthProvider>
            <CartProvider>
                <App />
            </CartProvider>
        </AuthProvider>
    );
} else
{
    console.error( 'Failed to find the root element' );
}
