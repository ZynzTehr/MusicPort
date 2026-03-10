
import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config( { path: path.join( __dirname, '../../.env' ) } );

const seedAdmin = async () =>
{
    try
    {
        await mongoose.connect( process.env.MONGODB_URI || 'mongodb://localhost:27017/musicport' );
        console.log( 'Connected to MongoDB' );

        const adminEmail = 'admin@musicport.com';
        const existingAdmin = await User.findOne( { email: adminEmail } );

        if ( existingAdmin )
        {
            console.log( 'Admin user already exists' );
            if ( !existingAdmin.isAdmin )
            {
                existingAdmin.isAdmin = true;
                await existingAdmin.save();
                console.log( 'Updated existing user to Admin' );
            }
        } else
        {
            const newAdmin = new User( {
                name: 'Super Admin',
                email: adminEmail,
                password: 'admin123', // Will be hashed by pre-save hook
                isAdmin: true,
                bio: 'System Administrator',
                photo: 'default.png'
            } );
            await newAdmin.save();
            console.log( 'Admin user created successfully' );
        }

        process.exit( 0 );
    } catch ( error )
    {
        console.error( 'Error seeding admin:', error );
        process.exit( 1 );
    }
};

seedAdmin();
