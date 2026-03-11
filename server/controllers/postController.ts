import { Request, Response } from 'express';
import prisma from '../database/dbConnection';

/**
 * =========================================
 * Community Forum / Post Controller
 * =========================================
 * Architectural Pattern: Relational Data Joining
 * 
 * Purpose: Manages the CRUD lifecycle for public community forum posts.
 * Utilizes advanced Prisma `include` clauses to automatically JOIN user profiles 
 * (author names/photos) alongside raw post payloads instantaneously, preventing 
 * N+1 query bottlenecks on the frontend feed render.
 */

/**
 * Pulls all feed posts from the database while linking relational user metadata.
 * Sorts automatically by descending creation date so the newest content appears first.
 *
 * @param req - Express request object.
 * @param res - Express response object returning the array of posts mapped with authors.
 */
export const getAllPosts = async ( req: Request, res: Response ) =>
{
    try
    {
        const posts = await prisma.post.findMany( {
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        photo: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        } );
        res.status( 200 ).json( posts );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error fetching posts', error: error.message } );
    }
};

/**
 * Executes the creation of a new text post bound to the active user's credentials.
 * Automatically ties the user properties directly into the return object to immediately mount
 * the author UI avatar into the frontend feed map correctly.
 *
 * @param req - Express request object carrying the string content body and JWT user.
 * @param res - Express response object returning the fully formed post object.
 */
export const createPost = async ( req: Request, res: Response ) =>
{
    try
    {
        const { content } = req.body;
        if ( !req.user ) return res.status( 401 ).json( { message: 'Unauthorized' } );

        // Support either .id (postgres format) or ._id (legacy mongo auth payload)
        const authorId = Number( ( req.user as any ).id || ( req.user as any )._id );

        if ( !content ) return res.status( 400 ).json( { message: 'Content is required' } );

        const newPost = await prisma.post.create( {
            data: {
                content,
                authorId
            },
            include: {
                author: { select: { id: true, name: true, photo: true } }
            }
        } );

        res.status( 201 ).json( newPost );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error creating post', error: error.message } );
    }
};

/**
 * Amends an existing post string. Fails gracefully if the user requesting
 * the edit does not match the actual author ID of the existing post within the database.
 *
 * @param req - Express request containing updated content string block.
 * @param res - Express response object.
 */
export const updatePost = async ( req: Request, res: Response ) =>
{
    try
    {
        const id = Number( req.params.id );
        const { content } = req.body;
        if ( !req.user ) return res.status( 401 ).json( { message: 'Unauthorized' } );

        const userId = Number( ( req.user as any ).id || ( req.user as any )._id );
        const post = await prisma.post.findUnique( { where: { id } } );

        if ( !post ) return res.status( 404 ).json( { message: 'Post not found' } );
        if ( post.authorId !== userId ) return res.status( 403 ).json( { message: 'Not authorized to update this post' } );

        const updatedPost = await prisma.post.update( {
            where: { id },
            data: { content: content || post.content },
            include: { author: { select: { id: true, name: true, photo: true } } }
        } );

        res.status( 200 ).json( updatedPost );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error updating post', error: error.message } );
    }
};

/**
 * Destroys a target post in the database natively.
 * Enforces ownership logic ensuring only the author _or_ a system administrator can delete.
 *
 * @param req - Express request containing post ID.
 * @param res - Express response object emitting success logic or a 403 Forbidden.
 */
export const deletePost = async ( req: Request, res: Response ) =>
{
    try
    {
        const id = Number( req.params.id );
        if ( !req.user ) return res.status( 401 ).json( { message: 'Unauthorized' } );

        const userId = Number( ( req.user as any ).id || ( req.user as any )._id );
        const isAdmin = ( req.user as any ).isAdmin;

        const post = await prisma.post.findUnique( { where: { id } } );

        if ( !post ) return res.status( 404 ).json( { message: 'Post not found' } );
        if ( post.authorId !== userId && !isAdmin )
        {
            return res.status( 403 ).json( { message: 'Not authorized to delete this post' } );
        }

        await prisma.post.delete( { where: { id } } );

        res.status( 200 ).json( { message: 'Post deleted' } );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error deleting post', error: error.message } );
    }
};
