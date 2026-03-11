// Import core React tools and routing utilities..
import React, { useState, useContext } from 'react';
import { Nav, Navbar, Badge } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

// Import AuthContext to access user state and auth functions..
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

// Import the modal component used for sign in / sign up / edit profile..
import AuthModal from './AuthModal';

// Import NavBar styles..
import '../styles/NavBar.css';

// Define the base API URL using the environment variable..
const API = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace( '/api', '' ) : 'http://localhost:4000';

/**
 * Navbar Component (AppNavbar)
 *
 * Architectural Pattern: Global Smart Component / Connected Component.
 * Omnipresent navigational shell persistent natively across all public and user-secured route paths.
 * Dynamically swaps its UI hierarchy actively rendering user profile blobs, dynamic shopping cart counts,
 * and explicit context triggers like Logout functionality directly reacting to global state.
 */
const AppNavbar: React.FC = () =>
{
  // Hook to read the current route path (useful for determining active link states).
  const location = useLocation();

  // Consume Contexts to determine exactly "who" is looking at the screen, and "what" they own.
  const authContext = useContext( AuthContext );
  const cartContext = useContext( CartContext );

  // Fail-Safe: In a well-architected app, if a developer accidentally renders <AppNavbar>
  // *outside* of the Context Providers, we explicitly crash it with a helpful error.
  if ( !authContext || !cartContext )
  {
    throw new Error( "Navbar must be used strictly within an AuthProvider and CartProvider root wrapper." );
  }

  // Object destructuring isolates the specific state nodes / functions we care about.
  const { user, signOut } = authContext;
  const { cartItems } = cartContext;

  /**
   * Local UI State vs Global State
   *
   * While Authentication is global, the *visibility* of the Auth Modal is purely a localized UI concern.
   * `modalMode` leverages a Discriminated Union type ('auth' | 'join' | 'edit') to force the child
   * <AuthModal /> into the mathematically correct view state.
   */
  const [ showModal, setShowModal ] = useState<boolean>( false );
  const [ modalMode, setModalMode ] = useState<'auth' | 'join' | 'edit'>( 'auth' );


  /**
   * UI Polish: Dynamic Time-of-Day logic
   * Analyzes the local browser clock strictly to render contextual greetings.
   */
  const getGreeting = () =>
  {
    const hour = new Date().getHours();
    if ( hour >= 18 ) return 'Good Evening';
    if ( hour >= 12 ) return 'Good Afternoon';
    return 'Good Morning';
  };

  /**
   * Helper Function: navLinkClass
   *
   * Checks the `location.pathname` against a strict target route.
   * Dynamically applies an "active state" CSS class (`text-primary fw-bold`)
   * if the user is currently looking at that exact page.
   */
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
                      id='sign-out'
                      className='btn btn-sm text-gradient ms-2'
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