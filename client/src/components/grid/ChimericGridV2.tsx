import React, { useState, useEffect } from 'react';
import { ContainerFactory } from '../containers';
import { ContainerData, ContainerState, ContainerType, PanelInfo } from '@/types/common';

const CONTAINER_SIZE = 128; // Taille d'un conteneur en pixels
const CONTAINER_SPACING = 4; // Espacement entre les conteneurs
const TOTAL_SIZE = CONTAINER_SIZE + CONTAINER_SPACING; // Taille totale d'une cellule
const GRID_SIZE = 32; // Nombre de cellules dans la grille (32x32)

// Informations sur les types de conteneurs et leurs extensions
const CONTAINER_EXPANSIONS = {
  [ContainerType.FREE]: { direction: 'up', size: 132 },       // oneone_up: extension vers le haut
  [ContainerType.ADOPTED]: { direction: 'down', size: 132 },  // oneone_down: extension vers le bas
  [ContainerType.ADOPT]: { direction: 'down', size: 64 },     // onehalf_down: extension partielle vers le bas
  [ContainerType.EDITORIAL]: { direction: 'none', size: 0 }   // container-one: pas d'extension
};

interface ChimericGridProps {
  debugMode?: boolean;
}

export function ChimericGridV2({ debugMode = false }: ChimericGridProps) {
  // État des conteneurs dans la grille
  const [containers, setContainers] = useState<ContainerData[]>([]);
  
  // Panels actifs: Map<containerId, panelInfo>
  const [activePanels, setActivePanels] = useState<Map<number, PanelInfo>>(new Map());
  
  // Position de la grille pour le drag & drop
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Initialisation de la grille avec des containers aléatoires
  useEffect(() => {
    // Centrer la grille au démarrage
    const gridWidth = GRID_SIZE * TOTAL_SIZE;
    const gridHeight = GRID_SIZE * TOTAL_SIZE;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const centerX = (windowWidth - gridWidth) / 2;
    const centerY = (windowHeight - gridHeight) / 2;
    
    setPosition({ x: centerX, y: centerY });
    console.log("Grille centrée au chargement initial");
    
    // Générer des containers aléatoires pour la démonstration
    const randomContainers: ContainerData[] = [];
    const usedPositions = new Set<string>();
    
    // Nombre de containers à générer
    const containerCount = 50 + Math.floor(Math.random() * 50);
    
    for (let i = 0; i < containerCount; i++) {
      // Position aléatoire dans la grille
      let x: number, y: number;
      let posKey: string;
      
      do {
        x = Math.floor(Math.random() * GRID_SIZE);
        y = Math.floor(Math.random() * GRID_SIZE);
        posKey = `${x},${y}`;
      } while (usedPositions.has(posKey));
      
      usedPositions.add(posKey);
      
      // Type et état aléatoires
      const typeValues = [
        ContainerType.FREE,
        ContainerType.ADOPTED, 
        ContainerType.ADOPT,
        ContainerType.EDITORIAL
      ];
      const randomType = typeValues[Math.floor(Math.random() * typeValues.length)];
      
      // Créer le container
      randomContainers.push({
        id: i,
        type: randomType,
        state: ContainerState.CLOSED, // Tous fermés initialement
        position: { x, y }
      });
    }
    
    setContainers(randomContainers);
    console.log(`Zone de test créée avec ${containerCount} containers`);
  }, []);
  
  // Convertir les coordonnées de la grille en pixels
  const gridToPixels = (x: number, y: number) => {
    return {
      left: x * TOTAL_SIZE,
      top: y * TOTAL_SIZE
    };
  };
  
  // Gestion des événements de dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Uniquement clic gauche
    
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Gestion du clic sur un container
  const handleContainerClick = (containerId: number) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    if (container.state === ContainerState.CLOSED) {
      // Ouvrir le container selon son type
      setContainers(prevContainers => {
        return prevContainers.map(c => {
          if (c.id !== containerId) return c;
          
          // Définir le nouvel état selon le type
          let newState;
          if (c.type === ContainerType.FREE) {
            newState = ContainerState.FREE;
          }
          else if (c.type === ContainerType.ADOPT) {
            newState = ContainerState.ADOPT;
          }
          else if (c.type === ContainerType.ADOPTED) {
            newState = ContainerState.ADOPTED;
          }
          else {
            newState = c.state; // Pas de changement pour les autres types
          }
          
          return { ...c, state: newState };
        });
      });
    } 
    else {
      // Si déjà ouvert, activer le panel
      handlePanelToggle(containerId);
    }
  };
  
  // Gestion de l'activation / désactivation du panel
  const handlePanelToggle = (containerId: number) => {
    const container = containers.find(c => c.id === containerId);
    if (!container || !container.position) return;
    
    setActivePanels(prevPanels => {
      const newPanels = new Map(prevPanels);
      
      // Si le panel est déjà actif, le fermer
      if (newPanels.has(containerId)) {
        console.log(`Panel fermé pour container ${containerId}`);
        newPanels.delete(containerId);
      } 
      // Sinon, l'activer
      else {
        console.log(`Panel ouvert pour container ${containerId} (colonne ${container.position.x})`);
        
        const panelInfo: PanelInfo = {
          columnIndex: container.position.x
        };
        
        newPanels.set(containerId, panelInfo);
      }
      
      return newPanels;
    });
  };
  
  // Organiser les containers par colonne
  const containersByColumn = new Map<number, ContainerData[]>();
  
  // Créer une map des colonnes
  containers.forEach(container => {
    if (!container.position) return;
    
    const col = container.position.x;
    if (!containersByColumn.has(col)) {
      containersByColumn.set(col, []);
    }
    
    containersByColumn.get(col)!.push(container);
  });
  
  // Trier les containers dans chaque colonne (par position Y)
  containersByColumn.forEach((colContainers) => {
    colContainers.sort((a, b) => {
      if (!a.position || !b.position) return 0;
      return a.position.y - b.position.y;
    });
  });
  
  // Obtenir la liste triée des colonnes
  const columns = Array.from(containersByColumn.keys()).sort((a, b) => a - b);
  
  // Déterminer quelle colonne a un panel actif
  const columnsWithPanels = new Set<number>();
  activePanels.forEach((panelInfo) => {
    columnsWithPanels.add(panelInfo.columnIndex);
  });
  
  // Calculer le décalage horizontal pour chaque colonne
  const getColumnOffset = (colIndex: number) => {
    let offset = 0;
    
    // Pour chaque colonne avec panel qui est à gauche de cette colonne
    columnsWithPanels.forEach(panelCol => {
      if (panelCol < colIndex) {
        // Chaque panel actif décale les colonnes à sa droite de 3 positions
        offset += 3 * TOTAL_SIZE;
      }
    });
    
    return offset;
  };
  
  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-gray-100"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grille principale avec les containers */}
      <div
        className="absolute"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: GRID_SIZE * TOTAL_SIZE,
          height: GRID_SIZE * TOTAL_SIZE
        }}
      >
        {/* Debug: lignes de la grille */}
        {debugMode && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
              <div
                key={`h-line-${i}`}
                className="absolute bg-gray-200"
                style={{ left: 0, top: i * TOTAL_SIZE, width: '100%', height: '1px' }}
              />
            ))}
            {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
              <div
                key={`v-line-${i}`}
                className="absolute bg-gray-200"
                style={{ left: i * TOTAL_SIZE, top: 0, width: '1px', height: '100%' }}
              />
            ))}
          </div>
        )}
        
        {/* Rendu des colonnes */}
        {columns.map(colIndex => {
          const colContainers = containersByColumn.get(colIndex) || [];
          const hasPanelActive = columnsWithPanels.has(colIndex);
          
          // Calculer le décalage horizontal de cette colonne
          const horizontalOffset = getColumnOffset(colIndex);
          
          return (
            <div
              key={`column-${colIndex}`}
              className="absolute"
              style={{
                left: colIndex * TOTAL_SIZE + horizontalOffset,
                top: 0,
                width: TOTAL_SIZE,
                height: GRID_SIZE * TOTAL_SIZE,
                transition: 'left 0.3s ease'
              }}
            >
              {/* Containers dans cette colonne */}
              {colContainers.map(container => {
                if (!container.position) return null;
                
                // Calculer la position en pixels
                const pixelPos = gridToPixels(0, container.position.y);
                
                // Vérifier si ce container a un panel actif
                const hasPanel = activePanels.has(container.id);
                
                return (
                  <React.Fragment key={`container-wrapper-${container.id}`}>
                    {/* Container */}
                    <ContainerFactory
                      id={container.id}
                      state={container.state}
                      type={container.type}
                      position={{ left: 0, top: pixelPos.top }}
                      onClick={() => handleContainerClick(container.id)}
                      onPanelToggle={() => handlePanelToggle(container.id)}
                      debugMode={debugMode}
                    />
                    
                    {/* Panel */}
                    {hasPanel && (
                      <div
                        className="absolute bg-white shadow-lg border border-gray-200 rounded-md"
                        style={{
                          left: CONTAINER_SIZE + 8, // Après le conteneur + marge
                          top: pixelPos.top,
                          width: TOTAL_SIZE * 3 - 16, // 3 colonnes moins les marges
                          minHeight: CONTAINER_SIZE,
                          maxHeight: '80vh',
                          zIndex: 1000
                        }}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Container #{container.id}</h3>
                            <button
                              className="p-1 hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center"
                              onClick={() => handlePanelToggle(container.id)}
                            >
                              ×
                            </button>
                          </div>
                          <div>
                            <p>Type: {container.type}</p>
                            <p>State: {container.state}</p>
                            <p>Position: ({container.position.x}, {container.position.y})</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}