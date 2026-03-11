import prisma from '../database/dbConnection';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config( { path: path.join( __dirname, '../../.env' ) } );

const seedAdmin = async () =>
{
    try
    {
        const adminEmail = 'admin@musicport.com';
        const existingAdmin = await prisma.user.findUnique( { where: { email: adminEmail } } );

        if ( existingAdmin )
        {
            console.log( 'Admin user already exists' );
            if ( !existingAdmin.isAdmin )
            {
                await prisma.user.update( {
                    where: { email: adminEmail },
                    data: { isAdmin: true }
                } );
                console.log( 'Updated existing user to Admin' );
            }
        } else
        {
            const hashedPassword = await bcrypt.hash( 'Admin@123!', 10 );
            await prisma.user.create( {
                data: {
                    name: 'Super Admin',
                    email: adminEmail,
                    password: hashedPassword,
                    isAdmin: true,
                    bio: 'System Administrator',
                    photo: 'default.png'
                }
            } );
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
