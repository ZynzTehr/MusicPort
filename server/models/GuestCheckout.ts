import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGuestCheckout extends Document
{
    name: string;
    email: string;
    purchasedProducts: {
        productId: mongoose.Types.ObjectId;
        name?: string;
        price?: number;
        quantity?: number;
    }[];
    totalPurchaseAmount: number;
    totalItems: number;
    checkoutDate: Date;
}

const guestCheckoutSchema = new Schema<IGuestCheckout>( {
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    purchasedProducts: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            name: String,
            price: Number,
            quantity: Number
        }
    ],
    totalPurchaseAmount: {
        type: Number,
        required: true
    },
    totalItems: {
        type: Number,
        required: true
    },
    checkoutDate: {
        type: Date,
        default: Date.now
    }
} );

const GuestCheckout: Model<IGuestCheckout> = mongoose.model<IGuestCheckout>( 'GuestCheckout', guestCheckoutSchema );
export default GuestCheckout;
