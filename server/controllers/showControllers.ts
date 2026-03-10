import { Request, Response } from 'express';
import Venue from '../models/ShowModel';

// Helper to calculate distance between two coordinates (Haversine formula)
const getDistance = ( lat1: number, lon1: number, lat2: number, lon2: number ) =>
{
    const R = 3963; // Radius of the earth in miles
    const dLat = ( lat2 - lat1 ) * Math.PI / 180;
    const dLon = ( lon2 - lon1 ) * Math.PI / 180;
    const a =
        Math.sin( dLat / 2 ) * Math.sin( dLat / 2 ) +
        Math.cos( lat1 * Math.PI / 180 ) * Math.cos( lat2 * Math.PI / 180 ) *
        Math.sin( dLon / 2 ) * Math.sin( dLon / 2 );
    const c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
    const d = R * c; // Distance in miles
    return d;
};

/* Export controller to send data from server to frontend */
export const getAllShows = async ( req: Request, res: Response ) =>
{
    try
    {
        const { city, state, q } = req.query;
        let query: any = {};

        if ( q )
        {
            // Unified search: matches city OR state
            query.$or = [
                { city: { $regex: new RegExp( q as string, 'i' ) } },
                { state: { $regex: new RegExp( q as string, 'i' ) } }
            ];
        } else
        {
            if ( city )
            {
                query.city = { $regex: new RegExp( city as string, 'i' ) };
            }
            if ( state )
            {
                query.state = { $regex: new RegExp( state as string, 'i' ) };
            }
        }

        const shows = await Venue.find( query ); // Get shows based on query
        res.json( shows ); // Respond with JSON array of shows..
    } catch ( err: any )
    {
        res.status( 500 ).json( { message: err.message } ); // Handle server error..
    }
};

/* Export controller to send data from server to frontend */
export const getShowsByLocation = async ( req: Request, res: Response ) =>
{
    try
    {
        const { lat, lng } = req.query;

        if ( lat && lng )
        {
            // Proximity search
            const userLat = parseFloat( lat as string );
            const userLng = parseFloat( lng as string );
            const maxDist = 50; // default 50 miles radius

            const allShows = await Venue.find( {} );

            const nearbyShows = allShows.filter( venue =>
            {
                if ( venue.latitude && venue.longitude )
                {
                    const distance = getDistance( userLat, userLng, venue.latitude, venue.longitude );
                    return distance <= maxDist;
                }
                return false;
            } );

            return res.json( nearbyShows );
        }

        // Fallback to existing logic if simple state param is passed (e.g. /api/shows/CA)
        // Note: The route param handling needs to be adjusted in routes.js or here
        // Currently this function maps to /shows/:state, so req.params.state is expected
        const { state } = req.params;
        if ( state )
        {
            const shows = await Venue.find( { state: { $regex: new RegExp( state as string, 'i' ) } } );
            return res.json( shows );
        }

        res.json( [] );
    } catch ( err: any )
    {
        res.status( 500 ).json( { message: err.message } ); // Handle server error..
    }
};

// Create a new show/venue
export const createShow = async ( req: Request, res: Response ) =>
{
    try
    {
        const show = await Venue.create( req.body );
        res.status( 201 ).json( show );
    } catch ( error: any )
    {
        if ( error.name === 'ValidationError' )
        {
            return res.status( 400 ).json( { message: 'Validation Error', error: error.message } );
        }
        res.status( 500 ).json( { message: 'Error creating show', error: error.message } );
    }
};

// Update a show/venue
export const updateShow = async ( req: Request, res: Response ) =>
{
    try
    {
        const { id } = req.params;
        const show = await Venue.findByIdAndUpdate( id, req.body, { new: true } );
        if ( !show )
        {
            return res.status( 404 ).json( { message: 'Show not found' } );
        }
        res.status( 200 ).json( show );
    } catch ( error: any )
    {
        if ( error.name === 'ValidationError' )
        {
            return res.status( 400 ).json( { message: 'Validation Error', error: error.message } );
        }
        res.status( 500 ).json( { message: 'Error updating show', error: error.message } );
    }
};

// Delete a show/venue
export const deleteShow = async ( req: Request, res: Response ) =>
{
    try
    {
        const { id } = req.params;
        console.log( `Attempting to delete show with ID: ${ id }` );
        const show = await Venue.findByIdAndDelete( id );
        if ( !show )
        {
            return res.status( 404 ).json( { message: 'Show not found' } );
        }
        res.status( 200 ).json( { message: 'Show deleted successfully' } );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error deleting show', error: error.message } );
    }
};
