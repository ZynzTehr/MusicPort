// Import React tools needed to create context, manage state, and handle side effects..
import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface CartItem
{
  _id: string;
  name: string;
  price: number;
  quantity: number;
  [ key: string ]: any;
}

interface CartContextType
{
  cartItems: CartItem[];
  addToCart: ( product: any ) => void;
  removeFromCart: ( productId: string ) => void;
  increaseQuantity: ( productId: string ) => void;
  decreaseQuantity: ( productId: string ) => void;
  clearCart: () => void;
}

// Create a context for the cart..
export const CartContext = createContext<CartContextType | undefined>( undefined );

// Create a provider component to manage and share cart state across the app..
export const CartProvider: React.FC<{ children: ReactNode; }> = ( { children } ) =>
{
  // State to hold cart items..
  // Initialize from localStorage if available, otherwise an empty array..
  const [ cartItems, setCartItems ] = useState<CartItem[]>( () =>
  {
    const saved = localStorage.getItem( 'cart' );
    return saved ? JSON.parse( saved ) : [];
  } );

  // Save updated cart items to localStorage whenever cartItems state changes..
  useEffect( () =>
  {
    localStorage.setItem( 'cart', JSON.stringify( cartItems ) );
  }, [ cartItems ] );

  // Function to add a product to the cart..
  const addToCart = ( product: any ) =>
  {
    setCartItems( prev =>
    {
      console.log( prev );
      const existing = prev.find( item => item._id === product._id ); // Check if product already exists..
      if ( existing )
      {
        // If product exists, increase its quantity by 1..
        return prev.map( item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else
      {
        // If product doesn't exist, add it to the cart with quantity 1..
        return [ ...prev, { ...product, quantity: 1 } ];
      }
    } );
  };

  // Function to remove a product from the cart by its ID..
  const removeFromCart = ( productId: string ) =>
  {
    setCartItems( prev => prev.filter( item => item._id !== productId ) );
  };

  // Function to increase the quantity of a product in the cart..
  const increaseQuantity = ( productId: string ) =>
  {
    setCartItems( prev =>
      prev.map( item =>
        item._id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Function to decrease the quantity of a product in the cart..
  const decreaseQuantity = ( productId: string ) =>
  {
    setCartItems( prev =>
      prev
        .map( item =>
          item._id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter( item => item.quantity > 0 ) // Automatically remove the item if quantity reaches 0..
    );
  };

  // Function to completely clear all items from the cart..
  const clearCart = () =>
  {
    setCartItems( [] );
  };

  // Provide cart data and functions to any component inside CartProvider..
  return (
    <CartContext.Provider
      value={ {
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart
      } }
    >
      { children } {/* Render all child components inside the provider */ }
    </CartContext.Provider>
  );
};