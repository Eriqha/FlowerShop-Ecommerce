import React from 'react';
import { Carousel } from 'react-bootstrap';

const HeroCarousel = ({ slides }) => {
  return (
    <Carousel interval={6000} pause={false}>
      {slides.map((slide, i) => (
        <Carousel.Item key={i}>
          <img
            className="d-block w-100"
            src={slide.image}
            alt={slide.title}
            style={{
              height: '60vh',
              minHeight: '300px',
              maxHeight: '700px',
              objectFit: 'cover'
            }}
          />

          {/* FADE SLIDE ANIMATION ADDED HERE */}
          <Carousel.Caption
            className="fade-slide-up"
            style={{
              top: '20%',
              left: '12%',
              transform: 'translateY(-50%)',
              textAlign: 'left',
              color: 'white',
              background: 'none',
            }}
          >
            <h3 style={{ fontSize: '4rem', fontWeight: '700', lineHeight: '1.2' }}>
              {slide.title.split(',').map((line, idx) => (
                <React.Fragment key={idx}>
                  {line.trim()} <br />
                </React.Fragment>
              ))}
            </h3>

            <p className="fade-slide-up" style={{ animationDelay: '0.4s', fontSize: '1.2rem' }}>
              {slide.subtitle.split('.').map((line, idx) => (
                <React.Fragment key={idx}>
                  {line.trim()} {idx !== slide.subtitle.split('.').length - 1 ? <br /> : null}
                </React.Fragment>
              ))}
            </p>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default HeroCarousel;
