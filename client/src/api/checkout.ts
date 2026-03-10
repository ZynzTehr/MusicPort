// Import axios to handle HTTP requests from the frontend to the backend..
import axios from 'axios';

// Define the base API URL using the environment variable..
// This allows the app to easily switch between local and deployed environments..
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Checkout for user that is signed-in..
 * @param {Object} data - { userId, productIds }
 */
export const userCheckout = ( data: any ) =>
{
  return axios.post( `${ API }/checkout/user`, data );
};

/**
 * Checkout for a guest user..
 * @param {Object} data - { name, email, productIds }
 */
export const guestCheckout = ( data: any ) =>
{
  return axios.post( `${ API }/checkout/guest`, data );
};
