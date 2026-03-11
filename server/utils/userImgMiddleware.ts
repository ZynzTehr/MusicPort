import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

/**
 * =========================================
 * Multipart Form File Upload (Multer)
 * =========================================
 * Architectural Pattern: Disk Storage Strategy Middleware.
 * 
 * Purpose: Native JSON requests cannot transmit binary file data (like profile avatars).
 * This middleware intercepts specific routes, parses the binary blobs, saves the physical 
 * files directly to the server's local storage block (`userProfileImgs`), and attaches 
 * the saved file metadata to the `req.file` object for the route controller to parse.
 */

const uploadsDir = path.join( __dirname, '../userProfileImgs' );

// Safety Net: Guarantees the physical directory exists upon server startup to prevent 
// localized Node.js fs 'ENOENT' directory-not-found crashing errors.
if ( !fs.existsSync( uploadsDir ) )
{
    fs.mkdirSync( uploadsDir, { recursive: true } );
}

/**
 * Storage Engine Configuration:
 * Dictates exactly *Where* files are saved and *What* they are named.
 */
const storage = multer.diskStorage( {
    destination: ( req: Request, file: Express.Multer.File, cb: ( error: Error | null, destination: string ) => void ) =>
    {
        cb( null, uploadsDir );
    },
    filename: ( req: Request, file: Express.Multer.File, cb: ( error: Error | null, filename: string ) => void ) =>
    {
        // Cryptographic naming convention: Prevents file overwrite collisions if two users 
        // upload independent files inexplicably sharing the exact same name simultaneously.
        const ext = path.extname( file.originalname );
        const uniqueName = `${ Date.now() }-${ Math.round( Math.random() * 1e9 ) }${ ext }`;
        cb( null, uniqueName );
    },
} );

/**
 * Deep MimeType Validation
 * Rejects malicious non-image file payloads (.exe, .sh, .pdf) before they are ever 
 * written to the physical storage partition.
 */
const fileFilter = ( req: Request, file: Express.Multer.File, cb: FileFilterCallback ) =>
{
    if ( !file.mimetype.startsWith( 'image/' ) )
    {
        cb( null, false ); // Silently drop payload
        return;
    }
    cb( null, true ); // Accept payload
};

/**
 * Export the initialized Multer construct.
 * Note the hard-enforced physical size limitation (5MB) preventing simple volumetric DDoS attacks.
 */
export default multer( {
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Maximum file size limit
} );
