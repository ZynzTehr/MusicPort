
// Import React hooks for internal state and lifecycle management.
import React, { useState, useEffect } from 'react';

// Use React Bootstrap's Modal component. This is a great choice for quick, accessible, 
// and responsive overlay dialogs without reinventing the wheel with custom CSS/portals.
import { Modal } from 'react-bootstrap';

// Import our workhorse authentication form component.
import UserAuth from './UserAuth';
import { User } from '../context/AuthContext';

/**
 * Interface defining the expected properties (Props) for the AuthModal.
 * TypeScript forces us to strictly type the inputs to this component, which prevents 
 * runtime bugs where a parent might pass down the wrong data type.
 */
interface AuthModalProps
{
  show: boolean;        // Controls whether the modal is visible on screen.
  onClose: () => void;  // Callback function to let the parent know the modal wants to close.
  mode?: 'auth' | 'join' | 'edit'; // Optional prop dictating the starting view state.
  user?: User | null;   // Optional prop passing the current user data (crucial for 'edit' mode).
}

/**
 * AuthModal Component
 * 
 * This component acts as a high-level container (a "Modal Shell"). 
 * It is completely unaware of *how* authentication works under the hood; instead, 
 * it only cares about *displaying* the `UserAuth` component inside a dialog box over 
 * the current page, and managing the internal state of which UI form is currently visible 
 * (Login vs Registration).
 */
const AuthModal: React.FC<AuthModalProps> = ( { show, onClose, mode = 'auth', user = null } ) =>
{
  /**
   * Internal State: currentMode
   * 
   * Even though the parent component passed in a `mode` prop, we store it in local state.
   * Why? Because we want the user to be able to click a "Switch to Sign Up" link *inside* 
   * the modal without having to tell the parent component to re-render the whole page.
   */
  const [ currentMode, setCurrentMode ] = useState( mode );

  /**
   * Effect Hook
   * 
   * This ensures that if the *parent* component forcibly changes the `mode` prop 
   * (e.g., clicking a specific "Edit Profile" button elsewhere on the site while the 
   * modal is already open), our internal state updates to match reality.
   */
  useEffect( () =>
  {
    setCurrentMode( mode );
  }, [ mode ] ); // Only re-run this effect if the `mode` prop literally changes.

  /**
   * A simple helper function to invert the current auth view.
   * If they are on Login, switch to Join, and vice versa.
   */
  const toggleMode = () =>
  {
    if ( currentMode === 'auth' )
    {
      setCurrentMode( 'join' );
    } else if ( currentMode === 'join' )
    {
      setCurrentMode( 'auth' );
    }
  };

  return (
    // React Bootstrap's Modal automatically handles accessibility (ARIA attributes),
    // keyboard navigation (closing on Esc), and background backdrop rendering.
    <Modal show={ show } onHide={ onClose } centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {/* Dynamic Header: Adjust the title based on what the user is currently doing */}
          { currentMode === 'edit' ? 'Edit Your Profile' : 'Welcome to MusicPort' }
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* 
          * The core form logic. We pass down the required props.
          * Notice how `UserAuth` does the heavy lifting, keeping this Modal component incredibly thin.
          */}
        <UserAuth onClose={ onClose } mode={ currentMode } user={ user } />

        {/* 
          * Conditional Rendering
          * We only show the "Don't have an account?" toggle link if they are in 
          * Login ('auth') or Registration ('join') mode.
          * If they are in 'edit' mode, this link doesn't make logical sense, so we hide it.
          */}
        { ( currentMode === 'auth' || currentMode === 'join' ) && (
          <div className='text-center mt-3'>
            <button id='link' className='btn btn-link' onClick={ toggleMode }>
              { currentMode === 'auth'
                ? "Don't have an account? Join"
                : 'Already have an account? Sign In' }
            </button>
          </div>
        ) }
      </Modal.Body>
    </Modal>
  );
};


// Export the component so it can be imported and used in other files..
export default AuthModal;