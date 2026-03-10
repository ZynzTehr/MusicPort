// Import React tools..
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AppFooter: React.FC = () =>
{
  return (
    <footer className="mt-auto py-5" style={ { backgroundColor: 'var(--bg-card)', borderTop: '1px solid rgba(255,255,255,0.05)' } }>
      <Container>
        <Row className="gy-4 align-items-center text-center text-md-start">
          {/* Brand & Copyright */ }
          <Col md={ 4 }>
            <h5 className="text-gradient fw-bold mb-2">MusicPort</h5>
            <p className="text-gradient small mb-0">
              &copy; { new Date().getFullYear() } MusicPort. All rights reserved.
            </p>
          </Col>

          {/* Social Links (Mock) */ }
          <Col md={ 4 } className="text-center">
            <div className="d-flex justify-content-center gap-3">
              <a href="#" className="text-gradient hover:text-primary transition-colors fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-gradient hover:text-primary transition-colors fs-5"><i className="bi bi-twitter"></i></a>
              <a href="#" className="text-gradient hover:text-primary transition-colors fs-5"><i className="bi bi-instagram"></i></a>
            </div>
          </Col>

          {/* Useful Links */ }
          <Col md={ 4 } className="text-center text-md-end">
            <Link to="/about" className="text-gradient small text-decoration-none me-3 hover:text-light transition-colors">About Us</Link>
            <Link to="/contact" className="text-gradient small text-decoration-none hover:text-light transition-colors">Contact</Link>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

// Export the component so it can be imported and used in other files..
export default AppFooter;