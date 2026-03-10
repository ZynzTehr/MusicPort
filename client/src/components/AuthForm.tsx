import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/AuthForm.css';

const AuthForm: React.FC = () =>
{
    const [ isSignup, setIsSignup ] = useState<boolean>( false );
    const [ formData, setFormData ] = useState( {
        name: '',
        email: '',
        password: '',
        repeatPassword: ''
    } );
    const [ formErrors, setFormErrors ] = useState<{ [ key: string ]: boolean; }>( {} );
    const [ isValid, setIsValid ] = useState<boolean>( false );
    const [ hasSubmitted, setHasSubmitted ] = useState<boolean>( false );

    const authContext = useContext( AuthContext );

    // Safety check for context
    const signIn = authContext?.signIn;
    const signUp = authContext?.signUp;
    const navigate = useNavigate();

    useEffect( () =>
    {
        const errors: { [ key: string ]: boolean; } = {};
        if ( isSignup && !formData.name ) errors.name = true;
        if ( !formData.email ) errors.email = true;
        if ( !formData.password || formData.password.length < 8 ) errors.password = true;
        if ( isSignup && formData.password !== formData.repeatPassword ) errors.repeatPassword = true;

        setFormErrors( errors );
        setIsValid( Object.keys( errors ).length === 0 );
    }, [ formData, isSignup ] );

    const handleChange = ( e: React.ChangeEvent<HTMLInputElement> ) =>
    {
        setFormData( { ...formData, [ e.target.name ]: e.target.value } );
    };

    const handleSubmit = async ( e: React.FormEvent ) =>
    {
        e.preventDefault();
        setHasSubmitted( true );
        if ( !isValid ) return;

        let success = false;

        if ( isSignup )
        {
            // Prepare FormData for signup (backend expects this format)
            const signupData = new FormData();
            signupData.append( 'name', formData.name );
            signupData.append( 'email', formData.email );
            signupData.append( 'password', formData.password );
            // Optional fields defaults
            signupData.append( 'bio', '' );
            // Photo is optional, not sending it here

            if ( signUp ) success = await signUp( signupData );
        } else
        {
            // Login (expects identifier and password)
            if ( signIn ) success = await signIn( formData.email, formData.password );
        }

        if ( success )
        {
            navigate( '/home' );
        } else
        {
            // You might want to show an error message here (AuthContext handles setting authMessage)
            console.error( "Authentication failed" );
        }
    };

    return (
        <div className="auth-wrapper">
            <h2 className="mb-4">{ isSignup ? 'Sign Up' : 'Login' }</h2>
            <div className="error-msg">
                { hasSubmitted && formErrors.password && formData.password && 'Password must be at least 8 chars.' }
                { hasSubmitted && formErrors.repeatPassword && 'Passwords do not match.' }
            </div>

            <form className="auth-form" onSubmit={ handleSubmit }>
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

                <div className={ `input-group ${ hasSubmitted && formErrors.password && formData.password !== '' ? 'error' : '' }` }>
                    <label><i className="bi bi-lock"></i></label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={ formData.password }
                        onChange={ handleChange }
                    />
                </div>

                { isSignup && (
                    <div className={ `input-group ${ hasSubmitted && formErrors.repeatPassword ? 'error' : '' }` }>
                        <label><i className="bi bi-lock-fill"></i></label>
                        <input
                            type="password"
                            name="repeatPassword"
                            placeholder="Repeat Password"
                            value={ formData.repeatPassword }
                            onChange={ handleChange }
                        />
                    </div>
                ) }

                <button
                    type="submit"
                    className={ `submit-btn ${ isValid ? 'active' : '' }` }
                >
                    { isSignup ? 'Sign Up' : 'Log In' }
                </button>
            </form>

            <div className="toggle-text">
                { isSignup ? 'Already have an account? ' : "Don't have an account? " }
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
