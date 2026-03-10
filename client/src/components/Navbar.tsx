// Import core React tools and routing utilities..
import React, { useState, useContext } from 'react';
import { Nav, Navbar, Badge } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

// Import AuthContext to access user state and auth functions..
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

// Import the modal component used for sign in / sign up / edit profile..
import AuthModal from './AuthModal';

// Define the base API URL using the environment variable..
const API = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace( '/api', '' ) : 'http://localhost:4000';

const AppNavbar: React.FC = () =>
{
  const location = useLocation(); // Hook to get the current route..
  const authContext = useContext( AuthContext ); // Get current user and signOut method from context..
  const cartContext = useContext( CartContext );

  if ( !authContext || !cartContext )
  {
    throw new Error( "Navbar must be used within AuthProvider and CartProvider" );
  }

  const { user, signOut } = authContext;
  const { cartItems } = cartContext;

  // Local UI state to control the auth modal visibility and mode..
  const [ showModal, setShowModal ] = useState<boolean>( false ); // Controls whether modal is visible..
  const [ modalMode, setModalMode ] = useState<'auth' | 'join' | 'edit'>( 'auth' ); // Can be 'auth', 'join', or 'edit'..


  // Checks for time and returns a greeting depending on the rime of day..
  const getGreeting = () =>
  {
    const hour = new Date().getHours();
    if ( hour >= 18 ) return 'Good Evening';
    if ( hour >= 12 ) return 'Good Afternoon';
    return 'Good Morning';
  };

  const navLinkClass = ( path: string ) =>
    `nav-link ms-2 transition-colors duration-200 ${ location.pathname === path ? 'text-primary fw-bold' : 'text-light hover:text-white' }`;

  return (
    <>
      {/* Navbar container */ }
      <Navbar collapseOnSelect expand='lg' className='navbar-dark shadow-md' style={ { backgroundColor: 'var(--bg-card)', borderBottom: '1px solid rgba(255,255,255,0.05)' } } sticky='top'>
        {/* App brand name links to homepage */ }
        <Navbar.Brand as={ Link } to="/home" className='fw-bold ms-4 text-gradient fs-4'>
          MusicPort
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' className='me-3 text-light border-0' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='ms-3 me-auto'>
            <Link to='/venues' className={ navLinkClass( '/venues' ) }>Shows</Link>
            <Link to='/lessons' className={ navLinkClass( '/lessons' ) }>Lessons</Link>
            <Link to='/chat' className={ navLinkClass( '/chat' ) }>Chat</Link>
            <Link to='/shop' className={ navLinkClass( '/shop' ) }>Shop</Link>
            { user && user.isAdmin && (
              <Link to='/admin/dashboard' className={ navLinkClass( '/admin/dashboard' ) }>Admin Panel</Link>
            ) }
          </Nav>

          {/* Right side navigation and auth controls */ }
          < div className='ms-auto d-flex align-items-center gap-3 me-4' >
            {/* Cart Icon */ }
            { user && (
              <Link to="/shop" className="text-light position-relative me-2 hover-lift">
                <i className="bi bi-cart3 fs-5"></i>
                { cartItems.length > 0 && (
                  <Badge pill bg="danger" style={ { position: 'absolute', top: '-8px', right: '-12px', fontSize: '0.65rem' } }>
                    { cartItems.length }
                  </Badge>
                ) }
              </Link>
            ) }

            {/* If the user is signed in, show their name and options */ }
            {
              user ? (
                <>
                  {/* Show user's name */ }
                  <div className='d-flex align-items-center gap-2 animate-fade-in'>
                    <span className='text-gradient small d-none d-md-inline'>
                      <span className='text-gradient'>{ getGreeting() },</span> <span className='fw-bold text-gradient text-uppercase'>{ user.name }</span>
                    </span>

                    {/* Avatar Button */ }
                    <button
                      className='rounded-circle p-0 border-0 overflow-hidden shadow-sm hover-lift'
                      style={ { width: '40px', height: '40px', transition: 'all 0.3s ease' } }
                      onClick={ () =>
                      {
                        setModalMode( 'edit' );
                        setShowModal( true );
                      } }
                    >
                      <img
                        src={ user.photo ? `${ API }/userProfileImgs/${ user.photo }` : 'https://via.placeholder.com/40' }
                        alt={ user.name }
                        style={ { width: '100%', height: '100%', objectFit: 'cover' } }
                      />
                    </button>

                    {/* Sign out button */ }
                    <button
                      className='btn btn-sm text-gradient hover:text-danger ms-2'
                      onClick={ signOut }
                      title="Sign Out"
                    >
                      <i className="bi bi-box-arrow-right fs-5"></i>
                    </button>
                  </div>
                </>
              ) : (
                // If no user, show sign in / join text link..
                <button
                  className='btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-glow hover-lift'
                  onClick={ () =>
                  {
                    setModalMode( 'auth' );
                    setShowModal( true );
                  } }
                >
                  Join / Sign In
                </button>
              )
            }
          </div >
        </Navbar.Collapse>
      </Navbar>

      {/* Authentication Modal — triggered by state above */ }
      < AuthModal
        show={ showModal } // Controls modal visibility..
        onClose={ () => setShowModal( false ) } // Close handler..
        mode={ modalMode } // Mode: 'auth', 'join', or 'edit'..
        user={ modalMode === 'edit' ? user : null } // Pass user only when editing..
      />
    </>
  );
};

// Export the component so it can be imported and used in other files..
export default AppNavbar;