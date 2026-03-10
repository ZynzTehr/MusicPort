// Import React tools and required components..
import React, { useEffect, useState, useContext } from 'react';
import ProductCard from '../components/ProductCard'; // Individual product display..
import { fetchFeaturedProducts } from '../api/products'; // API call to get featured items..
import Jumbotron from '../components/Jumbotron';  // Large top banner..
import ChatPreview from '../components/ChatPreview';

import bgImage from '../jumbotronBgImages/bg-pic.jpeg'; // Background image for jumbotron..
import { CartContext } from '../context/CartContext'; // Cart context for add-to-cart..
import { Toast } from 'react-bootstrap';  // Bootstrap toast for feedback messages..


import '../styles/HomePage.css'; // Import animation styles

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

const HomePage: React.FC = () =>
{
  // State to hold featured products from API..
  const [ featured, setFeatured ] = useState<Product[]>( [] );

  // Get addToCart function from context..
  const cartContext = useContext( CartContext );
  const addToCart = cartContext?.addToCart;

  // Local toast state: controls visibility and content of cart feedback message..
  const [ toast, setToast ] = useState<{ show: boolean; productName: string; }>( { show: false, productName: '' } );

  // Fetch featured products when the component mounts..
  useEffect( () =>
  {
    fetchFeaturedProducts().then( res =>
    {
      setFeatured( res.data ); // Save fetched data to local state..
    } );
  }, [] );

  // Scroll Animation Observer
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

    return () => hiddenElements.forEach( ( el ) => observer.unobserve( el ) );
  }, [ featured ] ); // Re-run when featured products load

  // Handle when a product is added to cart..
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
        <h1>Music Lovers</h1>
        <p className="lead">Discover exclusive items!! Show your Support.</p>
        <a href="/shop" className="btn btn-warning btn-lg">Shop All Products</a>
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
        <div className="row">
          { featured.map( product => (
            <div key={ product._id } className="slide-in col-md-6 col-lg-4 mb-4">
              <ProductCard
                product={ product }
                onAddToCart={ () => handleAddToCart( product ) }
              />
            </div>
          ) ) }
        </div>
      </section>
    </div>
  );
};

// Export for use in App.jsx..
export default HomePage;