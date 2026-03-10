import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const uploadsDir = path.join( __dirname, '../userProfileImgs' );

// Ensure folder exists
if ( !fs.existsSync( uploadsDir ) )
{
    fs.mkdirSync( uploadsDir, { recursive: true } );
}

const storage = multer.diskStorage( {
    destination: ( req: Request, file: Express.Multer.File, cb: ( error: Error | null, destination: string ) => void ) =>
    {
        cb( null, uploadsDir );
    },
    filename: ( req: Request, file: Express.Multer.File, cb: ( error: Error | null, filename: string ) => void ) =>
    {
        const ext = path.extname( file.originalname );
        const uniqueName = `${ Date.now() }-${ Math.round( Math.random() * 1e9 ) }${ ext }`;
        cb( null, uniqueName );
    },
} );

// Optional validation (recommended)
const fileFilter = ( req: Request, file: Express.Multer.File, cb: FileFilterCallback ) =>
{
    if ( !file.mimetype.startsWith( 'image/' ) )
    {
        cb( null, false );
        return;
    }
    cb( null, true );
};

export default multer( {
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
} );
