import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

// Run environmental variables
dotenv.config();

/**
 * =========================================
 * JWT Cryptographic Factory
 * =========================================
 * Purpose: Centralized utility functions for signing and verifying JSON Web Tokens.
 * This encapsulates the usage of `process.env.JWT_SECRET` so that isolated modules 
 * (like Passport) can easily issue tokens without duplicating the cryptographic boilerplate.
 */

interface UserPayload
{
    id: number;
}

/**
 * Encodes a JSON payload containing the User ID into a securely signed base64 token.
 */
export const createJWT = ( user: UserPayload ): string =>
{
    const secret = process.env.JWT_SECRET;
    if ( !secret )
    {
        throw new Error( "JWT_SECRET is not defined in environment variables" );
    }

    const options: SignOptions = {
        // Enforces a strict expiration timeline (defaults to 1 day) to limit vulnerability windows.
        expiresIn: ( process.env.JWT_EXPIRES_IN ? String( process.env.JWT_EXPIRES_IN ) : '1d' ) as any
    };

    return jwt.sign( { id: user.id }, secret, options );
};

/**
 * Directly parses and validates a raw token string against the server's private secret.
 * Throws an explicit Error if the token is forged, expired, or malformed.
 */
export const verifyJWT = ( token: string ): string | jwt.JwtPayload =>
{
    const secret = process.env.JWT_SECRET;
    if ( !secret )
    {
        throw new Error( "JWT_SECRET is not defined in environment variables" );
    }
    return jwt.verify( token, secret );
};
