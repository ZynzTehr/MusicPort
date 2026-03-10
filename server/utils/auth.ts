import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Document } from 'mongoose';
// @ts-ignore
import User from '../models/User';

// Extend Express User interface to match our User model
declare global
{
    namespace Express
    {
        interface User extends Document
        {
            _id: any;
            name: string;
            email: string;
            isAdmin: boolean;
            // Add other properties if needed
        }
    }
}

export default async ( req: Request, res: Response, next: NextFunction ) =>
{
    try
    {
        const authHeader = req.headers.authorization;

        if ( !authHeader || !authHeader.startsWith( 'Bearer ' ) )
        {
            return res.status( 401 ).json( { message: 'No token provided' } );
        }

        const token = authHeader.split( ' ' )[ 1 ];

        const decoded = jwt.verify( token, process.env.JWT_SECRET as string ) as JwtPayload;

        const user = await User.findById( decoded.id ).select( '-password' );
        if ( !user )
        {
            return res.status( 401 ).json( { message: 'User no longer exists' } );
        }

        req.user = user; // 🔑 attach logged-in user
        next();
    } catch ( err )
    {
        return res.status( 401 ).json( { message: 'Invalid or expired token' } );
    }
};
