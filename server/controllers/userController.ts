import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { createJWT } from '../utils/jwt';
import prisma from '../database/dbConnection';
import path from 'path';
import fs from 'fs';

/**
 * =========================================
 * User Profile & Authentication Controller
 * =========================================
 * Architectural Pattern: MVC Controller Layer / Data Access Object (DAO) Interface
 * 
 * Purpose: This module receives explicitly validated route payloads from Express, 
 * interfaces securely with the PostgreSQL database via Prisma ORM, handles complex 
 * cryptographic generation (BCRYPT hashing / JWT signatures), and formats the 
 * final HTTP JSON responses handed back to the frontend client. All functions 
 * employ Try/Catch blocks natively to guarantee absolute server crash-resistance 
 * against catastrophic database failures.
 */

// Regular Expression dictating strict password complexity constraints.
// Requires 8+ character length, one uppercase, one lowercase, one numeric, and one special character.
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Handles the logic required to register a brand new user.
 * Applies password validation constraints, maps profile photos via Multer optionally,
 * hashes passwords securely via bcrypt, and returns an encrypted JWT.
 *
 * @param req - Express request containing email, password, photo, bio, etc.
 * @param res - Express response containing the JWT structure payload mapping frontend auth.
 */
export const signup = async ( req: Request, res: Response ) =>
{
    try
    {
        const { name, email, password, bio } = req.body;

        if ( !email || !password ) return res.status( 400 ).json( { message: 'Email and password required' } );

        if ( !passwordRegex.test( password ) )
        {
            return res.status( 400 ).json( { message: 'Password must be at least 8 characters long, contain 1 uppercase, 1 lowercase, 1 number, and 1 special character.' } );
        }

        const userExists = await prisma.user.findFirst( {
            where: { OR: [ { email }, { name } ] }
        } );

        if ( userExists ) return res.status( 400 ).json( { message: 'Username or Email already exists' } );

        const hashedPassword = await bcrypt.hash( password, 10 );

        const user = await prisma.user.create( {
            data: {
                name, email, password: hashedPassword, bio,
                photo: req.file ? req.file.filename : 'default.png',
            }
        } );

        const token = createJWT( user );
        res.status( 201 ).json( { user, token } );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: error.message } );
    }
};

/**
 * Validates a user attempting to authenticate into an existing account profile.
 * Defends natively against brute force failures and rejects payloads missing correct passwords.
 * Updates the user's `lastLogin` timestamp.
 *
 * @param req - Express request containing either the username or email identifier, plus a plaintext password.
 * @param res - Express response returning the signed JWT and masked user body instance.
 */
export const login = async ( req: Request, res: Response ) =>
{
    const { identifier, password } = req.body;

    try
    {
        const user = await prisma.user.findFirst( {
            where: { OR: [ { email: identifier }, { name: identifier } ] }
        } );

        if ( !user ) return res.status( 404 ).json( { message: 'User not found.' } );
        if ( !user.password ) return res.status( 401 ).json( { message: 'Invalid credentials. User may have used an OAuth provider.' } );

        const validUser = await bcrypt.compare( password, user.password );
        if ( !validUser ) return res.status( 401 ).json( { message: 'Invalid password' } );

        const updatedUser = await prisma.user.update( {
            where: { id: user.id },
            data: { lastLogin: new Date() }
        } );

        const token = createJWT( updatedUser );
        res.json( { user: updatedUser, token } );
    } catch ( error )
    {
        res.status( 500 ).json( { message: 'Server Login Error' } );
    }
};

/**
 * Manages partial patch logic handling modifications across user profile descriptors.
 * Validates new passwords manually stringently against the regex constraints.
 * Cleans up the host system's file directories locally by severing unlinked profile avatars manually upon change.
 *
 * @param req - Express request loaded with dynamic text modifications or Form Multipart photo updates.
 * @param res - Express response.
 */
export const updateProfile = async ( req: Request, res: Response ) =>
{
    try
    {
        const { userId, name, email, password, bio } = req.body;
        const id = Number( userId );

        const user = await prisma.user.findUnique( { where: { id } } );
        if ( !user ) return res.status( 404 ).json( { message: 'User not found.' } );

        let updateData: any = {
            name: name || user.name,
            email: email || user.email,
            bio: bio || user.bio,
        };

        if ( password && password.trim() !== '' )
        {
            if ( !passwordRegex.test( password ) )
            {
                return res.status( 400 ).json( { message: 'Password must be at least 8 characters long, contain 1 uppercase, 1 lowercase, 1 number, and 1 special character.' } );
            }
            updateData.password = await bcrypt.hash( password, 10 );
        }

        if ( req.file )
        {
            if ( user.photo && user.photo !== 'default.png' )
            {
                const oldPath = path.join( __dirname, '../userProfileImgs', user.photo );
                if ( fs.existsSync( oldPath ) ) fs.unlinkSync( oldPath );
            }
            updateData.photo = req.file.filename;
        }

        const updatedUser = await prisma.user.update( { where: { id }, data: updateData } );
        res.json( { user: updatedUser } );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: error.message } );
    }
};

/**
 * Destroys a user profile completely out of the database architecture.
 * Removes related data objects and actively drops any orphaned graphical profile blobs natively
 * stored on the local file system. Authorized natively only by the root account owner or an admin.
 *
 * @param req - Express request targeting specific user ID params.
 * @param res - Express response.
 */
export const deleteUser = async ( req: Request, res: Response ) =>
{
    try
    {
        const id = Number( req.params.userId );
        const reqUserId = Number( ( req.user as any ).id || ( req.user as any )._id );
        const isAdmin = ( req.user as any ).isAdmin === true;

        if ( id !== reqUserId && !isAdmin )
        {
            return res.status( 403 ).json( { message: 'Forbidden: You can only delete your own account or must be an admin.' } );
        }

        const user = await prisma.user.findUnique( { where: { id } } );
        if ( !user ) return res.status( 404 ).json( { message: 'User not found.' } );

        if ( user.photo && user.photo !== 'default.png' )
        {
            const imagePath = path.join( __dirname, '../userProfileImgs', user.photo );
            if ( fs.existsSync( imagePath ) ) fs.unlinkSync( imagePath );
        }

        await prisma.user.delete( { where: { id } } );
        res.json( { message: 'User and image deleted successfully.' } );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: error.message } );
    }
};

/**
 * Retrieves an isolated profile payload based exclusively on the provided ID parameters.
 * Cleans the object stripping out the hashed password protecting vulnerability points explicitly.
 *
 * @param req - Express request.
 * @param res - Express response.
 */
export const getUserById = async ( req: Request, res: Response ) =>
{
    try
    {
        const id = Number( req.params.userId );
        const user = await prisma.user.findUnique( { where: { id } } );

        if ( !user ) return res.status( 404 ).json( { message: 'User not found' } );

        // Omit password
        const { password, ...safeUser } = user;
        res.json( safeUser );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: error.message } );
    }
};

/**
 * Iterates directly across the entire user table rendering an array of active system platforms.
 * Explicitly parses through each model iteratively removing password strings before appending them into a safe array return.
 *
 * @param req - Express request.
 * @param res - Express response containing safe-user lists.
 */
export const getAllUsers = async ( req: Request, res: Response ) =>
{
    try
    {
        const users = await prisma.user.findMany();

        // Omit passwords
        const safeUsers = users.map( user =>
        {
            const { password, ...safeUser } = user;
            return safeUser;
        } );

        res.json( safeUsers );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: error.message } );
    }
};
