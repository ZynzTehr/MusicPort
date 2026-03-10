import { Request, Response } from 'express';
import User from '../models/User';
import GuestCheckout from '../models/GuestCheckout';
import UserCheckout from '../models/UserCheckout';

// Export controller to send data to frontend from server..
export const userCheckout = async ( req: Request, res: Response ) =>
{
    const { userId, name, email, productDetails, totalPurchaseAmount, totalItems } = req.body;

    try
    {
        const purchasedIds = productDetails.map( ( p: any ) => p.productId );

        // Update purchased product references in User profile..
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { purchasedProducts: { $each: purchasedIds } } },
            { new: true }
        );

        if ( !updatedUser )
        {
            return res.status( 404 ).json( { message: 'User not found.' } );
        }

        // Save full purchase data for marketing/analytics..
        const userOrder = new UserCheckout( {
            userId,
            name,
            email,
            purchasedProducts: productDetails,
            totalPurchaseAmount,
            totalItems
        } );

        await userOrder.save();

        res.json( { message: 'User Checkout recorded in profile & DB.' } );
    } catch ( err: any )
    {
        console.error( 'User Checkout ERROR:', err );
        res.status( 500 ).json( { message: err.message } );
    }
};


export const guestCheckout = async ( req: Request, res: Response ) =>
{
    const {
        name,
        email,
        productDetails,
        totalPurchaseAmount,
        totalItems
    } = req.body;

    try
    {
        // Create a new guest order document..
        const guestOrder = new GuestCheckout( {
            name,
            email,
            purchasedProducts: productDetails,   // Save full product info "not just IDs"..
            totalPurchaseAmount,
            totalItems
        } );

        // Optional: For backend debugging/logging..
        console.log( guestOrder, 'line 44' );

        // Save guest order to MongoDB..
        await guestOrder.save();

        res.status( 201 ).json( {
            message: "Guest Checkout was successful!!"
        } );
    } catch ( err: any )
    {
        res.status( 500 ).json( { message: err.message } ); // Error handling..
    }
};
