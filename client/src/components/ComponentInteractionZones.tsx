import React, { useState } from 'react';

enum PanelComponentType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  PODCAST = 'podcast',
  WALLET = 'wallet',
  MAP = 'map',
  BUTTON = 'button',
  FORM = 'form',
  GALLERY = 'gallery',
  SOCIAL = 'social',
  LINK = 'link',
  DIVIDER = 'divider'
}

interface ComponentInteractionZonesProps {
  componentType: PanelComponentType;
  componentId: string;
  children: React.ReactNode;
  onAction?: (action: string, componentId: string) => void;
  onGrab?: () => void;
  onZoomClick?: () => void;
  debug?: boolean;
  isZoomActive?: boolean; // État du zoom pour masquer l'icône flottante
}

// Mapping des types de composants vers leurs actions et curseurs
const COMPONENT_CONFIG = {
  [PanelComponentType.TEXT]: {
    action: 'edit',
    cursor: 'panel',
    actionZone: 'full' // Zone d'action couvre tout le composant
  },
  [PanelComponentType.IMAGE]: {
    action: 'zoom',
    cursor: 'scale',
    actionZone: 'full' // Zone d'action couvre toute l'image pour le curseur SCALE_TIMER
  },
  [PanelComponentType.AUDIO]: {
    action: 'play',
    cursor: 'panel',
    actionZone: 'full',
    priority: 'high'
  },
  [PanelComponentType.VIDEO]: {
    action: 'play',
    cursor: 'panel',
    actionZone: 'full'
  },
  [PanelComponentType.PODCAST]: {
    action: 'play',
    cursor: 'panel',
    actionZone: 'full'
  },
  [PanelComponentType.WALLET]: {
    action: 'connect',
    cursor: 'panel',
    actionZone: 'full'
  },
  [PanelComponentType.MAP]: {
    action: 'navigate',
    cursor: 'panel',
    actionZone: 'full'
  },
  [PanelComponentType.BUTTON]: {
    action: 'click',
    cursor: 'panel',
    actionZone: 'full'
  },
  [PanelComponentType.FORM]: {
    action: 'focus',
    cursor: 'panel',
    actionZone: 'full'
  },
  [PanelComponentType.GALLERY]: {
    action: 'browse',
    cursor: 'panel',
    actionZone: 'full'
  },
  [PanelComponentType.SOCIAL]: {
    action: 'open',
    cursor: 'panel',
    actionZone: 'full'
  },
  [PanelComponentType.LINK]: {
    action: 'open',
    cursor: 'panel',
    actionZone: 'full'
  },
  [PanelComponentType.DIVIDER]: {
    action: 'none',
    cursor: 'grab',
    actionZone: 'none' // Pas de zone d'action, seulement grab
  }
};

export function ComponentInteractionZones({
  componentType,
  componentId,
  children,
  onAction,
  onGrab,
  onZoomClick,
  debug = false,
  isZoomActive = false
}: ComponentInteractionZonesProps) {
  
  const config = COMPONENT_CONFIG[componentType] || COMPONENT_CONFIG[PanelComponentType.TEXT];
  const [isZoneHovered, setIsZoneHovered] = useState(false);
  
  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`🎯 ComponentInteractionZones: Action "${config.action}" pour composant ${componentType} (${componentId})`);
    if (onAction && config.action !== 'none') {
      onAction(config.action, componentId);
    }
  };

  const handleGrabClick = (e: React.MouseEvent) => {
    console.log(`🎯 ComponentInteractionZones: Zone GRAB pour composant ${componentType} (${componentId})`);
    if (onGrab) {
      onGrab();
    }
  };

  return (
    <div className="component-interaction-container relative">
      {/* Zone de grab de base - marges constantes autour du composant (z-index 1) */}
      <div 
        className="absolute pointer-events-auto"
        style={{ 
          top: '-12px',
          left: '-12px', 
          right: '-12px',
          bottom: '-12px',
          zIndex: 1,
          backgroundColor: debug ? 'rgba(0, 255, 0, 0.1)' : 'transparent',
          border: debug ? '1px dashed green' : 'none'
        }}
        data-cursor-type="grab"
        onClick={handleGrabClick}
      />

      {/* Contenu principal du composant */}
      <div className="component-content relative" style={{ zIndex: 10 }}>
        {children}
      </div>

      {/* Zone d'action spécifique au type de composant */}
      {config.actionZone !== 'none' && (
        <div
          className="absolute pointer-events-auto cursor-pointer"
          data-cursor-type={componentType === PanelComponentType.IMAGE ? "scaleTimer" : config.cursor}
          onMouseEnter={() => setIsZoneHovered(true)}
          onMouseLeave={() => setIsZoneHovered(false)}
          style={{
            // Position selon le type de zone d'action
            ...(config.actionZone === 'full' ? {
              top: componentType === PanelComponentType.AUDIO ? '8px' : '30px',
              left: componentType === PanelComponentType.AUDIO ? '8px' : '30px',
              right: componentType === PanelComponentType.AUDIO ? '8px' : '30px',
              bottom: componentType === PanelComponentType.AUDIO ? '8px' : '30px',
              zIndex: componentType === PanelComponentType.AUDIO ? 75 : 50
            } : config.actionZone === 'top-half' ? {
              top: '30px',
              left: '30px', 
              right: '30px',
              height: 'calc(50% - 30px)',
              zIndex: 50
            } : {}),
            backgroundColor: debug ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
            border: debug ? '1px dashed blue' : 'none'
          }}
          onClick={handleActionClick}
        >
        </div>
      )}

      {/* Icône zoom flottante DÉFINITIVEMENT SUPPRIMÉE */}

      {/* Zone de fermeture pour les images (partie basse) */}
      {componentType === PanelComponentType.IMAGE && (
        <div
          className="absolute pointer-events-auto cursor-pointer"
          data-cursor-type="close"
          style={{
            top: '50%',
            bottom: '30px',
            left: '30px',
            right: '30px',
            zIndex: 100,
            backgroundColor: debug ? 'rgba(255, 0, 0, 0.3)' : 'transparent',
            border: debug ? '2px dashed red' : 'none'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`🎯 ComponentInteractionZones: Zone CLOSE pour image ${componentId}`);
            if (onAction) {
              onAction('close', componentId);
            }
          }}
        />
      )}

      {debug && (
        <div 
          className="absolute top-0 left-0 text-xs bg-black text-white px-1 pointer-events-none"
          style={{ zIndex: 200 }}
        >
          {componentType}
        </div>
      )}
    </div>
  );
}

export { PanelComponentType };