import axios from 'axios';

/**
 * Environment & Network Configuration
 * Points to the backend Express server. Dynamically adapts via Vite environment variables.
 */
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch All Shows
 * 
 * Target Endpoint: GET /shows
 * Purpose: Retrieves the full matrix of concert/venue data natively.
 * Architecture Note: Due to potentially high data volume, in a production app this endpoint 
 * would ideally support cursor or offset-based pagination.
 */
export const fetchAllShows = () => axios.get( `${ API }/shows` );

/**
 * Fetch Shows by State/Location
 * 
 * Target Endpoint: GET /shows/:location
 * Purpose: A RESTful query utilizing a path parameter for state-restricted querying (e.g., 'NY' or 'CA').
 */
export const requestShows = ( location: string ) => axios.get( `${ API }/shows/${ location }` );

/**
 * Search Shows (Complex Querying)
 * 
 * Target Endpoint: GET /shows
 * Purpose: Constructs highly flexible query strings using Axios' `params` object mapping.
 * Architecture Note: This supports complex multi-variable filtering natively 
 * (e.g., `?city=Austin&date=2026-04-10` or explicitly targeting geospatial `{ lat, lng, radius }` coordinates).
 */
export const searchShows = ( params: any ) =>
{
    return axios.get( `${ API }/shows`, { params } );
};