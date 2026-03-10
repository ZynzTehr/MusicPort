import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create( { baseURL: API } );

api.interceptors.request.use( ( config: any ) =>
{
	const token = sessionStorage.getItem( 'token' );

	// ⛔ Do NOT attach token to auth routes
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
