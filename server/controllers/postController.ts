import { Request, Response } from 'express';
import Post from '../models/Post';

// Get all posts
export const getAllPosts = async ( req: Request, res: Response ) =>
{
    try
    {
        const posts = await Post.find()
            .populate( 'author', 'name photo _id' )
            .sort( { createdAt: -1 } );
        res.status( 200 ).json( posts );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error fetching posts', error: error.message } );
    }
};

// Create a new post
export const createPost = async ( req: Request, res: Response ) =>
{
    try
    {
        const { content } = req.body;
        // req.user is populated by the auth middleware
        if ( !req.user ) return res.status( 401 ).json( { message: 'Unauthorized' } );
        const author = req.user._id;

        if ( !content )
        {
            return res.status( 400 ).json( { message: 'Content is required' } );
        }

        const newPost = await Post.create( {
            content,
            author
        } );

        const populatedPost = await newPost.populate( 'author', 'name photo _id' );

        res.status( 201 ).json( populatedPost );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error creating post', error: error.message } );
    }
};

// Update a post
export const updatePost = async ( req: Request, res: Response ) =>
{
    try
    {
        const { id } = req.params;
        const { content } = req.body;
        if ( !req.user ) return res.status( 401 ).json( { message: 'Unauthorized' } );
        const userId = req.user._id;

        const post = await Post.findById( id );

        if ( !post )
        {
            return res.status( 404 ).json( { message: 'Post not found' } );
        }

        // Check if the user is the author
        if ( post.author.toString() !== userId.toString() )
        {
            return res.status( 403 ).json( { message: 'Not authorized to update this post' } );
        }

        post.content = content || post.content;
        await post.save();

        const updatedPost = await post.populate( 'author', 'name photo _id' );

        res.status( 200 ).json( updatedPost );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error updating post', error: error.message } );
    }
};

// Delete a post
export const deletePost = async ( req: Request, res: Response ) =>
{
    try
    {
        const { id } = req.params;
        if ( !req.user ) return res.status( 401 ).json( { message: 'Unauthorized' } );
        const userId = req.user._id;

        const post = await Post.findById( id );

        if ( !post )
        {
            return res.status( 404 ).json( { message: 'Post not found' } );
        }

        // Check if the user is the author or an admin
        if ( post.author.toString() !== userId.toString() && !req.user.isAdmin )
        {
            return res.status( 403 ).json( { message: 'Not authorized to delete this post' } );
        }

        await post.deleteOne(); // or post.remove() depending on mongoose version, deleteOne is safer in newer versions

        res.status( 200 ).json( { message: 'Post deleted' } );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error deleting post', error: error.message } );
    }
};
