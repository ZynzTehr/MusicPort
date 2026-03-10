const { dir, log, info, time, warn, clear, count, debug, error, group, table, trace, assert, dirxml, profile, timeEnd, timeLog, groupEnd, timeStamp, countReset, profileEnd, groupCollapsed } = console;

import express, { Express, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import Server Functionality..
import './database/dbConnection'; // Connect to database file..
import routes from './routes/routes'; // Import routes..
import auth from './utils/auth'; // Import jwt to use as middleware to verify tokens
import passport from './config/passport'; // Import passport config

// Load environment variables from .env file..
dotenv.config();

const app: Express = express(); // Create variable to use express..
const PORT = process.env.PORT; // Port for server connection..

// Middleware..
app.use( cors( {
    origin: process.env.ORIGIN // frontend server URL "React app"..
} ) );

app.use( '/userProfileImgs', express.static( path.join( __dirname, 'userProfileImgs' ) ) );
// app.use('/userProfileImgs', auth, express.static('userProfileImgs'));
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );
app.use( morgan( 'dev' ) );
app.use( passport.initialize() );


// Custom middleware logger..
app.use( ( err: any, req: Request, res: Response, next: NextFunction ) =>
{
    info( `Method: ${ req.method } URL: ${ req.url }` );
    next();
} );

// Use routes
app.use( '/api', routes );

// Route for testing server availability..
app.get( '/', ( req: Request, res: Response ) =>
{
    log( "App's Backend is running!" );
    res.send( "App's Backend is running!" );
} );

app.listen( PORT, () =>
{
    info( '\n', `Server is listening on PORT:${ PORT }`, '\n Press Control + C to Stop' );
} );
