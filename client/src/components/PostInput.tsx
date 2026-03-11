import React, { useState, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import { createPost } from '../api/posts';
import { AuthContext } from '../context/AuthContext';

/**
 * TypeScript Interface: PostInputProps
 * Explicitly mandates that the parent component provides a callback function (`onPostCreated`).
 * This pattern (lifting state up) allows this child component to notify the parent when a new 
 * post is successfully saved to the database, ensuring the parent's list re-renders instantly.
 */
interface PostInputProps
{
    onPostCreated: ( post: any ) => void;
}

/**
 * PostInput Component
 * 
 * A localized form specifically handling the creation of new community chat messages.
 * It is Context-aware, automatically checking if a user session exists before allowing input.
 */
const PostInput: React.FC<PostInputProps> = ( { onPostCreated } ) =>
{
    // Local state for the textarea content. Controlled component pattern.
    const [ content, setContent ] = useState( '' );
    
    // Consume global Auth context to verify login status.
    const authContext = useContext( AuthContext );
    const user = authContext?.user;

    /**
     * Handles the form submission lifecycle.
     * Prevents default browser refresh, validates input, calls the API, and bubbles the result up.
     */
    const handleSubmit = async ( e: React.FormEvent ) =>
    {
        e.preventDefault();
        
        // Validation: Prevent submitting pure whitespace strings.
        if ( !content.trim() ) return;

        try
        {
            // Execute the API call. Note that `createPost` internally fetches the JWT securely.
            const { data } = await createPost( { content } );
            
            // Trigger the parent's callback to push the new post into the UI instantly.
            onPostCreated( data );
            
            // Clear the form for the next message.
            setContent( '' );
        } catch ( error )
        {
            console.error( 'Error creating post:', error );
            alert( 'Failed to create post. Please try again.' );
        }
    };

    // Architectural Guard: If the user is a guest, completely short-circuit the render tree.
    // Instead of rendering a disabled input box, we explicitly prompt them to login.
    if ( !user )
    {
        return (
            <div className="alert alert-info text-center mt-4 border-0 shadow-sm" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(13,202,240,0.1)' }}>
                Please <span className="fw-bold">Login</span> to participate in the conversation.
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
