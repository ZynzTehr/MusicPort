import React from 'react';
import { Card, Button } from 'react-bootstrap';

/**
 * TypeScript Interface: Product
 * Note the optional `_id` and `sizes` fields utilizing the `?` operator. 
 * This grants flexibility depending on whether the product just came from the DB (`_id`) 
 * or is a mocked/legacy item (`id`).
 */
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
}

/**
 * TypeScript Interface: ProductCardProps
 * `onAddToCart` requires the parent component to handle the specific business logic 
 * of modifying the global cart state array.
 */
interface ProductCardProps
{
  product: Product;
  onAddToCart: ( product: any ) => void;
}

/**
 * ProductCard Component
 * 
 * Architectural Pattern: Highly Reusable Presentation Component.
 * Responsible strictly for rendering the UI logic of a single item, managing its own 
 * micro-state (e.g., specific sizing variants picked from a dropdown) before dispatching 
 * the payload upstream.
 */
const ProductCard: React.FC<ProductCardProps> = ( { product, onAddToCart } ) =>
{
  // Local state intelligently defaulting to the first available size in the array (if any exist).
  const [ selectedSize, setSelectedSize ] = React.useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[ 0 ] : ''
  );

  /**
   * Action Handler: handleAddToCart
   * Bundles the base product object with the currently selected variant size overlay,
   * sending the consolidated object up to the parent container.
   */
  const handleAddToCart = () =>
  {
    onAddToCart( { ...product, selectedSize: selectedSize || null } );
  };

  return (
    <Card className="h-100 border-0 rounded-4 card-glass overflow-hidden hover-lift shadow-lg">
      <div className="position-relative overflow-hidden group">
        <Card.Img
          variant="top"
          src={ product.image }
          alt={ product.name }
          style={ { height: '220px', objectFit: 'cover', backgroundColor: '#fff' } }
        />
        {/* Overlay effect could go here */ }
      </div>

      <Card.Body className="d-flex flex-column justify-content-between text-light">
        <div>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="fw-bold mb-0 text-truncate text-gradient" title={ product.name }>{ product.name }</h5>
            <span className="badge bg-dark border border-secondary text-light">${ product.price }</span>
          </div>
          <Card.Text className="text-secondary small mb-3 text-truncate-2">
            { product.description || 'No description available for this awesome product.' }
          </Card.Text>
        </div>

        { product.sizes && product.sizes.length > 0 && (
          <div className="mb-2">
            <select
              className="form-select form-select-sm text-dark"
              value={ selectedSize }
              onChange={ ( e ) => setSelectedSize( e.target.value ) }
            >
              { product.sizes.map( ( size ) => (
                <option key={ size } value={ size }>{ size }</option>
              ) ) }
            </select>
          </div>
        ) }

        <Button
          variant="primary"
          className="w-100 rounded-pill fw-bold shadow-glow mt-2"
          onClick={ handleAddToCart }
        >
          Add to Cart <i className="bi bi-cart-plus ms-1"></i>
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;