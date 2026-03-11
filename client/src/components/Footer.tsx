// Import core React library for building UI components.
import React from 'react';

// Use React Bootstrap's structural components (Container, Row, Col) 
// to quickly build a responsive, grid-based layout for the footer without custom CSS.
import { Container, Row, Col } from 'react-bootstrap';

// Use React Router's Link component for SPA navigation. 
// Standard <a> tags cause full page reloads, which we want to avoid.
import { Link } from 'react-router-dom';

/**
 * AppFooter Component
 * 
 * This component renders the global footer present at the bottom of the entire application.
 * From an architectural standpoint, footers are typically stateless "dumb" components. 
 * They receive no props and manage no complex state. Their primary job is semantic structure 
 * and providing escape hatches (links) for the user.
 */
const AppFooter: React.FC = () => {
  return (
    /**
     * The semantic <footer> tag is crucial for screen readers and SEO.
     * We use `mt-auto` (margin-top: auto) in combination with a flexbox layout on the main App 
     * to ensure the footer perfectly "sticks" to the bottom of the screen if the page content is short.
     * We also utilize CSS variables (var(--bg-card)) for easy theme switching (Dark/Light mode later).
     */
    <footer className="mt-auto py-5" style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <Container>
        <Row className="gy-4 align-items-center text-center text-md-start">
          
          {/* 
            * Column 1: Brand & Copyright 
            * Using a dynamic `{new Date().getFullYear()}` is a senior developer habit.
            * It guarantees the copyright year never goes out of date on January 1st.
            */}
          <Col md={4}>
            <h5 className="text-gradient fw-bold mb-2">MusicPort</h5>
            <p className="text-gradient small mb-0">
              &copy; {new Date().getFullYear()} MusicPort. All rights reserved.
            </p>
          </Col>

          {/* 
            * Column 2: Social Links 
            * These are currently mocks (href="#"). In a production app, these would either 
            * point to external URLs or be driven by a CMS/API configuration.
            * Because they lead *off-site*, we use standard `<a>` tags instead of React Router `<Link>` tags.
            */}
          <Col md={4} className="text-center">
            <div className="d-flex justify-content-center gap-3">
              <a href="#" className="text-gradient hover:text-primary transition-colors fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-gradient hover:text-primary transition-colors fs-5"><i className="bi bi-twitter"></i></a>
              <a href="#" className="text-gradient hover:text-primary transition-colors fs-5"><i className="bi bi-instagram"></i></a>
            </div>
          </Col>

          {/* 
            * Column 3: Useful Internal Links 
            * Because these lead to internal pages within our React app, we MUST use `<Link to="...">`.
            * This prevents the browser from discarding the application state and re-downloading the HTML.
            */}
          <Col md={4} className="text-center text-md-end">
            <Link to="/about" className="text-gradient small text-decoration-none me-3 hover:text-light transition-colors">About Us</Link>
            <Link to="/contact" className="text-gradient small text-decoration-none hover:text-light transition-colors">Contact</Link>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default AppFooter;