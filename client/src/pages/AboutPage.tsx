import React, { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../styles/jumbotron.css'; // Reusing some base styles if needed, but adding custom inline flair

/**
 * AboutPage Component
 * 
 * Aesthetic Direction: Atmospheric, editorial dark-mode. 
 * Features: High-contrast typography, generous negative space, subtle CSS variable integration, 
 * and a staggered fade-in animation effect (handled via inline styling for portability here).
 * 
 * Architectural Note: This is a pure presentational "dumb" component. It holds zero internal 
 * state (other than the scroll initialization effect) and strictly serves a narrative purpose.
 */
const AboutPage: React.FC = () => {
  /**
   * UX Polish: Scroll Restoration
   * React Router doesn't automatically scroll to the top of a new page. 
   * We force `window.scrollTo(0,0)` on component mount to prevent users from 
   * jumping into the middle of the About narrative if they clicked the link from the bottom of the Home page.
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#f0f0f0', paddingBottom: '6rem' }}>
      {/* Editorial Hero Section */}
      <section 
        className="d-flex align-items-center position-relative overflow-hidden" 
        style={{ minHeight: '60vh', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Subtle background glow effect */}
        <div style={{
          position: 'absolute', top: '10%', right: '10%', width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(13,202,240,0.15) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%', filter: 'blur(60px)', zIndex: 0
        }} />
        
        <Container className="position-relative" style={{ zIndex: 1 }}>
          <Row>
            <Col lg={8}>
              <h6 className="text-info text-uppercase tracking-widest mb-3 fw-bold" style={{ letterSpacing: '4px', fontSize: '0.85rem' }}>
                Our Genesis
              </h6>
              <h1 className="display-1 fw-bolder mb-4" style={{ letterSpacing: '-2px', lineHeight: '1.1' }}>
                We Built the <br />
                <span className="text-gradient" style={{ background: 'linear-gradient(45deg, #0dcaf0, #6610f2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Sonic Bridge.
                </span>
              </h1>
              <p className="lead border-start border-info border-3 ps-4 fs-4 text-secondary mb-0" style={{ maxWidth: '600px' }}>
                MusicPort wasn't born in a boardroom. It was forged in damp rehearsal spaces and late-night studio sessions by artists who were tired of playing into the void.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Narrative Content */}
      <section className="py-5 mt-5">
        <Container>
          <Row className="gy-5 justify-content-between">
            <Col lg={5}>
              <h2 className="display-5 fw-bold mb-4">The Fragmentation Problem.</h2>
              <p className="text-secondary fs-5 lh-lg mb-4">
                Historically, the music industry has operated behind velvet ropes. Finding a collaborator, booking a gig, or even sourcing a niche instrument required you to "know a guy." We hated that. The talent is everywhere, but the infrastructure was ancient.
              </p>
              <p className="text-secondary fs-5 lh-lg">
                We designed MusicPort as a digital epicenter. Whether you're a session drummer looking for a weekend gig, a producer hunting for stems, or a venue needing an opener—the port is open.
              </p>
            </Col>
            <Col lg={6}>
              <div 
                className="p-5 rounded-4 h-100 d-flex flex-column justify-content-center position-relative overflow-hidden" 
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                {/* Decorative grain/noise pattern overlay if available, otherwise subtle gradient */}
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.5,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 100%)',
                  pointerEvents: 'none'
                }} />
                
                <h3 className="fs-2 fw-light mb-4">"It's not just a platform. It's an ecosystem."</h3>
                <div className="d-flex align-items-center mt-3">
                  <div className="bg-info rounded-circle me-3" style={{ width: '50px', height: '50px' }} />
                  <div>
                    <h5 className="mb-0 fw-bold">Jane Doe</h5>
                    <small className="text-info text-uppercase" style={{ letterSpacing: '1px' }}>Lead Architect</small>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default AboutPage;
