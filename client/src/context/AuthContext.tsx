// Import React tools and backend API methods..
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import
{
  signInUser,
  signUpUser,
  updateUserProfile,
  deleteUserAccount
} from '../api/auth';

export interface User
{
  _id: string;
  name: string;
  email: string;
  [ key: string ]: any; // Allow other properties for now
}

interface AuthContextType
{
  user: User | null;
  signUp: ( formData: any ) => Promise<boolean>;
  signIn: ( identifier: string, password: string ) => Promise<boolean>;
  signOut: () => void;
  updateProfile: ( formData: any ) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  authMessage: string;
  setAuthMessage: ( message: string ) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>( undefined );

// AuthProvider component that wraps the app and shares auth state globally..
export const AuthProvider: React.FC<{ children: ReactNode; }> = ( { children } ) =>
{
  // Store the logged-in user (null means no user signed in)..
  const [ user, setUser ] = useState<User | null>( null );

  // Store any auth-related messages (success/failure alerts)..
  const [ authMessage, setAuthMessage ] = useState( '' );

  // On first load, check localStorage for a previously logged-in user..
  useEffect( () =>
  {
    const stored = sessionStorage.getItem( 'user' );
    if ( stored )
    {
      setUser( JSON.parse( stored ) ); // Restore user from sessionStorage..
    }
  }, [] );

  const signUp = async ( formData: any ) =>
  {
    try
    {
      const res = await signUpUser( formData );  // Send signup request to API..
      const newUser = res.data.user; // Send User data to the backend..
      setUser( newUser ); // Update React state
      sessionStorage.setItem( 'token', res.data.token ); // Persist in sessionStorage..
      sessionStorage.setItem( 'user', JSON.stringify( newUser ) ); // Persist in sessionStorage..
      setAuthMessage( `Welcome ${ newUser.name }!` ); // Show this message to user if successful..
      return true;
    } catch ( err )
    {
      console.error( 'Sign up error:', err );
      setAuthMessage( `${ ( err as any ).response.data.message }` ); // Show this message to user if unsuccessful..
      // setAuthMessage('Sign up failed.'); // Show this message to user if unsuccessful..
      return false;
    }
  };

  const signIn = async ( identifier: string, password: string ) =>
  {
    try
    {
      const res = await signInUser( identifier, password ); // Send login request..
      const loggedInUser = res.data.user; // Send User certifications to the backend..
      console.log( loggedInUser );
      setUser( loggedInUser ); // Save user state..
      sessionStorage.setItem( 'token', res.data.token ); // Save token to sessionStorage..
      sessionStorage.setItem( 'user', JSON.stringify( loggedInUser ) ); // Save to sessionStorage..
      setAuthMessage( `Welcome back, ${ loggedInUser.name }!` ); // Show this message to user if successful..
      return true;
    } catch ( err )
    {
      console.error( 'Sign in error:', err );
      setAuthMessage( `${ ( err as any ).response.data.message }` ); // Show this message to user if unsuccessful..
      // setAuthMessage('Sign in failed.'); // Show this message to user if unsuccessful..
      return false;
    }
  };

  // const updateProfile = async (updatedData) => {
  //   try {
  //     // Include userId in the update payload for the backend..
  //     const res = await updateUserProfile({ ...updatedData, userId: user._id });
  //     const updatedUser = res.data.user; // Send user's updated data to backend..
  //     setUser(updatedUser); // Update state..
  //     sessionStorage.setItem('user', JSON.stringify(updatedUser)); // Persist updates..
  //     setAuthMessage('Profile updated successfully.'); // Show this message to user if successful..
  //     return true;
  //   } catch (err) {
  //     console.error('Update profile error:', err);
  //     setAuthMessage(`${err.response.data.message}`); // Show this message to user if unsuccessful..
  //     // setAuthMessage('Profile update failed.'); // Show this message to user if unsuccessful..
  //     return false;
  //   }
  // };

  const updateProfile = async ( formData: any ) =>
  {
    try
    {
      // Append userId to FormData to update payload for the backend..
      if ( user ) formData.append( 'userId', user._id );

      const res = await updateUserProfile( formData );

      const updatedUser = res.data.user; // Send user's updated data to backend..
      setUser( updatedUser ); // Update React state..
      sessionStorage.setItem( 'token', res.data.token ); // Save token to sessionStorage..
      sessionStorage.setItem( 'user', JSON.stringify( updatedUser ) ); // Persist updates..
      setAuthMessage( 'Profile updated successfully.' ); // Show this message to user if successful..
      return true; // Return true to indicate success
    } catch ( err )
    {
      console.error( 'Update profile error:', err ); // Log error for debugging
      setAuthMessage( ( err as any ).response?.data?.message || 'Profile update failed.' ); // Show error message or default failure message
      return false; // Return false to indicate failure
    }
  };


  const signOut = () =>
  {
    setUser( null ); // Clear state
    sessionStorage.removeItem( 'user' ); // Remove from sessionStorage
    setAuthMessage( '' );
  };

  const deleteAccount = async () =>
  {
    try
    {
      if ( user ) await deleteUserAccount( user._id ); // Request backend to delete user..
      setUser( null );  // Clear user state..
      sessionStorage.removeItem( 'user' );   // Remove from sessionStorage..
      setAuthMessage( 'Account deleted.' ); // Show this message to user if successful..
      return true;
    } catch ( err )
    {
      console.error( 'Delete account error:', err );
      setAuthMessage( `${ ( err as any ).response.data.message }` ); // Show this message to user if unsuccessful..
      // setAuthMessage('Account deletion failed.'); // Show this message to user if unsuccessful..
      return false;
    }
  };

  // Provide all auth state + functions to children of this provider
  return (
    <AuthContext.Provider
      value={ {
        user, // Current logged-in user or null if no user is signed in..
        signUp, // Function to handle user signup..
        signIn, // Function to handle user login..
        signOut, // Function to handle user logout..
        updateProfile, // Function to update user profile..
        deleteAccount, // Function to delete user account..
        authMessage, // Any auth-related message to show to the user..
        setAuthMessage // Function to set the auth message..
      } }
    >
      { children } {/* Render all children inside this provider */ }
    </AuthContext.Provider>
  );
};