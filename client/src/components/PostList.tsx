import React from 'react';
import PostItem from './PostItem';

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

interface PostListProps
{
    posts: Post[];
    onPostUpdated: ( post: Post ) => void;
    onPostDeleted: ( postId: string ) => void;
}

const PostList: React.FC<PostListProps> = ( { posts, onPostUpdated, onPostDeleted } ) =>
{
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
