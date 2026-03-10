import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Retrieve MongoDB connection URI from environment variables..
const db: string = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/musicport';

// Connect to MongoDB using the provided connection string..
mongoose.connect( db );

// Event listener: Successful connection..
mongoose.connection.on( 'connected', () =>
{
    console.log( `Mongoose successfully connected to ${ db }` );
} );

// Event listener: Connection error handling..
mongoose.connection.on( 'error', ( err ) =>
{
    console.error( `Mongoose connection error: ${ err }` );
} );

// Event listener: Disconnection handling..
mongoose.connection.on( 'disconnected', () =>
{
    console.warn( 'Mongoose disconnected from MongoDB' );
} );

// Export mongoose connection instance
export default mongoose.connection;
