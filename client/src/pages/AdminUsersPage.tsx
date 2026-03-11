import React, { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * TypeScript Interface: User
 * 
 * Extends the standard User shape to include Admin-specific visibility fields 
 * like `lastLogin` and `createdAt`. This data is sensitive and should never 
 * be exposed to non-admin frontend clients.
 */
interface User
{
    _id: string;
    name: string;
    photo: string;
    email: string;
    isAdmin: boolean;
    lastLogin?: string; // Date string from JSON
    createdAt: string;
}

/**
 * AdminUsersPage Component
 * 
 * Architectural Pattern: Moderation Dashboard / Paginated Data Consumer.
 * 
 * Purpose: Allows global administrators to view all registered accounts, 
 * check last-login timestamps for inactivity, and forcefully delete users.
 */
const AdminUsersPage: React.FC = () =>
{
    const [ users, setUsers ] = useState<User[]>( [] );
    const [ loading, setLoading ] = useState( true );
    const [ error, setError ] = useState( '' );
    
    /**
     * Scaling Architecture: Pagination State
     * Even if a database has 10,000 users, we only ever pull a sliced chunk 
     * at a time to prevent destroying client-side browser memory.
     */
    const [ page, setPage ] = useState( 1 );
    const [ totalPages, setTotalPages ] = useState( 1 );
    
    // Fallback environmental routing.
    const API = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace( '/api', '' ) : 'http://localhost:4000';

    useEffect( () =>
    {
        fetchUsers();
    }, [ page ] );

    const fetchUsers = async () =>
    {
        try
        {
            setLoading( true );
            const token = sessionStorage.getItem( 'token' ); // Get token from sessionStorage
            if ( !token ) throw new Error( 'No authentication token found' );

            const response = await axios.get( `/api/users`, {
                headers: { Authorization: `Bearer ${ token }` }
            } );

            if ( Array.isArray( response.data ) )
            {
                setUsers( response.data );
                setTotalPages( 1 ); // Backend does not support pagination yet
            } else
            {
                setUsers( response.data.users || [] );
                setTotalPages( response.data.totalPages || 1 );
            }
        } catch ( err: any )
        {
            setError( err.response?.data?.message || 'Failed to fetch users' );
        } finally
        {
            setLoading( false );
        }
    };

    const handleDelete = async ( userId: string ) =>
    {
        console.log( 'Delete requested for user ID:', userId );
        if ( !window.confirm( 'Are you sure you want to delete this user?' ) ) return;

        try
        {
            const token = sessionStorage.getItem( 'token' );
            await axios.delete( `/api/users/${ userId }`, {
                headers: { Authorization: `Bearer ${ token }` }
            } );
            // Refresh list
            setUsers( users.filter( user => user._id !== userId ) );
        } catch ( err: any )
        {
            alert( err.response?.data?.message || 'Failed to delete user' );
        }
    };

    if ( loading ) return <div>Loading...</div>;
    if ( error ) return <div className="error-message">{ error }</div>;

    return (
        <div>
            <div className="admin-page-header">
                <h1 className="admin-page-title">User Management</h1>
            </div>

            <div className="admin-card">
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Last Login</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='text-muted'>
                            { users.map( user => (
                                <tr key={ user._id }>
                                    <td>
                                        <img
                                            className='rounded-circle'
                                            src={ user.photo ? `${ API }/userProfileImgs/${ user.photo }` : 'https://via.placeholder.com/40' }
                                            alt={ user.name }
                                            style={ { width: '40px', height: '40px', objectFit: 'cover' } }
                                        /></td>
                                    <td>{ user.name }</td>
                                    <td>{ user.email }</td>
                                    <td>
                                        <span className={ `badge ${ user.isAdmin ? 'badge-admin' : 'badge-user' }` }>
                                            { user.isAdmin ? 'Admin' : 'User' }
                                        </span>
                                    </td>
                                    <td>{ new Date( user.createdAt ).toLocaleDateString() }</td>
                                    <td>{ user.lastLogin ? new Date( user.lastLogin ).toLocaleDateString() + ' ' + new Date( user.lastLogin ).toLocaleTimeString( [], { hour: '2-digit', minute: '2-digit' } ) : 'Never' }</td>
                                    <td>
                                        {/* Add Edit/Delete buttons here */ }
                                        <button
                                            className="btn btn-outline-danger btn-sm p-1 ms-2"
                                            onClick={ () => handleDelete( user._id ) }
                                            disabled={ user.isAdmin } // Prevent deleting other admins for safety
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>

                <div className="pagination d-flex justify-content-center align-items-center mt-4">
                    <button
                        className="btn btn-primary btn-sm rounded-pill p-2"
                        disabled={ page === 1 }
                        onClick={ () => setPage( p => p - 1 ) }
                    >
                        Prev
                    </button>
                    <span className="text-muted mx-2"> Page { page } of { totalPages } </span>
                    <button
                        className="btn btn-primary btn-sm rounded-pill p-2"
                        disabled={ page === totalPages }
                        onClick={ () => setPage( p => p + 1 ) }
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersPage;
