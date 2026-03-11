import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/AuthForm.css';

/**
 * AuthForm Component
 * 
 * This is the primary authentication interface for the application (typically used on landing pages).
 * It acts as a dual-purpose component, cleanly handling both the "Login" and "Sign Up" flows 
 * by toggling internal React state. 
 * 
 * As a senior developer, I appreciate this pattern because it keeps all auth-related UI 
 * in one place, reducing code duplication. However, it relies heavily on the `AuthContext` 
 * to actually perform the communication with the backend APIs.
 */
const AuthForm: React.FC = () =>
{
    // --- Internal State Management ---
    // isSignup toggles the UI between the login form (false) and the registration form (true).
    const [ isSignup, setIsSignup ] = useState<boolean>( false );
    
    // Visibility Toggles for complex password UX requirements.
    const [ showPassword, setShowPassword ] = useState<boolean>( false );
    const [ showRepeatPassword, setShowRepeatPassword ] = useState<boolean>( false );
    
    // formData holds the controlled inputs for the form fields.
    const [ formData, setFormData ] = useState( {
        name: '',
        email: '',
        password: '',
        repeatPassword: ''
    } );
    
    // formErrors is a dictionary tracking which specific fields currently fail validation requirements.
    const [ formErrors, setFormErrors ] = useState<{ [ key: string ]: boolean; }>( {} );
    
    // isValid is a derived boolean tracking if the entire form is completely valid to submit.
    const [ isValid, setIsValid ] = useState<boolean>( false );
    
    // hasSubmitted prevents validation errors from showing up *before* the user has even tried to submit once.
    const [ hasSubmitted, setHasSubmitted ] = useState<boolean>( false );

    // --- Global Context & Navigation ---
    // We hook into our global authentication context to get access to the actual API functions.
    const authContext = useContext( AuthContext );

    // React Router's hook to programmatically redirect the user after a successful action.
    const navigate = useNavigate();

    // Safety checks: Context can technically be undefined if this component isn't wrapped in the Provider.
    const signIn = authContext?.signIn;
    const signUp = authContext?.signUp;

    /**
     * Validation Effect Hook
     * 
     * This `useEffect` runs continuously whenever `formData` or `isSignup` changes.
     * It is responsible for live, client-side validation *before* we ever touch the server.
     * We do this to provide immediate feedback to the user experience (UX).
     */
    useEffect( () =>
    {
        // Strict regex matching for 8+ length, uppercase, lowercase, number, and special character.
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const errors: { [ key: string ]: boolean; } = {};
        
        // Contextual validation: Only check 'name' if we are actually signing up.
        if ( isSignup && !formData.name ) errors.name = true;
        if ( !formData.email ) errors.email = true;
        if ( !formData.password || !passwordRegex.test(formData.password) ) errors.password = true;
        // Password confirmation matching check.
        if ( isSignup && formData.password !== formData.repeatPassword ) errors.repeatPassword = true;

        setFormErrors( errors );
        
        // If the errors object has no keys (length 0), the form is perfectly valid.
        setIsValid( Object.keys( errors ).length === 0 );
    }, [ formData, isSignup ] );

    /**
     * Standard controlled-input handler.
     * Dynamically updates the specific field in `formData` based on the HTML `name` attribute of the input.
     */
    const handleChange = ( e: React.ChangeEvent<HTMLInputElement> ) =>
    {
        setFormData( { ...formData, [ e.target.name ]: e.target.value } );
    };

    /**
     * Form Submission Handler
     * Orchestrates the actual API calls depending on whether the user is logging in or signing up.
     */
    const handleSubmit = async ( e: React.FormEvent ) =>
    {
        e.preventDefault(); // Prevent standard browser POST refresh.
        setHasSubmitted( true ); // Flag that the user tried to submit, allowing errors to physically render.
        
        if ( !isValid ) return; // Stop executing if our prior `useEffect` flagged errors.

        let success = false;

        if ( isSignup )
        {
            // Prepare FormData for signup. The backend expects multipart/form-data 
            // (often required if they later decide to include avatar photo uploads during signup).
            const signupData = new FormData();
            signupData.append( 'name', formData.name );
            signupData.append( 'email', formData.email );
            signupData.append( 'password', formData.password );
            
            // Hardcoding a blank bio as an optional default.
            signupData.append( 'bio', '' );

            if ( signUp ) success = await signUp( signupData );
        } else
        {
            // Login relies on standard JSON execution (expects identifier and password).
            // This maps gracefully down to the context provider functions.
            if ( signIn ) success = await signIn( formData.email, formData.password );
        }

        if ( success )
        {
            // Only redirect if the context function explicitly returned true.
            navigate( '/home' );
        } else
        {
            console.error( "Authentication failed" );
        }
    };

    return (
        <div className="auth-wrapper">
            <h2 className="mb-4">{ isSignup ? 'Sign Up' : 'Login' }</h2>
            <div className="error-msg">
                { hasSubmitted && formErrors.password && formData.password && 'Password must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special char.' }
                { hasSubmitted && formErrors.repeatPassword && 'Passwords do not match.' }
            </div>

            <form className="auth-form" onSubmit={ handleSubmit }>
                
                {/* Conditional Rendering: Only render the Name field if currently attempting a signup */}
                { isSignup && (
                    <div className={ `input-group ${ hasSubmitted && formErrors.name && formData.name === '' ? 'error' : '' }` }>
                        <label><i className="bi bi-person"></i></label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={ formData.name }
                            onChange={ handleChange }
                        />
                    </div>
                ) }

                {/* Email is always required in both contexts */}
                <div className={ `input-group ${ hasSubmitted && formErrors.email && formData.email === '' ? 'error' : '' }` }>
                    <label>@</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={ formData.email }
                        onChange={ handleChange }
                    />
                </div>

                <div className={ `input-group position-relative ${ hasSubmitted && formErrors.password && formData.password !== '' ? 'error' : '' }` }>
                    <label><i className="bi bi-lock"></i></label>
                    <input
                        type={ showPassword ? 'text' : 'password' }
                        name="password"
                        placeholder="Password"
                        value={ formData.password }
                        onChange={ handleChange }
                        style={{ paddingRight: '40px' }} // Prevent text from colliding with the absolute eye icon
                    />
                    {/* Absolute positioned eye toggle */}
                    <i 
                        className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} position-absolute`} 
                        style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#666', zIndex: 10 }}
                        onClick={() => setShowPassword(!showPassword)}
                    ></i>
                </div>

                {/* Password confirmation only required during initial creation phase */}
                { isSignup && (
                    <div className={ `input-group position-relative ${ hasSubmitted && formErrors.repeatPassword ? 'error' : '' }` }>
                        <label><i className="bi bi-lock-fill"></i></label>
                        <input
                            type={ showRepeatPassword ? 'text' : 'password' }
                            name="repeatPassword"
                            placeholder="Repeat Password"
                            value={ formData.repeatPassword }
                            onChange={ handleChange }
                            style={{ paddingRight: '40px' }} 
                        />
                         <i 
                            className={`bi ${showRepeatPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} position-absolute`} 
                            style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#666', zIndex: 10 }}
                            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                        ></i>
                    </div>
                ) }

                {/* The submit button conditionally styles itself active only if the internal useEffect flag declares validation clean */}
                <button
                    type="submit"
                    className={ `submit-btn ${ isValid ? 'active' : '' }` }
                >
                    { isSignup ? 'Sign Up' : 'Log In' }
                </button>
            </form>

            <div className="toggle-text">
                { isSignup ? 'Already have an account? ' : "Don't have an account? " }
                {/* 
                  * Toggle Switcher: Inverts the internal `isSignup` boolean.
                  * The UI dynamically re-renders based on this flip.
                  */}
                <span className="toggle-link" onClick={ () => setIsSignup( !isSignup ) }>
                    { isSignup ? 'Log In' : 'Sign Up' }
                </span>
            </div>

            <button className="guest-btn" onClick={ () => navigate( '/home' ) }>
                Continue as Guest
            </button>
        </div>
    );
};

export default AuthForm;
