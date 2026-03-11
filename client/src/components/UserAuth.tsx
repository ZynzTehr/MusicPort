// Import necessary React hooks and global Context.
import React, { useState, useContext, useEffect, ChangeEvent, FormEvent } from 'react';
import { AuthContext, User } from '../context/AuthContext';

/**
 * Environment & Network Configuration
 * Points to the backend Express server. Dynamically adapts via Vite environment variables.
 */
const API = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace( '/api', '' ) : 'http://localhost:4000';

/**
 * TypeScript Interface: UserAuthProps
 * 
 * Defines the configuration options for this multi-purpose modal.
 * `mode` acts as a Discriminated Union, strictly forcing the component to render 
 * its internal UI as either a Login, Registration, or Profile Editing form.
 */
interface UserAuthProps
{
  onClose: () => void;
  mode?: 'auth' | 'join' | 'edit'; // Strict type-locking.
  user?: User | null;              // Passed down *only* if the user is actively logged in.
}

/**
 * UserAuth Component
 * 
 * Architectural Pattern: "God" Form Component / Context Consumer.
 * This is arguably the most complex form in the application. Instead of building three 
 * separate forms (Login, Signup, EditProfile), we built one massive state engine that 
 * dynamically switches its UI and API targets based on the `mode` prop.
 */
