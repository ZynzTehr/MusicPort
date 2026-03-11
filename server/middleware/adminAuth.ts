import { Request, Response, NextFunction } from 'express';

/**
 * =========================================
 * Administrator Privilege Guard (RBAC)
 * =========================================
 * Architectural Pattern: Role-Based Access Control (RBAC) Middleware.
 * 
 * Purpose: This middleware acts as a secondary security gate. It MUST be placed 
 * strictly AFTER the primary `auth.ts` middleware in the Express routing sequence. 
 * `auth.ts` proves *WHO* the user is (Authentication), while this file proves 
 * *WHAT* the user is allowed to do (Authorization).
 */
export default ( req: Request, res: Response, next: NextFunction ) =>
{
    console.log( 'AdminAuth Middleware checking user:', req.user ? req.user.id : 'No user' );
    
    try
    {
        // Security Assertion: Deny access if the user payload doesn't exist (bypassed primary auth)
        // or if the `isAdmin` boolean flag on their PostgreSQL row is explicitly false.
        if ( !req.user || !req.user.isAdmin )
        {
            return res.status( 403 ).json( { message: 'Access denied. Admins only.' } );
        }
        
        // Authorization Successful: Yield the execution thread to the actual route Controller.
        next();
    } catch ( err )
    {
        return res.status( 500 ).json( { message: 'Server Error' } );
    }
};
