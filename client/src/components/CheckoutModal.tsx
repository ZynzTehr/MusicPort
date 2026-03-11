// Import core React hooks for state and lifecycle management.
import React, { useState, useContext, useEffect } from 'react';

// Use React Bootstrap's Modal for an accessible, styled overlay dialog.
import { Modal } from 'react-bootstrap';

// Import our context providers. This is a critical architectural pattern: 
// By using Context, we avoid "prop drilling" (passing user/cart data down through 10 layers of components).
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

// Import our abstracted API calling functions for clean separation of concerns.
import { userCheckout, guestCheckout } from '../api/checkout';

/**
 * Interface defining the strict shape of a CartItem.
 * This ensures type safety when iterating over the cart to calculate totals or format API payloads.
 */
interface CartItem
{
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * Interface defining the Props this Modal expects from its parent component.
 */
interface CheckoutModalProps
{
  show: boolean;         // Controls modal visibility.
  onClose: () => void;   // Callback to parent to trigger the modal closing animation.
  cartItems: CartItem[]; // The actual list of items the user is attempting to buy.
}

/**
 * CheckoutModal Component
 * 
 * This component acts as the final step in the e-commerce funnel.
 * It intelligently handles two completely different workflows natively:
 * 1. Authenticated Users (can use saved cards, connects purchase to their account history).
 * 2. Anonymous Guests (one-off purchases without account creation).
 */
const CheckoutModal: React.FC<CheckoutModalProps> = ( { show, onClose, cartItems } ) =>
{
  // Destructure the global contexts to grab the current user and the clearCart dispatch function.
  const authContext = useContext( AuthContext );
  const cartContext = useContext( CartContext );

  // Using optional chaining (?.) because theoretically, a context might not be wrapped around this component.
  const user = authContext?.user;
  const clearCart = cartContext?.clearCart;

  // --- Internal Component State ---
  // Tracks if a logged-in user flipped the toggle switch to use an existing saved card.
  const [ useCardOnFile, setUseCardOnFile ] = useState( false );

  // Controlled form inputs for the credit card / billing information.
  const [ formData, setFormData ] = useState( {
    name: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  } );

  // Stores success or error messages retrieved from the API after submission.
  const [ checkoutMessage, setCheckoutMessage ] = useState( '' );

  /**
   * Data Pre-filling Effect
   * 
   * As soon as this component mounts (or the 'user' object changes), we check if they are logged in.
   * If they are, it's a massive UX anti-pattern to make them type their name and email again.
   * We automatically populate `formData` with their existing profile data.
   */
  useEffect( () =>
  {
    if ( user )
    {
      setFormData( prev => ( {
        ...prev,
        name: user.name || '',
        email: user.email || '',
        // If they have a saved card, preload that info into state as well.
        cardNumber: user.cardOnFile ? user.cardInfo?.cardNumber || '' : '',
        expiryDate: user.cardOnFile ? user.cardInfo?.expiryDate || '' : '',
        cvv: user.cardOnFile ? user.cardInfo?.cvv || '' : ''
      } ) );
    }
  }, [ user ] );

  /**
   * Form Submission Orchestrator
   * 
   * This is the vital core of the checkout logic.
   * 1. It maps frontend cart items into the strict 'productDetails' array expected by the backend schema.
   * 2. It locally calculates total sums (though a secure backend MUST recalculate this server-side to prevent tampering).
   * 3. It routes the payload to the correct controller endpoint (User vs Guest).
   */
  const handleSubmit = async ( event: React.FormEvent ) =>
  {
    event.preventDefault(); // Stop default browser refresh

    // Map over `cartItems` and strip out excess frontend data, sending only what the API explicitly requires.
    const productDetails = cartItems.map( item => ( {
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    } ) );

    // Calculate aggregated metrics for the transaction record.
    const totalPurchaseAmount = cartItems.reduce( ( sum: number, item: CartItem ) => sum + item.price * item.quantity, 0 );
    const totalItems = cartItems.reduce( ( sum: number, item: CartItem ) => sum + item.quantity, 0 );

    try
    {
      // Branching logic: Authenticated hit vs Anonymous hit
      if ( user )
      {
        await userCheckout( {
          userId: user._id, // Critical: Attach the transaction to the user's permanent history.
          name: formData.name,
          email: formData.email,
          productDetails,
          totalPurchaseAmount,
          totalItems
        } );
      } else
      {
        await guestCheckout( {
          name: formData.name, // No user ID to link. Transaction floats anonymously in the DB merely for accounting.
          email: formData.email, 
          productDetails,
          totalPurchaseAmount,
          totalItems
        } );
      }

      // UX Polish: Upon complete API success, we forcefully wipe the global cart context. 
      // Navigating away with an un-emptied cart after paying is highly confusing to users.
      if ( clearCart ) clearCart(); 
      setCheckoutMessage( 'Thank you for your purchase!' );
    } catch ( err )
    {
      console.error( "Checkout API Exception:", err );
      setCheckoutMessage( 'Checkout failed. Please try again.' );
    }
  };

  return (
    <Modal show={ show } onHide={ onClose } centered>
      <Modal.Header closeButton>
        <Modal.Title>Complete Your Purchase</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* State-Driven UI: Hide the checkout form entirely and solely render a status message upon submission. */}
        { checkoutMessage ? (
          <div className="alert alert-info text-center">{ checkoutMessage }</div>
        ) : (
          <form onSubmit={ handleSubmit }>
            
            {/* 
              * Full Name input 
              * We use dynamic conditions. If `useCardOnFile` is true, we lock the input (`readOnly`) 
              * because we shouldn't let them tamper with the registered billing name tied to that token.
              */}
            <div className='form-group form-floating mb-2'>
              <input
                id='name'
                type="text"
                className="form-control"
                placeholder="Full Name"
                required={ !useCardOnFile }
                value={ formData.name }
                readOnly={ useCardOnFile }
                onChange={ event => setFormData( { ...formData, name: event.target.value } ) }
              />
              <label htmlFor='name'>Full Name</label>
            </div>

            <div className='form-group form-floating mb-2'>
              <input
                id='email'
                type="email"
                className="form-control"
                placeholder="Email"
                required
                value={ formData.email }
                onChange={ event => setFormData( { ...formData, email: event.target.value } ) }
              />
              <label htmlFor='email'>Email</label>
            </div>

            {/* 
              * Saved Payment Toggle
              * This is an exclusive feature for logged-in users who have opted to store payment credentials.
              * We only render this div block if `user` AND `user.cardOnFile` both evaluate truthy.
              */}
            { user && user.cardOnFile && (
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={ useCardOnFile }
                  onChange={ () => setUseCardOnFile( !useCardOnFile ) }
                  id="useCardOnFile"
                />
                <label className="form-check-label" htmlFor="useCardOnFile">
                  Use Card on File
                </label>
              </div>
            ) }

            {/* 
              * Conditional Rendering for Payment Inputs
              * By wrapping the Card/Exp/CVV fields in `{!useCardOnFile && (...)}`, we literally delete them 
              * from the DOM if the user toggled the saved card feature. This reduces visual clutter and prevents 
              * accidental modifications.
              */}
            { !useCardOnFile && (
              <>
                <div className='form-group form-floating mb-2'>
                  <input
                    id='card'
                    type="text"
                    className="form-control"
                    placeholder="Card Number"
                    required
                    value={ formData.cardNumber }
                    onChange={ event => setFormData( { ...formData, cardNumber: event.target.value } ) }
                  />
                  <label htmlFor='card'>Card Number</label>
                </div>

                <div className='form-group form-floating mb-2'>
                  <input
                    id='exp'
                    type="text"
                    className="form-control"
                    placeholder="Expiration Date (MM/YY)"
                    required
                    value={ formData.expiryDate }
                    onChange={ event => setFormData( { ...formData, expiryDate: event.target.value } ) }
                  />
                  <label htmlFor='exp'>Expiration Date (MM/YY)</label>
                </div>

                <div className='form-group form-floating mb-2'>
                  <input
                    id='cvv'
                    type="text"
                    className="form-control mb-3"
                    placeholder="CVV"
                    required
                    value={ formData.cvv }
                    onChange={ event => setFormData( { ...formData, cvv: event.target.value } ) }
                  />
                  <label htmlFor='cvv'>CVV</label>
                </div>
              </>
            ) }

            <button className="btn btn-dark w-100 rounded-pill" type="submit">Confirm Payment</button>
          </form>
        ) }
      </Modal.Body>
    </Modal>
  );
};

// Export the component so it can be imported and used in other files..
export default CheckoutModal;