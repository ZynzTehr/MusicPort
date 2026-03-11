import React from 'react';
import PostItem from './PostItem';

/**
 * TypeScript Interface: Post
 * Mirrors the Post interface in PostItem.tsx.
 * In a larger application, this interface would ideally reside in a shared `@types/` folder 
 * and be imported by both components to enforce strict DRY (Don't Repeat Yourself) principles.
 */
interface Post
{
    _id: string;
    content: string;
    author: {
        _id: string;
        name: string;
        photo?: string;
    };
    createdAt: string;
}

/**
 * TypeScript Interface: PostListProps
 * 
 * Defines the massive array of structured `Post` payloads expected from the parent container,
 * alongside the destructive/mutational callback handlers to be passed directly down into the 
 * individual `PostItem` children rendering below.
 */
interface PostListProps
{
    posts: Post[];
    onPostUpdated: ( post: Post ) => void;
    onPostDeleted: ( postId: string ) => void;
}

/**
 * PostList Component
 * 
 * Architectural Pattern: List/Iterator Component.
 * Purely presentational. It iterates over the array dataset and delegates the complex 
 * rendering logic of individual cards down to `<PostItem />`.
 */
const PostList: React.FC<PostListProps> = ( { posts, onPostUpdated, onPostDeleted } ) =>
{
    // Render Guard: Fallback UI for empty datasets.
    if ( !posts || posts.length === 0 )
    {
        return (
            <div className="text-center text-muted mt-5">
                <h4>No posts yet.</h4>
                <p>Be the first to say hello!</p>
            </div>
        );
    }

    return (
        <div className="post-list">
            {/* 
              * React highly optimizes rendering natively through `.map()`.
              * The uniquely assigned `key` prop here is critical for the React Virtual DOM diffing engine
              * to isolate exactly which elements modify or unmount during array mutations.
              */}
            { posts.map( ( post ) => (
                <PostItem
                    key={ post._id }
                    post={ post }
                    onPostUpdated={ onPostUpdated }
                    onPostDeleted={ onPostDeleted }
                />
            ) ) }
        </div>
    );
};

export default PostList;
