// Import React tools and required components..
import React, { useEffect, useState, useContext } from 'react';
import ProductCard from '../components/ProductCard'; // UI component for displaying each product..
import ShoppingCart from '../components/ShoppingCart'; // Cart component displayed on the right..
import { CartContext } from '../context/CartContext'; // Global cart state and functions..
import { fetchAllProducts } from '../api/products'; // API call to get all products..


interface Product
{
  id: number;
  _id?: string;
  image: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  sizes?: string[];
  [ key: string ]: any;
}

/**
 * ShopPage Component
 * 
 * Architectural Pattern: Global Product Gallery / Context Distributor.
 * 
 * Purpose: This component acts as the digital storefront. It fetches the complete 
 * active inventory and delegates rendering to individual `<ProductCard>` children.
 * Crucially, it orchestrates the `CartContext` interaction. Instead of each ProductCard 
 * connecting to the Context independently, the ShopPage acts as the broker, passing down 
 * `onAddToCart` as a prop.
 */
const ShopPage: React.FC = () =>
{
  const [ products, setProducts ] = useState<Product[]>( [] ); // Local state for fetched product list..
  const cartContext = useContext( CartContext );   // Access cart items and add-to-cart function..
  const addToCart = cartContext?.addToCart;


  /**
   * Triggers an immediate network request upon component initialization mapping the entire
   * inventory JSON array locally into state memory for fast rendering.
   */
  useEffect( () =>
  {
    fetchAllProducts().then( res =>
    {
      setProducts( res.data );
    } );
  }, [] );

  return (
    <div className="row">
      {/* Left side: product listing */ }
      <div className="col-md-8">
        <h2 className="text-light mb-4">Store</h2>

        {/* Display each product as a card */ }
        <div className="row">
          { products.map( product => (
            <div className="col-sm-6 col-md-4 mb-4" key={ product.id || product._id }>
              <ProductCard
                product={ product } // Product data passed to the card..
                onAddToCart={ ( product: any ) => addToCart && addToCart( product ) } // Pass the function to add items to cart..
              />
            </div>
          ) ) }
        </div>
      </div>

      {/* Right side: shopping cart summary */ }
      <div className="col-md-4">
        <ShoppingCart />
      </div>
    </div>
  );
};


export default ShopPage;