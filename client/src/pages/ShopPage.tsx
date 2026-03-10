// Import React tools and required components..
import React, { useEffect, useState, useContext } from 'react';
import ProductCard from '../components/ProductCard'; // UI component for displaying each product..
import ShoppingCart from '../components/ShoppingCart'; // Cart component displayed on the right..
import { CartContext } from '../context/CartContext'; // Global cart state and functions..
import { fetchAllProducts } from '../api/products'; // API call to get all products..


interface Product
{
  _id: string;
  image: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  [ key: string ]: any;
}

const ShopPage: React.FC = () =>
{
  const [ products, setProducts ] = useState<Product[]>( [] ); // Local state for fetched product list..
  const cartContext = useContext( CartContext );   // Access cart items and add-to-cart function..
  const addToCart = cartContext?.addToCart;


  // When the component mounts, fetch product data from the backend..
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
            <div className="col-sm-6 col-md-4 mb-4">
              <ProductCard
                key={ product._id } // React key to uniquely identify each item..
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