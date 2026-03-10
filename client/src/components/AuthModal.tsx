
// Import React tools and Bootstrap modal..
import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';

// Import the form component used for sign in / sign up / edit profile..
import UserAuth from './UserAuth';
import { User } from '../context/AuthContext';

interface AuthModalProps
{
  show: boolean;
  onClose: () => void;
  mode?: 'auth' | 'join' | 'edit';
  user?: User | null;
}

// AuthModal receives props: show (bool), onClose (function), mode (string), and optional user object..
const AuthModal: React.FC<AuthModalProps> = ( { show, onClose, mode = 'auth', user = null } ) =>
{
  // Internal state to control the current view: 'auth', 'join', or 'edit'..
  const [ currentMode, setCurrentMode ] = useState( mode );

  // Update internal mode state when parent prop changes "important for switching context"..
  useEffect( () =>
  {
    setCurrentMode( mode );
  }, [ mode ] );

  // Toggle between "Sign In" and "Join" modes..
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
    <Modal show={ show } onHide={ onClose } centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {/* Modal title changes based on current mode */ }
          { currentMode === 'edit' ? 'Edit Your Profile' : 'Welcome to MusicPort' }
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Render the UserAuth form with the current mode and optional user info */ }
        <UserAuth onClose={ onClose } mode={ currentMode } user={ user } />

        {/* Toggle link shown only in 'auth' and 'join' modes */ }
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