import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import AppleStrategy from 'passport-apple';
import prisma from '../database/dbConnection';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

/**
 * =========================================
 * PassportJS Strategy Configuration
 * =========================================
 * Architectural Pattern: Delegation / Dependency Injection for Authentication.
 * Purpose: Centralizes the exact logic for how users verify their identities. 
 * Allows the application to seamlessly support Username/Password, Google OAuth, 
 * and Apple ID without tightly coupling the login logic directly into the route controllers.
 */

// -- Local Strategy: Standard Email & Password Validation --
passport.use( new LocalStrategy( {
    usernameField: 'identifier', // Explicitly maps the incoming `req.body.identifier` to the strategy.
    passwordField: 'password'
}, async ( identifier, password, done ) =>
{
    try
    {
        // Database Verification: Check against BOTH standard emails and physical usernames.
        const user = await prisma.user.findFirst( {
            where: { OR: [ { email: identifier }, { name: identifier } ] }
        } );

        // Security UX: Generic failure messages prevent bad actors from guessing valid emails.
        if ( !user ) return done( null, false, { message: 'Incorrect username or email.' } );
        
        // OAuth Safety Catch: Prevent users who signed up via Google from crashing the Local strategy.
        if ( !user.password ) return done( null, false, { message: 'Please login with your social account.' } );

        // Cryptographic Verification: Compare the raw string against the deeply hashed PostgreSQL record securely.
        const isMatch = await bcrypt.compare( password, user.password );
        if ( !isMatch ) return done( null, false, { message: 'Incorrect password.' } );

        // Successfully authenticated the payload. Yielding user back to the caller.
        return done( null, user );
    } catch ( err )
    {
        return done( err ); // Yield strict 500 error if PostgreSQL goes offline.
    }
} ) );

// -- Google Strategy: OAuth2.0 Integration --
passport.use( new GoogleStrategy( {
    clientID: process.env.GOOGLE_CLIENT_ID || 'place_holder_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'place_holder_secret',
    callbackURL: "/api/auth/google/callback" // URL Google hits synchronously upon successful sign-in.
}, async ( accessToken, refreshToken, profile, done ) =>
{
    try
    {
        // 1. Existing OAuth Check: Determine if this physical Google ID has logged in before.
        let user = await prisma.user.findUnique( { where: { googleId: profile.id } } );
        if ( user )
        {
            const updatedUser = await prisma.user.update( {
                where: { id: user.id },
                data: { lastLogin: new Date() }
            } );
            return done( null, updatedUser );
        }

        // 2. Email Crosspollination Check: Did this user sign up manually earlier using the identical Gmail address?
        const email = profile.emails?.[ 0 ]?.value;
        if ( email )
        {
            user = await prisma.user.findUnique( { where: { email } } );
            if ( user )
            {
                // Unify accounts: Soft-link the Google ID to their existing local account.
                const updatedUser = await prisma.user.update( {
                    where: { id: user.id },
                    data: { googleId: profile.id, lastLogin: new Date() }
                } );
                return done( null, updatedUser );
            }
        }

        // 3. Complete Cold Signup: Automatically register a brand new user row utilizing Google's data.
        const newUser = await prisma.user.create( {
            data: {
                googleId: profile.id,
                name: profile.displayName || 'Google User',
                email: email || `${ profile.id }@google.com`,
                photo: profile.photos?.[ 0 ]?.value || 'default.png',
                lastLogin: new Date()
            }
        } );

        done( null, newUser );
    } catch ( err )
    {
        done( err, undefined );
    }
} ) );

// -- Apple Strategy --
if ( process.env.APPLE_CLIENT_ID )
{
    passport.use( new AppleStrategy( {
        clientID: process.env.APPLE_CLIENT_ID || '',
        teamID: process.env.APPLE_TEAM_ID || '',
        keyID: process.env.APPLE_KEY_ID || '',
        privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH ? path.join( __dirname, '../../', process.env.APPLE_PRIVATE_KEY_PATH ) : '',
        callbackURL: "/api/auth/apple/callback",
        passReqToCallback: true
    }, async ( req, accessToken, refreshToken, idToken, profile, done ) =>
    {
        try
        {
            // Apple uniquely identifies users via a `sub` claims string within the encrypted idToken.
            const appleId = ( idToken as any ).sub;
            let user = await prisma.user.findUnique( { where: { appleId } } );
            
            // Fast fail-forward if this user has previously linked their Apple ID.
            if ( user ) return done( null, user );

            // Apple only shares the user's real email on the *very first* authentication event.
            // On subsequent logins, this field is completely stripped for privacy. 
            // We must aggressively capture and cross-pollinate it against existing manual accounts if present.
            const email = ( idToken as any ).email;
            if ( email )
            {
                user = await prisma.user.findUnique( { where: { email } } );
                if ( user )
                {
                    const updatedUser = await prisma.user.update( {
                        where: { id: user.id },
                        data: { appleId }
                    } );
                    return done( null, updatedUser );
                }
            }

            // Fallback: If no previous manual account exists under this Apple email, we blindly generate a new Row.
            const fullName = ( profile && ( profile as any ).name )
                ? `${ ( profile as any ).name.firstName } ${ ( profile as any ).name.lastName }`.trim()
                : 'Apple User';

            const newUser = await prisma.user.create( {
                data: {
                    appleId,
                    email: email || `${ appleId }@privaterelay.appleid.com`, // Fallback dummy relay email if hidden by Apple's 'Hide My Email' feature.
                    name: fullName
                }
            } );

            done( null, newUser );
        } catch ( err: any )
        {
            done( err, undefined );
        }
    } ) );
}

export default passport;
