import { Request, Response } from 'express';
import Lesson from '../models/Lesson';
import User from '../models/User';

// Get all lessons (with optional filtering)
export const getAllLessons = async ( req: Request, res: Response ) =>
{
    try
    {
        const { instrument, difficulty } = req.query;
        let query: any = {};

        if ( instrument ) query.instrument = ( instrument as string ).toLowerCase();
        if ( difficulty ) query.difficulty = ( difficulty as string ).toLowerCase();

        const lessons = await Lesson.find( query ).sort( { order: 1 } );
        res.status( 200 ).json( lessons );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error fetching lessons', error: error.message } );
    }
};

// Get single lesson by ID
export const getLessonById = async ( req: Request, res: Response ) =>
{
    try
    {
        const { id } = req.params;
        const lesson = await Lesson.findById( id );

        if ( !lesson )
        {
            return res.status( 404 ).json( { message: 'Lesson not found' } );
        }

        res.status( 200 ).json( lesson );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error fetching lesson', error: error.message } );
    }
};

// Mark lesson as complete
export const markLessonComplete = async ( req: Request, res: Response ) =>
{
    try
    {
        const { id } = req.params;
        if ( !req.user ) return res.status( 401 ).json( { message: 'Unauthorized' } );
        const userId = req.user._id;

        const user = await User.findById( userId );
        if ( !user )
        {
            return res.status( 404 ).json( { message: 'User not found' } );
        }

        // Add to completedLessons if not already there
        // mongoose objectId comparison might need toString()
        const alreadyCompleted = user.completedLessons.some( lessonId => lessonId.toString() === id );

        if ( !alreadyCompleted )
        {
            // @ts-ignore
            user.completedLessons.push( id );
            await user.save();
        }

        res.status( 200 ).json( { message: 'Lesson marked as complete', completedLessons: user.completedLessons } );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error updating progress', error: error.message } );
    }
};

// Create a new lesson
export const createLesson = async ( req: Request, res: Response ) =>
{
    try
    {
        const lesson = await Lesson.create( req.body );
        res.status( 201 ).json( lesson );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error creating lesson', error: error.message } );
    }
};

// Update a lesson
export const updateLesson = async ( req: Request, res: Response ) =>
{
    try
    {
        const { id } = req.params;
        const lesson = await Lesson.findByIdAndUpdate( id, req.body, { new: true } );
        if ( !lesson )
        {
            return res.status( 404 ).json( { message: 'Lesson not found' } );
        }
        res.status( 200 ).json( lesson );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error updating lesson', error: error.message } );
    }
};

// Delete a lesson
export const deleteLesson = async ( req: Request, res: Response ) =>
{
    try
    {
        const { id } = req.params;
        const lesson = await Lesson.findByIdAndDelete( id );
        if ( !lesson )
        {
            return res.status( 404 ).json( { message: 'Lesson not found' } );
        }
        res.status( 200 ).json( { message: 'Lesson deleted successfully' } );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error deleting lesson', error: error.message } );
    }
};
