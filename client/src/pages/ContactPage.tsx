import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import '../styles/jumbotron.css';

/**
 * ContactPage Component
 * 
 * Aesthetic Direction: Sleek, glassmorphic minimalism over a deep, moody background.
 * Features: Controlled form state, simulated submission delay for UX, floating labels, 
 * and custom focus states via inline styles.
 * 
 * Architectural Pattern: Controlled Form / Local State UX Simulation.
 * Since there is no `mailto:` or backend email service integrated yet, this component
 * fakes the network delay (`setTimeout`) to provide tactile, polished feedback to the user.
 */
const ContactPage: React.FC = () => {
  // Local Form Binding: A single object containing all input strings.
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  
  // UX State: Prevents double-submissions and triggers the success animation.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Scroll Restoration: Fixes React Router's default behavior of maintaining vertical Y scroll on navigation.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay for polish UX
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Auto reset success message after a few seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#f0f0f0', position: 'relative', overflow: 'hidden' }}>
      
      {/* Aesthetic Background Elements */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(102,16,242,0.15) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%', filter: 'blur(80px)', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw',
        background: 'radial-gradient(circle, rgba(13,202,240,0.1) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%', filter: 'blur(80px)', zIndex: 0
      }} />

      <Container className="position-relative py-5 mt-5" style={{ zIndex: 1 }}>
        <Row className="justify-content-center">
          <Col lg={10}>
            {/* Header Section */}
            <div className="text-center mb-5">
              <h6 className="text-info text-uppercase tracking-widest fw-bold mb-3" style={{ letterSpacing: '4px', fontSize: '0.85rem' }}>
                Initiate Connection
              </h6>
              <h1 className="display-3 fw-bolder mb-3" style={{ letterSpacing: '-1.5px' }}>
                Drop us a line.
              </h1>
              <p className="lead text-secondary mx-auto" style={{ maxWidth: '600px' }}>
                Have a question, a feature request, or just want to talk gear? We're listening. Our team usually responds within 24 hours.
              </p>
            </div>

            {/* Form Section */}
            <div 
              className="p-5 p-md-5 rounded-4 mx-auto shadow-lg" 
              style={{ 
                maxWidth: '800px', 
                backgroundColor: 'rgba(255,255,255,0.03)', 
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)' 
              }}
            >
              {submitted ? (
                <div className="text-center py-5">
                  <div className="d-inline-flex justify-content-center align-items-center bg-info rounded-circle mb-4" style={{ width: '80px', height: '80px', color: '#000' }}>
                    <i className="bi bi-check-lg display-5"></i>
                  </div>
                  <h3 className="fw-bold">Transmission Received</h3>
                  <p className="text-secondary">Thanks for reaching out. We'll be in touch shortly.</p>
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Row className="g-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-secondary small text-uppercase" style={{ letterSpacing: '1px' }}>Name</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="bg-transparent text-light border-0 border-bottom border-secondary rounded-0 px-0 shadow-none focus-ring focus-ring-info"
                          style={{ transition: 'all 0.3s ease' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-secondary small text-uppercase" style={{ letterSpacing: '1px' }}>Email</Form.Label>
                        <Form.Control 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="bg-transparent text-light border-0 border-bottom border-secondary rounded-0 px-0 shadow-none focus-ring focus-ring-info"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="text-secondary small text-uppercase" style={{ letterSpacing: '1px' }}>Subject</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="bg-transparent text-light border-0 border-bottom border-secondary rounded-0 px-0 shadow-none focus-ring focus-ring-info"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="text-secondary small text-uppercase" style={{ letterSpacing: '1px' }}>Message</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={4}
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          className="bg-transparent text-light border-0 border-bottom border-secondary rounded-0 px-0 shadow-none focus-ring focus-ring-info"
                          style={{ resize: 'none' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12} className="text-center mt-5">
                      <Button 
                        type="submit" 
                        variant="outline-info" 
                        size="lg" 
                        className="rounded-pill px-5 py-3 fw-bold text-uppercase tracking-widest transition-all"
                        disabled={isSubmitting}
                        style={{ letterSpacing: '2px' }}
                      >
                        {isSubmitting ? (
                          <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/> Sending...</>
                        ) : 'Send Message'}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ContactPage;
