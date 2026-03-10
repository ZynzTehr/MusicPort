import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserCheckout extends Document
{
    userId: mongoose.Types.ObjectId;
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

const userCheckoutSchema = new Schema<IUserCheckout>( {
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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

const UserCheckout: Model<IUserCheckout> = mongoose.model<IUserCheckout>( 'UserCheckout', userCheckoutSchema );
export default UserCheckout;
