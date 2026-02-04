import React, { useState, useEffect, useRef } from 'react';

const LazyImage = ({ src, alt, className, style, placeholder = '/placeholder.jpg', asBackground = false, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(imgRef.current);
        }
      },
      { threshold: 0.1, rootMargin: '50px' } // Carregar 50px antes de entrar na viewport
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  if (asBackground) {
    // Modo para background-image
    return (
      <div
        ref={imgRef}
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: isInView ? `url(${src})` : `url(${placeholder})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease',
          ...style
        }}
        className={className}
        onLoad={handleLoad}
        {...props}
      >
        {!isLoaded && !isInView && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.3)',
            }}
          >
            🖼️
          </div>
        )}
      </div>
    );
  } else {
    // Modo padrão para <img>
    return (
      <div ref={imgRef} style={{ position: 'relative', overflow: 'hidden', ...style }} className={className}>
        <img
          src={isInView ? src : placeholder}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
            ...(isLoaded ? {} : { position: 'absolute', top: 0, left: 0 }),
            ...props.style
          }}
          onLoad={handleLoad}
          {...props}
        />
        {!isLoaded && !isInView && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.3)',
            }}
          >
            🖼️
          </div>
        )}
      </div>
    );
  }
};

export default LazyImage;