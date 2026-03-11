const { dir, log, info, time, warn, clear, count, debug, error, group, table, trace, assert, dirxml, profile, timeEnd, timeLog, groupEnd, timeStamp, countReset, profileEnd, groupCollapsed } = console;

import express, { Express, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

/**
 * =========================================
 * Application Bootstrap & Dependencies
 * =========================================
 */
import './database/dbConnection'; // Instantiates the Prisma ORM PostgreSQL connection pool silently.
import routes from './routes/routes'; // Centralized REST API routing manifest.
import auth from './utils/auth'; // JWT Validation Middleware.
import passport from './config/passport'; // PassportJS OAuth strategy implementations.

// Injects variables from the physical `.env` file directly into Node's `process.env` memory space.
dotenv.config();

const app: Express = express(); // Initialize the core Express application instance.
const PORT = process.env.PORT; // Bind the physical server port (typically 5000 in dev).

/**
 * =========================================
 * Global Middleware Pipeline
 * =========================================
 * Note on Architecture: The order of Express `app.use()` calls defines the exact
 * execution flow of every single incoming HTTP request (The "Middleware Stack").
 */

// 1. CORS: Dictates which external domains are permitted to interface with this API.
app.use( cors( {
    origin: process.env.ORIGIN // Only allows traffic from our explicit React Frontend URL.
} ) );

// 2. Static File Serving: Exposes the `userProfileImgs` directory securely to the public internet.
app.use( '/userProfileImgs', express.static( path.join( __dirname, 'userProfileImgs' ) ) );

// 3. Body Parsing: Intercepts raw incoming HTTP POST requests and parses formatting into Native JS Objects (`req.body`).
app.use( express.json() ); // Parses standard 'application/json'
app.use( express.urlencoded( { extended: true } ) ); // Parses complex standard Form submissions 'application/x-www-form-urlencoded'

// 4. Logging & Security: 
app.use( morgan( 'dev' ) ); // Intercepts all traffic and prints colored diagnostic logs to the terminal.
app.use( passport.initialize() ); // Bootstraps PassportJS OAuth strategies into the memory stream.


/**
 * 5. Custom Network Middleware
 * A simple diagnostic interceptor that logs the exact HTTP method (GET, POST, etc.) 
 * and target endpoint before passing control (`next()`) deeper into the stack.
 */
app.use( ( err: any, req: Request, res: Response, next: NextFunction ) =>
{
    info( `Method: ${ req.method } URL: ${ req.url }` );
    next();
} );

/**
 * =========================================
 * Route Registration
 * =========================================
 * All endpoints mapped within the `routes.ts` file are prefixed globally with `/api`.
 */
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
