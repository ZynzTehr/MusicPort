import { Request, Response } from 'express';
import Venue from '../models/ShowModel';

export const insertAllShows = async ( req: Request, res: Response ) =>
{
    try
    {
        const venues = Array.from( { length: 10000 } ).map( ( _, index ) => ( {
            name: [
                "Luna",
                "Sol",
                "Whiskey",
                "Carina",
                "The Glass House",
                "Spot",
                "Beethoven's Lounge",
                "The Forum",
                "Smokeglass",
                "Dug Out",
                "The Venue",
                "Zero"
            ][ index % 9 ],
            bands: [
                { name: "Praise the Sword" },
                { name: "Violet Day" },
                { name: "Earth Ate Jimmy" },
                { name: "St. Babylon" },
                { name: "Lombert St." },
                { name: "Step Up" },
                { name: "Copper Dreams" },
                { name: "Blink 200" },
                { name: "Miss it when you Blink" },
                { name: "Blue Jumpsuit Accesory" }
            ][ index % 4 ], // Logic seems slightly varied from original simple array of strings vs objects. Original was strings in array, but schema had object structure potentially?
            // Original bands: ["Praise the Sword", ...] -> schema bands: [{type: String, name: String}]?
            // Re-reading ShowModel.js from my view:
            // bands: [ { type: String, name: String, required: true } ]
            // But the seeding logic provided an array of strings: ["Praise the Sword", "Violet Day", ...]
            // If I pass an array of strings to an array of objects in Mongoose, it might fail or cast strangely.
            // However, if I conform to the schema I defined in ShowModel.ts (Array of objects), I should map it.
            // But wait, the original index % 4 selects ONE string from the array.
            // So bands becomes "Praise the Sword".
            // But the field is `bands: [...]`.
            // If `bands` is an array, assigning a single string to it is invalid conform to Mongoose array.
            // Unless it means `bands: ["String"]`.
            // The original code:
            // bands: [ "Praise...", ... ][index % 4]
            // This selects ONE item.
            // So in the object being created: { bands: "Praise the Sword" }
            // But the schema says `bands: [...]`.
            // Mongoose might wrap it in an array automatically? `["Praise the Sword"]`?
            // And if the schema expects objects `[{name: String}]`, then `["Praise the Sword"]` might fail casting to Object with unknown keys.
            // The original schema was:
            // bands: [ { type: String, name: String } ]
            // This is very ambiguous.
            // If I look at `venueController.js` (step 101):
            // bands: [ ... ][index % 4]
            // It returns a string.
            // So we are trying to insert `{ bands: "Some String" }`.
            // Mongoose usually auto-wraps if schema is array?
            // I will assume the intention is `bands: [{ name: "Some String" }]`.
            // I will adjust the code to be enabling.
            // Or maybe the original schema was wrong and bands is just [String].
            // In ShowModel.ts I defined it as `bands: {name?: string, type?: string}[]`.
            // I will wrap it in an object.
            // Actually, looking at the original controller, `bands` value is selected from a list of strings.
            // So I will make it `bands: [{ name: "Selected String" }]`.

            // Original logic selected a string. I will wrap it.
            // But wait, the random selection logic `[...][index % 4]` selects one band name.
            // So I'll put that in an array.

            date: String( Date.now() + Math.floor( Math.random() * 10 ) ), // Fixed date logic
            price: [ 20, 22, 19, 25, 16 ][ index % 5 ] || 20, // fixed index access
            address: [
                "123 Elm St. Bashful CA. 92886",
                "123 Elm St. Timid CA. 92886",
                "123 Elm St. Scared CA. 92886",
                "123 Elm St. Tired CA. 92886",
                "123 Elm St. Running CA. 92886",
                "123 Elm St. Fly CA. 92886",
                "123 Elm St. Bashful OR. 92886",
                "123 Elm St. Timid OR. 92886",
                "123 Elm St. Scared OR. 92886",
                "123 Elm St. Tired OR. 92886",
                "123 Elm St. Running OR. 92886",
                "123 Elm St. Fly OR. 92886",
                "123 Elm St. Bashful WA. 92886",
                "123 Elm St. Timid WA. 92886",
                "123 Elm St. Scared WA. 92886",
                "123 Elm St. Tired WA. 92886",
                "123 Elm St. Running WA. 92886",
                "123 Elm St. Fly WA. 92886",
                "123 Elm St. Bashful NV. 92886",
                "123 Elm St. Timid NV. 92886",
                "123 Elm St. Scared NV. 92886",
                "123 Elm St. Tired NV. 92886",
                "123 Elm St. Running NV. 92886",
                "123 Elm St. Fly NV. 92886"
            ][ index % 24 ],
            city: "Unknown", // Original controller didn't match schema requirements for city/state/zipcode if they were required!
            // Wait, ShowModel.js (step 77) has required: true for city, state, zipcode.
            // But venueController.js (step 101) DOES NOT PROVIDE THEM explicitly?
            // It provides `address` which contains them.
            // Does the Schema parse address? No.
            // This means the seeding script in venueController.js was likely failing or relying on loose validation/hooks not shown?
            // OR maybe I missed something.
            // Ah, looking closely at venueController.js step 101:
            // It ONLY provides: name, bands, date, price, address, image, index.
            // It DOES NOT provide city, state, zipcode, latitude, longitude.
            // Mongoose should throw validation error if `required: true` is set.
            // Unless `seeded: true` (default false) or something else.
            // It's possible the original code was broken or I'm misinterpreting `required: true`.
            // I will extract city/state/zip from address to fix it properly.
            state: "CA",
            zipcode: "92886",
            image: [
                "venue1.jpeg",
                "venue2.jpeg",
                "venue3.jpeg",
                "venue4.jpeg",
                "venue5.jpeg"
            ][ index % 5 ],
            seeded: true
        } ) );

        // Post-processing to extract city/state/zip from address string if possible, or just mock it to satisfy schema
        const fixedVenues = venues.map( v =>
        {
            const parts = v.address.split( ' ' );
            // "123 Elm St. Bashful CA. 92886"
            // parts: [123, Elm, St., Bashful, CA., 92886]
            // city: Bashful, state: CA., zip: 92886
            const zip = parts[ parts.length - 1 ];
            const state = parts[ parts.length - 2 ].replace( '.', '' );
            const city = parts[ parts.length - 3 ];
            return {
                ...v,
                city,
                state,
                zipcode: zip,
                bands: [ { name: v.bands } ] // Correction to wrap band name in object array
            };
        } );

        await Venue.insertMany( fixedVenues as any ); // Use 'as any' to bypass strict type check on the complex map structure if needed
        console.log( 'Documents Inserted Successfuly!!' );
        res.json( { message: 'Documents Inserted Successfully' } );
    } catch ( err: any )
    {
        res.status( 500 ).json( { message: err.message } ); // Handle server error..
    }
};
