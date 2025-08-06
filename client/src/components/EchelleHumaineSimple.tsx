import React, { useState, useEffect } from 'react';
import { formatImagePathForDisplay } from '@/utils/imageUtils';

interface EchelleHumaineSimpleProps {
  imageUrl: string;
  isActive: boolean;
  mousePosition: { x: number; y: number };
  panelBounds?: { left: number; width: number; top: number; height: number };
}

/**
 * Module "Échelle Humaine" simplifié - Version propre sans timer interne
 * Contrôlé uniquement par isActive depuis l'extérieur
 */
export function EchelleHumaineSimple({ 
  imageUrl, 
  isActive, 
  mousePosition, 
  panelBounds 
}: EchelleHumaineSimpleProps) {
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });

  // Navigation dans l'image basée sur la position de la souris
  useEffect(() => {
    if (isActive && mousePosition) {
      setImagePosition({
        x: Math.max(0, Math.min(100, mousePosition.x)),
        y: Math.max(0, Math.min(100, mousePosition.y))
      });
    }
  }, [mousePosition, isActive]);

  // Si pas actif, on n'affiche rien
  if (!isActive) return null;

  // Utiliser les dimensions du panel si disponibles
  const containerStyle = panelBounds ? {
    position: 'absolute' as const,
    top: panelBounds.top,
    left: panelBounds.left,
    width: panelBounds.width,
    height: panelBounds.height,
    zIndex: 9999,
    pointerEvents: 'none' as const,
    overflow: 'hidden'
  } : {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    pointerEvents: 'none' as const,
    overflow: 'hidden'
  };

  return (
    <div style={containerStyle}>
      {/* Image zoomée échelle humaine */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${formatImagePathForDisplay(imageUrl)})`,
          backgroundSize: '700%', // Zoom 7x - Échelle humaine
          backgroundPosition: `${imagePosition.x}% ${imagePosition.y}%`,
          backgroundRepeat: 'no-repeat',
          transition: 'background-position 0.1s ease-out',
          opacity: 1
        }}
      />
    </div>
  );
}