// Import core React library for building UI components.
import React from 'react';

// Import CSS module/stylesheet specific to the Jumbotron.
// In larger projects, you often see this as `import styles from './jumbotron.module.css'` 
// to prevent CSS class name collisions.
import '../styles/jumbotron.css';

/**
 * TypeScript Interface: JumbotronProps
 * 
 * We explicitly define what data this reusable component expects.
 * By typing `backgroundImage`, `heading`, etc. as strictly `string`, 
 * TypeScript will throw a compile error if a developer accidentally passes a number or an object.
 */
interface JumbotronProps
{
  backgroundImage: string; // URL string for the heroic background image.
  heading: string;         // The massive `h1` title text.
  subtext: string;         // The secondary descriptive paragraph.
  buttonText: string;      // The label inside the Call-to-Action (CTA) button.
  buttonLink: string;      // The URL destination of the CTA button.
}

/**
 * Jumbotron Component
 * 
 * This is a highly reusable "Hero Section" component. 
 * Architecturally, it is a "dumb" or "presentation" component. It holds no state, 
 * makes no API calls, and simply renders whatever data is passed into it via Props.
 */
const Jumbotron: React.FC<JumbotronProps> = ( { backgroundImage, heading, subtext, buttonText, buttonLink } ) =>
{
  /**
   * Dynamic Inline Styles
   * 
   * Normally, moving inline styles to a CSS file is best practice for caching and brevity.
   * However, because the `backgroundImage` is dynamic (passed in as a prop), 
   * we *must* inject it inline here on the fly using a JavaScript template literal.
   */
  const sectionStyle: React.CSSProperties = {
    height: '80vh', // Responsive: Always take up exactly 80% of the user's vertical Viewport Height (vh).
    background: `url(${ backgroundImage }) center center/cover no-repeat`, // CSS Shorthand for positioning.
    position: 'relative',
    color: '#fff' // Ensure text defaults to white so it contrasts against dark images.
  };

  return (
    <section
      className="jumbotron d-flex align-items-center justify-content-center"
      style={ sectionStyle } 
    >
      {/* 
        * Overlay Box
        * Background images are unpredictable (e.g., passing a white image would render the white text invisible).
        * We apply a semi-transparent dark overlay (`rgba(0,0,0,0.6)`) behind the text to guarantee 
        * WCAG compliance and readability regardless of what image is fetched.
        */}
      <div
        className="jumbotron-overlay text-center p-5 rounded"
        style={ {
          backgroundColor: 'rgba(0, 0, 0, 0.6)', 
          maxWidth: '700px' // Cap the width so text lines don't become unreadably long on ultra-wide monitors.
        } }
      >
        <h1 className="display-4 heading">{ heading }</h1>
        <p className="lead">{ subtext }</p>
        
        {/* 
          * Note: This uses a standard `<a>` tag instead of React Router's `<Link>`.
          * If `buttonLink` points to an internal route (like `/artists`), this will cause a full 
          * page reload. In a pure SPA, it might be better to convert this to `<Link to={buttonLink}>`.
          */}
        <a href={ buttonLink } className="btn-premium-glass mt-3">
          { buttonText }
        </a>
      </div>
    </section>
  );
};

// Export the component so it can be imported and used in other files..
export default Jumbotron;