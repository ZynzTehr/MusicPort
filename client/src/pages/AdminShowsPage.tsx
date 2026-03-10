import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Table, Spinner, Image, Badge } from 'react-bootstrap';

interface Venue
{
    _id: string;
    name: string;
    bands: string[];
    date: string;
    price: number;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    image: string;
}

const AdminShowsPage: React.FC = () =>
{
    const [ shows, setShows ] = useState<Venue[]>( [] );
    const [ loading, setLoading ] = useState( true );
    const [ showModal, setShowModal ] = useState( false );
    const [ editingShow, setEditingShow ] = useState<Venue | null>( null );

    // Form state
    const [ formData, setFormData ] = useState( {
        name: '',
        bands: '', // Managed as comma-separated string for input
        date: '',
        price: 0,
        address: '',
        city: '',
        state: '',
        zipcode: '',
        image: ''
    } );

    useEffect( () =>
    {
        fetchShows();
    }, [] );

    const fetchShows = async () =>
    {
        try
        {
            const response = await axios.get( '/api/shows/all?q=' ); // The getAllShows controller handles query params, passing empty q might return all if logic permits.
            // Wait, getAllShows controller filters by city/state/q. If no params, it might return empty or all?
            // Let's check showControllers.ts again.
            // It says: const shows = await Venue.find( query );
            // If query is empty {}, it returns all. So just /api/shows should work if I routed it correctly?
            // Routes: router.get( '/shows', getAllShows ); -> maps to /api/shows
            // But wait, there is also router.get( '/shows/:state', getShowsByLocation );
            // If I call /api/shows, it hits getAllShows.
            const res = await axios.get( '/api/shows' );
            setShows( res.data );
            setLoading( false );
        } catch ( error )
        {
            console.error( "Error fetching shows:", error );
            setLoading( false );
        }
    };

    const handleShowModal = ( show?: Venue ) =>
    {
        if ( show )
        {
            setEditingShow( show );
            setFormData( {
                name: show.name,
                bands: show.bands.join( ', ' ),
                date: show.date,
                price: show.price,
                address: show.address,
                city: show.city,
                state: show.state,
                zipcode: show.zipcode,
                image: show.image
            } );
        } else
        {
            setEditingShow( null );
            setFormData( {
                name: '',
                bands: '',
                date: '',
                price: 0,
                address: '',
                city: '',
                state: '',
                zipcode: '',
                image: ''
            } );
        }
        setShowModal( true );
    };

    const handleCloseModal = () => setShowModal( false );

    const handleInputChange = ( e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ) =>
    {
        const { name, value } = e.target;
        setFormData( prev => ( {
            ...prev,
            [ name ]: name === 'price' ? parseFloat( value ) : value
        } ) );
    };

    const handleSubmit = async ( e: React.FormEvent ) =>
    {
        e.preventDefault();
        try
        {
            const token = sessionStorage.getItem( 'token' );
            const config = {
                headers: { Authorization: `Bearer ${ token }` }
            };

            const payload = {
                ...formData,
                bands: formData.bands.split( ',' ).map( b => b.trim() ).filter( b => b !== '' )
            };

            if ( editingShow )
            {
                const response = await axios.put( `/api/shows/${ editingShow._id }`, payload, config );
                setShows( shows.map( s => s._id === editingShow._id ? response.data : s ) );
            } else
            {
                const response = await axios.post( '/api/shows', payload, config );
                setShows( [ ...shows, response.data ] );
            }
            handleCloseModal();
        } catch ( error: any )
        {
            alert( error.response?.data?.message || 'Operation failed' );
        }
    };

    const handleDelete = async ( id: string ) =>
    {
        console.log( 'Delete requested for show ID:', id );
        if ( !window.confirm( 'Are you sure you want to delete this show?' ) ) return;
        try
        {
            const token = sessionStorage.getItem( 'token' );
            await axios.delete( `/api/shows/${ id }`, {
                headers: { Authorization: `Bearer ${ token }` }
            } );
            setShows( shows.filter( s => s._id !== id ) );
        } catch ( error: any )
        {
            alert( error.response?.data?.message || 'Delete failed' );
        }
    };

    if ( loading ) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div>
            <div className="admin-page-header d-flex justify-content-between align-items-center">
                <h1 className="admin-page-title fw-bold">Show Management</h1>
                <Button variant="primary" onClick={ () => handleShowModal() }>
                    <i className="fas fa-plus me-2"></i>Add Show
                </Button>
            </div>

            <div className="admin-card">
                <Table responsive hover className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Venue / Band</th>
                            <th>Location</th>
                            <th>Date</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-muted">
                        { shows.map( show => (
                            <tr key={ show._id }>
                                <td style={ { width: '80px' } }>
                                    <Image src={ show.image } alt={ show.name } thumbnail style={ { width: '50px', height: '50px', objectFit: 'cover' } } />
                                </td>
                                <td>
                                    <strong>{ show.name }</strong><br />
                                    <small>{ show.bands.join( ', ' ) }</small>
                                </td>
                                <td>{ show.city }, { show.state }</td>
                                <td>{ show.date }</td>
                                <td>${ show.price }</td>
                                <td>
                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={ () => handleShowModal( show ) }>
                                        <i className="fas fa-edit"></i>
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={ () => handleDelete( show._id ) }>
                                        <i className="fas fa-trash"></i>
                                    </Button>
                                </td>
                            </tr>
                        ) ) }
                    </tbody>
                </Table>
            </div>

            {/* Add/Edit Modal */ }
            <Modal show={ showModal } onHide={ handleCloseModal } size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{ editingShow ? 'Edit Show' : 'Add New Show' }</Modal.Title>
                </Modal.Header>
                <Form onSubmit={ handleSubmit }>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Venue Name</Form.Label>
                            <Form.Control type="text" name="name" value={ formData.name } onChange={ handleInputChange } required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Bands (comma separated)</Form.Label>
                            <Form.Control type="text" name="bands" value={ formData.bands } onChange={ handleInputChange } placeholder="Band A, Band B" required />
                        </Form.Group>
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control type="text" name="date" value={ formData.date } onChange={ handleInputChange } placeholder="Oct 15, 2023 8:00 PM" required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Price</Form.Label>
                                    <Form.Control type="number" name="price" value={ formData.price } onChange={ handleInputChange } required />
                                </Form.Group>
                            </div>
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control type="text" name="address" value={ formData.address } onChange={ handleInputChange } required />
                        </Form.Group>
                        <div className="row">
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>City</Form.Label>
                                    <Form.Control type="text" name="city" value={ formData.city } onChange={ handleInputChange } required />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>State</Form.Label>
                                    <Form.Control type="text" name="state" value={ formData.state } onChange={ handleInputChange } required />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>Zipcode</Form.Label>
                                    <Form.Control type="text" name="zipcode" value={ formData.zipcode } onChange={ handleInputChange } required />
                                </Form.Group>
                            </div>
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label>Image URL</Form.Label>
                            <Form.Control type="text" name="image" value={ formData.image } onChange={ handleInputChange } placeholder="https://example.com/venue.jpg" required />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={ handleCloseModal }>Cancel</Button>
                        <Button variant="primary" type="submit">{ editingShow ? 'Save Changes' : 'Create Show' }</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminShowsPage;
