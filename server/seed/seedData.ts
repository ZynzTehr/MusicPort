import prisma from '../database/dbConnection';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config( { path: path.join( __dirname, '../../.env' ) } );

const seedData = async () =>
{
    try
    {
        await prisma.venue.deleteMany();
        await prisma.product.deleteMany();
        await prisma.lesson.deleteMany();
        await prisma.userCompletedLesson.deleteMany();
        await prisma.userPurchasedProduct.deleteMany();
        await prisma.userViewedProduct.deleteMany();
        await prisma.post.deleteMany();
        await prisma.guestCheckout.deleteMany();
        await prisma.userCheckout.deleteMany();
        console.log( 'Cleared existing database records' );

        const showsData = JSON.parse( fs.readFileSync( path.join( __dirname, 'venues.json' ), 'utf-8' ) );
        const productsData = JSON.parse( fs.readFileSync( path.join( __dirname, 'products.json' ), 'utf-8' ) );
        const lessonsData = JSON.parse( fs.readFileSync( path.join( __dirname, 'lessons.json' ), 'utf-8' ) );

        const cleanShows = showsData.map( ( s: any ) =>
        {
            const { _id, createdAt, updatedAt, ...rest } = s;
            if ( rest.bands )
            {
                if ( Array.isArray( rest.bands ) )
                {
                    rest.bands = rest.bands.map( ( b: any ) => b.name ? b.name : b );
                } else
                {
                    rest.bands = [];
                }
            }
            if ( rest.price && typeof rest.price === 'string' ) rest.price = parseFloat( rest.price );
            return rest;
        } );

        const cleanProducts = productsData.map( ( p: any ) =>
        {
            const { _id, createdAt, updatedAt, ...rest } = p;
            if ( rest.price && typeof rest.price === 'string' ) rest.price = parseFloat( rest.price );
            if ( rest.seeded && typeof rest.seeded === 'string' ) rest.seeded = rest.seeded === 'true';
            return rest;
        } );

        const cleanLessons = lessonsData.map( ( l: any ) =>
        {
            const { _id, createdAt, updatedAt, ...rest } = l;
            return rest;
        } );

        await prisma.venue.createMany( { data: cleanShows } );
        console.log( `Seeded ${ cleanShows.length } shows` );

        await prisma.product.createMany( { data: cleanProducts } );
        console.log( `Seeded ${ cleanProducts.length } products` );

        await prisma.lesson.createMany( { data: cleanLessons } );
        console.log( `Seeded ${ cleanLessons.length } lessons` );

        process.exit( 0 );
    } catch ( error )
    {
        console.error( 'Error seeding data:', error );
        process.exit( 1 );
    }
};

seedData();
