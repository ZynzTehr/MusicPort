import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

// Run environmental variables
dotenv.config();

interface UserPayload
{
    _id: string;
}

export const createJWT = ( user: UserPayload ): string =>
{
    const secret = process.env.JWT_SECRET;
    if ( !secret )
    {
        throw new Error( "JWT_SECRET is not defined in environment variables" );
    }

    const options: SignOptions = {
        expiresIn: ( process.env.JWT_EXPIRES_IN ? String( process.env.JWT_EXPIRES_IN ) : '1d' ) as any
    };

    return jwt.sign( { id: user._id }, secret, options );
};

export const verifyJWT = ( token: string ): string | jwt.JwtPayload =>
{
    const secret = process.env.JWT_SECRET;
    if ( !secret )
    {
        throw new Error( "JWT_SECRET is not defined in environment variables" );
    }
    return jwt.verify( token, secret );
};
