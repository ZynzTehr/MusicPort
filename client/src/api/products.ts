// Import axios to handle HTTP requests from the frontend to the backend.
import axios from 'axios';

/**
 * Environment & Network Configuration
 * Points to the backend Express server. Dynamically adapts via Vite environment variables.
 */
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch All Products
 * 
 * Retrieve the master catalog of active store elements.
 * Architecture Note: For a production app with thousands of items, this endpoint 
 * should be updated to accept pagination params (page, limit) to prevent memory bloat.
 */
export const fetchAllProducts = () => axios.get( `${ API }/products` );

/**
 * Fetch Featured Products
 * 
 * Retrieves a curated subset (e.g., top 6) of products.
 * Often used to populate the Homepage Hero Carousel or "Recommended" sections 
 * without downloading the entire database overhead.
 */
export const fetchFeaturedProducts = () => axios.get( `${ API }/products/featured` );

/**
 * Fetch Single Product By ID
 * 
 * RESTful pattern: Appends the specific `id` to the base endpoint path.
 * Used for deeply rendering individual Product Detail Pages (PDP).
 */
export const fetchProductsById = ( id: string ) => axios.get( `${ API }/products/${ id }` );
