import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { fetchAllPosts } from '../api/posts';
import PostInput from '../components/PostInput';
import PostList from '../components/PostList';

/**
 * TypeScript Interface: Post
 * Defines the strict shape of a chat message. 
 * `author` is heavily populated with sub-document UI properties (name/photo).
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
 * ChatPage Component
 * 
 * Architectural Pattern: Top-Level Smart Page / State Manager.
 * 
 * Purpose: This acts as the "Brain" for the community forum. It holds the Master State 
 * array (`posts`) and delegates subsets of that state down to "Dumb" children components 
 * (`<PostList>` and `<PostInput>`) via Props.
 */
const ChatPage: React.FC = () =>
{
    // The Master Source of Truth for all active chat threads on the screen.
    const [ posts, setPosts ] = useState<Post[]>( [] );
    const [ loading, setLoading ] = useState( true );

    // Initialization: Fetch all posts immediately on page load.
    useEffect( () =>
    {
        fetchPosts();
    }, [] );

    const fetchPosts = async () =>
    {
        try
        {
            const { data } = await fetchAllPosts();
            setPosts( data );
            setLoading( false );
        } catch ( error )
        {
            console.error( 'Error fetching posts:', error );
            setLoading( false );
        }
    };

    /**
     * Action Callback: handlePostCreated
     * 
     * Pattern: "Data-Down, Actions-Up" (Inverse Data Flow)
     * When `<PostInput>` successfully hits the API, it calls this function (passed as a prop).
     * We dynamically inject the newly returned Post object into the *front* of our local array,
     * instantly updating the UI without requiring an expensive secondary network fetch.
     */
    const handlePostCreated = ( newPost: Post ) =>
    {
        setPosts( [ newPost, ...posts ] ); // The Spread Operator (...) preserves existing data.
    };

    const handlePostUpdated = ( updatedPost: Post ) =>
    {
        setPosts( posts.map( post => post._id === updatedPost._id ? updatedPost : post ) );
    };

    const handlePostDeleted = ( deletedPostId: string ) =>
    {
        setPosts( posts.filter( post => post._id !== deletedPostId ) );
    };

    return (
        <div className="page-content" style={ { minHeight: '80vh', backgroundColor: '#f8f9fa' } }>
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={ 10 } lg={ 8 }>
                        <div className="text-center mb-4">
                            <h1 className="fw-bold text-dark">Community Chat</h1>
                            <p className="text-muted">Connect with other music enthusiasts!</p>
                        </div>

                        <PostInput onPostCreated={ handlePostCreated } />

                        { loading ? (
                            <div className="d-flex justify-content-center py-5">
                                <Spinner animation="border" variant="info" />
                            </div>
                        ) : (
                            <PostList
                                posts={ posts }
                                onPostUpdated={ handlePostUpdated }
                                onPostDeleted={ handlePostDeleted }
                            />
                        ) }
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ChatPage;
