// @ts-nocheck
import mongoose from 'mongoose';
import User from './models/User';
import { deleteUser } from './controllers/userController';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config( { path: path.join( __dirname, '.env' ) } );

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/musicport';

async function run ()
{
    try
    {
        await mongoose.connect( MONGODB_URI );
        console.log( 'Connected to DB' );

        // 1. Find Admin
        const admin = await User.findOne( { email: 'admin@musicport.com' } );
        if ( !admin ) throw new Error( 'Admin not found' );
        console.log( 'Admin found:', admin.email, 'isAdmin:', admin.isAdmin );

        // 2. Create Dummy User to Delete
        const dummyUser = await User.create( {
            name: 'DeleteMe',
            email: 'deleteme@example.com',
            password: 'password123',
            isAdmin: false
        } );
        console.log( 'Dummy user created:', dummyUser._id );

        // 3. Mock Req/Res
        // Simulate whatauth middleware does: fetches user from DB
        const reqUser = await User.findById( admin._id );

        const req: any = {
            user: reqUser,
            params: { userId: dummyUser._id.toString() }
        };

        const res: any = {
            status: ( code: number ) =>
            {
                console.log( 'Response Status:', code );
                return {
                    json: ( data: any ) => console.log( 'Response JSON:', data )
                };
            },
            json: ( data: any ) => console.log( 'Response JSON:', data )
        };

        // 4. Call Controller
        console.log( '--- Calling deleteUser ---' );
        await deleteUser( req, res );
        console.log( '--- End Call ---' );

    } catch ( error )
    {
        console.error( 'Error:', error );
    } finally
    {
        await mongoose.disconnect();
    }
}

run();
