import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { fetchLessonById, markLessonAsComplete } from '../api/lessons';
import { AuthContext } from '../context/AuthContext';

/**
 * TypeScript Interface: Lesson
 * Exposes the structure of a single educational module.
 * Notably includes the `videoUrl` which will be bound directly to an iframe's source.
 */
interface Lesson
{
    _id: string;
    videoUrl: string;
    title: string;
    difficulty: string;
    instrument: string;
    content: string;
}

/**
 * LessonPage Component
 * 
 * Architectural Pattern: Deep-Link Detail View / Interactive Consumer.
 * 
 * Purpose: Analyzes the dynamic React Router URL segment (`:lessonId`) to fetch 
 * and display a specific video tutorial. It also interfaces directly with the 
 * global `AuthContext` to sync a user's progress (marking videos as watched).
 */
const LessonPage: React.FC = () =>
{
    const { lessonId } = useParams<{ lessonId: string; }>();
    const [ lesson, setLesson ] = useState<Lesson | null>( null );
    const [ loading, setLoading ] = useState<boolean>( true );
    const authContext = useContext( AuthContext );
    const user = authContext?.user;
    const [ completed, setCompleted ] = useState<boolean>( false );

    /**
     * Component Mount / Dependency Refresh Lifecycle
     * 1. Extracts `lessonId` from the browser URL.
     * 2. Re-fetches database content if the ID changes (user clicked "Next Lesson").
     * 3. Cross-references the fetched lesson's ID against the Global User Context's `completedLessons` array.
     */
    useEffect( () =>
    {
        const loadLesson = async () =>
        {
            try
            {
                if ( lessonId )
                {
                    const { data } = await fetchLessonById( lessonId );
                    setLesson( data );

                    // Defensive check: Does the user object exist, and is this ID in their array?
                    if ( user?.completedLessons?.some( ( id: any ) => id.toString() === data._id ) )
                    {
                        setCompleted( true );
                    }
                }

                setLoading( false );
            } catch ( error )
            {
                console.error( 'Error fetching lesson:', error );
                setLoading( false );
            }
        };
        loadLesson();
    }, [ lessonId, user ] ); // Re-run if the URL changes OR if the User logs in/out.

    const handleComplete = async () =>
    {
        if ( !user ) return alert( 'Please login to track progress.' );
        try
        {
            if ( lessonId ) await markLessonAsComplete( lessonId );
            setCompleted( true );
            // Ideally we should update the global user context here
            // but for now visual feedback is enough
        } catch ( error )
        {
            console.error( 'Error marking complete:', error );
        }
    };

    if ( loading ) return <div className="text-center py-5"><Spinner animation="border" variant="info" /></div>;
    if ( !lesson ) return <div className="text-center py-5">Lesson not found</div>;

    return (
        <Container className="py-5">
            <Link to={ `/lessons/${ lesson.instrument }` } className="btn btn-outline-secondary mb-4">
                <i className="bi bi-arrow-left"></i> Back to Curriculum
            </Link>

            <Row className="justify-content-center">
                <Col lg={ 10 }>
                    <div className="ratio ratio-16x9 mb-4 shadow rounded overflow-hidden">
                        <iframe
                            src={ lesson.videoUrl }
                            title={ lesson.title }
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>

                    <div className="bg-white p-4 rounded shadow-sm">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <h1 className="fw-bold">{ lesson.title }</h1>
                            { completed ? (
                                <Button variant="success" disabled>
                                    Completed <i className="bi bi-check-lg"></i>
                                </Button>
                            ) : (
                                <Button variant="info" className="text-white fw-bold" onClick={ handleComplete }>
                                    Mark as Complete
                                </Button>
                            ) }
                        </div>

                        <h5 className="text-muted text-capitalize mb-4">{ lesson.difficulty } Level - { lesson.instrument }</h5>

                        <div className="lesson-content">
                            <h4>Instructor Notes</h4>
                            <p className="lead">{ lesson.content }</p>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default LessonPage;
