import axios from 'axios';

/**
 * Endpoint Configuration
 * Resolves the backend URI depending on the Vite environment (local dev vs. prod build).
 */
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Auth Token Interceptor (Helper)
 * 
 * Architecture Note: Because our backend implements JWT (JSON Web Tokens) for security,
 * certain protected routes (like marking a lesson as complete) MUST have this token.
 * 
 * By wrapping this in `getConfig()`, we ensure that:
 * 1. The token is fetched *fresh* from `sessionStorage` at the exact moment the API is called.
 * 2. If the token expires or is cleared, we don't send stale headers.
 */
const getConfig = () =>
{
    // Retrieve the JWT securely stored during the Login process.
    const token = sessionStorage.getItem( 'token' );
    
    return {
        headers: {
            'Content-Type': 'application/json',
            // The standard 'Bearer' schema is required by Passport.js/JWT middleware on the Express server.
            Authorization: token ? `Bearer ${ token }` : ''
        }
    };
};

/**
 * Fetch All Lessons
 * 
 * Allows passing an optional `query` object for filtering (e.g., ?instrument=guitar).
 * Axios intelligently converts the `{ params: query }` object into a URL-encoded query string.
 */
export const fetchAllLessons = ( query: any = {} ) =>
{
    return axios.get( `${ API }/lessons`, { params: query } );
};

/**
 * Fetch Single Lesson
 * 
 * RESTful pattern: Appends the specific `id` to the base endpoint path.
 * This does *not* require authorization; lessons are publicly viewable.
 */
export const fetchLessonById = ( id: string ) => axios.get( `${ API }/lessons/${ id }` );

/**
 * Mark Lesson Complete
 * 
 * This is a protected action (only logged-in users get a dashboard showing completed lessons).
 * Thus, we attach `getConfig()` as the third argument so the backend accepts the POST request.
 */
export const markLessonAsComplete = ( id: string ) => axios.post( `${ API }/users/lessons/${ id }`, {}, getConfig() );
