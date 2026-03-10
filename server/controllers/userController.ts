import { Request, Response } from 'express';
import { createJWT } from '../utils/jwt';
import User from '../models/User';
import path from 'path';
import fs from 'fs';

/* Export controller be able to create new user and store data in database */
export const signup = async ( req: Request, res: Response ) =>
{
    try
    {
        const { name, email, password, bio } = req.body;

        if ( !email || !password )
        {
            return res.status( 400 ).json( { message: 'Email and password required' } );
        }

        const userExists = await User.findOne( { $or: [ { email }, { name } ] } );
        if ( userExists )
        {
            return res
                .status( 400 )
                .json( { message: 'Username or Email already exists' } );
        }

        // Create new user..
        const user = await User.create( {
            name,
            email,
            password,
            bio,
            photo: req.file ? req.file.filename : 'default.png', // Set default photo if none uploaded..
        } );


        // Create JWT token..
        const token = createJWT( user );

        res.status( 201 ).json( { user, token } );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: error.message } );
    }
};

/* Export controller to be able to login users based on our database records */
export const login = async ( req: Request, res: Response ) =>
{
    const { identifier, password } = req.body; // Accepts either email or username..

    try
    {
        // Find user by email OR username..
        const user = await User.findOne( {
            $or: [ { email: identifier }, { name: identifier } ],
        } );

        console.log( 'Password:', password );

        // If no user found, return 404..
        if ( !user ) return res.status( 404 ).json( { message: 'User not found.' } );

        // Compare password directly via bCrypt and JSON webToken..
        const validUser = await user.comparePassword( password );
        if ( !validUser )
        {
            return res.status( 401 ).json( { message: 'Invalid password' } );
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();


        // Create JWT token..
        const token = createJWT( user );

        // If credentials match, return user..
        res.json( { user, token } );
    } catch ( error )
    {
        res.status( 500 ).json( { message: 'No User Found!' } ); // Handle server error..
    }
};

/* Export controller to be able to update profile of users in the database */
export const updateProfile = async ( req: Request, res: Response ) =>
{
    console.log( 'BODY:', req.body );
    console.log( 'FILE:', req.file );
    try
    {
        const { userId, name, email, password, bio } = req.body;

        // Ensure the userId from the token matches the one being created/updated..
        // if (req.user._id.toString() !== userId) {
        // 	return res.status(403).json({ message: 'Forbidden' });
        // }

        // Find user by ID..
        const user = await User.findById( userId );
        if ( !user ) return res.status( 404 ).json( { message: 'User not found.' } );

        // Update text fields..
        user.name = name || user.name;
        user.email = email || user.email;
        user.bio = bio || user.bio;

        if ( password && password.trim() !== '' )
        {
            user.password = password;
            // Password hashing is handled by pre-save hook in model
        }

        // Replace profile image..
        if ( req.file )
        {
            // Delete old image..
            if ( user.photo && user.photo !== 'default.png' )
            {
                const oldPath = path.join( __dirname, '../userProfileImgs', user.photo );
                if ( fs.existsSync( oldPath ) )
                {
                    fs.unlinkSync( oldPath );
                }
            }

            user.photo = req.file.filename;
        }

        await user.save();
        res.json( { user } );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: error.message } );
    }
};

/* Export controller to be ale to delete user from database */
export const deleteUser = async ( req: Request, res: Response ) =>
{
    try
    {
        const { userId } = req.params;
        console.log( `Attempting to delete user with ID: ${ userId }` );
        console.log( `Attempting to delete user with ID: ${ userId }` );

        // Check if user is admin OR if they are deleting their own account
        // @ts-ignore
        const isSelf = req.user._id.toString() === userId;
        // @ts-ignore
        const isAdmin = req.user.isAdmin === true;

        console.log( 'DEBUG: req.user._id:', String( req.user?._id ) );
        console.log( 'DEBUG: userId to delete:', userId );
        console.log( 'DEBUG: req.user.isAdmin:', req.user?.isAdmin );
        console.log( 'DEBUG: isSelf:', isSelf );
        console.log( 'DEBUG: isAdmin:', isAdmin );

        if ( !isSelf && !isAdmin )
        {
            return res.status( 403 ).json( { message: 'Forbidden: You can only delete your own account or must be an admin.' } );
        }

        // Find user by ID..
        const user = await User.findById( userId );
        if ( !user ) return res.status( 404 ).json( { message: 'User not found.' } );

        // Delete profile image..
        if ( user.photo !== 'default.png' && user.photo )
        {
            const imagePath = path.join( __dirname, '../userProfileImgs', user.photo );
            if ( fs.existsSync( imagePath ) )
            {
                fs.unlinkSync( imagePath );
            }
        }

        await User.findByIdAndDelete( userId );
        res.json( { message: 'User and image deleted successfully.' } );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: error.message } );
    }
};

/* Export controller to get a single user by ID */
export const getUserById = async ( req: Request, res: Response ) =>
{
    try
    {
        const { userId } = req.params;
        const user = await User.findById( userId ).select( '-password' );

        if ( !user )
        {
            return res.status( 404 ).json( { message: 'User not found' } );
        }

        res.json( user );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: error.message } );
    }
};

/* Export controller to get all users */
export const getAllUsers = async ( req: Request, res: Response ) =>
{
    try
    {
        const users = await User.find().select( '-password' );
        res.json( users );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: error.message } );
    }
};
