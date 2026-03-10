import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { fetchAllPosts } from '../api/posts';
import PostInput from '../components/PostInput';
import PostList from '../components/PostList';

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

const ChatPage: React.FC = () =>
{
    const [ posts, setPosts ] = useState<Post[]>( [] );
    const [ loading, setLoading ] = useState( true );

    // Fetch all posts on component mount
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

    const handlePostCreated = ( newPost: Post ) =>
    {
        setPosts( [ newPost, ...posts ] );
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
