import axios from 'axios';

/**
 * Environment & Network Configuration
 * Points to the backend Express server. Dynamically adapts via Vite environment variables.
 */
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Axios Instance Creation
 * 
 * Instead of relying on the global `axios` object, we instantiate a custom client (`api`).
 * This allows us to define base URLs and attach global interceptors that apply *only* 
 * to calls made via this specific instance.
 */
const api = axios.create( { baseURL: API } );

/**
 * Global Request Interceptor
 * 
 * Architecture Note: This is a powerful, centralized piece of middleware that runs 
 * immediately before any HTTP request leaves the browser.
 * 
 * Purpose: It automatically injects the active JWT (if one exists) into the headers as a Bearer token.
 * Security Check: We explicitly bypass this injection for `/login` and `/signup` routes. 
 * Sending an expired or invalid token to an authentication endpoint can sometimes trigger a 
 * premature 401 Unauthorized rejection before the server even reads the new login credentials.
 */
api.interceptors.request.use( ( config: any ) =>
{
	const token = sessionStorage.getItem( 'token' );

	// ⛔ Do NOT attach token to auth routes to prevent circular auth loops or false rejections.
	if (
		token &&
		!config.url.includes( '/login' ) &&
		!config.url.includes( '/signup' )
	)
	{
		config.headers.Authorization = `Bearer ${ token }`;
	}

	return config;
} );

export default api;
