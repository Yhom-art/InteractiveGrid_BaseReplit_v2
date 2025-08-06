import { useState, useEffect } from "react";
import { CursorType } from "@/types/common";
import { useCursorManager } from "@/hooks/useCursorManager";
import cursorAdoptSvg from "@assets/Yhom_PictosMarket/cursor-adopt.svg";
import cursorKnokSvg from "@assets/Yhom_PictosMarket/cursor-knok.svg";
import cursorMeetSvg from "@assets/Yhom_PictosMarket/cursor-meet.svg";
import cursorCloseSvg from "@assets/Yhom_PictosMarket/cursor-close.svg";
import cursorGrabSvg from "@assets/Yhom_PictosMarket/cursor-grab.svg";
import cursorGrabbingSvg from "@assets/Yhom_PictosMarket/cursor-grab.svg";
import cursorScaleSvg from "@assets/Yhom_PictosMarket/cursor-scale.svg";
import cursorKnokPill from "@assets/Yhom_PictosMarket/cursor-pill-knok.svg";
import cursorMeetPill from "@assets/Yhom_PictosMarket/cursor-pill-meet.svg";
import cursorAdoptPill from "@assets/Yhom_PictosMarket/cursor-pill-adopt.svg";
import cursorInfoSvg from "@assets/Yhom_PictosMarket/cursor-info.svg";
import cursorPanelSvg from "@assets/Yhom_PictosMarket/cursor-panel.svg";

interface CustomCursorProps {
  debug?: boolean;
  zoomCountdown?: number;
  isZoomActive?: boolean;
  isZoomInCooldown?: boolean;
}

/**
 * Composant de curseur personnalisé simplifié
 */
export function CustomCursorSimple({ debug = false }: CustomCursorProps) {
  const { currentCursor } = useCursorManager();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  
  // Gestion du suivi de la souris
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  // Masquer le curseur natif du navigateur
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body, *, *:hover {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Obtenir l'image du curseur selon son type - SAUF pour les curseurs Pill-Like
  const getCursorImage = () => {
    // Pour les curseurs Pill-Like, ne pas retourner d'image SVG
    if ([CursorType.KNOK_PILL, CursorType.MEET_PILL, CursorType.ADOPT_PILL].includes(currentCursor)) {
      return null; // Pas d'image pour les pills, ils seront rendus en CSS pur
    }
    
    switch (currentCursor) {
      case CursorType.ADOPT:
        return cursorAdoptSvg;
      case CursorType.KNOK:
        return cursorKnokSvg;
      case CursorType.MEET:
        return cursorMeetSvg;
      case CursorType.CLOSE:
        return cursorCloseSvg;
      case CursorType.GRAB:
        return cursorGrabSvg;
      case CursorType.GRABBING:
        return cursorGrabbingSvg;
      case CursorType.INFO:
        return cursorInfoSvg;
      case CursorType.PANEL:
        return cursorPanelSvg;
      case CursorType.SCALE:
        return cursorScaleSvg;
      default:
        return null;
    }
  };

  const cursorImage = getCursorImage();
  
  // Déterminer si c'est un curseur pill pour ajuster les dimensions proportionnellement
  const isPillCursor = [CursorType.KNOK_PILL, CursorType.MEET_PILL, CursorType.ADOPT_PILL].includes(currentCursor);
  
  // Style pour positionner le curseur avec dimensions appropriées
  const cursorStyle = {
    position: 'fixed' as const,
    left: position.x,
    top: position.y,
    pointerEvents: 'none' as const,
    zIndex: 99999,
    transform: 'translate(-50%, -50%)',
    width: isPillCursor ? '80px' : '32px', // Tailles natives respectives
    height: isPillCursor ? '30px' : '32px',
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.1s ease'
  };

  // Rendu spécial pour les curseurs Pill-Like en CSS pur
  if (isPillCursor) {
    const backgroundColor = 
      currentCursor === CursorType.ADOPT_PILL ? '#F2C94C' : // Jaune pour ADOPT
      currentCursor === CursorType.MEET_PILL ? '#000000' : // Noir pour MEET 
      '#FF26BD'; // Rose-fuschia pour KNOK
    
    const textContent = 
      currentCursor === CursorType.ADOPT_PILL ? 'À DÉCOUVRIR !' :
      currentCursor === CursorType.MEET_PILL ? 'COUP D\'OEIL' :
      'UN MATCH ?';
    
    const pillStyle = {
      position: 'fixed' as const,
      left: position.x - 16, // Centrer sur le point de la souris initialement
      top: position.y - 16,
      pointerEvents: 'none' as const,
      zIndex: 99999,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.1s ease',
      backgroundColor: currentCursor === CursorType.ADOPT_PILL ? 'white' : backgroundColor,
      borderRadius: '16px',
      border: 'none',
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      fontFamily: 'Roboto Mono, monospace',
      fontSize: (currentCursor === CursorType.MEET_PILL || currentCursor === CursorType.KNOK_PILL || currentCursor === CursorType.ADOPT_PILL) ? '9px' : '11px', // Plus petit pour MEET, KNOK et ADOPT
      fontWeight: 'bold' as const,
      color: currentCursor === CursorType.ADOPT_PILL ? '#FF26BD' : 'white',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      padding: '0 12px',
      height: '32px'
    };

    const knokAnimClass = currentCursor === CursorType.KNOK_PILL ? 'knok-bump-rotate' : '';
    const meetAnimClass = currentCursor === CursorType.MEET_PILL ? 'meet-arrow-anim' : '';
    const adoptAnimClass = currentCursor === CursorType.ADOPT_PILL ? 'adopt-arrow-anim' : '';

    // Rendu spécial pour MEET_PILL avec animation de traversée
    if (currentCursor === CursorType.MEET_PILL) {
      return (
        <div 
          className={`pill-cursor ${meetAnimClass}`}
          style={pillStyle}
        >
          <span className="pill-text">{textContent}</span>
          {debug && (
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '4px 8px',
              fontSize: '12px',
              borderRadius: '4px',
              whiteSpace: 'nowrap'
            }}>
              {currentCursor}
            </div>
          )}
        </div>
      );
    }

    // Rendu spécial pour ADOPT_PILL avec animation de traversée
    if (currentCursor === CursorType.ADOPT_PILL) {
      return (
        <div 
          className={`pill-cursor ${adoptAnimClass}`}
          style={pillStyle}
        >
          <span className="pill-text">{textContent}</span>
          {debug && (
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '4px 8px',
              fontSize: '12px',
              borderRadius: '4px',
              whiteSpace: 'nowrap'
            }}>
              {currentCursor}
            </div>
          )}
        </div>
      );
    }

    return (
      <div 
        className={`pill-cursor ${knokAnimClass} ${meetAnimClass} ${adoptAnimClass}`}
        style={pillStyle}
      >
        <span className="pill-text">{textContent}</span>
        {debug && (
          <div style={{
            position: 'absolute',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '4px 8px',
            fontSize: '12px',
            borderRadius: '4px',
            whiteSpace: 'nowrap'
          }}>
            {currentCursor}
          </div>
        )}
      </div>
    );
  }

  // Rendu standard pour les curseurs SVG
  if (!cursorImage) return null;

  return (
    <div style={cursorStyle}>
      <img 
        src={cursorImage} 
        alt={`Cursor ${currentCursor}`}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
      {debug && (
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          fontSize: '12px',
          borderRadius: '4px',
          whiteSpace: 'nowrap'
        }}>
          {currentCursor}
        </div>
      )}
    </div>
  );
}