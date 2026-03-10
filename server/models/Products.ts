import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document
{
    name: string;
    brand: string;
    price: number;
    description: string;
    image: string;
    seeded: boolean;
}

const productSchema = new Schema<IProduct>( {
    name: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    seeded: {
        type: Boolean,
        default: false,
    },
} );

const Product: Model<IProduct> = mongoose.model<IProduct>( 'Product', productSchema );
export default Product;
