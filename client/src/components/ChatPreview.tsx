import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchAllPosts } from '../api/posts';

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

const ChatPreview: React.FC = () =>
{
    const [ recentPosts, setRecentPosts ] = useState<Post[]>( [] );

    useEffect( () =>
    {
        // Fetch posts and take the last 3-4
        fetchAllPosts()
            .then( ( { data } ) =>
            {
                // Assuming data is array of posts.
                // If sorting is needed, do it here.
                // For now, take the last 4 items (latest).
                const latest = data.slice( -4 ).reverse();
                setRecentPosts( latest );
            } )
            .catch( ( err ) => console.error( "Failed to fetch chat preview", err ) );
    }, [] );

    return (
        <section className="my-5 container">
            <Card className="shadow-lg border-0" style={ { borderRadius: '20px', overflow: 'hidden' } }>
                <Card.Body className="p-0">
                    <Row className="g-0">
                        <Col md={ 5 } className="bg-info text-white p-5 d-flex flex-column justify-content-center align-items-center text-center">
                            <h2 className="display-6 fw-bold mb-3">Community Chat</h2>
                            <p className="lead mb-4">
                                See what's buzzing in the music world! Join the conversation, share your gigs, or just hang out.
                            </p>
                            <Link to="/chat">
                                <Button variant="light" size="lg" className="fw-bold px-4 rounded-pill text-info">
                                    Join the Chat <i className="bi bi-chat-dots-fill ms-2"></i>
                                </Button>
                            </Link>
                        </Col>
                        <Col md={ 7 } className="bg-light p-4">
                            <h5 className="text-secondary mb-3 ms-2">Latest Messages</h5>
                            { recentPosts.length > 0 ? (
                                <ListGroup variant="flush" className="bg-transparent">
                                    { recentPosts.map( ( post ) => (
                                        <ListGroup.Item key={ post._id } className="bg-transparent border-bottom-0 mb-2 rounded-3 shadow-sm bg-white">
                                            <div className="d-flex align-items-start">
                                                <img
                                                    src={ post.author && post.author.photo
                                                        ? `${ import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace( '/api', '' ) : 'http://localhost:4000' }/userProfileImgs/${ post.author.photo }`
                                                        : 'https://via.placeholder.com/40'
                                                    }
                                                    alt={ post.author ? post.author.name : 'User' }
                                                    className="rounded-circle me-3"
                                                    style={ { width: '40px', height: '40px', objectFit: 'cover' } }
                                                />
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <span className="fw-bold text-dark small">
                                                            { post.author ? post.author.name : 'Unknown User' }
                                                        </span>
                                                        <small className="text-muted" style={ { fontSize: '0.75rem' } }>
                                                            { new Date( post.createdAt ).toLocaleDateString() }
                                                        </small>
                                                    </div>
                                                    <p className="mb-0 text-secondary small">
                                                        { post.content.length > 80
                                                            ? post.content.substring( 0, 80 ) + '...'
                                                            : post.content
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    ) ) }
                                </ListGroup>
                            ) : (
                                <div className="text-center text-muted py-5">
                                    <p>No messages yet. Be the first to say hi!</p>
                                </div>
                            ) }
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </section>
    );
};

export default ChatPreview;
