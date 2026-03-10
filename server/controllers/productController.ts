import { Request, Response } from 'express';
import Product from '../models/Products';

/* Export controller to send all product data to frontend from server */
export const getAllProducts = async ( req: Request, res: Response ) =>
{
    try
    {
        const products = await Product.find( {} ); // Get all products..
        // console.log(products); // (Optional) Debugging log — remove in production..
        res.json( products );    // Respond with JSON array of products..
    } catch ( err: any )
    {
        res.status( 500 ).json( { message: err.message } ); // Handle server error..
    }
};

/* Export controller to send most viewed products to frontend from
  server for display in featured section of the Home Page */
export const getFeaturedProducts = async ( req: Request, res: Response ) =>
{
    try
    {
        const featured = await Product.find( {} ).limit( 3 ); // Only return 3 items..
        res.json( featured ); // Respond with featured product data..
    } catch ( err: any )
    {
        res.status( 500 ).json( { message: err.message } ); // Handle error..
    }
};

/* Export controller to send most relevant data
  i.e "id" to frontend from server  */
export const getProductById = async ( req: Request, res: Response ) =>
{
    try
    {
        // Get the product ID from the URL param and fetch it from DB..
        const product = await Product.findById( req.params.id );

        // Return the product data..
        res.json( product );
    } catch ( err: any )
    {
        res.status( 500 ).json( { message: err.message } ); // Catch errors..
    }
};

// Create a new product
export const createProduct = async ( req: Request, res: Response ) =>
{
    try
    {
        const product = await Product.create( req.body );
        res.status( 201 ).json( product );
    } catch ( error: any )
    {
        if ( error.name === 'ValidationError' )
        {
            return res.status( 400 ).json( { message: 'Validation Error', error: error.message } );
        }
        res.status( 500 ).json( { message: 'Error creating product', error: error.message } );
    }
};

// Update a product
export const updateProduct = async ( req: Request, res: Response ) =>
{
    try
    {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate( id, req.body, { new: true } );
        if ( !product )
        {
            return res.status( 404 ).json( { message: 'Product not found' } );
        }
        res.status( 200 ).json( product );
    } catch ( error: any )
    {
        if ( error.name === 'ValidationError' )
        {
            return res.status( 400 ).json( { message: 'Validation Error', error: error.message } );
        }
        res.status( 500 ).json( { message: 'Error updating product', error: error.message } );
    }
};

// Delete a product
export const deleteProduct = async ( req: Request, res: Response ) =>
{
    try
    {
        const { id } = req.params;
        console.log( `Attempting to delete product with ID: ${ id }` );
        const product = await Product.findByIdAndDelete( id );
        if ( !product )
        {
            return res.status( 404 ).json( { message: 'Product not found' } );
        }
        res.status( 200 ).json( { message: 'Product deleted successfully' } );
    } catch ( error: any )
    {
        res.status( 500 ).json( { message: 'Error deleting product', error: error.message } );
    }
};
