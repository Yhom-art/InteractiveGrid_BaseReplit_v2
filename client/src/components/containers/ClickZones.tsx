import React from 'react';
import { ContainerState, ContainerType, CursorType } from '@/types/common';

interface ClickZoneProps {
  containerType: ContainerType;
  containerState: ContainerState;
  containerId: number;
  debugMode?: boolean;
  onZoneClick: (action: "close" | "open" | "openPanel", e: React.MouseEvent) => void;
}

/**
 * Composant qui définit les zones de clic en fonction du type de conteneur
 * et de son état (ouvert/fermé)
 */
export function ClickZones({
  containerType,
  containerState,
  containerId,
  debugMode = false,
  onZoneClick
}: ClickZoneProps) {
  // Si le conteneur est fermé, on a une configuration simple avec une zone centrale
  if (containerState === ContainerState.CLOSED) {
    // Déterminer le type de curseur selon le type de conteneur
    const cursorType = 
      containerType === ContainerType.ADOPT ? CursorType.ADOPT :
      containerType === ContainerType.ADOPTED ? CursorType.MEET :
      containerType === ContainerType.FREE ? CursorType.KNOK :
      containerType === ContainerType.EDITORIAL ? CursorType.INFO :
      CursorType.GRAB;
    
    return (
      <>
        {/* Zone de curseur étendue couvrant tout le container */}
        <div 
          className="absolute z-10"
          style={{
            width: '128px',
            height: '128px',
            left: '0px',
            top: '0px',
            pointerEvents: 'none', // N'intercepte pas les clics
            border: debugMode ? '1px solid blue' : 'none',
            backgroundColor: debugMode ? 'rgba(0, 0, 255, 0.1)' : 'transparent'
          }}
          data-cursor-type={cursorType}
        />
        
        {/* Zone de clic centrale pour l'ouverture */}
        <div 
          className="absolute cursor-pointer z-50"
          style={{
            width: '25px',
            height: '25px',
            left: '51.5px', // (128 - 25) / 2
            top: '51.5px',  // (128 - 25) / 2
            border: debugMode ? '1px dashed red' : 'none',
            backgroundColor: debugMode ? 'rgba(255, 0, 0, 0.3)' : 'transparent'
          }}
          onClick={(e) => onZoneClick("open", e)}
        />
      </>
    );
  }
  
  // Pour un conteneur ouvert, les zones dépendent du type
  // FREE (oneone_up) - Expansion vers le haut
  if (containerType === ContainerType.FREE && containerState === ContainerState.FREE) {
    return (
      <>
        {/* Zone de fond global GRAB (z-index bas) pour permettre le déplacement - Couvre tout le container */}
        <div 
          className="absolute z-10"
          style={{
            width: '128px',
            height: '260px',
            left: '0px',
            top: '0px',
            border: debugMode ? '1px solid rgba(100, 100, 100, 0.5)' : 'none',
            backgroundColor: debugMode ? 'rgba(100, 100, 100, 0.1)' : 'transparent'
          }}
          data-cursor-type={CursorType.GRAB}
        />
        
        {/* Zone d'ouverture de panneau dans la partie haute (card) - Rétrécie pour laisser des marges de drag */}
        <div 
          className="absolute cursor-pointer z-50"
          style={{
            width: '90px', // Réduit de 128px à 90px pour laisser des marges de 19px de chaque côté
            height: '100px', 
            left: '19px', // Centré (128 - 90) / 2
            top: '20px', // Partie haute du conteneur
            border: debugMode ? '1px dashed blue' : 'none',
            backgroundColor: debugMode ? 'rgba(0, 0, 255, 0.3)' : 'transparent'
          }}
          data-cursor-type={CursorType.KNOK}
          onClick={(e) => onZoneClick("openPanel", e)}
        />
        
        {/* Zone de fermeture circulaire sur l'image (partie basse) */}
        <div 
          className="absolute cursor-pointer z-50"
          style={{
            width: '50px',
            height: '50px',
            left: '39px', // Centré (128 - 50) / 2
            top: '175px', // Partie basse, sur l'image
            border: debugMode ? '1px dashed red' : 'none',
            backgroundColor: debugMode ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
            borderRadius: '50%'
          }}
          data-cursor-type={CursorType.CLOSE}
          onClick={(e) => onZoneClick("close", e)}
        />
      </>
    );
  }
  
  // ADOPT (onehalf_down) - Expansion partielle vers le bas
  if (containerType === ContainerType.ADOPT && containerState === ContainerState.ADOPT) {
    return (
      <>
        {/* Zone de fond global GRAB (z-index bas) pour permettre le déplacement - Couvre tout le container */}
        <div 
          className="absolute z-10"
          style={{
            width: '128px',
            height: '192px',
            left: '0px',
            top: '0px',
            border: debugMode ? '1px solid rgba(100, 100, 100, 0.5)' : 'none',
            backgroundColor: debugMode ? 'rgba(100, 100, 100, 0.1)' : 'transparent'
          }}
          data-cursor-type={CursorType.GRAB}
        />
        
        {/* Zone de fermeture circulaire sur l'image (partie supérieure) */}
        <div 
          className="absolute cursor-pointer z-50"
          style={{
            width: '50px',
            height: '50px',
            left: '39px', // Centré (128 - 50) / 2
            top: '39px',  // Centré sur l'image
            border: debugMode ? '1px dashed red' : 'none',
            backgroundColor: debugMode ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
            borderRadius: '50%'
          }}
          data-cursor-type={CursorType.CLOSE}
          onClick={(e) => onZoneClick("close", e)}
        />
        
        {/* Zone d'ouverture de panneau unifiée - calée au pied du conteneur */}
        <div 
          className="absolute cursor-pointer z-40"
          style={{
            width: '90px', // Réduit de 128px à 90px pour laisser des marges de 19px de chaque côté
            height: '128px', // Hauteur couvrant toute la partie inférieure
            left: '19px', // Centré (128 - 90) / 2
            bottom: '0px', // Calée au pied du conteneur pour rester fixée même si le conteneur s'étend
            border: debugMode ? '1px dashed blue' : 'none',
            backgroundColor: debugMode ? 'rgba(0, 0, 255, 0.2)' : 'transparent'
          }}
          data-cursor-type={CursorType.ADOPT}
          onClick={(e) => onZoneClick("openPanel", e)}
        />
      </>
    );
  }
  
  // ADOPTED (oneone_down) - Expansion complète vers le bas
  if (containerType === ContainerType.ADOPTED && containerState === ContainerState.ADOPTED) {
    return (
      <>
        {/* Zone circulaire de fermeture sur l'image */}
        <div 
          className="absolute cursor-pointer z-50"
          style={{
            width: '50px',
            height: '50px',
            left: '39px', // Centré (128 - 50) / 2
            top: '39px',  // Centré sur l'image
            border: debugMode ? '1px dashed red' : 'none',
            backgroundColor: debugMode ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
            borderRadius: '50%'
          }}
          data-cursor-type={CursorType.CLOSE}
          onClick={(e) => onZoneClick("close", e)}
        />
        
        {/* Zone d'ouverture de panneau (partie card en bas) - Rétrécie pour laisser des marges latérales pour le drag */}
        <div 
          className="absolute cursor-pointer z-50"
          style={{
            width: '90px', // Réduit de 128px à 90px pour laisser des marges de 19px de chaque côté
            height: '110px',
            left: '19px', // Centré (128 - 90) / 2
            top: '140px', // Positionnée dans la partie ID
            border: debugMode ? '1px dashed blue' : 'none',
            backgroundColor: debugMode ? 'rgba(0, 0, 255, 0.3)' : 'transparent'
          }}
          data-cursor-type={CursorType.MEET}
          onClick={(e) => onZoneClick("openPanel", e)}
        />
      </>
    );
  }
  
  // Type EDITORIAL ou autres cas
  return (
    <>
      {/* Zone de fermeture centrale */}
      <div 
        className="absolute cursor-pointer z-50"
        style={{
          width: '40px',
          height: '40px',
          left: '44px', // (128 - 40) / 2
          top: '44px',  // (128 - 40) / 2
          border: debugMode ? '1px dashed red' : 'none',
          backgroundColor: debugMode ? 'rgba(255, 0, 0, 0.3)' : 'transparent'
        }}
        data-cursor-type={CursorType.CLOSE}
        onClick={(e) => onZoneClick("close", e)}
      />
      
      {/* Zone d'ouverture de panneau (coin en bas à droite) */}
      <div 
        className="absolute cursor-pointer z-50"
        style={{
          width: '40px',
          height: '40px',
          right: '0px',
          bottom: '0px',
          border: debugMode ? '1px dashed blue' : 'none',
          backgroundColor: debugMode ? 'rgba(0, 0, 255, 0.3)' : 'transparent'
        }}
        data-cursor-type={CursorType.GRAB}
        onClick={(e) => onZoneClick("openPanel", e)}
      />
    </>
  );
}