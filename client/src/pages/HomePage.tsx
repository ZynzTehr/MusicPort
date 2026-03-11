// Import React tools and required components.
import React, { useEffect, useState, useContext } from 'react';
import ProductCard from '../components/ProductCard'; // Individual product display
import { fetchFeaturedProducts } from '../api/products'; // API call to get featured items
import Jumbotron from '../components/Jumbotron';  // Large top banner
import ChatPreview from '../components/ChatPreview';

import bgImage from '../jumbotronBgImages/bg-pic.jpeg'; // Background image for jumbotron
import { CartContext } from '../context/CartContext'; // Cart context for add-to-cart
import { Toast } from 'react-bootstrap';  // Bootstrap toast for feedback messages

import '../styles/HomePage.css'; // Import DOM intersection animation styles

/**
 * TypeScript Interface: Product
 * Loosely typed to allow dynamic extension (`[key: string]: any`) but mandates 
 * core properties required for rendering the Carousel and Cart context payload.
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
  [ key: string ]: any;
}

/**
 * Primary Landing Dashboard for authenticated and unauthenticated traffic.
 * Orchestrates the intersection observer for scroll animations, dynamically fetches
 * the top featured items from the database, and exposes the global Chat preview module.
 */
const HomePage: React.FC = () =>
{
  // State to hold featured products from API
  const [ featured, setFeatured ] = useState<Product[]>( [] );

  /**
   * Global State Consumption
   * We need `addToCart` here so we can pass it down as a callback to the underlying `<ProductCard>` components.
   * This prevents the Dumb components from needing to consume the Context directly.
   */
  const cartContext = useContext( CartContext );
  const addToCart = cartContext?.addToCart;

  // Local UX State: Controls visibility and content of the temporary 'Added to Cart' popup.
  const [ toast, setToast ] = useState<{ show: boolean; productName: string; }>( { show: false, productName: '' } );

  /**
   * Initializes network payload requesting the top 'featured' store elements upon component mount.
   * Isolates out explicitly marked T-Shirt elements to dynamically preserve the Carousel aspect ratio UI.
   */
  useEffect( () =>
  {
    fetchFeaturedProducts().then( res =>
    {
      const products = res.data;
      // Filter out the T-shirt specifically for the Carousel
      const filtered = products.filter( ( p: Product ) => !p.name.includes( 'T-Shirt' ) );
      setFeatured( filtered ); // Save fetched data to local state..
    } );
  }, [] );

  /**
   * Scroll Animation Observer
   * A classic UX engineering pattern. We utilize the Native Browser API `IntersectionObserver` 
   * to detect when elements with the `.slide-in` class physically cross into the viewport (threshold: 0.1).
   * It then artificially adds a `.visible` class, triggering a CSS transition (found in HomePage.css).
   */
  useEffect( () =>
  {
    const observer = new IntersectionObserver( ( entries ) =>
    {
      entries.forEach( entry =>
      {
        if ( entry.isIntersecting )
        {
          entry.target.classList.add( 'visible' );
        }
      } );
    }, { threshold: 0.1 } );

    const hiddenElements = document.querySelectorAll( '.slide-in' );
    hiddenElements.forEach( ( el ) => observer.observe( el ) );

    // Cleanup phase: Prevents catastrophic memory leaks by disconnecting the observer when the component dies.
    return () => hiddenElements.forEach( ( el ) => observer.unobserve( el ) );
  }, [ featured ] ); // The dependency array forces the observer to re-calculate if the dynamic `featured` array changes.

  /**
   * Wrapper invocation triggering the Global Cart Context add method.
   * Flashes a temporary, timed Bootstrap Toast notification ensuring user feedback loop completion.
   *
   * @param product Specific targeted product object payload.
   */
  const handleAddToCart = ( product: Product ) =>
  {
    if ( addToCart ) addToCart( product ); // Add product to global cart..
    setToast( { show: true, productName: product.name } ); // Show success message..

    // Automatically hide toast after 4 seconds..
    setTimeout( () =>
    {
      setToast( { show: false, productName: '' } );
    }, 4000 );
  };


  return (
    <div className="text-center">
      {/* Top jumbotron banner */ }
      <div className="slide-in">
        <Jumbotron
          backgroundImage={ bgImage }
          heading="Welcome to MusicPort"
          subtext="Where music geeks meet.. Connect with your community today!!"
          buttonText="Explore Local Shows"
          buttonLink="/venues"
        />
      </div>

      {/* Chatroom Beta banner */ }
      {/* Chat Portal Section */ }
      <div className="slide-in">
        <ChatPreview />
      </div>

      {/* Mid-section tagline and CTA */ }
      <section className="text-light mb-5 mt-4 slide-in">
        <h1 style={{ fontWeight: 800, letterSpacing: '1px' }}>Music Lovers</h1>
        <p className="lead mb-4">Discover exclusive items!! Show your Support.</p>
        <a href="/shop" className="btn-premium-outline">Shop All Products</a>
      </section>

      {/* Toast appears temporarily when item is added to cart */ }
      { toast.show && (
        <div className="mb-3 d-flex justify-content-center">
          <Toast bg="success" show={ toast.show } className="text-white">
            <Toast.Body>
              <span role="img" aria-label="star"><i className="fa fa-fw me-1" aria-hidden="true" title="Copy to use star"></i></span>
              { toast.productName } added to cart!
              <span role="img" aria-label="star"><i className="fa fa-fw ms-1" aria-hidden="true" title="Copy to use star"></i></span>
            </Toast.Body>
          </Toast>
        </div>
      ) }

      {/* Featured sneakers section */ }
      <section className="featured-products slide-in">
        <h3 className="text-start text-light mb-4">Featured Products</h3>

        {/* Render product cards dynamically from featured array */ }
        <div className="carousel-wrapper slide-in">
          <div className="carousel-track">
            {/* Render featured twice to create a seamless scrolling loop */ }
            { [ ...featured, ...featured ].map( ( product, index ) => (
              <div key={ `${ product.id || product._id }-${ index }` } className="carousel-item-wrapper">
                <ProductCard
                  product={ product }
                  onAddToCart={ () => handleAddToCart( product ) }
                />
              </div>
            ) ) }
          </div>
        </div>
      </section>
    </div>
  );
};

// Export for use in App.jsx..
export default HomePage;