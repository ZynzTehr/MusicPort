import { Request, Response } from 'express';
import prisma from '../database/dbConnection';

/**
 * =========================================
 * E-Commerce Checkout Controller
 * =========================================
 * Architectural Pattern: Complex Relational Transacting
 * 
 * Purpose: This controller governs the finalization of the checkout flow.
 * It writes data not just to a single table, but performs heavy relational mapping 
 * by spinning up overarching Checkout records, and recursively seeding all 
 * nested product line-items natively connected up to that identical parent record 
 * instantaneously via Prisma's `create` linking.
 */

/**
 * Processes a checkout block for a registered, authenticated user.
 * Records the overarching user checkout details as well as explicitly mapping all individual
 * products, variations (sizes), and quantities to the user's permanent purchase history.
 *
 * @param req - The Express request object containing cart and user data.
 * @param res - The Express response object.
 */
export const userCheckout = async ( req: Request, res: Response ) =>
{
    const { userId, name, email, productDetails, totalPurchaseAmount, totalItems } = req.body;
    try
    {
        const parsedUserId = Number( userId );

        await prisma.userCheckout.create( {
            data: {
                userId: parsedUserId,
                name,
                email,
                totalPurchaseAmount: parseFloat( totalPurchaseAmount ),
                totalItems,
                // Construct relational purchases connecting back to the main checkout ID
                purchasedProducts: {
                    create: productDetails.map( ( p: any ) => ( {
                        productId: Number( p.productId ),
                        name: p.name,
                        price: p.price ? parseFloat( p.price ) : null,
                        quantity: p.quantity,
                        selectedSize: p.selectedSize || null
                    } ) )
                }
            }
        } );

        // Ensure global purchase memory: if this particular product has never been
        // purchased by this user previously, flag it in the userPurchasedProduct join table.
        for ( const p of productDetails )
        {
            const alreadyPurchased = await prisma.userPurchasedProduct.findFirst( {
                where: { userId: parsedUserId, productId: Number( p.productId ) }
            } );
            if ( !alreadyPurchased )
            {
                await prisma.userPurchasedProduct.create( {
                    data: { userId: parsedUserId, productId: Number( p.productId ) }
                } );
            }
        }

        res.json( { message: 'User Checkout recorded in profile & DB.' } );
    } catch ( err: any )
    {
        console.error( 'User Checkout ERROR:', err );
        res.status( 500 ).json( { message: err.message } );
    }
};

/**
 * Processes a checkout order for an un-authenticated guest user.
 * Generates an isolated receipt tracing the email, but does not bind to any registered account ID.
 *
 * @param req - The Express request object containing the guest name, email, and cart payload.
 * @param res - The Express response object.
 */
export const guestCheckout = async ( req: Request, res: Response ) =>
{
    const { name, email, productDetails, totalPurchaseAmount, totalItems } = req.body;
    try
    {
        await prisma.guestCheckout.create( {
            data: {
                name,
                email,
                totalPurchaseAmount: parseFloat( totalPurchaseAmount ),
                totalItems,
                purchasedProducts: {
                    create: productDetails.map( ( p: any ) => ( {
                        productId: Number( p.productId ),
                        name: p.name,
                        price: p.price ? parseFloat( p.price ) : null,
                        quantity: p.quantity,
                        selectedSize: p.selectedSize || null
                    } ) )
                }
            }
        } );

        res.status( 201 ).json( { message: "Guest Checkout was successful!!" } );
    } catch ( err: any )
    {
        res.status( 500 ).json( { message: err.message } );
    }
};
