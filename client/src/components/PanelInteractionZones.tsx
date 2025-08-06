import React, { useState, useEffect, useRef } from 'react';
import { ContainerType } from '@/types/common';
import { useCursorManager } from '@/hooks/useCursorManager';
import { ZoomTimer } from './ZoomTimer';

interface PanelInteractionZonesProps {
  containerType: ContainerType;
  imageUrl?: string;
  hasAudio?: boolean;
  onClose: () => void;
  onZoom?: () => void;
  onAudioToggle?: () => void;
  children: React.ReactNode;
  debug?: boolean;
}

export function PanelInteractionZones({
  containerType,
  imageUrl,
  hasAudio = false,
  onClose,
  onZoom,
  onAudioToggle,
  children,
  debug = false
}: PanelInteractionZonesProps) {
  
  console.log('🔍 PanelInteractionZones chargé:', { containerType, imageUrl: imageUrl?.split('/').pop() });
  
  const [isZoomed, setIsZoomed] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ancien système "échelle humaine" - DÉSACTIVÉ pour utiliser le nouveau système avec timer
  // useEffect(() => { ... }, []);
  
  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 PanelInteractionZones: Zone CLOSE cliquée');
    onClose();
  };

  const handleZoomClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 PanelInteractionZones: Zone ZOOM cliquée - Déclenchement échelle humaine');
    
    if (onZoom) {
      onZoom();
    }
  };

  const handleAudioClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 PanelInteractionZones: Zone AUDIO cliquée');
    if (onAudioToggle) {
      onAudioToggle();
    }
  };

  const handleGrabClick = (e: React.MouseEvent) => {
    console.log('🎯 PanelInteractionZones: Zone GRAB cliquée');
    // Ne pas empêcher la propagation pour le grab, car il peut y avoir d'autres gestionnaires
  };

  // Gestionnaires pour le timer de zoom
  const handleTimerStart = () => {
    console.log('🔍 Timer démarré - zoom activé');
    setIsZoomed(true);
  };

  const handleTimerComplete = () => {
    console.log('🔍 Timer terminé - zoom désactivé, cooldown activé');
    setIsZoomed(false);
    setCooldownActive(true);
  };

  const handleTimerStop = () => {
    console.log('🔍 Timer arrêté - zoom désactivé');
    setIsZoomed(false);
    setIsTimerActive(false);
  };

  // Gestionnaire pour la zone de survol
  const handleScaleMouseEnter = () => {
    if (cooldownActive) {
      console.log('🔍 Survol zone SCALE - cooldown actif, pas de zoom');
      return;
    }
    
    console.log('🔍 Survol zone SCALE - démarrage timer + debug états');
    console.log('🔍 État avant:', { isTimerActive, cooldownActive, isZoomed });
    setIsTimerActive(true);
  };

  const handleScaleMouseLeave = () => {
    console.log('🔍 Quitter zone SCALE - arrêt timer et zoom');
    setIsTimerActive(false);
    setIsZoomed(false); // Masquer immédiatement le zoom
    setCooldownActive(false); // Reset cooldown si on quitte pendant
  };

  return (
    <div ref={containerRef} className={`panel-interaction-container relative ${cooldownActive ? 'cooldown-active' : ''}`}>
      {/* Zone de grab de base - désactivée pour ne pas interférer avec ZOOM et CLOSE */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          zIndex: 1,
          cursor: 'grab'
        }}
        data-cursor-type="grab"
      />

      {/* Zone SCALE simplifiée - Moitié haute pour trigger */}
      <div
        className="absolute pointer-events-auto"
        data-cursor-type="scale"
        style={{
          // Position selon le type de container - moitié haute
          ...(containerType === ContainerType.FREE ? {
            top: '16px',
            left: '16px',
            right: '16px',
            height: '64px', // Moitié haute
            zIndex: 50
          } : containerType === ContainerType.ADOPTED ? {
            top: '16px',
            left: '16px',
            right: '16px',
            height: '64px', // Moitié haute
            zIndex: 50
          } : { // ADOPT
            top: '16px',
            left: '16px',
            right: '16px',
            height: '32px', // Moitié haute
            zIndex: 50
          }),
          backgroundColor: debug ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
          border: debug ? '1px solid red' : 'none'
        }}
        onMouseEnter={handleScaleMouseEnter}
        onMouseLeave={handleScaleMouseLeave}
      />

      {/* Zone CLOSE - Moitié basse */}
      <div
        className="absolute pointer-events-auto"
        data-cursor-type="close"
        style={{
          // Position selon le type de container - moitié basse
          ...(containerType === ContainerType.FREE ? {
            top: '80px',
            left: '16px',
            right: '16px',
            height: '64px',
            zIndex: 100
          } : containerType === ContainerType.ADOPTED ? {
            bottom: '16px',
            left: '16px',
            right: '16px',
            height: '64px',
            zIndex: 100
          } : { // ADOPT
            top: '48px',
            left: '16px',
            right: '16px',
            height: '32px',
            zIndex: 100
          }),
          backgroundColor: debug ? 'rgba(0, 0, 255, 0.2)' : 'transparent',
          border: debug ? '1px solid blue' : 'none'
        }}
        onClick={onClose}
      />

      {/* ZoomTimer pour gérer le décompte et le message */}
      <ZoomTimer
        isActive={isTimerActive}
        onTimerStart={handleTimerStart}
        onTimerComplete={handleTimerComplete}
        onTimerStop={handleTimerStop}
      />

      {/* Contenu principal du panel avec effet zoom sur les images */}
      <div 
        className="panel-content relative" 
        style={{ 
          zIndex: 10,
          overflow: 'hidden' // Pour contenir le zoom
        }}
      >
        <div
          className={isZoomed ? 'zoom-active' : ''}
          style={{
            transition: 'transform 0.3s ease-out'
          }}
        >
          {children}
        </div>
      </div>
      
      {/* Style CSS pour le zoom sur hover des zones SCALE */}
      <style>{`
        .zoom-active:has([data-cursor-type="scale"]:hover) img,
        .zoom-active:has([data-cursor-type="scale"]:hover) figure img {
          transform: scale(1.5) !important;
          transition: transform 0.3s ease-out !important;
          transform-origin: center center !important;
        }
        
        /* Désactiver tous les effets de zoom pendant le cooldown */
        .cooldown-active img,
        .cooldown-active figure img,
        .cooldown-active .zoom-active img {
          transform: scale(1) !important;
          transition: none !important;
          border: none !important;
          box-shadow: none !important;
          opacity: 0 !important; /* Rendre le zoom invisible pendant le cooldown */
        }
        
        /* Effet zoom directement sur hover des zones scale - SEULEMENT si pas en cooldown */
        .panel-interaction-container:not(.cooldown-active) [data-cursor-type="scale"]:hover ~ .panel-content img,
        .panel-interaction-container:not(.cooldown-active) [data-cursor-type="scale"]:hover ~ * img {
          transform: scale(1.5) !important;
          transition: transform 0.3s ease-out !important;
          transform-origin: center center !important;
        }
        
        /* Alternative : effet sur le conteneur parent - SEULEMENT si pas en cooldown */
        .panel-interaction-container:not(.cooldown-active):has([data-cursor-type="scale"]:hover) img {
          transform: scale(1.5) !important;
          transition: transform 0.3s ease-out !important;
          transform-origin: center center !important;
        }
        
        /* Effet "échelle humaine" - zoom sur hover direct des images - SEULEMENT si pas en cooldown */
        .panel-interaction-container:not(.cooldown-active) img:hover {
          transform: scale(1.5) !important;
          transition: transform 0.3s ease-out !important;
          transform-origin: center center !important;
          z-index: 100 !important;
          border: 3px solid red !important;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.8) !important;
          pointer-events: auto !important;
        }
        
        /* Assurer que l'image peut recevoir les événements hover même avec les zones par-dessus */
        .panel-interaction-container .panel-image-scalable {
          pointer-events: auto !important;
          position: relative !important;
          z-index: 15 !important;
        }
        
        /* Permettre aux zones d'interaction de laisser passer les hovers sur les images */
        .panel-interaction-container [data-cursor-type] {
          pointer-events: none !important;
        }
        
        .panel-interaction-container [data-cursor-type]:hover {
          pointer-events: auto !important;
        }
        
        /* Forcer la priorité des événements hover sur les images des composants */
        .panel-interaction-container img {
          pointer-events: auto !important;
          position: relative !important;
          z-index: 200 !important;
        }
        
        /* Effet "échelle humaine" - déclenchement via JavaScript plutôt que CSS hover */
        .panel-interaction-container .nft-image.scale-effect {
          transform: scale(1.5) !important;
          border: 3px solid red !important;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.8) !important;
          z-index: 300 !important;
          transition: all 0.3s ease-out !important;
          transform-origin: center center !important;
          position: relative !important;
        }
        
        /* Force hover detection sur l'image principale */
        .panel-interaction-container .nft-image {
          pointer-events: auto !important;
        }
      `}</style>

      {/* Zones d'interaction superposées - créées même sans imageUrl pour détecter les images internes */}
      {(imageUrl || true) && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Zone SCALE couvre toute l'image (z-index 50) */}
          <div
            className="absolute pointer-events-auto cursor-pointer"
            data-cursor-type="scale"
            style={{
              // Position selon le type de container - TOUTE la zone image
              ...(containerType === ContainerType.FREE ? {
                top: '16px',
                left: '16px',
                right: '16px',
                bottom: '16px', // Couvre toute la hauteur
                zIndex: 50
              } : containerType === ContainerType.ADOPTED ? {
                top: '16px',
                left: '16px', 
                right: '16px',
                bottom: '16px', // Couvre toute la hauteur
                zIndex: 50
              } : { // ADOPT
                top: '16px',
                left: '16px',
                right: '16px', 
                bottom: '16px', // Couvre toute la hauteur
                zIndex: 50
              }),
              backgroundColor: debug ? 'rgba(0, 255, 0, 0.3)' : 'transparent',
              border: debug ? '2px dashed green' : 'none'
            }}
            onClick={handleZoomClick}
          >

          </div>

          {/* Événements de la zone SCALE (séparés pour éviter les conflits) */}
          <div
            className="absolute pointer-events-auto cursor-pointer"
            data-cursor-type="scale"
            style={{
              // Position selon le type de container - partie haute (50%)
              ...(containerType === ContainerType.FREE ? {
                top: '16px',
                left: '16px',
                right: '16px',
                height: '64px', // 50% de 128px
                zIndex: 50
              } : containerType === ContainerType.ADOPTED ? {
                bottom: '80px', // Bottom + 50% de hauteur
                left: '16px', 
                right: '16px',
                height: '64px', // 50% de 128px
                zIndex: 50
              } : { // ADOPT
                top: '16px',
                left: '16px',
                right: '16px', 
                height: '32px', // 50% de 64px
                zIndex: 50
              }),
              backgroundColor: 'transparent',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              // Ne pas activer le zoom si on est en cooldown
              if (cooldownActive) {
                console.log('🔍 ZOOM: Zone SCALE survolée mais cooldown actif - zoom bloqué');
                return;
              }
              
              console.log('🔍 ZOOM: Zone SCALE survolée - activation zoom');
              setIsZoomed(true);
              
              // Application directe sur les images dans le conteneur parent
              const currentTarget = e.currentTarget as HTMLElement;
              const panelContainer = currentTarget.closest('.panel-interaction-container');
              console.log('🔍 ZOOM: Conteneur panel trouvé:', !!panelContainer);
              
              if (panelContainer) {
                const images = panelContainer.querySelectorAll('img');
                console.log('🔍 ZOOM: Images trouvées:', images.length);
                images.forEach((img, index) => {
                  console.log(`🔍 ZOOM: Application du zoom sur l'image ${index + 1}`);
                  (img as HTMLElement).style.transform = 'scale(1.5)';
                  (img as HTMLElement).style.transition = 'transform 0.3s ease-out';
                  (img as HTMLElement).style.transformOrigin = 'center center';
                });
              } else {
                console.log('🔍 ZOOM: Aucun conteneur panel trouvé');
              }
            }}
            onMouseLeave={() => {
              console.log('🔍 ZOOM: Zone SCALE quittée - désactivation zoom');
              setIsZoomed(false);
              
              // Retrait de l'effet sur toutes les images
              const container = document.querySelector('.panel-interaction-container');
              if (container) {
                const images = container.querySelectorAll('img');
                console.log('🔍 ZOOM: Retrait du zoom sur', images.length, 'images');
                images.forEach((img, index) => {
                  console.log(`🔍 ZOOM: Retrait du zoom sur l'image ${index + 1}`);
                  img.style.transform = 'scale(1)';
                });
              }
            }}
          />

          {/* Zone CLOSE horizontale - partie basse (z-index 100) */}
          <div
            className="absolute pointer-events-auto cursor-pointer"
            data-cursor-type="close"
            style={{
              // Position selon le type de container - partie basse (50%)
              ...(containerType === ContainerType.FREE ? {
                top: '80px', // Top + 50% de hauteur
                left: '16px',
                right: '16px',
                height: '64px', // 50% de 128px
                zIndex: 100
              } : containerType === ContainerType.ADOPTED ? {
                bottom: '16px',
                left: '16px',
                right: '16px',
                height: '64px', // 50% de 128px
                zIndex: 100
              } : { // ADOPT
                top: '48px', // Top + 50% de hauteur
                left: '16px',
                right: '16px',
                height: '32px', // 50% de 64px
                zIndex: 100
              }),
              backgroundColor: debug ? 'rgba(255, 0, 0, 0.3)' : 'transparent',
              border: debug ? '2px dashed red' : 'none'
            }}
            onClick={handleCloseClick}
          />
        </div>
      )}

      {/* Zone audio spécialisée si présente */}
      {hasAudio && (
        <div
          className="absolute pointer-events-auto cursor-pointer"
          data-cursor-type="panel"
          style={{
            // Position dans la zone de contenu textuel
            bottom: '20px',
            left: '20px',
            width: '30px',
            height: '30px',
            zIndex: 75 // Entre zoom et fermeture
          }}
          onClick={handleAudioClick}
        >
          {/* Indicateur audio */}
          <div className="w-full h-full bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center text-blue-600 hover:bg-opacity-40 transition-all">
            ♪
          </div>
        </div>
      )}


    </div>
  );
}