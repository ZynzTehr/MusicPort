import React, { useState, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import { createPost } from '../api/posts';
import { AuthContext } from '../context/AuthContext';

interface PostInputProps
{
    onPostCreated: ( post: any ) => void;
}

const PostInput: React.FC<PostInputProps> = ( { onPostCreated } ) =>
{
    const [ content, setContent ] = useState( '' );
    const authContext = useContext( AuthContext );
    const user = authContext?.user;

    const handleSubmit = async ( e: React.FormEvent ) =>
    {
        e.preventDefault();
        if ( !content.trim() ) return;

        try
        {
            const { data } = await createPost( { content } );
            onPostCreated( data );
            setContent( '' );
        } catch ( error )
        {
            console.error( 'Error creating post:', error );
            alert( 'Failed to create post. Please try again.' );
        }
    };

    if ( !user )
    {
        return (
            <div className="alert alert-info text-center mt-4">
                Please <span className="fw-bold">Login</span> to participate in the chat.
            </div>
        );
    }

    return (
        <div className="card shadow-sm mb-4 mt-4">
            <div className="card-body">
                <h5 className="card-title mb-3">Join the Conversation</h5>
                <Form onSubmit={ handleSubmit }>
                    <Form.Group className="mb-3">
                        <Form.Control
                            as="textarea"
                            rows={ 3 }
                            placeholder="What's on your mind?"
                            value={ content }
                            onChange={ ( e ) => setContent( e.target.value ) }
                            style={ { resize: 'none' } }
                        />
                    </Form.Group>
                    <div className="d-flex justify-content-end">
                        <Button variant="info" type="submit" className="text-white fw-bold">
                            Post Message
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default PostInput;
