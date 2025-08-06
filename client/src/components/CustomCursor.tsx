import React from 'react';
import { cursors } from '../assets/cursors';
import { CursorType } from '@/types/common';

interface CustomCursorProps {
  cursorType: CursorType;
  position: { x: number, y: number };
}

export function CustomCursor({ cursorType, position }: CustomCursorProps) {
  // Déterminer la taille et le style du curseur selon son type
  const getCursorStyle = () => {
    // Dimensions de base pour tous les curseurs
    let style: React.CSSProperties = {
      backgroundImage: cursors[cursorType === CursorType.PANEL2 ? 'panel2' : cursorType as keyof typeof cursors] || '',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: 9999,
    };
    
    // Dimensions spécifiques selon le type
    switch (cursorType) {
      case CursorType.GRAB:
      case CursorType.CLOSE:
        // Petits curseurs ronds
        style.width = '28px';
        style.height = '28px';
        style.left = `${position.x - 14}px`; // Centrer horizontalement (-width/2)
        style.top = `${position.y - 14}px`;  // Centrer verticalement (-height/2)
        break;
        
      // Curseurs standards pour containers FERMÉS - harmonisé à 32px
      case CursorType.ADOPT:
      case CursorType.MEET:
      case CursorType.KNOK:
      case CursorType.INFO:
      case CursorType.SCALE:
        style.width = '32px';
        style.height = '32px';
        style.left = `${position.x - 16}px`; // Centrer horizontalement (-width/2)
        style.top = `${position.y - 16}px`;  // Centrer verticalement (-height/2)
        break;
        
      // Curseur PANEL2 pour composants musicaux - taille optimisée
      case CursorType.PANEL2:
        style.width = '10px';  // Taille réduite pour interaction précise
        style.height = '10px';
        style.left = `${position.x - 5}px`; // Centrer horizontalement (-width/2)
        style.top = `${position.y - 5}px`;  // Centrer verticalement (-height/2)
        break;
        
      // Curseurs pill-like pour containers OUVERTS - pas de style ici, géré dans extraStyle
      case CursorType.ADOPT_PILL:
      case CursorType.MEET_PILL:
      case CursorType.KNOK_PILL:
        // Ne pas appliquer de style ici, tout sera géré dans extraStyle
        return {}; // Retourner un style vide pour les pills
        
      default:
        // Fallback
        style.width = '30px';
        style.height = '30px';
        style.left = `${position.x - 15}px`;
        style.top = `${position.y - 15}px`;
    }
    
    return style;
  };
  
  // Déterminer la classe d'animation à appliquer pour KNOK_PILL
  const knokAnimClass = cursorType === CursorType.KNOK_PILL ? 'knok-bump-rotate' : '';
  
  // Style supplémentaire pour les curseurs pill-like
  const extraStyle: React.CSSProperties = {};
  
  // Configuration complète des curseurs Pill-Like sans images SVG
  if (cursorType === CursorType.ADOPT_PILL || cursorType === CursorType.MEET_PILL || cursorType === CursorType.KNOK_PILL) {
    // Couleurs selon le type
    const backgroundColor = 
      cursorType === CursorType.ADOPT_PILL ? '#F2C94C' : // Jaune pour ADOPT
      cursorType === CursorType.MEET_PILL ? '#000000' : // Noir pour MEET 
      '#FF26BD'; // Rose-fuschia pour KNOK
    
    // Style complet pour remplacer les SVG
    Object.assign(extraStyle, {
      // Positionnement - Centré sur le curseur de la souris
      position: 'fixed',
      left: `${position.x - 16}px`, // Centrer sur le point de la souris initialement
      top: `${position.y - 16}px`,
      zIndex: 9999,
      pointerEvents: 'none',
      
      // Apparence
      backgroundColor: cursorType === CursorType.ADOPT_PILL ? 'white' : backgroundColor,
      height: '32px',
      borderRadius: '16px',
      border: 'none',
      
      // Layout et texte
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Roboto Mono, monospace',
      fontSize: (cursorType === CursorType.MEET_PILL || cursorType === CursorType.KNOK_PILL || cursorType === CursorType.ADOPT_PILL) ? '9px' : '11px', // Plus petit pour MEET, KNOK et ADOPT
      fontWeight: 'bold',
      color: cursorType === CursorType.ADOPT_PILL ? '#FF26BD' : 'white',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      
      // Dimensions et overflow
      padding: '0 12px',
      minWidth: '32px', // Commence comme un cercle
      maxWidth: '90px', // Largeur finale
      width: 'auto',
      overflow: 'hidden',
      
      // Supprimer complètement l'image de fond
      backgroundImage: 'none !important',
      backgroundSize: 'auto',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    });
  }
  
  // Combiner les styles
  const combinedStyle = { ...getCursorStyle(), ...extraStyle };
  
  // Rendu conditionnel selon le type de curseur
  if (cursorType === CursorType.ADOPT_PILL || cursorType === CursorType.MEET_PILL || cursorType === CursorType.KNOK_PILL) {
    const textContent = 
      cursorType === CursorType.ADOPT_PILL ? 'À DÉCOUVRIR !' :
      cursorType === CursorType.MEET_PILL ? 'COUP D\'OEIL' :
      'UN MATCH ?';
    
    const meetAnimClass = cursorType === CursorType.MEET_PILL ? 'meet-arrow-anim' : '';
    const adoptAnimClass = cursorType === CursorType.ADOPT_PILL ? 'adopt-arrow-anim' : '';
    
    // Rendu spécial pour MEET_PILL avec animation de traversée
    if (cursorType === CursorType.MEET_PILL) {
      return (
        <div 
          className={`pill-cursor ${meetAnimClass}`}
          style={combinedStyle}
        >
          <span className="pill-text">{textContent}</span>
        </div>
      );
    }
    
    // Rendu spécial pour ADOPT_PILL avec animation de traversée
    if (cursorType === CursorType.ADOPT_PILL) {
      return (
        <div 
          className={`pill-cursor ${adoptAnimClass}`}
          style={combinedStyle}
        >
          <span className="pill-text">{textContent}</span>
        </div>
      );
    }
    
    return (
      <div 
        className={`pill-cursor ${knokAnimClass} ${meetAnimClass} ${adoptAnimClass}`}
        style={combinedStyle}
      >
        <span className="pill-text">{textContent}</span>
      </div>
    );
  }
  
  // Rendu standard pour les autres curseurs
  return <div style={combinedStyle} />;
}