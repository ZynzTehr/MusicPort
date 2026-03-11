import { Request, Response } from 'express';
import prisma from '../database/dbConnection';

/**
 * =========================================
 * Storefront Product Controller
 * =========================================
 * Architectural Pattern: MVC Controller Layer / CRUD Operations
 * 
 * Purpose: Interfaces with the Prisma ORM to execute Data Definition requests against 
 * the PostgreSQL `Product` table. Methods are cleanly separated strictly by function, 
 * ranging from public storefront queries (GET) to strictly Admin-gated write ops (POST, PUT, DELETE).
 * Explicitly parses incoming numeric constraints natively.
 */

/**
 * Retrieves all products from the Prisma database.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 */
export const getAllProducts = async ( req: Request, res: Response ) =>
{
    try
    {
        const products = await prisma.product.findMany();
        res.json( products );
    } catch ( err: any )
    {
        res.status( 500 ).json( { message: err.message } );
    }
};

/**
 * Retrieves a limited number of featured products (maximum 6) from the database.
 * Primarily used for populating the storefront homepage carousel.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 */
export const getFeaturedProducts = async ( req: Request, res: Response ) =>
{
    try
    {
        const featured = await prisma.product.findMany( { take: 6 } );
        res.json( featured );
    } catch ( err: any )
    {
        res.status( 500 ).json( { message: err.message } );
    }
};

/**
 * Retrieves a single product by its unique integer ID.
 * Returns 404 if the product does not exist.
 *
 * @param req - The Express request object containing the product ID in params.
 * @param res - The Express response object.
 */
export const getProductById = async ( req: Request, res: Response ) =>
{
    try
    {
        const product = await prisma.product.findUnique( { where: { id: Number( req.params.id ) } } );
        if ( !product ) return res.status( 404 ).json( { message: 'Product not found' } );
        res.json( product );
    } catch ( err: any )
    {
        res.status( 500 ).json( { message: err.message } );
    }
};

/**
 * Creates a new product record in the database.
 * Only accessible by administrators. Parses string representations of numbers and booleans.
 *
 * @param req - The Express request object containing product details in the body.
 * @param res - The Express response object.
 */
export const createProduct = async ( req: Request, res: Response ) =>
{
    try
    {
        const { price, seeded, ...rest } = req.body;
        const product = await prisma.product.create( {
            data: {
                ...rest,
                price: parseFloat( price.toString() ),
                seeded: seeded === true || seeded === 'true'
            }
        } );
        res.status( 201 ).json( product );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error creating product', error: error.message } );
    }
};

/**
 * Updates an existing product record based on its unique ID.
 * Dynamically handles partial payload updates for pricing and booleans.
 *
 * @param req - The Express request object containing the updated fields and product ID.
 * @param res - The Express response object.
 */
export const updateProduct = async ( req: Request, res: Response ) =>
{
    try
    {
        const id = Number( req.params.id );
        const { price, seeded, ...rest } = req.body;

        let updateData: any = { ...rest };
        if ( price !== undefined ) updateData.price = parseFloat( price.toString() );
        if ( seeded !== undefined ) updateData.seeded = seeded === true || seeded === 'true';

        const product = await prisma.product.update( {
            where: { id },
            data: updateData,
        } );
        res.status( 200 ).json( product );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error updating product', error: error.message } );
    }
};

/**
 * Deletes a specific product from the database permanently.
 *
 * @param req - The Express request object containing the product ID in params.
 * @param res - The Express response object.
 */
export const deleteProduct = async ( req: Request, res: Response ) =>
{
    try
    {
        const id = Number( req.params.id );
        await prisma.product.delete( { where: { id } } );
        res.status( 200 ).json( { message: 'Product deleted successfully' } );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error deleting product', error: error.message } );
    }
};
