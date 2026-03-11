// Import axios to handle HTTP requests securely between the client and server.
import axios from 'axios';

/**
 * Environment Variable Configuration
 * 
 * Using `import.meta.env` is Vite's syntax for accessing environment variables (replacing Webpack's `process.env`).
 * This architecture guarantees we don't accidentally hit production databases while developing locally.
 * If VITE_API_URL isn't found in a `.env` file, it safely falls back to the localhost default.
 */
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * API Function: userCheckout
 * 
 * Target Endpoint: POST /checkout/user
 * Purpose: Submits a payment payload tailored for an authenticated user.
 * 
 * Note on security: While `data: any` is used here for brevity, in a strict TypeScript environment,
 * you would want to replace `any` with a proper interface (e.g., `UserCheckoutPayload`) to ensure 
 * the components calling this function provide exactly the correct data shape (userId, productIds, totals).
 */
export const userCheckout = ( data: any ) =>
{
  return axios.post( `${ API }/checkout/user`, data );
};

/**
 * API Function: guestCheckout
 * 
 * Target Endpoint: POST /checkout/guest
 * Purpose: Submits a checkout payload for an anonymous session.
 * 
 * Architectural difference: Guests don't have a `userId` in the payload. The backend controller 
 * will handle this transaction independently of the users collection (or tie it solely to an email).
 */
export const guestCheckout = ( data: any ) =>
{
  return axios.post( `${ API }/checkout/guest`, data );
};
