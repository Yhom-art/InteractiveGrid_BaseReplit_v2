import React from 'react';
import { CursorType } from '@/types/common';

interface AdoptedClickZonesProps {
  debugMode?: boolean;
  onClose: (e: React.MouseEvent) => void;
  onOpenPanel: (e: React.MouseEvent) => void;
}

/**
 * Composant spécifique pour les zones de clic du container ADOPTED (oneone_down)
 * Ce composant est indépendant des autres containers pour garantir son bon fonctionnement
 */
export function AdoptedClickZones({ debugMode = false, onClose, onOpenPanel }: AdoptedClickZonesProps) {
  return (
    <>
      {/* 1. Zone circulaire de fermeture sur l'image (en haut) */}
      <div 
        className="absolute cursor-pointer z-50"
        style={{
          width: '50px',
          height: '50px',
          left: '39px', // Centré (128 - 50) / 2
          top: '39px',  // Centré sur l'image
          border: debugMode ? '2px dashed red' : 'none',
          backgroundColor: debugMode ? 'rgba(255, 0, 0, 0.3)' : 'transparent',
          borderRadius: '50%'
        }}
        data-cursor-type={CursorType.CLOSE}
        onClick={onClose}
      />
      
      {/* 2. Zone rectangulaire pour ouvrir le panel (partie card en bas) */}
      <div 
        className="absolute cursor-pointer z-50"
        style={{
          width: '128px',
          height: '110px', // Zone bien centrée dans la partie card
          left: '0',
          top: '140px', // Positionnée dans la partie ID
          border: debugMode ? '2px dashed blue' : 'none',
          backgroundColor: debugMode ? 'rgba(0, 0, 255, 0.3)' : 'transparent'
        }}
        data-cursor-type={CursorType.MEET}
        onClick={onOpenPanel}
      />
      
      {/* 3. Zone du bandeau de titre (optionnelle) */}
      <div 
        className="absolute cursor-pointer z-50"
        style={{
          width: '128px',
          height: '20px',
          left: '0',
          top: '128px', // Juste sous la photo
          border: debugMode ? '2px dashed green' : 'none',
          backgroundColor: debugMode ? 'rgba(0, 255, 0, 0.3)' : 'transparent'
        }}
        data-cursor-type={CursorType.MEET}
        onClick={onOpenPanel}
      />
    </>
  );
}