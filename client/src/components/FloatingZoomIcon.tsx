import React from 'react';
import cursorScaleSvg from '@assets/Yhom_PictosMarket/cursor-scale.svg';

interface FloatingZoomIconProps {
  isVisible: boolean;
  zoneWidth: number;
  zoneHeight: number;
  onZoomClick?: () => void;
  isZoomActive?: boolean; // Masquer l'icône quand le zoom est actif
}

export function FloatingZoomIcon({ isVisible, zoneWidth, zoneHeight, onZoomClick, isZoomActive = false }: FloatingZoomIconProps) {
  // Masquer l'icône si elle n'est pas visible OU si le zoom est actif
  if (!isVisible || isZoomActive) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 FloatingZoomIcon: Icône cliquée - Déclenchement échelle humaine');
    if (onZoomClick) {
      onZoomClick();
    }
  };

  return (
    <div
      className="floating-zoom-icon"
      style={{
        position: 'absolute',
        width: '24px',
        height: '24px',
        backgroundImage: `url(${cursorScaleSvg})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        pointerEvents: 'none', // Ne pas bloquer les événements de la zone SCALE en dessous
        cursor: 'none', // Désactiver le curseur par défaut pour laisser place au curseur personnalisé
        zIndex: 25, // Z-index en-dessous de la zone SCALE (50) pour ne pas bloquer le curseur
        // Positionné dans la zone TOP (moitié supérieure)
        left: '50%',
        top: '25%',
        transform: 'translate(-50%, -50%)',
        // Animation organique uniquement - mouvements lents et naturels
        animation: `scaleOrganicFloat ${18 + Math.random() * 12}s cubic-bezier(0.4, 0.0, 0.6, 1.0) infinite`,
        animationDelay: `${Math.random() * 5}s`
      }}
      onClick={handleClick}
    />
  );
}