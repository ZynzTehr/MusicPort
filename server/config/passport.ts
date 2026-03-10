import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import AppleStrategy from 'passport-apple';
import User, { IUser } from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// -- Local Strategy --
passport.use( new LocalStrategy( {
    usernameField: 'identifier', // We will send 'identifier' from frontend (could be email or name)
    passwordField: 'password'
}, async ( identifier, password, done ) =>
{
    try
    {
        // Find user by email OR name
        const user = await User.findOne( {
            $or: [ { email: identifier }, { name: identifier } ]
        } );

        if ( !user )
        {
            return done( null, false, { message: 'Incorrect username or email.' } );
        }

        // If user has no password (e.g. Google/Apple only), they can't login via local
        if ( !user.password )
        {
            return done( null, false, { message: 'Please login with your social account.' } );
        }

        const isMatch = await user.comparePassword( password );
        if ( !isMatch )
        {
            return done( null, false, { message: 'Incorrect password.' } );
        }

        return done( null, user );
    } catch ( err )
    {
        return done( err );
    }
} ) );

// -- Google Strategy --
passport.use( new GoogleStrategy( {
    clientID: process.env.GOOGLE_CLIENT_ID || 'place_holder_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'place_holder_secret',
    callbackURL: "/api/auth/google/callback"
}, async ( accessToken, refreshToken, profile, done ) =>
{
    try
    {
        // 1. Check if user exists by googleId
        let user = await User.findOne( { googleId: profile.id } );
        if ( user )
        {
            user.lastLogin = new Date();
            await user.save();
            return done( null, user );
        }

        // 2. Check if user exists by email (link accounts)
        const email = profile.emails?.[ 0 ]?.value;
        if ( email )
        {
            user = await User.findOne( { email } );
            if ( user )
            {
                user.googleId = profile.id;
                // Update photo if not present?
                user.lastLogin = new Date();
                await user.save();
                return done( null, user );
            }
        }

        // 3. Create new user
        const newUser = new User( {
            googleId: profile.id,
            name: profile.displayName || 'Google User',
            email: email,
            photo: profile.photos?.[ 0 ]?.value,
            lastLogin: new Date()
        } );
        await newUser.save();
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
            const appleId = ( idToken as any ).sub;
            let user = await User.findOne( { appleId } );
            if ( user )
            {
                return done( null, user );
            }

            const email = ( idToken as any ).email;
            if ( email )
            {
                user = await User.findOne( { email } );
                if ( user )
                {
                    user.appleId = appleId;
                    await user.save();
                    return done( null, user );
                }
            }

            // Apple only provides name on first login in the 'profile' object
            const fullName = ( profile && profile.name )
                ? `${ profile.name.firstName } ${ profile.name.lastName }`.trim()
                : 'Apple User';

            const newUser = new User( {
                appleId: appleId,
                email: email || `${ appleId }@privaterelay.appleid.com`, // Fallback
                name: fullName
            } );
            await newUser.save();
            done( null, newUser );
        } catch ( err: any )
        {
            done( err, undefined );
        }
    } ) );
}

export default passport;
