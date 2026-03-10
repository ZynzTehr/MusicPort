import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Table, Spinner, Image, Badge } from 'react-bootstrap';

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
    likes?: string[];
    comments?: any[];
}

const AdminChatPage: React.FC = () =>
{
    const [ posts, setPosts ] = useState<Post[]>( [] );
    const [ loading, setLoading ] = useState( true );

    useEffect( () =>
    {
        fetchPosts();
    }, [] );

    const fetchPosts = async () =>
    {
        try
        {
            const token = sessionStorage.getItem( 'token' );
            const response = await axios.get( '/api/posts', {
                headers: { Authorization: `Bearer ${ token }` }
            } );
            setPosts( response.data );
            setLoading( false );
        } catch ( error )
        {
            console.error( "Error fetching posts:", error );
            setLoading( false );
        }
    };

    const handleDelete = async ( id: string ) =>
    {
        if ( !window.confirm( 'Are you sure you want to delete this post?' ) ) return;
        try
        {
            const token = sessionStorage.getItem( 'token' );
            await axios.delete( `/api/posts/${ id }`, {
                headers: { Authorization: `Bearer ${ token }` }
            } );
            setPosts( posts.filter( p => p._id !== id ) );
        } catch ( error: any )
        {
            alert( error.response?.data?.message || 'Delete failed' );
        }
    };

    if ( loading ) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div>
            <div className="admin-page-header">
                <h1 className="admin-page-title fw-bold">Chat Moderation</h1>
            </div>

            <div className="admin-card">
                <Table responsive hover className="admin-table">
                    <thead>
                        <tr>
                            <th>Author</th>
                            <th>Content</th>
                            <th>Date</th>
                            <th>Engagement</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-muted">
                        { posts.map( post => (
                            <tr key={ post._id }>
                                <td>
                                    <div className="d-flex align-items-center">
                                        { post.author.photo && post.author.photo !== 'default.png' ? (
                                            <Image src={ `/userProfileImgs/${ post.author.photo }` } roundedCircle style={ { width: '30px', height: '30px', marginRight: '10px', objectFit: 'cover' } } />
                                        ) : (
                                            <div style={ { width: '30px', height: '30px', borderRadius: '50%', background: '#ccc', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
                                                <small>{ post.author.name?.charAt( 0 ) }</small>
                                            </div>
                                        ) }
                                        <span>{ post.author.name }</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={ { maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } } title={ post.content }>
                                        { post.content }
                                    </div>
                                </td>
                                <td>{ new Date( post.createdAt ).toLocaleDateString() } { new Date( post.createdAt ).toLocaleTimeString( [], { hour: '2-digit', minute: '2-digit' } ) }</td>
                                <td>
                                    <Badge bg="info" className="me-1"><i className="fas fa-thumbs-up me-1"></i>{ post.likes?.length || 0 }</Badge>
                                    <Badge bg="secondary"><i className="fas fa-comment me-1"></i>{ post.comments?.length || 0 }</Badge>
                                </td>
                                <td>
                                    <Button variant="outline-danger" size="sm" onClick={ () => handleDelete( post._id ) }>
                                        <i className="fas fa-trash"></i> Delete
                                    </Button>
                                </td>
                            </tr>
                        ) ) }
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default AdminChatPage;
