// Import React tools to create component, and routing utilities..
import React from 'react';
import { Link } from 'react-router-dom';

// Component to diplay Error page..
const ErrorPage: React.FC = () =>
{
  return (
    <>
      <div className='text-center text-light'>
        <h1 className='mt-5 display-1'> There is Nothing Here! </h1>
        <h1><b> Go Back! </b></h1>
        <p> We couldn't find that Page! </p>
        <img className='errImg mt-5 rounded w-50' src='../../assets/images/error.jpeg' alt='backend artwork' />
        <h1 className='mt-5'><b> Page not Found </b></h1>
        <button className='btn btn-outline-info'><Link to='/' className='text-light text-decoration-none'>To Home</Link></button>
      </div>
    </>
  );
};

// Export the component so it can be imported and used in other files..
export default ErrorPage;