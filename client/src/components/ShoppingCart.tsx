// Import React tools and context hooks..
import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext'; // Global cart state..
import { AuthContext } from '../context/AuthContext'; // Global user auth state..
import CheckoutModal from './CheckoutModal'; // Checkout modal component..

/**
 * ShoppingCart Component
 * 
 * Architectural Type: Context-driven smart component.
 * Purpose: Provides a persistent slide-out or sidebar representation of the user's queued
 * purchases. It actively subscribes to global changes inside `CartContext`.
 */
const ShoppingCart: React.FC = () =>
{
  // Intercept the globally available Cart and Auth stores.
  // This circumvents the "Prop Drilling" anti-pattern completely.
  const cartContext = useContext( CartContext );
  const authContext = useContext( AuthContext );

  // Safety net: Always ensure the Context trees actually wrapped this part of the app.
  if ( !cartContext || !authContext ) return null;

  // Destructure mutative handlers and array data natively.
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity } = cartContext;
  const { user } = authContext;

  // Local state controls the complex modal launch logic keeping parent state clean.
  const [ showCheckout, setShowCheckout ] = useState( false );

  /**
   * Functional Programming: Array.reduce()
   * Iterates automatically through every item applying the mathematical accumulator (sum) 
   * against individual line-item totals (price * quantity). Initialized strictly at 0.
   */
  const subtotal = cartItems.reduce( ( sum: number, item: any ) => sum + item.price * item.quantity, 0 );

  return (
    <div className="card shadow-sm p-3 mt-5 ms-4 rounded-4 border-0 bg-light">
      {/* Section title */ }
      <h4 className="fw-bold mb-3">Your Cart</h4>

      {/* Display user name and bio if signed in */ }
      { user && (
        <div className="text-center mb-4">
          <h5 className="fw-bold text-success">{ user.name }</h5>
          <p className="text-muted fst-italic mb-0">{ user.bio }</p>
        </div>
      ) }

      {/* Conditional UI: If cart is empty */ }
      { cartItems.length === 0 ? (
        <p className="text-muted">Your cart is empty.</p>
      ) : (
        <ul className="list-group mb-3">
          {/* Render each item in the cart */ }
          { cartItems.map( ( item: any, idx: number ) => (
            <li
              key={ idx }
              className="list-group-item d-flex justify-content-between align-items-center border-0"
            >
              {/* Product details */ }
              <div>
                <strong>{ item.name } { item.selectedSize ? `(Size: ${ item.selectedSize })` : '' }</strong><br />
                <span className="text-muted">
                  ${ item.price } × { item.quantity }
                </span>
              </div>

              {/* Quantity controls and remove button */ }
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={ () => decreaseQuantity( item._id ) }
                >
                  -
                </button>
                <span>{ item.quantity }</span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={ () => increaseQuantity( item._id ) }
                >
                  +
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={ () => removeFromCart( item._id ) }
                >
                  Remove
                </button>
              </div>
            </li>
          ) ) }
        </ul>
      ) }

      {/* Subtotal display */ }
      <div className="d-flex justify-content-between border-top pt-3">
        <strong>Total:</strong>
        <span>${ subtotal.toFixed( 2 ) }</span>
      </div>

      {/* Checkout button */ }
      <button
        className="btn btn-warning w-100 mt-3 rounded-pill"
        disabled={ cartItems.length === 0 }
        onClick={ () => setShowCheckout( true ) }
      >
        Checkout
      </button>

      {/* Checkout Modal component renders here when triggered */ }
      <CheckoutModal
        show={ showCheckout }
        onClose={ () => setShowCheckout( false ) }
        cartItems={ cartItems }
      />
    </div>
  );
};


// Export the component so it can be imported and used in other files..
export default ShoppingCart;