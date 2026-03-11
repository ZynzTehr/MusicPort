import axios from 'axios';

/**
 * Environment & Network Configuration
 * Points to the backend Express server. Dynamically adapts via Vite environment variables.
 */
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * JWT Interceptor Header Generator
 * 
 * Crucial for stateless session management. Every time a protected write-action 
 * occurs (create, update, delete), we extract the JWT from the browser's storage 
 * to prove identity to the backend.
 */
const getConfig = () =>
{
    const token = sessionStorage.getItem( 'token' );
    return {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${ token }` : ''
        }
    };
};

/**
 * Read Operation (Public)
 * Fetches the global stream of community posts. No authentication required.
 */
export const fetchAllPosts = () => axios.get( `${ API }/posts` );

/**
 * Write Operation (Protected)
 * Creates a new post. Fails with 401 Unauthorized if `getConfig()` yields no valid token.
 */
export const createPost = ( postData: any ) => axios.post( `${ API }/posts`, postData, getConfig() );

/**
 * Update Operation (Protected)
 * Modifies an existing post. Backend validates that the logged-in user actually owns `id`.
 */
export const updatePost = ( id: string, postData: any ) => axios.put( `${ API }/posts/${ id }`, postData, getConfig() );

/**
 * Delete Operation (Protected)
 * Submits a DELETE request. Again, `getConfig()` provides authorization.
 */
export const deletePost = ( id: string ) => axios.delete( `${ API }/posts/${ id }`, getConfig() );
