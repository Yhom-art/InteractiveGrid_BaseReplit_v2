import React, { useState, useRef } from 'react';
import { Container, ContainerExpansionType } from './types';
import { ContainerType, CursorType } from '@/types/common';

// Actions possibles pour les zones de clic
enum ClickAction {
  CLOSE = "close",   // Fermeture du container
  EXPAND = "expand", // Expansion du container
  OPEN_PANEL = "openPanel" // Ouverture du panel
}

interface FluidContainerProps {
  // Données du container
  container: Container;
  
  // Dimensions et position
  size: number;
  position: {
    left: number;
    top: number;
  };
  height: number;
  
  // État du panel associé
  hasOpenPanel: boolean;
  
  // Callbacks pour les interactions
  onExpand: (containerId: number) => void;
  onPanelToggle: (containerId: number) => void;
  
  // Mode debug optionnel
  debug?: boolean;
}

/**
 * Container fluide avec gestion des différentes zones de clic
 * et support pour les différents types d'expansion
 */
export function FluidContainer({
  container,
  size,
  position,
  height,
  hasOpenPanel,
  onExpand,
  onPanelToggle,
  debug = false
}: FluidContainerProps) {
  // État local pour le survol et l'animation
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Référence à l'élément d'image (pour les manipulations DOM directes)
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Couleur selon le type
  const getColorForType = (type: ContainerType): string => {
    switch (type) {
      case ContainerType.FREE: return '#58C4DD';
      case ContainerType.ADOPT: return '#F2C94C';
      case ContainerType.ADOPTED: return '#EB5757';
      case ContainerType.EDITORIAL: return '#6FCF97';
      default: return '#cccccc';
    }
  };
  
  // Forcer l'arrêt de toute animation en cours
  const forceStopAnimation = () => {
    if (imgRef.current) {
      imgRef.current.style.animation = 'none';
      imgRef.current.style.transform = 'scale(1)';
      // Forcer un reflow
      void imgRef.current.offsetWidth;
    }
  };
  
  // Gérer l'action en fonction de la zone cliquée
  const handleZoneClick = (action: ClickAction, e: React.MouseEvent) => {
    // Empêcher la propagation pour éviter de déclencher le drag
    e.stopPropagation();
    e.preventDefault();
    
    if (debug) {
      console.log(`Zone clicked: ${action} on container ${container.id} (type: ${container.type})`);
    }
    
    // Réinitialiser les états
    setIsHovered(false);
    setIsAnimating(false);
    
    // Arrêter toute animation en cours et forcer le retour à l'état normal
    forceStopAnimation();
    
    // Gérer l'action selon son type
    switch (action) {
      case ClickAction.CLOSE:
        // Si le container est expandé, le réduire
        if (container.isExpanded) {
          onExpand(container.id);
        }
        break;
        
      case ClickAction.EXPAND:
        // Agrandir ou réduire le container
        onExpand(container.id);
        break;
        
      case ClickAction.OPEN_PANEL:
        // Ouvrir/fermer le panel (si le container est expandé)
        if (container.isExpanded) {
          onPanelToggle(container.id);
        } else {
          // Si le container n'est pas expandé, l'expandre d'abord
          onExpand(container.id);
          // Puis ouvrir le panel après un bref délai
          setTimeout(() => onPanelToggle(container.id), 50);
        }
        break;
    }
  };
  
  // Contenu interne du container
  const renderContainerContent = () => {
    // Ici nous pourrons intégrer le vrai contenu du container (images, etc.)
    // Pour le moment, c'est un contenu de démonstration
    return (
      <div style={{ 
        textAlign: 'center',
        pointerEvents: 'none' // Pour que le contenu ne perturbe pas les clics sur les zones
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>#{container.id}</div>
        <div style={{ fontSize: '12px', marginBottom: '4px' }}>
          ({container.col}, {container.row})
        </div>
        <div style={{ 
          fontSize: '11px',
          fontWeight: 'bold',
          backgroundColor: 'rgba(255,255,255,0.7)',
          padding: '2px 6px',
          borderRadius: '4px',
          marginBottom: '6px'
        }}>
          {container.type}
        </div>
        
        {container.expansionType !== ContainerExpansionType.NONE && container.isExpanded && (
          <div style={{
            fontSize: '10px',
            backgroundColor: 'rgba(0,0,0,0.1)',
            color: '#fff',
            padding: '2px 6px',
            borderRadius: '4px',
            marginTop: '6px'
          }}>
            {container.expansionType}
          </div>
        )}
      </div>
    );
  };
  
  // Rendu des zones de clic qui changent selon l'état du container
  const renderClickZones = () => {
    if (container.isExpanded) {
      // Container expandé avec zones pour fermer et ouvrir le panel
      return (
        <>
          {/* Zone pour fermer le container (coin supérieur droit) */}
          <div 
            className="click-zone close-zone"
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 20,
              height: 20,
              cursor: 'pointer',
              zIndex: 10
            }}
            onClick={(e) => handleZoneClick(ClickAction.CLOSE, e)}
          >
            {debug && (
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#fff'
              }}>
                X
              </div>
            )}
          </div>
          
          {/* Zone pour ouvrir/fermer le panel (bande droite) */}
          <div 
            className="click-zone panel-zone"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '20%',
              height: '100%',
              cursor: 'pointer',
              zIndex: 9
            }}
            onClick={(e) => handleZoneClick(ClickAction.OPEN_PANEL, e)}
          >
            {debug && (
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#fff'
              }}>
                P
              </div>
            )}
          </div>
          
          {/* Zone principale (pour une future interaction de déplacement) */}
          <div 
            className="click-zone main-zone"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '80%',
              height: '100%',
              cursor: 'grab',
              zIndex: 8
            }}
          >
            {debug && (
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,255,0,0.1)',
              }}></div>
            )}
          </div>
        </>
      );
    } else {
      // Container fermé avec une seule zone pour l'expansion
      return (
        <div 
          className="click-zone expand-zone"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: 'pointer',
            zIndex: 10
          }}
          onClick={(e) => handleZoneClick(ClickAction.EXPAND, e)}
        >
          {debug && (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,255,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#333'
            }}>
              E
            </div>
          )}
        </div>
      );
    }
  };
  
  // Styles du container selon son état
  const backgroundColor = getColorForType(container.type);
  const borderStyle = hasOpenPanel
    ? '3px solid black'
    : container.isExpanded
      ? '2px solid rgba(0,0,0,0.3)'
      : '1px solid rgba(0,0,0,0.1)';
  
  return (
    <div
      className="fluid-container"
      style={{
        width: size,
        height,
        backgroundColor,
        position: 'absolute',
        left: position.left,
        top: position.top,
        borderRadius: '8px',
        border: borderStyle,
        boxShadow: container.isExpanded ? '0 0 10px rgba(0,0,0,0.15)' : 'none',
        transition: 'all 0.3s ease-out',
        overflow: 'visible',
        zIndex: hasOpenPanel ? 2 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Contenu intérieur du container */}
      {renderContainerContent()}
      
      {/* Zones de clic */}
      {renderClickZones()}
    </div>
  );
}