import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../database/dbConnection';

/**
 * TypeScript Type Augmentation
 * Extends the native Express `Request` interface globally to guarantee the TypeScript
 * compiler recognizes the custom `.user` property we inject during successful authentication.
 */
declare global
{
    namespace Express
    {
        interface User
        {
            id: number;
            name: string;
            email: string;
            isAdmin: boolean;
            googleId?: string | null;
            appleId?: string | null;
        }
    }
}

/**
 * =========================================
 * Base Authentication Pipeline
 * =========================================
 * Architectural Pattern: JWT Verification Middleware
 * 
 * Purpose: Intercepts secured HTTP requests, extracts the physical Bearer Token 
 * from the headers, decrypts it, and hydrates the Express `req.user` object 
 * with fresh database credentials.
 */
export default async ( req: Request, res: Response, next: NextFunction ) =>
{
    try
    {
        const authHeader = req.headers.authorization;

        // Step 1: Format Validation. Ensure the token exists and conforms to standard Bearer schema.
        if ( !authHeader || !authHeader.startsWith( 'Bearer ' ) )
        {
            return res.status( 401 ).json( { message: 'No token provided' } );
        }

        // Step 2: Extraction & Decryption
        const token = authHeader.split( ' ' )[ 1 ]; // Slices off the "Bearer " prefix.
        const decoded = jwt.verify( token, process.env.JWT_SECRET as string ) as JwtPayload; // Cryptographically validates the token hasn't been tampered with.

        // Step 3: Database Hydration. We re-pull the user to ensure their account hasn't been deleted or banned since the token was issued.
        const user = await prisma.user.findUnique( {
            where: { id: Number( decoded.id ) },
            select: { id: true, name: true, email: true, isAdmin: true, googleId: true, appleId: true }
        } );

        if ( !user )
        {
            return res.status( 401 ).json( { message: 'User no longer exists' } );
        }

        // Step 4: Context Injection. Mount the verified user to the request object so downstream controllers can instantly access them.
        req.user = user;
        next();
    } catch ( err )
    {
        // Catch-all for tampered tokens, expired tokens, or faulty signatures.
        return res.status( 401 ).json( { message: 'Invalid or expired token' } );
    }
};
