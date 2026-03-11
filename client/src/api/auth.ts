// Import axios to handle HTTP requests securely between the frontend and backend.
import axios from 'axios';

/**
 * Environment & Network Configuration
 * Points to the backend Express server. Dynamically adapts via Vite environment variables.
 * This ensures developers don't accidentally hit production databases when testing locally.
 */
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * User Registration (Sign Up)
 *
 * Target Endpoint: POST /users/signup
 * Architecture Note: We use `formData: any` because the payload is often a `FormData` object
 * (which natively supports multipart/form-data for image uploads like avatars), rather than pure JSON.
 */
export const signUpUser = ( formData: any ) =>
{
  return axios.post( `${ API }/users/signup`, formData );
};

/**
 * User Authentication (Login)
 *
 * Target Endpoint: POST /users/login
 * Architecture Note: Transmits raw credentials securely. The backend will hash the incoming password
 * and compare it against the stored bcrypt hash. Upon success, it returns a JWT for the frontend to cache.
 */
export const signInUser = ( identifier: string, password: string ) =>
{
  return axios.post( `${ API }/users/login`, { identifier, password } );
};

/**
 * Profile Modification (Update)
 *
 * Target Endpoint: PUT /users/update
 * Architecture Note: This is an authenticated route. We manually extract the JWT from `sessionStorage`
 * and append it as a strict Bearer token inside the Authorization header.
 * If the token is missing or expired, the backend rejects the mutation with 401/403.
 */
export const updateUserProfile = ( formData: any ) =>
{
  const token = sessionStorage.getItem( 'token' );
  return axios.put( `${ API }/users/update`, formData, {
    headers: { Authorization: `Bearer ${ token }` }
  } );
};

/**
 * Account Deletion (Destroy)
 *
 * Target Endpoint: DELETE /users/:userId
 * Architecture Note: A highly destructive action. Like `updateUserProfile`, it demands a valid JWT.
 * A robust backend will verify that the ID inside the JWT perfectly matches the `userId` requested 
 * for deletion (unless performed by an Admin role).
 */
export const deleteUserAccount = ( userId: string ) =>
{
  const token = sessionStorage.getItem( 'token' );
  return axios.delete( `${ API }/users/${ userId }`, {
    headers: { Authorization: `Bearer ${ token }` }
  } );
};
