import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const fetchAllShows = () => axios.get( `${ API }/shows` );

export const requestShows = ( location: string ) => axios.get( `${ API }/shows/${ location }` );

export const searchShows = ( params: any ) =>
{
    // params can assume { city, state } or { lat, lng }
    return axios.get( `${ API }/shows`, { params } );
};