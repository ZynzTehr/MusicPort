import React, { useState, useContext } from 'react';
import { Card, Button, Form, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { updatePost, deletePost } from '../api/posts';
import { AuthContext } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace( '/api', '' ) : 'http://localhost:4000';

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

interface PostItemProps
{
    post: Post;
    onPostUpdated: ( post: Post ) => void;
    onPostDeleted: ( postId: string ) => void;
}

const PostItem: React.FC<PostItemProps> = ( { post, onPostUpdated, onPostDeleted } ) =>
{
    const authContext = useContext( AuthContext );
    const user = authContext?.user;
    const [ isEditing, setIsEditing ] = useState<boolean>( false );
    const [ editContent, setEditContent ] = useState( post.content );
    const [ showDeleteModal, setShowDeleteModal ] = useState( false );

    const isAuthor = user && ( user._id === post.author._id || user.id === post.author._id );

    const handleUpdate = async () =>
    {
        try
        {
            const { data } = await updatePost( post._id, { content: editContent } );
            onPostUpdated( data );
            setIsEditing( false );
        } catch ( error )
        {
            console.error( 'Error updating post:', error );
            alert( 'Failed to update post.' );
        }
    };

    const handleDelete = async () =>
    {
        try
        {
            await deletePost( post._id );
            onPostDeleted( post._id );
            setShowDeleteModal( false );
        } catch ( error )
        {
            console.error( 'Error deleting post:', error );
            alert( 'Failed to delete post.' );
        }
    };

    return (
        <>
            <Card className="mb-3 shadow-sm border-0">
                <Card.Body>
                    <div className="d-flex align-items-start mb-2">
                        <Link to={ `/users/${ post.author._id }` } className="text-decoration-none">
                            <img
                                src={ post.author.photo ? `${ API }/userProfileImgs/${ post.author.photo }` : 'https://via.placeholder.com/50' }
                                alt={ post.author.name }
                                className="rounded-circle me-3"
                                style={ { width: '50px', height: '50px', objectFit: 'cover' } }
                            />
                        </Link>
                        <div className="w-100">
                            <div className="d-flex justify-content-between align-items-center">
                                <Link to={ `/users/${ post.author._id }` } className="text-decoration-none">
                                    <h6 className="fw-bold text-dark mb-0 hover-underline">{ post.author.name }</h6>
                                </Link>
                                <small className="text-muted">
                                    { new Date( post.createdAt ).toLocaleDateString() } { new Date( post.createdAt ).toLocaleTimeString( [], { hour: '2-digit', minute: '2-digit' } ) }
                                </small>
                            </div>

                            { isEditing ? (
                                <div className="mt-2">
                                    <Form.Control
                                        as="textarea"
                                        rows={ 2 }
                                        value={ editContent }
                                        onChange={ ( e ) => setEditContent( e.target.value ) }
                                        className="mb-2"
                                    />
                                    <div className="d-flex gap-2">
                                        <Button variant="success" size="sm" onClick={ handleUpdate }>Save</Button>
                                        <Button variant="secondary" size="sm" onClick={ () => setIsEditing( false ) }>Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="card-text mt-2 text-dark">{ post.content }</p>
                            ) }
                        </div>
                    </div>

                    { isAuthor && !isEditing && (
                        <div className="d-flex justify-content-end gap-2 mt-2">
                            <Button variant="outline-primary" size="sm" onClick={ () => setIsEditing( true ) }>
                                <i className="bi bi-pencil"></i> Edit
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={ () => setShowDeleteModal( true ) }>
                                <i className="bi bi-trash"></i> Delete
                            </Button>
                        </div>
                    ) }
                </Card.Body>
            </Card>

            {/* Delete Confirmation Modal */ }
            <Modal show={ showDeleteModal } onHide={ () => setShowDeleteModal( false ) } centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this post?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={ () => setShowDeleteModal( false ) }>Cancel</Button>
                    <Button variant="danger" onClick={ handleDelete }>Delete</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default PostItem;
