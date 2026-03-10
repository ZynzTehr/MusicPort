import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const fetchUserById = ( userId: string ) => axios.get( `${ API }/users/${ userId }` );
