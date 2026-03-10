// Import axios to handle HTTP requests from the frontend to the backend..
import axios from 'axios';

// Define the base API URL using the environment variable..
// This allows the app to easily switch between local and deployed environments..
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Route to fetch all products to display at the Shop page from the backend..
export const fetchAllProducts = () => axios.get( `${ API }/products` );

// Route to fetch top 3 products to display at the featured section of the Home page from the backend..
export const fetchFeaturedProducts = () => axios.get( `${ API }/products/featured` );

// Route to fetch top 3 products to display at the featured section of the Home page from the backend..
export const fetchProductsById = () => axios.get( `${ API }/products/:id` );
