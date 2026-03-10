// Import necessary React hooks and AuthContext..
import React, { useState, useContext, useEffect, ChangeEvent, FormEvent } from 'react';
import { AuthContext, User } from '../context/AuthContext';

// Define the base API URL using the environment variable..
const API = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace( '/api', '' ) : 'http://localhost:4000';


interface UserAuthProps
{
  onClose: () => void;
  mode?: 'auth' | 'join' | 'edit';
  user?: User | null;
}

// UserAuth handles signup, login, edit profile, and delete account
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
  ``;
  // console.log('photo:', formData.photo)

  // Initialize form field for file upload based on the mode and whether a user object was passed in..
  const [ selectedFile, setSelectedFile ] = useState<File | null>( null );

  const handleFileChange = ( event: ChangeEvent<HTMLInputElement> ) =>
  {
    // Access the selected file from the event object
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

    // Route the request to the appropriate context method..
    if ( isEditMode )
    {

      const userData = new FormData();
      userData.append( 'name', trimmedFormData.name ); // The key must match your backend parser
      userData.append( 'email', trimmedFormData.email ); // The key must match your backend parser
      userData.append( 'password', trimmedFormData.password ); // The key must match your backend parser
      userData.append( 'bio', trimmedFormData.bio ); // The key must match your backend parser
      if ( selectedFile ) userData.append( 'photo', selectedFile ); // The 'photo' key must match your backend parser

      success = await updateProfile( userData ); // Update profile..
    } else if ( mode === 'join' )
    {

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
            <img id='user' className='m-0 img-thumbnail rounded-circle' src={ `${ API }/userProfileImgs/${ formData.photo }` } alt={ `${ formData.name }'s profile photo` } style= { { width: '150px', height: '150px', objectFit: 'cover' } } />
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

        {/* Password field is always shown */ }

        <div className='form-group form-floating mb-3'>
          <input
            id='password'
            type='password'
            className='form-control'
            placeholder={ isEditMode ? 'New Password (optional)' : 'Password' }
            value={ formData.password }
            onChange={ ( event ) => setFormData( { ...formData, password: event.target.value } ) }
          />
          <label htmlFor="password">{ isEditMode ? 'New Password "optional"' : 'Password' }</label>
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