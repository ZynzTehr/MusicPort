
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import Show from '../models/ShowModel';
import Product from '../models/Products';
import Lesson from '../models/Lesson';

// Load env vars
dotenv.config( { path: path.join( __dirname, '../../.env' ) } );

const seedData = async () =>
{
    try
    {
        await mongoose.connect( process.env.MONGODB_URI || 'mongodb://localhost:27017/musicport' );
        console.log( 'Connected to MongoDB' );

        // Clear existing data
        await Show.deleteMany( {} );
        await Product.deleteMany( {} );
        await Lesson.deleteMany( {} );
        console.log( 'Cleared existing Shows, Products, and Lessons' );

        // Read JSON files
        const showsData = JSON.parse( fs.readFileSync( path.join( __dirname, 'venues.json' ), 'utf-8' ) );
        const productsData = JSON.parse( fs.readFileSync( path.join( __dirname, 'products.json' ), 'utf-8' ) );
        const lessonsData = JSON.parse( fs.readFileSync( path.join( __dirname, 'lessons.json' ), 'utf-8' ) );

        // Insert data
        await Show.insertMany( showsData );
        console.log( `Seeded ${ showsData.length } shows` );

        await Product.insertMany( productsData );
        console.log( `Seeded ${ productsData.length } products` );

        await Lesson.insertMany( lessonsData );
        console.log( `Seeded ${ lessonsData.length } lessons` );

        process.exit( 0 );
    } catch ( error )
    {
        console.error( 'Error seeding data:', error );
        process.exit( 1 );
    }
};

seedData();
