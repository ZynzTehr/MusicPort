import { Request, Response } from 'express';
import prisma from '../database/dbConnection';

/**
 * =========================================
 * Tour Routing & Venue Controller
 * =========================================
 * Architectural Pattern: Geolocation Arithmetic & CRUD Management
 * 
 * Purpose: Manages the concert tour schedule. Highlights advanced logic 
 * capabilities by executing raw mathematical Geofencing (The Haversine formula) 
 * directly against incoming client coordinate arrays to determine physically 
 * localized shows within a hard 50-mile radius.
 */

/**
 * Implements the rigorous mathematical Haversine formula natively determining exact
 * point-to-point geographic distances factoring the strict curvature of the globe.
 *
 * @param lat1 - Numeric latitude vector 1.
 * @param lon1 - Numeric longitude vector 1.
 * @param lat2 - Numeric latitude vector 2.
 * @param lon2 - Numeric longitude vector 2.
 * @returns - Numeric mile distance.
 */
const getDistance = ( lat1: number, lon1: number, lat2: number, lon2: number ) =>
{
    const R = 3963;
    const dLat = ( lat2 - lat1 ) * Math.PI / 180;
    const dLon = ( lon2 - lon1 ) * Math.PI / 180;
    const a =
        Math.sin( dLat / 2 ) * Math.sin( dLat / 2 ) +
        Math.cos( lat1 * Math.PI / 180 ) * Math.cos( lat2 * Math.PI / 180 ) *
        Math.sin( dLon / 2 ) * Math.sin( dLon / 2 );
    const c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
    return R * c;
};

/**
 * Retrieves the global aggregate of touring shows dynamically from the database.
 * Natively supports case-insensitive, partial-match substring filtering spanning city and state matrices.
 *
 * @param req - Express request housing geographic parameters.
 * @param res - Express response outputting the JSON matched matrix.
 */
export const getAllShows = async ( req: Request, res: Response ) =>
{
    try
    {
        const { city, state, q } = req.query;
        let where: any = {};

        if ( q )
        {
            where.OR = [
                { city: { contains: q as string, mode: 'insensitive' } },
                { state: { contains: q as string, mode: 'insensitive' } }
            ];
        } else
        {
            if ( city ) where.city = { contains: city as string, mode: 'insensitive' };
            if ( state ) where.state = { contains: state as string, mode: 'insensitive' };
        }

        const shows = await prisma.venue.findMany( { where } );
        res.json( shows );
    } catch ( err: any )
    {
        res.status( 500 ).json( { message: err.message } );
    }
};

/**
 * Pinpoints active concerts programmatically isolated within a strict 50-mile geographical boundary.
 * Ingests direct hardware lat/long pings from the client and executes the Haversine calculation against the master schedule.
 * Can alternatively render shows restricted directly by state-level parameters.
 *
 * @param req - Express request mapping explicit hardware lat/lng or abstract state queries.
 * @param res - Express response outputting locally-verified concert payloads.
 */
export const getShowsByLocation = async ( req: Request, res: Response ) =>
{
    try
    {
        const { lat, lng } = req.query;

        if ( lat && lng )
        {
            const userLat = parseFloat( lat as string );
            const userLng = parseFloat( lng as string );
            const maxDist = 50;

            const allShows = await prisma.venue.findMany();

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

        const { state } = req.params;
        if ( state )
        {
            const shows = await prisma.venue.findMany( {
                where: { state: { contains: state as string, mode: 'insensitive' } }
            } );
            return res.json( shows );
        }

        res.json( [] );
    } catch ( err: any )
    {
        res.status( 500 ).json( { message: err.message } );
    }
};

/**
 * Synthesizes a new explicit concert record mapped into the venues database securely.
 * Automatically casts incoming JSON boundary fields into proper Float precision formatting natively.
 *
 * @param req - Express request.
 * @param res - Express response.
 */
export const createShow = async ( req: Request, res: Response ) =>
{
    try
    {
        const { price, seeded, latitude, longitude, bands, ...rest } = req.body;

        let updateData: any = { ...rest };
        if ( price !== undefined ) updateData.price = parseFloat( price.toString() );
        if ( seeded !== undefined ) updateData.seeded = seeded === true || seeded === 'true';
        if ( latitude !== undefined ) updateData.latitude = parseFloat( latitude.toString() );
        if ( longitude !== undefined ) updateData.longitude = parseFloat( longitude.toString() );

        // Prism arrays for bands needs parsing if string json
        if ( Array.isArray( bands ) ) updateData.bands = bands.map( b => ( b.name ? b.name : b ).toString() );

        const show = await prisma.venue.create( { data: updateData } );
        res.status( 201 ).json( show );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error creating show', error: error.message } );
    }
};

/**
 * Issues a targeted payload update modifying an explicit show ID in the database natively.
 * Applies graceful transformations automatically coercing pricing architectures into Floats prior to injection.
 *
 * @param req - Express request.
 * @param res - Express response.
 */
export const updateShow = async ( req: Request, res: Response ) =>
{
    try
    {
        const id = Number( req.params.id );
        const { price, seeded, latitude, longitude, bands, ...rest } = req.body;

        let updateData: any = { ...rest };
        if ( price !== undefined ) updateData.price = parseFloat( price.toString() );
        if ( seeded !== undefined ) updateData.seeded = seeded === true || seeded === 'true';
        if ( latitude !== undefined ) updateData.latitude = parseFloat( latitude.toString() );
        if ( longitude !== undefined ) updateData.longitude = parseFloat( longitude.toString() );
        if ( Array.isArray( bands ) ) updateData.bands = bands.map( b => ( b.name ? b.name : b ).toString() );

        const show = await prisma.venue.update( { where: { id }, data: updateData } );
        res.status( 200 ).json( show );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error updating show', error: error.message } );
    }
};

/**
 * Modifies the table layout securely deleting a single explicitly referenced concert ID completely.
 *
 * @param req - Express request containing the integer identifier block.
 * @param res - Express response indicating success output.
 */
export const deleteShow = async ( req: Request, res: Response ) =>
{
    try
    {
        const id = Number( req.params.id );
        await prisma.venue.delete( { where: { id } } );
        res.status( 200 ).json( { message: 'Show deleted successfully' } );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error deleting show', error: error.message } );
    }
};
