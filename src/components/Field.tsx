import React, { useState, useRef, useEffect } from 'react';
import fieldImage from '../assets/2026 FRC.png';
import { useNetworkTables } from '../NetworkTablesContext';

const Field: React.FC = () => {
  const [pose, setPose] = useState<{ x: number; y: number } | null>(null);
  const { setValue } = useNetworkTables();
  const imageRef = useRef<HTMLImageElement>(null);
  const [renderedImageDimensions, setRenderedImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [clickedPixelPosition, setClickedPixelPosition] = useState<{ x: number; y: number } | null>(null); // New state for pixel position

  const fieldLengthFeet = 57.5; // X-axis
  const fieldWidthFeet = 26.4;  // Y-axis

  useEffect(() => {
    const updateDimensions = () => {
      if (imageRef.current) {
        setRenderedImageDimensions({
          width: imageRef.current.offsetWidth,
          height: imageRef.current.offsetHeight,
        });
      }
    };

    if (imageRef.current) {
      // Update dimensions immediately if image is already loaded
      if (imageRef.current.complete) {
        updateDimensions();
      }
      // Add event listener for when the image loads
      imageRef.current.addEventListener('load', updateDimensions);
    }

    // Add event listener for window resize
    window.addEventListener('resize', updateDimensions);

    return () => {
      if (imageRef.current) {
        imageRef.current.removeEventListener('load', updateDimensions);
      }
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const handleFieldClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!renderedImageDimensions) return; // Wait for dimensions

    const rect = event.currentTarget.getBoundingClientRect();
    const clickXInPixels = event.clientX - rect.left;
    const clickYInPixels = event.clientY - rect.top;

    // Store pixel position for the dot
    setClickedPixelPosition({ x: clickXInPixels, y: clickYInPixels });

    // Scale to real-world dimensions (feet)
    const xFeet = (clickXInPixels / renderedImageDimensions.width) * fieldLengthFeet;
    const yFeet = (clickYInPixels / renderedImageDimensions.height) * fieldWidthFeet;
    
    setPose({ x: xFeet, y: yFeet });
    setValue('/dashboard/field/clickX', parseFloat(xFeet.toFixed(2)));
    setValue('/dashboard/field/clickY', parseFloat(yFeet.toFixed(2)));
  };

  return (
    <div>
      <h2>2026 FRC Field</h2>
      <div style={{
          position: 'relative',
          width: '100%',
          // Calculate paddingBottom for aspect ratio (height / width)
          paddingBottom: `${(fieldWidthFeet / fieldLengthFeet) * 100}%`,
          overflow: 'hidden',
          backgroundColor: 'transparent', // Or match your background if desired
        }}>
        <img
          ref={imageRef}
          src={fieldImage}
          alt="2026 FRC Field"
          onClick={handleFieldClick}
          style={{
            cursor: 'crosshair',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain', // Ensure image fits within the aspect ratio box
          }}
        />
        {clickedPixelPosition && (
          <div
            style={{
              position: 'absolute',
              left: clickedPixelPosition.x - 5, // Offset by half dot size for centering (dot is 10px)
              top: clickedPixelPosition.y - 5,  // Offset by half dot size for centering
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: 'red',
              zIndex: 10,
            }}
          />
        )}
      </div>
      {pose && (
        <div>
          <h3>Clicked Pose (feet):</h3>
          <p>X: {pose.x.toFixed(2)} ft</p>
          <p>Y: {pose.y.toFixed(2)} ft</p>
        </div>
      )}
    </div>
  );
};

export default Field;
