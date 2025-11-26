import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';

const messages = [
  "Free Delivery for Metro Manila & Rizal Orders",
  "Use SAVE250 at checkout for ₱250 off",
  "New Arrivals: Check out our Anniversary Collection"
];

const AnnouncementCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 4000); // changes every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: '#f45c5c',
      color: '#fff',
      padding: '8px 0',
      textAlign: 'center',
      fontSize: '0.9rem'
    }}>
      <Container>
        {messages[currentIndex]}
      </Container>
    </div>
  );
};

export default AnnouncementCarousel;
