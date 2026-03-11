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

// Create an empty Context shell typed against the interface.
export const CartContext = createContext<CartContextType | undefined>( undefined );

/**
 * CartProvider Component
 * 
 * Architectural Pattern: Ephemeral State Synchronization / Context Provider.
 * 
 * Purpose: Manages the active shopping cart payload entirely within the client's memory.
 * By hooking directly into the browser's persistent `localStorage`, this Context ensures 
 * that a user's unpurchased cart survives hard page reloads and tab closures without 
 * requiring expensive, constant backend syncing until the actual checkout phase.
 */
/**
 * Global component providing explicit Cart state management exposing localized arrays.
 * Handles exact sync between live shopping sessions and the persistent browser LocalStorage instance globally.
 *
 * @param children - Any underlying nested React DOM elements.
 */
export const CartProvider: React.FC<{ children: ReactNode; }> = ( { children } ) =>
{
  /**
   * State Initialization with Lazy Evaluation.
   * Reading `localStorage` is a synchronous, blocking operation. By passing an anonymous 
   * function to `useState`, React guarantees this expensive read only executes exactly 
   * once during the initial mount phase, preventing UI stutter on subsequent re-renders.
   */
  const [ cartItems, setCartItems ] = useState<CartItem[]>( () =>
  {
    const saved = localStorage.getItem( 'cart' );
    return saved ? JSON.parse( saved ) : [];
  } );

  /**
   * State Persistence Sync
   * A classic React pattern. Whenever the master `cartItems` array is mutated (added/removed),
   * this observer fires and blindly overwrites the stringified `localStorage` vault matching it.
   */
  useEffect( () =>
  {
    localStorage.setItem( 'cart', JSON.stringify( cartItems ) );
  }, [ cartItems ] );

  // Function to add a product to the cart..
  /**
   * Appends an active product strictly into the Cart Array block natively.
   * Modifies existing instance counts if duplicate ID payloads execute simultaneously avoiding duplicate mappings.
   *
   * @param product Incoming standardized product object metadata.
   */
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

  /**
   * Action: removeFromCart
   * Leverages the non-mutating `Array.filter` native method to swiftly eject 
   * a product from the shopping matrix without mutating existing memory references.
   */
  const removeFromCart = ( productId: string ) =>
  {
    setCartItems( prev => prev.filter( item => item._id !== productId ) );
  };

  /**
   * Action: increaseQuantity
   * Iterates standard `Array.map` to patch identical object matches dynamically.
   */
  const increaseQuantity = ( productId: string ) =>
  {
    setCartItems( prev =>
      prev.map( item =>
        item._id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Function to decrease the quantity of a product in the cart..
  /**
   * Safely deprecates localized instances of a cart object based on unique identifiers exclusively.
   * Hard-drops the object safely from the LocalStorage cache the moment quantity values eclipse 0.
   */
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