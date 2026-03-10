// Import axios to handle HTTP requests from the frontend to the backend..
import axios from 'axios';
// import api from './token';

// Define the base API URL using the environment variable..
// This allows the app to easily switch between local and deployed environments..
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create new user..
export const signUpUser = ( formData: any ) =>
{
  // return api.post(`/api/users/signup`, formData);
  return axios.post( `${ API }/users/signup`, formData );
};

// Log in an existing user..
export const signInUser = ( identifier: string, password: string ) =>
{
  // return appendFile.post(`/api/users/login`, { identifier, password });
  return axios.post( `${ API }/users/login`, { identifier, password } );
};

// Update user profile "edit name, bio, password, card info"..
export const updateUserProfile = ( formData: any ) =>
{
  const token = sessionStorage.getItem( 'token' );
  // return api.put(`/api/users/update`, formData);
  return axios.put( `${ API }/users/update`, formData, {
    headers: { Authorization: `Bearer ${ token }` }
  } );
};

// Delete a user account..
export const deleteUserAccount = ( userId: string ) =>
{
  const token = sessionStorage.getItem( 'token' );
  // return api.delete(`/api/users/${userId}`);
  return axios.delete( `${ API }/users/${ userId }`, {
    headers: { Authorization: `Bearer ${ token }` }
  } );
};
