import { Request, Response } from 'express';
import prisma from '../database/dbConnection';

/**
 * =========================================
 * Venue Seeding / Mass Ingestion Controller
 * =========================================
 * Architectural Pattern: Database Population & Stress Testing
 * 
 * Purpose: Provides a dedicated utility endpoint for instantaneously seeding 
 * massive blocks of pseudo-randomized performance data into the `Venue` table natively 
 * using Prisma's `createMany` bulk-operation optimization logic.
 */

/**
 * Drops a massive pseudo-randomized string payload of 10,000 venue instances directly into the database natively.
 * Exclusively utilized for local stress-testing constraints, scrolling performance limits, and mass data rendering logic.
 *
 * @param req - Express request object.
 * @param res - Express response indicator.
 */
export const insertAllShows = async ( req: Request, res: Response ) =>
{
    try
    {
        const venues = Array.from( { length: 10000 } ).map( ( _, index ) =>
        {
            const bandsArray = [
                "Praise the Sword", "Violet Day", "Earth Ate Jimmy", "St. Babylon",
                "Lombert St.", "Step Up", "Copper Dreams", "Blink 200",
                "Miss it when you Blink", "Blue Jumpsuit Accesory"
            ];

            const zipCodes = [ "92886", "90210", "10001", "33101", "60601", "98101" ];

            return {
                name: [
                    "Luna", "Sol", "Whiskey", "Carina", "The Glass House",
                    "Spot", "Beethoven's Lounge", "The Forum", "Smokeglass",
                    "Dug Out", "The Venue", "Zero"
                ][ index % 12 ],
                bands: [ bandsArray[ index % 10 ] ],
                date: String( Date.now() + Math.floor( Math.random() * 10 ) ),
                price: [ 20, 22, 19, 25, 16 ][ index % 5 ] || 20,
                address: `123 Elm St. Generic City CA. ${ zipCodes[ index % 6 ] }`,
                city: "Generic City",
                state: "CA",
                zipcode: zipCodes[ index % 6 ],
                image: [
                    "venue1.jpeg", "venue2.jpeg", "venue3.jpeg", "venue4.jpeg", "venue5.jpeg"
                ][ index % 5 ],
                seeded: true,
                latitude: 34.0522 + ( Math.random() * 0.1 ),
                longitude: -118.2437 - ( Math.random() * 0.1 )
            };
        } );

        await prisma.venue.createMany( { data: venues } );

        console.log( 'Documents Inserted Successfuly!!' );
        res.json( { message: 'Documents Inserted Successfully' } );
    } catch ( err: any )
    {
        res.status( 500 ).json( { message: err.message } );
    }
};
