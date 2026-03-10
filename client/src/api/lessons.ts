import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

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

export const fetchAllLessons = ( query: any = {} ) =>
{
    return axios.get( `${ API }/lessons`, { params: query } );
};

export const fetchLessonById = ( id: string ) => axios.get( `${ API }/lessons/${ id }` );

export const markLessonAsComplete = ( id: string ) => axios.post( `${ API }/users/lessons/${ id }`, {}, getConfig() );
