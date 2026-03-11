// Import core React features for building UI and handling side-effects/state.
import React, { useEffect, useState } from 'react';

// React Bootstrap provides pre-styled, responsive flexbox components.
import { Card, Button, Row, Col, ListGroup } from 'react-bootstrap';

// Link is crucial for SPA (Single Page Application) routing without page reloads.
import { Link } from 'react-router-dom';

// Import our API utility function that abstracts the Axios/fetch call to our backend.
import { fetchAllPosts } from '../api/posts';

/**
 * TypeScript Interface: Post
 * 
 * Defining the shape of our data is critical for a robust frontend. 
 * This tells TypeScript exactly what fields to expect from the backend API, 
 * powering autocomplete and catching undefined-variable errors at compile time.
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
 * ChatPreview Component
 * 
 * This component acts as a "teaser" widget, usually displayed on a Dashboard or Homepage.
 * It fetches the global list of community chat posts, but selectively filters them 
 * so it only displays the most recent handful of messages. 
 */
const ChatPreview: React.FC = () =>
{
    // State to hold the sliced array of recent posts. Starts empty.
    const [ recentPosts, setRecentPosts ] = useState<Post[]>( [] );

    /**
     * Data Hydration Effect
     * 
     * We run this API call only once when the component mounts (empty dependency array `[]`).
     * As a senior engineer, I'd normally attach a polling mechanism or a WebSocket listener 
     * here if this needed to be real-time, but a simple HTTP fetch is fine for a teaser preview.
     */
    useEffect( () =>
    {
        // Execute the imported API call.
        fetchAllPosts()
            .then( ( { data } ) =>
            {
                // The `data` array represents all history.
                // slice(-4) grabs the final 4 items in the monolithic array.
                // reverse() flips them so the absolute newest is at index 0 (top of the UI list).
                const latest = data.slice( -4 ).reverse();
                setRecentPosts( latest );
            } )
            .catch( ( err ) => console.error( "Failed to fetch chat preview:", err ) );
    }, [] );

    return (
        <section className="my-5 container">
            <Card className="shadow-lg border-0" style={ { borderRadius: '20px', overflow: 'hidden' } }>
                <Card.Body className="p-0">
                    <Row className="g-0">
                        {/* 
                          * Left Column: Call to Action (CTA)
                          * We use standard Bootstrap 12-column grid (`md={5}`).
                          * This side acts as a marketing push to drive users into the actual chat route.
                          */}
                        <Col md={ 5 } className="bg-info text-white p-5 d-flex flex-column justify-content-center align-items-center text-center">
                            <h2 className="display-6 fw-bold mb-3">Community Chat</h2>
                            <p className="lead mb-4">
                                See what's buzzing in the music world! Join the conversation, share your gigs, or just hang out.
                            </p>
                            
                            {/* Seamless SPA routing to the full Chat Application */}
                            <Link to="/chat">
                                <Button variant="light" size="lg" className="fw-bold px-4 rounded-pill text-info">
                                    Join the Chat <i className="bi bi-chat-dots-fill ms-2"></i>
                                </Button>
                            </Link>
                        </Col>

                        {/* 
                          * Right Column: Dynamic Data List
                          * Takes up the remaining 7 columns (`md={7}`).
                          */}
                        <Col md={ 7 } className="bg-light p-4">
                            <h5 className="text-secondary mb-3 ms-2">Latest Messages</h5>
                            
                            {/* Conditional Rendering: Handle the "Zero State" if the DB is empty */}
                            { recentPosts.length > 0 ? (
                                <ListGroup variant="flush" className="bg-transparent">
                                    
                                    {/* Map over our State array and dynamically render List Items */}
                                    { recentPosts.map( ( post ) => (
                                        <ListGroup.Item key={ post._id } className="bg-transparent border-bottom-0 mb-2 rounded-3 shadow-sm bg-white">
                                            <div className="d-flex align-items-start">
                                                
                                                {/* 
                                                  * Avatar Image Handling 
                                                  * This includes complex fallback logic in case the author, 
                                                  * the author's photo, or the environment variable is missing.
                                                  */}
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
                                                    {/* Fallback to 'Unknown User' if Author relation failed to populate from DB */}
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <span className="fw-bold text-dark small">
                                                            { post.author ? post.author.name : 'Unknown User' }
                                                        </span>
                                                        <small className="text-muted" style={ { fontSize: '0.75rem' } }>
                                                            { new Date( post.createdAt ).toLocaleDateString() }
                                                        </small>
                                                    </div>

                                                    {/* 
                                                      * Message Truncation
                                                      * Since this is a preview widget, we don't want massive paragraphs breaking the UI.
                                                      * We strictly cut the string at 80 characters and append an ellipsis.
                                                      */}
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
