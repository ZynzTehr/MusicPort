import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Table, Spinner, Image } from 'react-bootstrap';

interface Product
{
    _id: string;
    name: string;
    brand: string;
    price: number;
    description: string;
    image: string;
    seeded?: boolean; // Optional, from schema
}

const AdminProductsPage: React.FC = () =>
{
    const [ products, setProducts ] = useState<Product[]>( [] );
    const [ loading, setLoading ] = useState( true );
    const [ showModal, setShowModal ] = useState( false );
    const [ editingProduct, setEditingProduct ] = useState<Product | null>( null );

    // Form state
    const [ formData, setFormData ] = useState<Partial<Product>>( {
        name: '',
        brand: '',
        price: 0,
        description: '',
        image: ''
    } );

    useEffect( () =>
    {
        fetchProducts();
    }, [] );

    const fetchProducts = async () =>
    {
        try
        {
            const response = await axios.get( '/api/products' );
            setProducts( response.data );
            setLoading( false );
        } catch ( error )
        {
            console.error( "Error fetching products:", error );
            setLoading( false );
        }
    };

    const handleShowModal = ( product?: Product ) =>
    {
        if ( product )
        {
            setEditingProduct( product );
            setFormData( {
                name: product.name,
                brand: product.brand,
                price: product.price,
                description: product.description,
                image: product.image
            } );
        } else
        {
            setEditingProduct( null );
            setFormData( {
                name: '',
                brand: '',
                price: 0,
                description: '',
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

            if ( editingProduct )
            {
                // Update
                const response = await axios.put( `/api/products/${ editingProduct._id }`, formData, config );
                setProducts( products.map( p => p._id === editingProduct._id ? response.data : p ) );
            } else
            {
                // Create
                const response = await axios.post( '/api/products', formData, config );
                setProducts( [ ...products, response.data ] );
            }
            handleCloseModal();
        } catch ( error: any )
        {
            alert( error.response?.data?.message || 'Operation failed' );
        }
    };

    const handleDelete = async ( id: string ) =>
    {
        console.log( 'Delete requested for product ID:', id );
        if ( !window.confirm( 'Are you sure you want to delete this product?' ) ) return;
        try
        {
            const token = sessionStorage.getItem( 'token' );
            await axios.delete( `/api/products/${ id }`, {
                headers: { Authorization: `Bearer ${ token }` }
            } );
            setProducts( products.filter( p => p._id !== id ) );
        } catch ( error: any )
        {
            alert( error.response?.data?.message || 'Delete failed' );
        }
    };

    if ( loading ) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div>
            <div className="admin-page-header d-flex justify-content-between align-items-center">
                <h1 className="admin-page-title fw-bold">Product Management</h1>
                <Button variant="primary" onClick={ () => handleShowModal() }>
                    <i className="fas fa-plus me-2"></i>Add Product
                </Button>
            </div>

            <div className="admin-card">
                <Table responsive hover className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Brand</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-muted">
                        { products.map( product => (
                            <tr key={ product._id }>
                                <td style={ { width: '80px' } }>
                                    <Image src={ product.image } alt={ product.name } thumbnail style={ { width: '50px', height: '50px', objectFit: 'cover' } } />
                                </td>
                                <td>{ product.name }</td>
                                <td>{ product.brand }</td>
                                <td>${ product.price }</td>
                                <td>
                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={ () => handleShowModal( product ) }>
                                        <i className="fas fa-edit"></i>
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={ () => handleDelete( product._id ) }>
                                        <i className="fas fa-trash"></i>
                                    </Button>
                                </td>
                            </tr>
                        ) ) }
                    </tbody>
                </Table>
            </div>

            {/* Add/Edit Modal */ }
            <Modal show={ showModal } onHide={ handleCloseModal }>
                <Modal.Header closeButton>
                    <Modal.Title>{ editingProduct ? 'Edit Product' : 'Add New Product' }</Modal.Title>
                </Modal.Header>
                <Form onSubmit={ handleSubmit }>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" name="name" value={ formData.name } onChange={ handleInputChange } required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Brand</Form.Label>
                            <Form.Control type="text" name="brand" value={ formData.brand } onChange={ handleInputChange } required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control type="number" name="price" value={ formData.price } onChange={ handleInputChange } required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Image URL</Form.Label>
                            <Form.Control type="text" name="image" value={ formData.image } onChange={ handleInputChange } placeholder="https://example.com/image.jpg" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={ 3 } name="description" value={ formData.description } onChange={ handleInputChange } required />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={ handleCloseModal }>Cancel</Button>
                        <Button variant="primary" type="submit">{ editingProduct ? 'Save Changes' : 'Create Product' }</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminProductsPage;