const UserAuth: React.FC<UserAuthProps> = ( { onClose, mode = 'auth', user = null } ) =>
{
  const authContext = useContext( AuthContext );

  // If context is undefined, we return null (or loading state) to prevent crash
  if ( !authContext ) return null;

  const {
    signUp,
    signIn,
    updateProfile,
    deleteAccount,
    authMessage,
    setAuthMessage
  } = authContext;

  // Determine if we're in "edit profile" mode..
  const isEditMode = mode === 'edit';

  // Initialize form fields based on the mode and whether a user object was passed in..
  const [ formData, setFormData ] = useState( {
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    bio: user?.bio || '',
    photo: user?.photo || '',
    identifier: ''
  } );

  const [showPassword, setShowPassword] = useState(false);

  /**
   * Complex State: File Attachments
   * The browser's `<input type="file">` does not play nicely with standard controlled 
   * text inputs. We must isolate the physical `File` object in its own state node 
   * so we can inject it into a `FormData` payload during submission.
   */
  const [ selectedFile, setSelectedFile ] = useState<File | null>( null );

  const handleFileChange = ( event: ChangeEvent<HTMLInputElement> ) =>
  {
    // Deep access: Navigate the Synthetic Event to extract the physical file blob.
    if ( event.target.files && event.target.files.length > 0 )
    {
      setSelectedFile( event.target.files[ 0 ] );
    }
  };

  // Clear alert message after 1.6 seconds if it exists..
  useEffect( () =>
  {
    if ( authMessage )
    {
      const timer = setTimeout( () =>
      {
        setAuthMessage( '' );
      }, 1600 );
    }
  }, [ authMessage, setAuthMessage ] );

  // Handle form submission for sign up, sign in, or profile update..
  const handleSubmit = async ( event: FormEvent ) =>
  {
    event.preventDefault();
    let success = false;

    // Sanitize all input by trimming whitespace..
    const trimmedFormData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      bio: formData.bio.trim(),
      photo: formData.photo.trim(),
      identifier: formData.identifier.trim()
    };

    // The strict security policy regex (Must contain Upper, Lower, Num, Special, and be 8+ chars).
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    /**
     * Architectural Branching:
     * We analyze `isEditMode` and `mode` to decide which Context method to fire.
     * Note the usage of `new FormData()` instead of a standard JSON object.
     * This is an absolute requirement for transmitting `multipart/form-data` (images) to the Node server.
     */
    if ( isEditMode )
    {
      if ( trimmedFormData.password && !passwordRegex.test( trimmedFormData.password ) )
      {
        setAuthMessage( 'Password must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special char.' );
        return;
      }

      const userData = new FormData();
      userData.append( 'name', trimmedFormData.name ); // The key must match your backend parser
      userData.append( 'email', trimmedFormData.email ); // The key must match your backend parser
      userData.append( 'password', trimmedFormData.password ); // The key must match your backend parser
      userData.append( 'bio', trimmedFormData.bio ); // The key must match your backend parser
      if ( selectedFile ) userData.append( 'photo', selectedFile ); // The 'photo' key must match your backend parser

      success = await updateProfile( userData ); // Update profile..
    } else if ( mode === 'join' )
    {
      if ( !passwordRegex.test( trimmedFormData.password ) )
      {
        setAuthMessage( 'Password must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special char.' );
        return;
      }

      const userData = new FormData();
      userData.append( 'name', trimmedFormData.name ); // The key must match your backend parser
      userData.append( 'email', trimmedFormData.email ); // The key must match your backend parser
      userData.append( 'password', trimmedFormData.password ); // The key must match your backend parser
      userData.append( 'bio', trimmedFormData.bio ); // The key must match your backend parser
      if ( selectedFile ) userData.append( 'photo', selectedFile ); // The 'photo' key must match your backend parser

      success = await signUp( userData ); // Create new user..
    } else
    {
      success = await signIn( trimmedFormData.identifier, trimmedFormData.password ); // Log in user..
    }

    // If successful, reset form and close modal..
    setFormData( { name: '', email: '', password: '', bio: '', photo: '', identifier: '' } );
    setTimeout( () =>
    {
      if ( success )
      {
        onClose();
      }
    }, 1620 );

  };

  // Confirm and handle account deletion
  const handleDeleteAccount = async () =>
  {
    // const confirmed = window.confirm('Are you sure you want to delete your account? This cannot be undone.');
    // if (confirmed) {
    const success = await deleteAccount();
    setTimeout( () =>
    {
      if ( success ) onClose();
    }, 1620 );
    // }
  };

  return (
    <>
      {/* Heading based on the mode */ }
      { isEditMode ?
        <div className='d-flex justify-content-center'>
          <figure>
            <img id='user' className='m-0 img-thumbnail rounded-circle' src={ `${ API }/userProfileImgs/${ formData.photo }` } alt={ `${ formData.name }'s profile photo` } style={ { width: '150px', height: '150px', objectFit: 'cover' } } />
            {/* <img id='user' className='m-0 img-thumbnail' src={`../assets/uploads/${formData.photo}`} alt={`${formData.name}'s profile photo`}></img> */ }
          </figure>
          {/* <figcaption className='mx-auto'>{formData.bio}</figcaption> */ }
        </div> : '' }
      <h5 className="mb-3 text-center">
        { isEditMode
          ? 'Edit Your Profile'
          : mode === 'join'
            ? 'Create Your Account'
            : 'Sign In to MusicPort' }
      </h5>

      {/* Show auth message if available */ }
      { authMessage && (
        <div className="alert alert-success text-center py-2">{ authMessage }</div>
      ) }

      {/* Auth form */ }
      <form key={ mode } onSubmit={ handleSubmit } encType={ mode === 'join' || isEditMode ? 'multipart/form-data' : undefined }>
        {/* If in join or edit mode, show name and email inputs */ }
        { isEditMode || mode === 'join' ? (
          <>
            <div className='form-group form-floating mb-2'>
              <input
                id='username'
                type="text"
                className="form-control"
                placeholder="Username"
                required
                value={ formData.name }
                onChange={ ( event ) => setFormData( { ...formData, name: event.target.value } ) }
              />
              <label htmlFor="username">Username</label>
            </div>
            <div className='form-group form-floating mb-2'>
              <input
                id='email'
                type="email"
                className="form-control"
                placeholder="Email"
                required
                value={ formData.email }
                onChange={ ( event ) => setFormData( { ...formData, email: event.target.value } ) }
              />
              <label htmlFor="email">Email</label>
            </div>
          </>
        ) : (
          // Sign in input "username or email"..
          <>
            <div className='form-group form-floating mb-2'>
              <input
                id='username_email'
                type='text'
                className='form-control'
                placeholder='Username or Email'
                required
                value={ formData.identifier }
                onChange={ ( event ) => setFormData( { ...formData, identifier: event.target.value } ) }
              />
              <label htmlFor='username_email'>Username or Email</label>
            </div>
          </>
        ) }

        {/* Password field is always shown */}
        <div className='form-group form-floating mb-3 position-relative'>
          <input
            id='password'
            type={showPassword ? 'text' : 'password'}
            className='form-control'
            placeholder={ isEditMode ? 'New Password (optional)' : 'Password' }
            value={ formData.password }
            onChange={ ( event ) => setFormData( { ...formData, password: event.target.value } ) }
            style={{ paddingRight: '45px' }} // Prevent password dots from hitting the icon
          />
          <label htmlFor="password">{ isEditMode ? 'New Password "optional"' : 'Password' }</label>
          <i
            className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} position-absolute`}
            style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#666', zIndex: 10, fontSize: '1.2rem' }}
            onClick={() => setShowPassword(!showPassword)}
          ></i>
        </div>

        {/* Bio textarea only shown in join or edit modes */ }
        { ( isEditMode || mode === 'join' ) && (
          <>

            <div className='form-group form-floating mb-3'>
              <textarea
                id='txtarea'
                className='form-control'
                placeholder='Short bio "Optional"'
                rows={ 4 }
                value={ formData.bio }
                onChange={ ( event ) => setFormData( { ...formData, bio: event.target.value } ) }
              />
              <label htmlFor='txtarea'>Short bio "Optional"</label>
            </div>

            <div className='form-group form-floating mb-3'>
              <input
                id='photo'
                type='file'
                accept='image/*'
                className='form-control'
                // value={formData.photo}
                onChange={ handleFileChange }
              />
              <label className='' htmlFor='photo'>Profile Picture "Optional"</label>
            </div>
          </>
        ) }

        {/* Submit button text depends on the mode */ }
        <button className='btn btn-dark w-100 rounded-pill' type='submit'>
          { isEditMode ? 'Update Profile' : mode === 'join' ? 'Join' : 'Sign In' }
        </button>
      </form>

      {/* Delete account button only shown in edit mode */ }
      { isEditMode && (
        <div className="text-center mt-3">
          <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={ handleDeleteAccount }>
            <span className='i p-4 py-2'>Delete Profile<i className="fa fa-fw ms-1" aria-hidden="true" title="Copy to use trash-alt"></i></span>
          </button>
        </div>
      ) }
    </>
  );
};


// Export the component so it can be imported and used in other files..
export default UserAuth;