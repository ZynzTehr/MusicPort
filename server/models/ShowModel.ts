import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVenue extends Document
{
    name: string;
    bands: string[];
    date: string;
    price: number;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    latitude?: number;
    longitude?: number;
    image: string;
    seeded: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const venueSchema = new Schema<IVenue>( {
    name: {
        type: String,
        required: true
    },
    bands: {
        type: [ String ],
        required: true
    },
    date: {
        type: String,
        default: () => String( Date.now() + Math.floor( Math.random() * 10 ) ) // Converted expression to function or string
    },
    price: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipcode: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    image: {
        type: String,
        required: true
    },
    seeded: {
        type: Boolean,
        default: false
    },
},
    { timestamps: true }
);

const Venue: Model<IVenue> = mongoose.model<IVenue>( 'Venue', venueSchema );
export default Venue;
