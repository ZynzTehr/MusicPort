import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const instruments = [
    {
        name: 'Guitar',
        path: 'guitar',
        img: '../assets/images/guitar.avif',
        desc: 'Learn riffs, chords, and scales.'
    },
    {
        name: 'Bass',
        path: 'bass',
        img: '../assets/images/bass.avif',
        desc: 'Master the groove and rhythm.'
    },
    {
        name: 'Drums',
        path: 'drums',
        img: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        desc: 'Keep the beat and drive the band.'
    },
    {
        name: 'Keyboard',
        path: 'keyboard',
        img: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        desc: 'Explore melodies and harmonies.'
    }
];

/**
 * LessonsPage Component
 * 
 * Architectural Pattern: Static Categorization Hub.
 * 
 * Purpose: Unlike generating navigation dynamically from a database, this page hardcodes 
 * the top-level instrument categories (`const instruments`). This guarantees these primary 
 * navigational routes (`/lessons/guitar`, `.../bass`) are consistently available 
 * even if the curriculum database temporarily fails.
 */
const LessonsPage: React.FC = () =>
{
    return (
        <Container className="py-5">
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold text-info">Music Academy</h1>
                <p className="lead">Choose your instrument and start learning today.</p>
            </div>
            <Row xs={ 1 } md={ 2 } className="g-4">
                { instruments.map( ( inst ) => (
                    <Col key={ inst.name }>
                        <Link to={ `/lessons/${ inst.path }` } style={ { textDecoration: 'none' } }>
                            <Card className="h-100 shadow border-0 hover-scale" style={ { transition: 'transform 0.2s' } }>
                                <div style={ { height: '200px', overflow: 'hidden' } }>
                                    <Card.Img
                                        variant="top"
                                        src={ inst.img }
                                        style={ { height: '100%', objectFit: 'cover' } }
                                    />
                                </div>
                                <Card.Body className="text-center">
                                    <Card.Title className="display-6 fw-bold text-dark">{ inst.name }</Card.Title>
                                    <Card.Text className="text-muted">{ inst.desc }</Card.Text>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                ) ) }
            </Row>
        </Container>
    );
};

export default LessonsPage;
