import React from 'react';
import { Card, Button } from 'react-bootstrap';

interface Product
{
  _id: string;
  image: string;
  name: string;
  brand: string;
  description: string;
  price: number;
}

interface ProductCardProps
{
  product: Product;
  onAddToCart: ( product: any ) => void;
}

const ProductCard: React.FC<ProductCardProps> = ( { product, onAddToCart } ) =>
{
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

        <Button
          variant="primary"
          className="w-100 rounded-pill fw-bold shadow-glow mt-2"
          onClick={ () => onAddToCart( product ) }
        >
          Add to Cart <i className="bi bi-cart-plus ms-1"></i>
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;