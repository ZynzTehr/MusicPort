// Import React tools..
import React from 'react';
// Importing PropTypes to enforce type checking on the props passed to this component..
import '../styles/jumbotron.css';

interface JumbotronProps
{
  backgroundImage: string;
  heading: string;
  subtext: string;
  buttonText: string;
  buttonLink: string;
}

// Jumbotron is a reusable UI component that displays a large banner section with text and a button
// Props are destructured from the function arguments
const Jumbotron: React.FC<JumbotronProps> = ( { backgroundImage, heading, subtext, buttonText, buttonLink } ) =>
{
  // Define inline styles for the outer section of the Jumbotron
  const sectionStyle: React.CSSProperties = {
    height: '80vh', // Take up 80% of the viewport height
    background: `url(${ backgroundImage }) center center/cover no-repeat`, // Set background image, center it, cover full area
    position: 'relative',
    color: '#fff' // Set text color to white for visibility over dark backgrounds
  };

  // Return the JSX layout for the component
  return (
    <section
      className="jumbotron d-flex align-items-center justify-content-center"
      style={ sectionStyle } // Apply custom styles to the section
    >
      {/* Overlay box that appears on top of the background image */ }
      <div
        className="jumbotron-overlay text-center p-5 rounded"
        style={ {
          backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark transparent background for text readability
          maxWidth: '700px' // Restrict width so the content doesn’t stretch too wide
        } }
      >
        {/* Heading text passed as a prop */ }
        <h1 className="display-4 heading">{ heading }</h1>
        {/* Subtext passed as a prop */ }
        <p className="lead">{ subtext }</p>
        {/* Call-to-action button that links to a provided URL */ }
        <a href={ buttonLink } className="btn btn-warning btn-lg mt-3">
          { buttonText }
        </a>
      </div>
    </section>
  );
};

// Export the component so it can be imported and used in other files..
export default Jumbotron;