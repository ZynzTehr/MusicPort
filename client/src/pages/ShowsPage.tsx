import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import ShowCard from '../components/ShowCard';
import { fetchAllShows, searchShows } from '../api/shows';

interface Show
{
  _id: string;
  image: string;
  name: string;
  bands: string[];
  address: string;
  city: string;
  state: string;
  zipcode: string;
  price: number;
}

/**
 * ShowsPage Component
 * 
 * Architectural Pattern: Complex Filter Hub + Geolocation Consumer.
 * 
 * Purpose: Handles displaying all upcoming concerts while offering dual-mode search capabilities:
 * 1. String-based text filtering (City, State) sent cleanly to the Backend.
 * 2. Native HTML5 Hardware Geolocation (Lat/Long extraction) triggering a geo-radius backend search.
 */
const ShowsPage: React.FC = () =>
{
  const [ shows, setShows ] = useState<Show[]>( [] );
  const [ loading, setLoading ] = useState<boolean>( true );
  const [ searchCity, setSearchCity ] = useState<string>( '' );
  const [ searchState, setSearchState ] = useState<string>( '' );
  const [ locationError, setLocationError ] = useState<string>( '' );
  const [ userLocation, setUserLocation ] = useState<{ lat: number; lng: number; } | null>( null );

  // Initial load
  useEffect( () =>
  {
    loadAllShows();
  }, [] );

  /**
   * Initializes the aggregate fetch of all database concerts strictly on component mount.
   */
  const loadAllShows = async () =>
  {
    setLoading( true );
    try
    {
      const { data } = await fetchAllShows();
      setShows( data );
    } catch ( error )
    {
      console.error( "Error fetching shows:", error );
    } finally
    {
      setLoading( false );
    }
  };

  /**
   * Intercepts explicit user form submission blocking default reload.
   * Generates a partial-match filter query passing explicit state/city properties into the API layer directly.
   */
  const handleSearch = async ( e: React.FormEvent ) =>
  {
    e.preventDefault();
    setLoading( true );
    try
    {
      const { data } = await searchShows( { city: searchCity, state: searchState } );
      setShows( data );
    } catch ( error )
    {
      console.error( "Error searching shows:", error );
    } finally
    {
      setLoading( false );
    }
  };

  /**
   * Engages the native navigator HTML5 geolocation architecture requesting raw user lat/long bounds securely.
   * Automatically executes the geographic radius queries returning localized concert blocks strictly.
   */
  const handleGeolocation = () =>
  {
    setLoading( true );
    setLocationError( '' );

    if ( !navigator.geolocation )
    {
      setLocationError( 'Geolocation is not supported by your browser' );
      setLoading( false );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ( position ) =>
      {
        const { latitude, longitude } = position.coords;
        setUserLocation( { lat: latitude, lng: longitude } );

        try
        {
          const { data } = await searchShows( { lat: latitude, lng: longitude } );
          setShows( data );
        } catch ( error )
        {
          console.error( "Error fetching nearby shows:", error );
        } finally
        {
          setLoading( false );
        }
      },
      ( error ) =>
      {
        console.error( "Geolocation error:", error );
        setLocationError( 'Unable to retrieve your location' );
        setLoading( false );
      }
    );
  };

  const handleReset = () =>
  {
    setSearchCity( '' );
    setSearchState( '' );
    setLocationError( '' );
    setUserLocation( null );
    loadAllShows();
  };

  return (
    <Container className="py-5">
      <Row className="mb-4 text-center">
        <Col>
          <h1 className="display-4 fw-bold text-info">Find Shows Near You</h1>
          <p className="lead text-light">Search by city, state, or use your current location.</p>
        </Col>
      </Row>

      {/* Search Controls */ }
      <Row className="justify-content-center mb-5">
        <Col md={ 10 } lg={ 8 }>
          <div className="bg-white p-4 rounded shadow-sm">
            <Form onSubmit={ handleSearch }>
              <Row className="g-3 align-items-end">
                <Col md={ 4 }>
                  <Form.Group>
                    <Form.Label className="text-muted small fw-bold">CITY</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Los Angeles"
                      value={ searchCity }
                      onChange={ ( e ) => setSearchCity( e.target.value ) }
                    />
                  </Form.Group>
                </Col>
                <Col md={ 3 }>
                  <Form.Group>
                    <Form.Label className="text-muted small fw-bold">STATE</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. CA"
                      value={ searchState }
                      onChange={ ( e ) => setSearchState( e.target.value ) }
                      maxLength={ 2 }
                    />
                  </Form.Group>
                </Col>
                <Col md={ 5 } className="d-flex gap-2">
                  <Button variant="info" type="submit" className="text-white fw-bold flex-grow-1">
                    Search
                  </Button>
                  <Button variant="outline-dark" onClick={ handleGeolocation } title="Use My Location">
                    <i className="bi bi-geo-alt-fill"></i> Near Me
                  </Button>
                  <Button variant="outline-secondary" onClick={ handleReset } title="Reset">
                    <i className="bi bi-arrow-counterclockwise"></i> Reset
                  </Button>
                </Col>
              </Row>
            </Form>

            { locationError && (
              <Alert variant="warning" className="mt-3 mb-0">
                { locationError }
              </Alert>
            ) }

            { userLocation && !locationError && (
              <div className="mt-2 text-success small">
                <i className="bi bi-geo-alt"></i> Location found! Showing shows within 50 miles.
              </div>
            ) }
          </div>
        </Col>
      </Row>

      {/* Results */ }
      { loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="info" />
          <p className="mt-3 text-muted">Finding the best gigs...</p>
        </div>
      ) : shows.length > 0 ? (
        <Row xs={ 1 } md={ 2 } lg={ 3 } className="g-4">
          { shows.map( show => (
            <Col key={ show._id }>
              <ShowCard venue={ show } />
            </Col>
          ) ) }
        </Row>
      ) : (
        <div className="text-center py-5 text-muted">
          <h3>No shows found matching your criteria.</h3>
          <p>Try a different location or check back later!</p>
        </div>
      ) }
    </Container>
  );
};

export default ShowsPage;