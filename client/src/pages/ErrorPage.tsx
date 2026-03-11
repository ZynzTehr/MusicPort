// Import React tools to create component, and routing utilities..
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ErrorPage Component (404 Not Found)
 * 
 * Architectural Pattern: Fallback/Catch-All Route
 * Purpose: This component acts as the global safety net for the React Router configuration.
 * Any URL path that does not match a registered `<Route>` will automatically render this view.
 * 
 * Note on Assets: The image `src` is intentionally set to an absolute path (`/assets/...`) 
 * rather than a relative path (`../../assets/...`). Because a 404 can trigger on any deeply 
 * nested URL (e.g., `/lessons/guitar/unknown-id`), a relative path would break and fail 
 * to load the fallback image. Absolute paths ensure it always fetches from the public root.
 */
const ErrorPage: React.FC = () =>
{
  return (
    <>
      <div className='text-center text-light'>
        <h1 className='mt-5 display-1'> There is Nothing Here! </h1>
        <h1><b> Go Back! </b></h1>
        <p> We couldn't find that Page! </p>
        
        {/* Important: Use absolute path so nested 404 routes don't break the image. */}
        <img className='errImg mt-5 rounded w-50' src='/assets/images/error.jpeg' alt='backend artwork' />
        
        <h1 className='mt-5'><b> Page not Found </b></h1>
        <button className='btn btn-outline-info'>
          <Link to='/' className='text-light text-decoration-none'>To Home</Link>
        </button>
      </div>
    </>
  );
};

// Export the component so it can be safely imported by App.tsx..
export default ErrorPage;