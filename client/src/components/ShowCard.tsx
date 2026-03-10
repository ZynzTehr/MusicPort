const { log } = console;
// Import React tools, and Boostrat's Card for component styling..
import React from 'react';
import { Card } from 'react-bootstrap';

interface Venue
{
  _id: string;
  image: string;
  name: string;
  bands: string[];
  address: string;
  city: string;
  state: string;
  zipcode: string;
  price: number;
}

interface ShowCardProps
{
  venue: Venue;
}

const ShowCard: React.FC<ShowCardProps> = ( { venue } ) =>
{
  const date = new Date();
  const day = date.toString().substring( 0, 16 );

  return (
    // Card container with shadow, rounded corners, and full height
    <Card className='h-100 border-0 rounded-4 card-glass overflow-hidden hover-lift shadow-lg'>

      {/* Product image at the top of the card */ }
      <Card.Img
        variant='top'
        src={ venue.image }
        alt={ venue.name }
        style={ {
          objectFit: 'cover',
          height: '200px',
          backgroundColor: 'var(--bg-card)'
        } }
      />

      {/* Card body with vertical spacing and alignment */ }
      <Card.Body className='d-flex flex-column justify-content-between text-light'>

        {/* Show details section */ }
        <div>
          <Card.Title className='fw-bold text-truncate text-gradient' title={ venue.bands.join( ', ' ) }>
            { venue.bands.join( ', ' ) }
          </Card.Title>
          <Card.Subtitle className='mb-2 text-gray fw-normal'>@ { venue.name } </Card.Subtitle>
          <Card.Text className='text-info small mb-1'> <i className="bi bi-calendar-event me-1"></i> { day } @ 9pm  </Card.Text>
          <Card.Text className='text-secondary small'> <i className="bi bi-geo-alt me-1"></i> { venue.address }, { venue.city } </Card.Text>
        </div>

        {/* Footer section with price */ }
        <div className='d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary border-opacity-25'>
          <span className='fw-bold text-light fs-5'>${ venue.price } </span>
          <button className='btn btn-sm btn-outline-primary rounded-pill px-3'>Get Tickets</button>
        </div>
      </Card.Body>
    </Card>
  );
};

// Export the component so it can be imported and used in other files..
export default ShowCard;