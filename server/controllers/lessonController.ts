import { Request, Response } from 'express';
import prisma from '../database/dbConnection';

/**
 * =========================================
 * Educational HUD / Lesson Curriculum Controller
 * =========================================
 * Architectural Pattern: Filterable Data Retrieval & Relational Junctions
 * 
 * Purpose: Manages the query logic for displaying structured lesson modules.
 * Implements dynamic `req.query` parsing to allow frontend interfaces to 
 * seamlessly filter massive arrays strictly by instrument or difficulty type.
 * Controls the specialized `markLessonComplete` junction-table logic bridging 
 * Users and Modules.
 */

/**
 * Fetches the entire directory of lessons from the database.
 * Supports query parameters to filter lessons strictly by instrument type or difficulty level.
 * Results are ordered ascending based on string or integer hierarchy.
 *
 * @param req - Express request object containing optional query parameters.
 * @param res - Express response object.
 */
export const getAllLessons = async ( req: Request, res: Response ) =>
{
    try
    {
        const { instrument, difficulty } = req.query;
        let where: any = {};
        if ( instrument ) where.instrument = ( instrument as string ).toLowerCase();
        if ( difficulty ) where.difficulty = ( difficulty as string ).toLowerCase();

        const lessons = await prisma.lesson.findMany( { where, orderBy: { order: 'asc' } } );
        res.status( 200 ).json( lessons );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error fetching lessons', error: error.message } );
    }
};

/**
 * Retrieves a specific lesson object by its unique ID.
 * Used often for routing to specific lesson player modules.
 *
 * @param req - Express request object containing the lesson ID in params.
 * @param res - Express response object.
 */
export const getLessonById = async ( req: Request, res: Response ) =>
{
    try
    {
        const id = Number( req.params.id );
        const lesson = await prisma.lesson.findUnique( { where: { id } } );
        if ( !lesson ) return res.status( 404 ).json( { message: 'Lesson not found' } );
        res.status( 200 ).json( lesson );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error fetching lesson', error: error.message } );
    }
};

/**
 * Marks a specific lesson as completed for the authenticated user.
 * Generates a record in the junction table mapping the user to the passed lesson.
 * Prevents duplicate completion rows from generating if the user attempts multiple completions.
 *
 * @param req - Express request object containing lesson ID and populated user object.
 * @param res - Express response object returning the updated array of completed lesson IDs.
 */
export const markLessonComplete = async ( req: Request, res: Response ) =>
{
    try
    {
        const id = Number( req.params.id );
        if ( !req.user ) return res.status( 401 ).json( { message: 'Unauthorized' } );
        const userId = Number( ( req.user as any ).id || ( req.user as any )._id );

        const user = await prisma.user.findUnique( { where: { id: userId } } );
        if ( !user ) return res.status( 404 ).json( { message: 'User not found' } );

        const alreadyCompleted = await prisma.userCompletedLesson.findFirst( {
            where: { userId, lessonId: id }
        } );

        if ( !alreadyCompleted )
        {
            await prisma.userCompletedLesson.create( {
                data: { userId, lessonId: id }
            } );
        }

        const completedLessons = await prisma.userCompletedLesson.findMany( {
            where: { userId },
            select: { lessonId: true }
        } );

        res.status( 200 ).json( {
            message: 'Lesson marked as complete',
            completedLessons: completedLessons.map( cl => cl.lessonId )
        } );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error updating progress', error: error.message } );
    }
};

/**
 * Creates a brand new lesson entry natively in the database.
 * Restricted to administrator payloads.
 *
 * @param req - Express request object containing lesson content payload.
 * @param res - Express response object.
 */
export const createLesson = async ( req: Request, res: Response ) =>
{
    try
    {
        const lesson = await prisma.lesson.create( { data: req.body } );
        res.status( 201 ).json( lesson );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error creating lesson', error: error.message } );
    }
};

/**
 * Updates an instantiated lesson using matching object properties.
 * Coerces order priority logic into proper numeric formats ensuring the database syncs properly.
 *
 * @param req - Express request object containing the updated fields.
 * @param res - Express response object.
 */
export const updateLesson = async ( req: Request, res: Response ) =>
{
    try
    {
        const id = Number( req.params.id );
        let updateData: any = { ...req.body };
        if ( updateData.order ) updateData.order = Number( updateData.order );

        const lesson = await prisma.lesson.update( { where: { id }, data: updateData } );
        res.status( 200 ).json( lesson );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error updating lesson', error: error.message } );
    }
};

/**
 * Permanently deletes a lesson from the application.
 *
 * @param req - Express request object containing lesson ID target.
 * @param res - Express response object status.
 */
export const deleteLesson = async ( req: Request, res: Response ) =>
{
    try
    {
        const id = Number( req.params.id );
        await prisma.lesson.delete( { where: { id } } );
        res.status( 200 ).json( { message: 'Lesson deleted successfully' } );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error deleting lesson', error: error.message } );
    }
};
