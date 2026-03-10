// Import React, hooks, Bootstrap modal, and app context/API..
import React, { useState, useContext, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { userCheckout, guestCheckout } from '../api/checkout';
import { CartContext } from '../context/CartContext';

interface CartItem
{
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutModalProps
{
  show: boolean;
  onClose: () => void;
  cartItems: CartItem[];
}

const CheckoutModal: React.FC<CheckoutModalProps> = ( { show, onClose, cartItems } ) =>
{
  const authContext = useContext( AuthContext );
  const cartContext = useContext( CartContext );

  // Get current user "null if guest"..
  const user = authContext?.user;
  // Clear cart after successful checkout..
  const clearCart = cartContext?.clearCart;

  // Track whether the user chooses to use card on file..
  const [ useCardOnFile, setUseCardOnFile ] = useState( false );

  // Checkout form state..
  const [ formData, setFormData ] = useState( {
    name: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  } );

  // Confirmation or error message after submission..
  const [ checkoutMessage, setCheckoutMessage ] = useState( '' );

  // Pre-fill form if the user is logged in..
  useEffect( () =>
  {
    if ( user )
    {
      setFormData( prev => ( {
        ...prev,
        name: user.name || '',
        email: user.email || '',
        cardNumber: user.cardOnFile ? user.cardInfo?.cardNumber || '' : '',
        expiryDate: user.cardOnFile ? user.cardInfo?.expiryDate || '' : '',
        cvv: user.cardOnFile ? user.cardInfo?.cvv || '' : ''
      } ) );
    }
  }, [ user ] );

  // Handle checkout form submission..
  const handleSubmit = async ( event: React.FormEvent ) =>
  {
    event.preventDefault();

    // Format the cart details for the backend..
    const productDetails = cartItems.map( item => ( {
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    } ) );

    // Calculate totals..
    const totalPurchaseAmount = cartItems.reduce( ( sum: number, item: CartItem ) => sum + item.price * item.quantity, 0 );
    const totalItems = cartItems.reduce( ( sum: number, item: CartItem ) => sum + item.quantity, 0 );

    try
    {
      if ( user )
      {
        // Submit checkout as a registered user..
        await userCheckout( {
          userId: user._id,
          name: formData.name,
          email: formData.email,
          productDetails,
          totalPurchaseAmount,
          totalItems
        } );
      } else
      {
        // Submit checkout as a guest..
        await guestCheckout( {
          name: formData.name,
          email: formData.email,
          productDetails,
          totalPurchaseAmount,
          totalItems
        } );
      }

      if ( clearCart ) clearCart(); // Clear cart after successful checkout..
      setCheckoutMessage( 'Thank you for your purchase!' );
    } catch ( err )
    {
      console.error( err );
      setCheckoutMessage( 'Checkout failed.' );
    }
  };

  return (
    <Modal show={ show } onHide={ onClose } centered>
      <Modal.Header closeButton>
        <Modal.Title>Complete Your Purchase</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        { checkoutMessage ? (
          // Show confirmation or error message after checkout..
          <div className="alert alert-info text-center">{ checkoutMessage }</div>
        ) : (
          // Checkout form
          <form onSubmit={ handleSubmit }>
            {/* Full Name input */ }
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

            {/* Email input */ }
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

            {/* Optional checkbox to use saved card info if user has one */ }
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

            {/* Show card input fields only if user is not using saved card */ }
            { !useCardOnFile && (
              <>
                {/* Card Number input */ }
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

                {/* Expiration Date input */ }
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

                {/* CVV input */ }
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

            {/* Submit Button */ }
            <button className="btn btn-dark w-100 rounded-pill" type="submit">Confirm Payment</button>
          </form>
        ) }
      </Modal.Body>
    </Modal>
  );
};

// Export the component so it can be imported and used in other files..
export default CheckoutModal;