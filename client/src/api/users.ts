import axios from 'axios';

/**
 * Environment & Network Configuration
 * Points to the backend Express server. Dynamically adapts via Vite environment variables.
 */
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch Public User Profile by ID
 * 
 * Target Endpoint: GET /users/:userId
 * Purpose: Retrieves public-facing profile information for a specific user (e.g., viewing an instructor's 
 * profile page, or looking at a post author).
 * Architecture Note: Unlike `/users/update` in `auth.ts`, this is generally a public or lightly-protected 
 * endpoint that does not strictly require the user themselves to be authenticated as `userId`.
 */
export const fetchUserById = ( userId: string ) => axios.get( `${ API }/users/${ userId }` );
