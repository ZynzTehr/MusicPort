import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Table, Spinner, Image, Badge } from 'react-bootstrap';

/**
 * TypeScript Interface: Lesson
 * 
 * Strict typing for the properties required by the MongoDB `Lesson` schema.
 * Note the utilization of Literal Types (e.g., `'guitar' | 'bass'`) instead of generic `string`.
 * This prevents typos at compile-time when assigning values to these specific dropdowns.
 */
interface Lesson
{
    _id: string;
    title: string;
    instrument: 'guitar' | 'bass' | 'drums' | 'keyboard';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    videoUrl: string;
    content: string;
    thumbnail: string;
    order: number;
}

/**
 * AdminLessonsPage Component
 * 
 * Architectural Pattern: Complex CRUD (Create, Read, Update, Delete) Dashboard.
 * 
 * Purpose: This is a heavy "Smart Component". It manages massive local state for a data grid,
 * controls the visibility of a multi-purpose modal (used for BOTH creating and editing), 
 * and handles the complex form-binding logic required to keep inputs synced before API dispatch.
 */
const AdminLessonsPage: React.FC = () =>
{
    // Master Data State
    const [ lessons, setLessons ] = useState<Lesson[]>( [] );
    const [ loading, setLoading ] = useState( true );
    
    // UI Modal State
    const [ showModal, setShowModal ] = useState( false );
    
    /**
     * Contextual State: Switchboard Variable
     * If `editingLesson` is `null`, the Modal operates in "Create Mode".
     * If it holds a `Lesson` object, the Modal switches to "Edit/Update Mode".
     */
    const [ editingLesson, setEditingLesson ] = useState<Lesson | null>( null );

    // Form Binding State: This single object tracks every input field simultaneously.
    const [ formData, setFormData ] = useState( {
        title: '',
        instrument: 'guitar',
        difficulty: 'beginner',
        videoUrl: '',
        content: '',
        thumbnail: '',
        order: 0
    } );

    // Trigger initial data load.
    useEffect( () =>
    {
        fetchLessons();
    }, [] );

    const fetchLessons = async () =>
    {
        try
        {
            const response = await axios.get( '/api/lessons' );
            setLessons( response.data );
            setLoading( false );
        } catch ( error )
        {
            console.error( "Error fetching lessons:", error );
            setLoading( false );
        }
    };

    const handleShowModal = ( lesson?: Lesson ) =>
    {
        if ( lesson )
        {
            setEditingLesson( lesson );
            setFormData( {
                title: lesson.title,
                instrument: lesson.instrument,
                difficulty: lesson.difficulty,
                videoUrl: lesson.videoUrl,
                content: lesson.content,
                thumbnail: lesson.thumbnail,
                order: lesson.order
            } );
        } else
        {
            setEditingLesson( null );
            setFormData( {
                title: '',
                instrument: 'guitar',
                difficulty: 'beginner',
                videoUrl: '',
                content: '',
                thumbnail: '',
                order: 0
            } );
        }
        setShowModal( true );
    };

    const handleCloseModal = () => setShowModal( false );

    const handleInputChange = ( e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> ) =>
    {
        const { name, value } = e.target;
        setFormData( prev => ( {
            ...prev,
            [ name ]: name === 'order' ? parseInt( value ) || 0 : value
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

            if ( editingLesson )
            {
                const response = await axios.put( `/api/lessons/${ editingLesson._id }`, formData, config );
                setLessons( lessons.map( l => l._id === editingLesson._id ? response.data : l ) );
            } else
            {
                const response = await axios.post( '/api/lessons', formData, config );
                setLessons( [ ...lessons, response.data ] );
            }
            handleCloseModal();
        } catch ( error: any )
        {
            alert( error.response?.data?.message || 'Operation failed' );
        }
    };

    const handleDelete = async ( id: string ) =>
    {
        if ( !window.confirm( 'Are you sure you want to delete this lesson?' ) ) return;
        try
        {
            const token = sessionStorage.getItem( 'token' );
            await axios.delete( `/api/lessons/${ id }`, {
                headers: { Authorization: `Bearer ${ token }` }
            } );
            setLessons( lessons.filter( l => l._id !== id ) );
        } catch ( error: any )
        {
            alert( error.response?.data?.message || 'Delete failed' );
        }
    };

    // Guard Clause: Prevent UI rendering until the initial payload arrives.
    if ( loading ) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    /**
     * UI Helper: getDifficultyBadge
     * Analyzes the pure data string and maps it to specific Bootstrap UX elements.
     * Keeps the JSX cleanly separated from the styling logic.
     */
    const getDifficultyBadge = ( difficulty: string ) =>
    {
        switch ( difficulty )
        {
            case 'beginner': return <Badge bg="success">Beginner</Badge>;
            case 'intermediate': return <Badge bg="warning" text="dark">Intermediate</Badge>;
            case 'advanced': return <Badge bg="danger">Advanced</Badge>;
            default: return <Badge bg="secondary">{ difficulty }</Badge>;
        }
    };

    return (
        <div>
            <div className="admin-page-header d-flex justify-content-between align-items-center">
                <h1 className="admin-page-title fw-bold">Lesson Management</h1>
                <Button variant="primary" onClick={ () => handleShowModal() }>
                    <i className="fas fa-plus me-2"></i>Add Lesson
                </Button>
            </div>

            <div className="admin-card">
                <Table responsive hover className="admin-table">
                    <thead>
                        <tr>
                            <th>Thumbnail</th>
                            <th>Title</th>
                            <th>Instrument</th>
                            <th>Difficulty</th>
                            <th>Order</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-muted">
                        { lessons.map( lesson => (
                            <tr key={ lesson._id }>
                                <td style={ { width: '80px' } }>
                                    { lesson.thumbnail ? (
                                        <Image src={ lesson.thumbnail } alt={ lesson.title } thumbnail style={ { width: '50px', height: '50px', objectFit: 'cover' } } />
                                    ) : (
                                        <div style={ { width: '50px', height: '50px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
                                            <i className="fas fa-music text-muted"></i>
                                        </div>
                                    ) }
                                </td>
                                <td>{ lesson.title }</td>
                                <td className="text-capitalize">{ lesson.instrument }</td>
                                <td>{ getDifficultyBadge( lesson.difficulty ) }</td>
                                <td>{ lesson.order }</td>
                                <td>
                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={ () => handleShowModal( lesson ) }>
                                        <i className="fas fa-edit"></i>
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={ () => handleDelete( lesson._id ) }>
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
                    <Modal.Title>{ editingLesson ? 'Edit Lesson' : 'Add New Lesson' }</Modal.Title>
                </Modal.Header>
                <Form onSubmit={ handleSubmit }>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-8">
                                <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control type="text" name="title" value={ formData.title } onChange={ handleInputChange } required />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>Order</Form.Label>
                                    <Form.Control type="number" name="order" value={ formData.order } onChange={ handleInputChange } required />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Instrument</Form.Label>
                                    <Form.Select name="instrument" value={ formData.instrument } onChange={ handleInputChange }>
                                        <option value="guitar">Guitar</option>
                                        <option value="bass">Bass</option>
                                        <option value="drums">Drums</option>
                                        <option value="keyboard">Keyboard</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Difficulty</Form.Label>
                                    <Form.Select name="difficulty" value={ formData.difficulty } onChange={ handleInputChange }>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Video URL (YouTube/Vimeo)</Form.Label>
                            <Form.Control type="text" name="videoUrl" value={ formData.videoUrl } onChange={ handleInputChange } placeholder="https://youtube.com/watch?v=..." required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Thumbnail URL</Form.Label>
                            <Form.Control type="text" name="thumbnail" value={ formData.thumbnail } onChange={ handleInputChange } placeholder="https://example.com/thumb.jpg" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Content / Description</Form.Label>
                            <Form.Control as="textarea" rows={ 5 } name="content" value={ formData.content } onChange={ handleInputChange } />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={ handleCloseModal }>Cancel</Button>
                        <Button variant="primary" type="submit">{ editingLesson ? 'Save Changes' : 'Create Lesson' }</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminLessonsPage;
