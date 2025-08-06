import React, { useState, useEffect } from 'react';
import { Container } from '../Container';
import { ContainerData, ContainerState, ContainerType, PanelInfo } from '@/types/common';

// Constantes
const GRID_SIZE = 32; // Taille de la grille (32×32)
const CONTAINER_SIZE = 128; // Taille d'un container en px
const CONTAINER_SPACING = 4; // Espacement entre containers en px
const TOTAL_SIZE = CONTAINER_SIZE + CONTAINER_SPACING; // 132px au total par case
const PANEL_WIDTH = 396; // Largeur fixe d'un panel (3 colonnes)

interface OrganizedGridProps {
  debugMode?: boolean;
}

export function OrganizedGrid({ debugMode = false }: OrganizedGridProps) {
  // État des containers dans la grille
  const [containers, setContainers] = useState<ContainerData[]>([]);
  
  // Position de la grille (pour drag & drop)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Panels actifs: Map<containerId, PanelInfo>
  const [activePanels, setActivePanels] = useState<Map<number, PanelInfo>>(new Map());
  
  // Initialisation de la grille avec des containers organisés
  useEffect(() => {
    // Définir une taille de grille visible plus petite pour faciliter les tests
    const visibleGridWidth = 5; // 5 colonnes visibles
    const visibleGridHeight = 10; // 10 rangées visibles
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Centrer la grille
    const centerX = (windowWidth - (visibleGridWidth * TOTAL_SIZE)) / 2;
    const centerY = (windowHeight - (visibleGridHeight * TOTAL_SIZE)) / 2;
    
    setPosition({ x: centerX, y: centerY });
    console.log("Grille centrée au chargement initial");
    
    // Générer des containers organisés pour voir clairement les effets
    const organizedContainers: ContainerData[] = [];
    let id = 0;
    
    // Créer une colonne avec des containers de type FREE
    for (let y = 0; y < 6; y++) {
      organizedContainers.push({
        id: id++,
        type: ContainerType.FREE,
        state: ContainerState.CLOSED,
        position: { x: 0, y }
      });
    }
    
    // Créer une colonne avec des containers de type ADOPT
    for (let y = 0; y < 6; y++) {
      organizedContainers.push({
        id: id++,
        type: ContainerType.ADOPT,
        state: ContainerState.CLOSED,
        position: { x: 1, y }
      });
    }
    
    // Créer une colonne avec des containers de type ADOPTED
    for (let y = 0; y < 6; y++) {
      organizedContainers.push({
        id: id++,
        type: ContainerType.ADOPTED,
        state: ContainerState.CLOSED,
        position: { x: 2, y }
      });
    }
    
    // Créer une colonne avec des containers de type EDITORIAL
    for (let y = 0; y < 6; y++) {
      organizedContainers.push({
        id: id++,
        type: ContainerType.EDITORIAL,
        state: ContainerState.CLOSED,
        position: { x: 3, y }
      });
    }
    
    // Créer une colonne mixte avec des types alternés
    for (let y = 0; y < 6; y++) {
      const types = [
        ContainerType.FREE,
        ContainerType.ADOPTED,
        ContainerType.ADOPT,
        ContainerType.EDITORIAL
      ];
      organizedContainers.push({
        id: id++,
        type: types[y % types.length],
        state: ContainerState.CLOSED,
        position: { x: 4, y }
      });
    }
    
    setContainers(organizedContainers);
    console.log(`Zone de test créée avec ${organizedContainers.length} containers organisés`);
  }, []);
  
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
  const containersByColumn: Map<number, ContainerData[]> = new Map();
  
  // Regrouper les containers par colonne
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
  
  // Calculer les décalages verticaux et horizontaux
  const verticalShifts: Map<number, number> = new Map(); // containerId -> décalage Y
  
  // Calculer les décalages verticaux (expansion des containers)
  Array.from(containersByColumn.entries()).forEach(([colIndex, colContainers]) => {
    let cumulativeShift = 0;
    
    // 1. Parcourir de haut en bas pour calculer les décalages vers le bas
    for (let i = 0; i < colContainers.length; i++) {
      const currentContainer = colContainers[i];
      
      // Appliquer le décalage cumulé jusqu'ici
      verticalShifts.set(currentContainer.id, cumulativeShift);
      
      // Si ouvert (et pas FREE), ajouter au décalage cumulé
      if (currentContainer.state !== ContainerState.CLOSED) {
        if (currentContainer.type === ContainerType.ADOPTED && currentContainer.state === ContainerState.ADOPTED) {
          // Container ADOPTED (oneone_down): pousse vers le bas de 132px
          cumulativeShift += 132;
        }
        else if (currentContainer.type === ContainerType.ADOPT && currentContainer.state === ContainerState.ADOPT) {
          // Container ADOPT (onehalf_down): pousse vers le bas de 64px
          cumulativeShift += 64;
        }
        // Le container FREE va être géré dans la seconde boucle
      }
    }
    
    // 2. Parcourir de bas en haut pour calculer les décalages vers le haut (pour FREE)
    const containerShiftsUp: Map<number, number> = new Map();
    
    for (let i = colContainers.length - 1; i >= 0; i--) {
      const currentContainer = colContainers[i];
      
      // Si c'est un container FREE ouvert
      if (currentContainer.type === ContainerType.FREE && currentContainer.state === ContainerState.FREE) {
        // Il pousse les containers au-dessus vers le haut
        let upwardShift = 132; // Hauteur d'expansion du FREE
        
        // Parcourir tous les containers au-dessus et les décaler vers le haut
        for (let j = 0; j < i; j++) {
          const aboveContainer = colContainers[j];
          containerShiftsUp.set(aboveContainer.id, (containerShiftsUp.get(aboveContainer.id) || 0) - upwardShift);
        }
      }
    }
    
    // Fusionner les décalages vers le haut avec ceux déjà calculés
    containerShiftsUp.forEach((shift, containerId) => {
      verticalShifts.set(containerId, (verticalShifts.get(containerId) || 0) + shift);
    });
  });
  
  // Calculer les décalages horizontaux (expansion des panels)
  const horizontalShifts: Map<number, number> = new Map(); // colIndex -> décalage X
  
  // Regrouper les panels par colonne
  const panelsByColumn: Map<number, number> = new Map(); // colIndex -> nombre de panels
  
  activePanels.forEach((panelInfo) => {
    const col = panelInfo.columnIndex;
    panelsByColumn.set(col, (panelsByColumn.get(col) || 0) + 1);
  });
  
  // Calculer le décalage horizontal pour chaque colonne
  let cumulativeHorizontalShift = 0;
  
  // Trier les colonnes
  const sortedColumns = Array.from(containersByColumn.keys()).sort((a, b) => a - b);
  
  sortedColumns.forEach(colIndex => {
    // Enregistrer le décalage cumulé pour cette colonne
    horizontalShifts.set(colIndex, cumulativeHorizontalShift);
    
    // Si cette colonne a des panels actifs, ajouter au décalage
    if (panelsByColumn.has(colIndex)) {
      const panelCount = panelsByColumn.get(colIndex) || 0;
      cumulativeHorizontalShift += PANEL_WIDTH;
    }
  });
  
  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-gray-100"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Conteneur principal de la grille */}
      <div
        className="absolute"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: GRID_SIZE * TOTAL_SIZE,
          height: GRID_SIZE * TOTAL_SIZE
        }}
      >
        {/* Lignes de debug pour la grille */}
        {debugMode && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
              <React.Fragment key={`grid-lines-${i}`}>
                <div
                  className="absolute bg-gray-200"
                  style={{ left: 0, top: i * TOTAL_SIZE, width: '100%', height: '1px' }}
                />
                <div
                  className="absolute bg-gray-200"
                  style={{ left: i * TOTAL_SIZE, top: 0, width: '1px', height: '100%' }}
                />
              </React.Fragment>
            ))}
          </div>
        )}
        
        {/* Rendu des colonnes */}
        {sortedColumns.map(colIndex => {
          const colContainers = containersByColumn.get(colIndex) || [];
          const horizontalOffset = horizontalShifts.get(colIndex) || 0;
          
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
              data-column={colIndex}
            >
              {/* Bande du panel dormant pour toute la colonne */}
              <div 
                className="absolute bg-white" 
                style={{
                  left: CONTAINER_SIZE,
                  top: 0,
                  width: CONTAINER_SPACING,
                  height: '100%',
                  opacity: 0.2
                }}
              />
              
              {/* Panel actif pour cette colonne (s'il existe) */}
              {(() => {
                // Rechercher s'il y a un container dans cette colonne avec un panel actif
                const containerWithPanel = colContainers.find(container => 
                  container.position && activePanels.has(container.id)
                );
                
                if (containerWithPanel) {
                  const panelInfo = activePanels.get(containerWithPanel.id);
                  return (
                    <div
                      className="absolute bg-white overflow-hidden"
                      style={{
                        left: CONTAINER_SIZE + CONTAINER_SPACING,
                        top: 0,
                        width: PANEL_WIDTH - CONTAINER_SPACING,
                        height: '100%', // Prend toute la hauteur de la colonne
                        zIndex: 1000,
                        borderLeft: '1px solid #eaeaea'
                      }}
                    >
                      {/* En-tête du panel */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium text-gray-900">Container {containerWithPanel.id}</h3>
                          <button
                            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
                            onClick={() => handlePanelToggle(containerWithPanel.id)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      
                      {/* Contenu du panel */}
                      <div className="p-4">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Type:</span>
                            <span className="text-gray-900">{containerWithPanel.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">État:</span>
                            <span className="text-gray-900">{containerWithPanel.state}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Position:</span>
                            <span className="text-gray-900">
                              ({containerWithPanel.position?.x || 0}, {containerWithPanel.position?.y || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              {/* Conteneurs dans cette colonne */}
              {colContainers.map(container => {
                if (!container.position) return null;
                
                // Sécuriser avec des valeurs par défaut pour éviter les erreurs "possibly undefined"
                const containerPosition = container.position || { x: 0, y: 0 };
                const verticalOffset = verticalShifts.get(container.id) || 0;
                const isPanelActive = activePanels.has(container.id);
                
                return (
                  <div
                    key={`container-wrapper-${container.id}`}
                    className="absolute"
                    style={{
                      left: 0,
                      top: containerPosition.y * TOTAL_SIZE + verticalOffset,
                      width: CONTAINER_SIZE,
                      height: CONTAINER_SIZE,
                      transition: 'top 0.3s ease',
                      zIndex: isPanelActive ? 50 : 10
                    }}
                    data-container-id={container.id}
                  >
                    {/* Conteneur */}
                    <Container
                      id={container.id}
                      state={container.state}
                      type={container.type}
                      position={{ left: 0, top: 0 }}
                      onClick={() => handleContainerClick(container.id)}
                      onPanelToggle={() => handlePanelToggle(container.id)}
                      debugMode={debugMode}
                    />
                    
                    {/* Indicateur de panel actif */}
                    {isPanelActive && (
                      <div 
                        className="absolute bg-white" 
                        style={{
                          left: CONTAINER_SIZE,
                          top: 0,
                          width: CONTAINER_SPACING,
                          height: CONTAINER_SIZE,
                          opacity: 1
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}