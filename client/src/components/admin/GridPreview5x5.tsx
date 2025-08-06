import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Container {
  id: number;
  position: { x: number; y: number };
  type: 'nft' | 'audio' | 'info' | 'video' | 'editorial';
  state: 'closed' | 'open' | 'panel';
  imageUrl?: string;
  title?: string;
  data?: any;
}

interface GridPreview5x5Props {
  selectedState: 'closed' | 'open' | 'panel';
  layerConfig: {
    visual: Array<{ name: string; active: boolean; color: string; expanded?: boolean; effects?: any[] }>;
    actions: Array<{ name: string; active: boolean; color: string; expanded?: boolean; zones?: any[] }>;
  };
  selectedZones?: {[key: string]: {[key: string]: boolean[]}};
}

export function GridPreview5x5({ selectedState, layerConfig, selectedZones }: GridPreview5x5Props) {
  const GRID_SIZE = 5;
  const CONTAINER_SIZE = 128;
  const [debugMode, setDebugMode] = useState(false);
  const CONTAINER_GAP = 4;
  const CELL_SIZE = CONTAINER_SIZE + CONTAINER_GAP; // 132px
  
  // État local pour gérer l'ouverture/fermeture des containers
  const [containerStates, setContainerStates] = useState<{[key: number]: 'closed' | 'open' | 'panel'}>({});

  // Récupération des données authentiques
  const { data: chimeras } = useQuery({
    queryKey: ['/api/chimeras'],
  });

  const { data: musicContainers } = useQuery({
    queryKey: ['/api/music-containers'],
  });

  const { data: editorials } = useQuery({
    queryKey: ['/api/editorials'],
  });

  // Configuration des containers pour la grille 5x5
  const [containers, setContainers] = useState<Container[]>([]);

  useEffect(() => {
    const gridContainers: Container[] = [];
    
    // Position centrale (2,2) - NFT principal avec données authentiques
    if (Array.isArray(chimeras) && chimeras.length > 0) {
      const chimeraData = chimeras[0] as any;
      gridContainers.push({
        id: 1,
        position: { x: 2, y: 2 },
        type: 'nft',
        state: containerStates[1] || 'closed', // État dynamique
        imageUrl: chimeraData.imageUrl || chimeraData.image_url || '',
        title: chimeraData.name || chimeraData.title || 'NFT Container',
        data: chimeraData
      });
    }

    // Positions autour - types variés avec données authentiques
    const positions = [
      { x: 1, y: 1, type: 'audio' as const },
      { x: 3, y: 1, type: 'info' as const },
      { x: 1, y: 3, type: 'video' as const },
      { x: 3, y: 3, type: 'editorial' as const }
    ];

    positions.forEach((pos, index) => {
      let containerData: any = null;
      let imageUrl = '';
      let title = '';

      switch (pos.type) {
        case 'audio':
          if (Array.isArray(musicContainers) && musicContainers[index]) {
            containerData = musicContainers[index] as any;
            title = containerData.title || 'Audio Container';
            imageUrl = containerData.imageUrl || 'https://via.placeholder.com/128x128/10b981/ffffff?text=AUDIO';
          }
          break;
        case 'editorial':
          if (Array.isArray(editorials) && editorials[index]) {
            containerData = editorials[index] as any;
            title = containerData.title || containerData.name || 'Editorial Container';
            imageUrl = containerData.image_url || containerData.imageUrl || 'https://via.placeholder.com/128x128/ef4444/ffffff?text=EDIT';
          }
          break;
        case 'info':
        case 'video':
          if (Array.isArray(chimeras) && chimeras[index + 1]) {
            containerData = chimeras[index + 1] as any;
            title = containerData.name || containerData.title || 'Info Container';
            imageUrl = containerData.imageUrl || containerData.image_url || 'https://via.placeholder.com/128x128/8b5cf6/ffffff?text=INFO';
          }
          break;
      }

      // Toujours ajouter un container (authentique si disponible, sinon placeholder)
      gridContainers.push({
        id: index + 2,
        position: pos,
        type: pos.type,
        state: containerStates[index + 2] || 'closed', // État dynamique pour tous
        imageUrl: imageUrl || `https://via.placeholder.com/128x128/6b7280/ffffff?text=${pos.type.toUpperCase()}`,
        title: title || `${pos.type.toUpperCase()} Container`,
        data: containerData
      });
    });

    setContainers(gridContainers);
  }, [chimeras, musicContainers, editorials, selectedState, containerStates]);

  // Fonctions de gestion des zones de clic
  const handleContainerClick = (containerId: number, zone: 'open' | 'close' | 'panel') => {
    const openZone = layerConfig.actions.find(a => a.name === 'open');
    const closeZone = layerConfig.actions.find(a => a.name === 'close');
    
    if (zone === 'open' && openZone?.active) {
      setContainerStates(prev => ({
        ...prev,
        [containerId]: 'open'
      }));
    }
    
    if (zone === 'panel' && openZone?.active) {
      setContainerStates(prev => ({
        ...prev,
        [containerId]: 'panel'
      }));
    }
    
    if (zone === 'close' && closeZone?.active) {
      setContainerStates(prev => ({
        ...prev,
        [containerId]: 'closed'
      }));
    }
  };

  // Conversion des zones granulaires en zones d'interaction codées
  const convertGranularToInteractionZone = (granularZones: any[], gridSize: number) => {
    if (!granularZones.length) return [];
    
    // Conversion des coordonnées granulaires (8x8, 8x16, 8x12) en pixels
    const cellSize = CONTAINER_SIZE / 8; // 128px / 8 = 16px par cellule granulaire
    
    return granularZones.map((zone, index) => ({
      id: `zone-${index}`,
      x: zone.x * cellSize,
      y: zone.y * cellSize,
      width: zone.width * cellSize,
      height: zone.height * cellSize
    }));
  };

  // Rendu des zones d'interaction depuis les données granulaires
  const renderInteractionZones = (container: Container) => {
    const { state, id } = container;
    const zones = [];

    // Zone OPEN pour containers fermés
    const openZone = layerConfig.actions.find(a => a.name === 'open');
    if (openZone?.active && state === 'closed' && openZone.zones) {
      const interactionZones = convertGranularToInteractionZone(openZone.zones, 8);
      zones.push(...interactionZones.map((zone, index) => (
        <div
          key={`open-${index}`}
          className="absolute cursor-pointer z-50 bg-green-500 bg-opacity-20 hover:bg-opacity-40 transition-all"
          style={{
            left: `${zone.x}px`,
            top: `${zone.y}px`,
            width: `${zone.width}px`,
            height: `${zone.height}px`,
          }}
          onClick={() => handleContainerClick(id, 'open')}
          title="Zone OPEN - Cliquez pour ouvrir"
        >
          {debugMode && (
            <span className="text-green-700 text-xs font-bold">OPEN</span>
          )}
        </div>
      )));
    }

    // Zone CLOSE pour containers ouverts
    const closeZone = layerConfig.actions.find(a => a.name === 'close');
    if (closeZone?.active && (state === 'open' || state === 'panel') && closeZone.zones) {
      const interactionZones = convertGranularToInteractionZone(closeZone.zones, state === 'open' ? 16 : 12);
      zones.push(...interactionZones.map((zone, index) => (
        <div
          key={`close-${index}`}
          className="absolute cursor-pointer z-50 bg-red-500 bg-opacity-20 hover:bg-opacity-40 transition-all"
          style={{
            left: `${zone.x}px`,
            top: `${zone.y}px`,
            width: `${zone.width}px`,
            height: `${zone.height}px`,
          }}
          onClick={() => handleContainerClick(id, 'close')}
          title="Zone CLOSE - Cliquez pour fermer"
        >
          {debugMode && (
            <span className="text-red-700 text-xs font-bold">CLOSE</span>
          )}
        </div>
      )));
    }

    return zones;
  };

  const renderContainer = (container: Container) => {
    const { position, type, state, imageUrl, title } = container;
    const left = position.x * CELL_SIZE;
    const top = position.y * CELL_SIZE;
    
    // Calcul de la hauteur selon l'état
    let height = CONTAINER_SIZE;
    let offsetTop = 0;
    
    if (state === 'open') {
      switch (type) {
        case 'nft':
          height = 260; // oneone_up
          offsetTop = -(260 - CONTAINER_SIZE);
          break;
        case 'audio':
        case 'video':
          height = 192; // onehalf_dwn
          break;
      }
    } else if (state === 'panel') {
      height = CONTAINER_SIZE;
      // Panel s'ouvre à droite
    }

    const getTypeColor = () => {
      switch (type) {
        case 'nft': return '#6366f1';
        case 'audio': return '#10b981';
        case 'video': return '#f59e0b';
        case 'editorial': return '#ef4444';
        case 'info': return '#8b5cf6';
        default: return '#6b7280';
      }
    };

    const shouldShowLayer = (layerName: string) => {
      const layer = layerConfig.visual.find(l => l.name === layerName);
      return layer?.active !== false;
    };

    // La zone GRAB est le curseur par défaut de la Grille App
    const grabZone = layerConfig.actions.find(zone => zone.name === 'grab');
    const showGrabCursor = grabZone?.active !== false; // Par défaut actif

    // Vérifier les zones actives
    const openZone = layerConfig.actions.find(a => a.name === 'open');
    const closeZone = layerConfig.actions.find(a => a.name === 'close');

    return (
      <div
        key={container.id}
        className="absolute border-2 border-gray-300 rounded overflow-hidden transition-all duration-300"
        style={{
          left: `${left}px`,
          top: `${top + offsetTop}px`,
          width: `${CONTAINER_SIZE}px`,
          height: `${height}px`,
          backgroundColor: getTypeColor(),
          zIndex: 10
        }}
      >
        {/* Layer PIC avec effets */}
        {shouldShowLayer('pic') && imageUrl && (() => {
          const picLayer = layerConfig.visual.find(l => l.name === 'pic');
          const zoomEffects = picLayer?.effects?.filter(effect => 
            effect.type === 'zoomHover' && effect.actionZone === 'hover'
          ) || [];
          
          const hasZoomHover = zoomEffects.length > 0 && state === 'closed';
          const zoomParams = hasZoomHover ? zoomEffects[0].params : {};
          
          return (
            <div className="relative w-full h-full">
              <img
                src={imageUrl}
                alt={title}
                className={`w-full h-full object-cover ${
                  hasZoomHover ? 'zoom-hover-active' : ''
                }`}
                style={{ 
                  filter: picLayer?.active ? 'none' : 'grayscale(100%)',
                  transformOrigin: hasZoomHover ? (zoomParams.origin || '24% 50%') : 'center'
                }}
              />
              {/* Indicateur ZoomHover actif */}
              {hasZoomHover && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" 
                     title="ZoomHover actif" />
              )}
            </div>
          );
        })()}
        
        {/* Layer OVERLAY */}
        {shouldShowLayer('overlay') && (
          <div 
            className="absolute inset-0"
            style={{ 
              backgroundColor: 'rgba(229, 209, 211, 0.9)',
              opacity: layerConfig.visual.find(l => l.name === 'overlay')?.active ? 1 : 0
            }}
          />
        )}
        
        {/* Layer TXT */}
        {shouldShowLayer('txt') && title && (
          <div 
            className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs font-bold bg-black bg-opacity-50"
            style={{ 
              opacity: layerConfig.visual.find(l => l.name === 'txt')?.active ? 1 : 0
            }}
          >
            {title}
          </div>
        )}
        
        {/* Layer CARD */}
        {shouldShowLayer('card') && (
          <div 
            className="absolute inset-3 border border-white rounded"
            style={{ 
              opacity: layerConfig.visual.find(l => l.name === 'card')?.active ? 1 : 0
            }}
          />
        )}

        {/* Panel si état panel */}
        {state === 'panel' && (
          <div
            className="absolute bg-white border-2 border-blue-500 rounded shadow-lg p-4"
            style={{
              left: `${CONTAINER_SIZE + 8}px`,
              top: '0px',
              width: '304px',
              height: `${CONTAINER_SIZE}px`,
              zIndex: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.95)'
            }}
          >
            <div className="text-sm font-bold mb-2 text-blue-600">{title}</div>
            <div className="text-xs text-gray-600 mb-2">
              Panel {type.toUpperCase()}
            </div>
            <div className="text-xs text-gray-500">
              État: {state.toUpperCase()}
            </div>
          </div>
        )}

        {/* Zones d'interaction granulaires depuis la BDD */}
        {renderInteractionZones(container)}
      </div>
    );
  };

  const gridWidth = GRID_SIZE * CELL_SIZE - CONTAINER_GAP;
  const gridHeight = GRID_SIZE * CELL_SIZE - CONTAINER_GAP;

  return (
    <div className="flex justify-center p-4">
      <div
        className="relative bg-gray-100 border-2 border-gray-300 rounded"
        style={{
          width: '644px', // Dimension fixe non-responsive
          height: '644px', // Dimension fixe non-responsive
          minWidth: '644px',
          minHeight: '644px',
          maxWidth: '644px',
          maxHeight: '644px'
        }}
      >
        {/* Grille de fond */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);
          return (
            <div
              key={index}
              className="absolute border border-gray-200"
              style={{
                left: `${x * CELL_SIZE}px`,
                top: `${y * CELL_SIZE}px`,
                width: `${CONTAINER_SIZE}px`,
                height: `${CONTAINER_SIZE}px`
              }}
            />
          );
        })}
        
        {/* Containers */}
        {containers.map(renderContainer)}
        
        {/* Mode Debug activé quand action zones sont expandées */}
        {layerConfig.actions.some(a => a.expanded) && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Grille debug conditionnée par mode ouvert/fermé */}
            {containers.map(container => {
              // Dimensions fixes selon les spécifications container
              const debugWidth = 128; // Toujours 128px de large
              const debugHeight = selectedState === 'closed' ? 128 : (selectedState === 'open' ? 256 : 192);
              const gridCols = 8; // Toujours 8 colonnes
              const gridRows = selectedState === 'closed' ? 8 : (selectedState === 'open' ? 16 : 12);
              const cellSize = 16; // Cellule fixe 16px
              
              return (
                <div
                  key={`debug-${container.id}`}
                  className="absolute"
                  style={{
                    left: `${container.position.x * CELL_SIZE}px`,
                    top: `${container.position.y * CELL_SIZE}px`,
                    width: `${debugWidth}px`,
                    height: `${debugHeight}px`
                  }}
                >
                  {/* Grille granulaire adaptée au mode */}
                  {Array.from({ length: gridCols * gridRows }).map((_, index) => {
                    const x = index % gridCols;
                    const y = Math.floor(index / gridCols);
                    return (
                      <div
                        key={index}
                        className="absolute border border-red-400"
                        style={{
                          left: `${x * cellSize}px`,
                          top: `${y * cellSize}px`,
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                          backgroundColor: 'rgba(255, 0, 0, 0.05)',
                          fontSize: '7px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'rgba(255, 0, 0, 0.8)',
                          fontWeight: 'bold'
                        }}
                      >
                        {index}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            
            {/* Overlay pour action zones actives */}
            {layerConfig.actions.filter(a => a.active).map(action => (
              <div
                key={action.name}
                className="absolute inset-0"
                style={{
                  border: `3px dashed ${action.color}`,
                  borderRadius: '8px',
                  opacity: 0.6
                }}
              >
                <div
                  className="absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded"
                  style={{
                    backgroundColor: action.color,
                    color: 'white'
                  }}
                >
                  {action.name.toUpperCase()} MODE
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}