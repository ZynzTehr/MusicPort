
import { Request, Response, NextFunction } from 'express';

export default async ( req: Request, res: Response, next: NextFunction ) =>
{
    console.log( 'AdminAuth Middleware checking user:', req.user ? req.user._id : 'No user' );
    try
    {
        if ( !req.user || !req.user.isAdmin )
        {
            return res.status( 403 ).json( { message: 'Access denied. Admins only.' } );
        }
        next();
    } catch ( err )
    {
        return res.status( 500 ).json( { message: 'Server Error' } );
    }
};
