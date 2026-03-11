import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { fetchAllLessons } from '../api/lessons';
import { AuthContext } from '../context/AuthContext';

/**
 * TypeScript Interface: Lesson
 * Defines the strict requirements for a lesson object payload.
 * The `order` property allows for chronological mapping regardless of creation date.
 */
interface Lesson
{
    _id: string;
    thumbnail: string;
    order: number;
    title: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * InstrumentHub Component
 * 
 * Architectural Pattern: Dynamic Data Router / Categorization Engine.
 * 
 * Purpose: This component acts as a dynamic hub for specific instruments 
 * (e.g., pulling from `/lessons/guitar` vs `/lessons/drums`). 
 * It reads the URL parameters, requests the associated curriculum, and dynamically 
 * groups them into Beginner/Intermediate/Advanced sub-categories.
 */

const InstrumentHub: React.FC = () =>
{
    const { instrument } = useParams<{ instrument: string; }>();
    const [ lessons, setLessons ] = useState<Lesson[]>( [] );
    const [ loading, setLoading ] = useState<boolean>( true );
    const authContext = useContext( AuthContext );
    const user = authContext?.user;

    useEffect( () =>
    {
        const loadLessons = async () =>
        {
            try
            {
                const { data } = await fetchAllLessons( { instrument } );
                setLessons( data );
                setLoading( false );
            } catch ( error )
            {
                console.error( 'Error fetching lessons:', error );
                setLoading( false );
            }
        };
        loadLessons();
    }, [ instrument ] );

    /**
     * Data Mapping: Dynamic Grouping
     * Instead of 3 separate API calls (getBeginner, getIntermediate, getAdvanced),
     * we retrieve the entire chunk once and utilize a `Record<string, Lesson[]>` to 
     * map them into memory objects dynamically. Fast client-side mapping saves network load.
     */
    const groupedLessons: Record<string, Lesson[]> = {
        beginner: lessons.filter( l => l.difficulty === 'beginner' ),
        intermediate: lessons.filter( l => l.difficulty === 'intermediate' ),
        advanced: lessons.filter( l => l.difficulty === 'advanced' )
    };

    /**
     * Global User Context Consumption
     * Confirms if the logged-in User's database `completedLessons` array includes 
     * this specific `lessonId`. We use `some()` for iteration and force string comparison.
     */
    const isCompleted = ( lessonId: string ) =>
    {
        return user?.completedLessons?.some( ( id: any ) => id.toString() === lessonId );
    };

    if ( loading )
    {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="info" />
            </div>
        );
    }

    return (
        <Container className="py-5">
            <h1 className="display-4 fw-bold text-capitalize text-info mb-4">{ instrument } Lessons</h1>

            { [ 'beginner', 'intermediate', 'advanced' ].map( ( level ) => (
                groupedLessons[ level ].length > 0 && (
                    <div key={ level } className="mb-5">
                        <h3 className="text-capitalize text-secondary mb-3 border-bottom pb-2">
                            { level } Level
                        </h3>
                        <Row xs={ 1 } md={ 2 } lg={ 3 } className="g-4">
                            { groupedLessons[ level ].map( ( lesson ) => (
                                <Col key={ lesson._id }>
                                    <Link to={ `/lessons/${ instrument }/${ lesson._id }` } style={ { textDecoration: 'none' } }>
                                        <Card className="h-100 shadow-sm border-0 hover-scale">
                                            <div style={ { position: 'relative' } }>
                                                <Card.Img variant="top" src={ lesson.thumbnail } />
                                                { isCompleted( lesson._id ) && (
                                                    <Badge
                                                        bg="success"
                                                        style={ { position: 'absolute', top: '10px', right: '10px' } }
                                                    >
                                                        Completed <i className="bi bi-check-lg"></i>
                                                    </Badge>
                                                ) }
                                            </div>
                                            <Card.Body>
                                                <Card.Title className="text-dark fw-bold h5">
                                                    { lesson.order }. { lesson.title }
                                                </Card.Title>
                                                <Card.Text className="text-muted small">
                                                    Click to start watching
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>
                            ) ) }
                        </Row>
                    </div>
                )
            ) ) }

            { lessons.length === 0 && (
                <p className="lead text-center">No lessons found for this instrument yet. Check back soon!</p>
            ) }
        </Container>
    );
};

export default InstrumentHub;
