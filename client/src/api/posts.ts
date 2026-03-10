import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Helper to get configuration with token
const getConfig = () =>
{
    const token = sessionStorage.getItem( 'token' );
    return {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${ token }` : ''
        }
    };
};

export const fetchAllPosts = () => axios.get( `${ API }/posts` );

export const createPost = ( postData: any ) => axios.post( `${ API }/posts`, postData, getConfig() );

export const updatePost = ( id: string, postData: any ) => axios.put( `${ API }/posts/${ id }`, postData, getConfig() );

export const deletePost = ( id: string ) => axios.delete( `${ API }/posts/${ id }`, getConfig() );
