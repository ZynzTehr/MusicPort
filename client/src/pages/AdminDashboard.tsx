import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Spinner } from 'react-bootstrap';

/**
 * AdminDashboard Component
 * 
 * Architectural Pattern: Aggregator / Analytics View.
 * Purpose: Serves as the landing hub for Administrators. It aggressively fetches 
 * metadata (counts) across multiple independent database collections to provide 
 * a high-level bird's-eye view of platform health.
 */
const AdminDashboard: React.FC = () =>
{
    // Centralized state object specifically tracking numerical KPI metrics.
    const [ stats, setStats ] = useState( {
        users: 0,
        products: 0,
        shows: 0,
        lessons: 0
    } );
    const [ loading, setLoading ] = useState( true );

    // Mount lifecycle: Trigger data aggregation immediately.
    useEffect( () =>
    {
        const fetchStats = async () =>
        {
            try
            {
                // Security verification: Block the aggregate query if they spoofed the route guard.
                const token = sessionStorage.getItem( 'token' );
                if ( !token ) return;

                const headers = { Authorization: `Bearer ${ token }` };

                /**
                 * Concurrency Optimization: Promise.all()
                 * Instead of waiting 1 second for Users, THEN 1 second for Products (2 seconds total),
                 * we fire all four API requests simultaneously. The longest request dictates the 
                 * total loading time. This is a massive UX performance upgrade.
                 */
                const [ usersRes, productsRes, showsRes, lessonsRes ] = await Promise.all( [
                    axios.get( '/api/users', { headers } ), // Requires Admin JWT
                    axios.get( '/api/products' ),           // Public route
                    axios.get( '/api/shows' ),              // Public route
                    axios.get( '/api/lessons' )             // Public route
                ] );

                // Handle users response which might be paginated
                const usersCount = Array.isArray( usersRes.data ) ? usersRes.data.length : ( usersRes.data.users?.length || 0 );

                setStats( {
                    users: usersCount,
                    products: productsRes.data.length,
                    shows: showsRes.data.length,
                    lessons: lessonsRes.data.length
                } );
            } catch ( error )
            {
                console.error( "Error fetching admin stats:", error );
            } finally
            {
                setLoading( false );
            }
        };

        fetchStats();
    }, [] );

    if ( loading )
    {
        return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;
    }

    return (
        <div>
            <div className="admin-page-header mb-4">
                <h1 className="admin-page-title fw-bold">Dashboard</h1>
                <p className="text-muted fw-bold">Welcome to the MusicPort Admin Panel.</p>
            </div>

            <Row className="g-4">
                <Col md={ 3 }>
                    <Card className="text-center h-100 shadow-sm border-0 bg-dark text-light">
                        <Card.Body>
                            <h5 className="card-title text-light mb-3">Total Users</h5>
                            <h2 className="display-4 fw-bold">{ stats.users }</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={ 3 }>
                    <Card className="text-center h-100 shadow-sm border-0 bg-dark text-light">
                        <Card.Body>
                            <h5 className="card-title text-light mb-3">Products</h5>
                            <h2 className="display-4 fw-bold">{ stats.products }</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={ 3 }>
                    <Card className="text-center h-100 shadow-sm border-0 bg-dark text-light">
                        <Card.Body>
                            <h5 className="card-title text-light mb-3">Shows</h5>
                            <h2 className="display-4 fw-bold">{ stats.shows }</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={ 3 }>
                    <Card className="text-center h-100 shadow-sm border-0 bg-dark text-light">
                        <Card.Body>
                            <h5 className="card-title text-light mb-3">Lessons</h5>
                            <h2 className="display-4 fw-bold">{ stats.lessons }</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <div className="admin-card mt-5">
                <h3 className="text-muted">Quick Actions</h3>
                <div className="d-flex gap-3 mt-3">
                    <a href="/admin/products" className="btn btn-primary">Manage Products</a>
                    <a href="/admin/shows" className="btn btn-outline-secondary">Manage Shows</a>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
