import React, { useState, useEffect } from 'react';
import { Container } from '../Container';
import { ContainerData, ContainerState, ContainerType, PanelInfo, CursorType } from '@/types/common';
import { CustomCursor } from '../CustomCursor';
import { Panel } from '../Panel';
import { generateSpiralPositions, positionsToSet, findNextFreePosition } from '@/utils/spiralAlgorithm';

// Constantes
const GRID_SIZE = 32; // Taille de la grille (32×32)
const CONTAINER_SIZE = 128; // Taille d'un container en px
const CONTAINER_SPACING = 4; // Espacement entre containers en px
const TOTAL_SIZE = CONTAINER_SIZE + CONTAINER_SPACING; // 132px au total par case
const PANEL_WIDTH = 396; // Largeur fixe d'un panel (3 colonnes)

// Position centrale de la grille
const CENTER_X = Math.floor(GRID_SIZE / 2); // 16
const CENTER_Y = Math.floor(GRID_SIZE / 2); // 16

interface SpiralGridProps {
  debugMode?: boolean;
}

export function SpiralGrid({ debugMode: initialDebugMode = false }: SpiralGridProps) {
  // État des containers dans la grille
  const [containers, setContainers] = useState<ContainerData[]>([]);
  
  // Position de la grille (pour drag & drop)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // État local pour le mode debug
  const [debugMode, setDebugMode] = useState(initialDebugMode);
  
  // Panels actifs: Map<containerId, PanelInfo>
  const [activePanels, setActivePanels] = useState<Map<number, PanelInfo>>(new Map());
  
  // État pour le cursor personnalisé
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState<CursorType>(CursorType.GRAB);
  
  // Gestionnaire du raccourci clavier pour le mode debug (touche 'D')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        setDebugMode(prev => !prev);
        console.log(`Mode debug ${!debugMode ? 'activé' : 'désactivé'}`);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [debugMode]);
  
  // Écouteur d'événement pour fermer explicitement un conteneur
  useEffect(() => {
    const handleContainerClose = (e: Event) => {
      // Récupérer les détails de l'événement personnalisé
      const event = e as CustomEvent;
      const containerId = event.detail?.containerId;
      
      if (containerId !== undefined) {
        console.log(`Fermeture explicite du conteneur ${containerId}`);
        
        // Mettre à jour l'état des conteneurs pour fermer celui-ci
        setContainers(prevContainers => {
          return prevContainers.map(c => {
            if (c.id !== containerId) return c;
            return { ...c, state: ContainerState.CLOSED };
          });
        });
      }
    };
    
    // Ajouter l'écouteur d'événement
    document.addEventListener('container-close', handleContainerClose);
    
    // Nettoyage lors du démontage
    return () => {
      document.removeEventListener('container-close', handleContainerClose);
    };
  }, []);

  // Initialisation de la grille avec des containers en spirale
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
    
    // Générer des positions en spirale
    const containerCount = 30; // Nombre total de containers à générer
    const spiralPositions = generateSpiralPositions(CENTER_X, CENTER_Y, containerCount);
    
    // Créer les containers aux positions en spirale
    const spiralContainers: ContainerData[] = [];
    let id = 0;
    
    spiralPositions.forEach((pos, index) => {
      // Déterminer le type de container en fonction de sa position dans la spirale
      let containerType: ContainerType;
      
      // Distribution répartie des types de container
      if (index === 0) {
        // Le centre est toujours un container éditorial
        containerType = ContainerType.EDITORIAL;
      } else if (index % 4 === 1) {
        containerType = ContainerType.FREE;
      } else if (index % 4 === 2) {
        containerType = ContainerType.ADOPT;
      } else if (index % 4 === 3) {
        containerType = ContainerType.ADOPTED;
      } else {
        containerType = ContainerType.EDITORIAL;
      }
      
      // Créer le container
      spiralContainers.push({
        id: id++,
        type: containerType,
        state: ContainerState.CLOSED, // Tous fermés initialement
        position: pos
      });
    });
    
    setContainers(spiralContainers);
    console.log(`Grille en spirale créée avec ${spiralContainers.length} containers`);
  }, []);
  
  // Fonction pour ajouter un nouveau container à la prochaine position libre en spirale
  const addNewContainer = (type: ContainerType) => {
    // Récupérer toutes les positions occupées
    const occupiedPositionsSet = new Set<string>();
    containers.forEach(container => {
      if (container.position) {
        occupiedPositionsSet.add(`${container.position.x},${container.position.y}`);
      }
    });
    
    // Trouver la prochaine position libre en spirale
    const nextPosition = findNextFreePosition(CENTER_X, CENTER_Y, occupiedPositionsSet);
    
    // Créer et ajouter le nouveau container
    const newContainer: ContainerData = {
      id: containers.length,
      type,
      state: ContainerState.CLOSED,
      position: nextPosition
    };
    
    setContainers(prevContainers => [...prevContainers, newContainer]);
    console.log(`Nouveau container ajouté à la position (${nextPosition.x}, ${nextPosition.y})`);
  };
  
  // Fonction pour détecter le type de curseur en fonction de l'élément survolé
  const detectCursorType = (clientX: number, clientY: number): CursorType => {
    // Obtenir l'élément sous le curseur
    const element = document.elementFromPoint(clientX, clientY);
    
    if (element) {
      // Rechercher l'attribut data-cursor-type sur l'élément ou ses parents
      let current: Element | null = element;
      
      while (current) {
        const cursorTypeValue = current.getAttribute('data-cursor-type');
        if (Object.values(CursorType).includes(cursorTypeValue as CursorType)) {
          const type = cursorTypeValue as CursorType;
          
          // Si le conteneur est ouvert et que c'est une zone de panel, utiliser les versions pill-like
          // Vérifier si on est sur un container ouvert
          const containerElement = current.closest('[data-container-state]');
          const containerState = containerElement?.getAttribute('data-container-state');
          
          // Ne convertir le curseur en pill que pour les zones de conteneurs OUVERTS
          if (containerState && containerState !== ContainerState.CLOSED) {
            // Adapter le type de curseur selon l'état du conteneur
            // Pour oneone_up (FREE) -> KNOK_PILL
            if (containerState === ContainerState.FREE && type === CursorType.KNOK) {
              return CursorType.KNOK_PILL;
            }
            // Pour oneone_down (ADOPTED) -> MEET_PILL
            else if (containerState === ContainerState.ADOPTED && type === CursorType.MEET) {
              return CursorType.MEET_PILL;
            }
            // Pour onehalf_down (ADOPT) -> ADOPT_PILL
            else if (containerState === ContainerState.ADOPT && type === CursorType.ADOPT) {
              return CursorType.ADOPT_PILL;
            }
          }
          
          return type;
        }
        current = current.parentElement;
      }
    }
    
    // Par défaut, curseur de saisie (grab) ou de déplacement (grabbing) selon l'état
    return isDragging ? CursorType.GRAB : CursorType.GRAB;
  };

  // Gestion des événements de dragging avec support du curseur personnalisé
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Uniquement clic gauche
    
    setIsDragging(true);
    setCursorType(CursorType.GRAB); // Mettre le curseur en mode "grabbing"
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    // Toujours mettre à jour la position du curseur personnalisé
    setCursorPosition({ x: e.clientX, y: e.clientY });
    
    // Si on est en train de déplacer la grille
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } 
    // Sinon, détecter et mettre à jour le type de curseur
    else {
      const detectedCursorType = detectCursorType(e.clientX, e.clientY);
      setCursorType(detectedCursorType);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Réinitialiser le type de curseur en fonction de l'élément sous le pointeur
    const detectedCursorType = detectCursorType(cursorPosition.x, cursorPosition.y);
    setCursorType(detectedCursorType);
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
    
    // Créer une copie de la map actuelle des panels
    const newPanels = new Map(activePanels);
    
    // Si le panel est déjà actif, le fermer
    if (newPanels.has(containerId)) {
      console.log(`Panel fermé pour container ${containerId}`);
      newPanels.delete(containerId);
      
      // Important: pour les containers de type onehalf_dwn (ADOPT)
      // on doit s'assurer qu'ils sont correctement fermés
      if (container.type === ContainerType.ADOPT) {
        // Assurons-nous que le container est bien en état fermé
        // pour faire en sorte que tous les calculs de décalage se fassent correctement
        setContainers(prevContainers => {
          return prevContainers.map(c => {
            if (c.id !== containerId) return c;
            return { ...c, state: ContainerState.CLOSED };
          });
        });
      }
    } 
    // Sinon, l'activer 
    else {
      console.log(`Panel ouvert pour container ${containerId} (colonne ${container.position.x})`);
      
      // Pour chaque colonne, nous autorisons un seul panel ouvert
      // Donc nous devons vérifier si un panel est déjà ouvert dans cette colonne
      const columnIndex = container.position.x;
      
      // Fermer tout panel existant dans la même colonne
      Array.from(activePanels.entries()).forEach(([id, info]) => {
        if (info.columnIndex === columnIndex) {
          newPanels.delete(id);
        }
      });
      
      // Ajouter le nouveau panel avec les informations du conteneur
      newPanels.set(containerId, { 
        columnIndex,
        containerId,
        containerType: container.type  // Type du conteneur pour associer les bonnes données
      });
      
      // Pour les containers de type onehalf_dwn (ADOPT), s'assurer qu'ils sont bien en état ouvert
      if (container.type === ContainerType.ADOPT) {
        setContainers(prevContainers => {
          return prevContainers.map(c => {
            if (c.id !== containerId) return c;
            return { ...c, state: ContainerState.ADOPT };
          });
        });
      }
    }
    
    // Appliquer les modifications
    setActivePanels(newPanels);
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
  
  // Interface utilisateur pour l'ajout de nouveaux containers
  const renderControls = () => {
    return (
      <div className="absolute bottom-4 left-4 p-4 bg-white shadow-lg rounded-md z-50">
        <div className="text-sm font-medium mb-2">Ajouter un container:</div>
        <div className="flex space-x-2">
          <button 
            className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
            onClick={() => addNewContainer(ContainerType.FREE)}
          >
            FREE
          </button>
          <button 
            className="px-3 py-1 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200"
            onClick={() => addNewContainer(ContainerType.ADOPT)}
          >
            ADOPT
          </button>
          <button 
            className="px-3 py-1 bg-pink-100 text-pink-800 rounded-md hover:bg-pink-200"
            onClick={() => addNewContainer(ContainerType.ADOPTED)}
          >
            ADOPTED
          </button>
          <button 
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
            onClick={() => addNewContainer(ContainerType.EDITORIAL)}
          >
            EDITORIAL
          </button>
        </div>
      </div>
    );
  };
  
  // Bouton pour centrer la grille sur le point central
  const handleCenterGrid = () => {
    const gridWidth = GRID_SIZE * TOTAL_SIZE;
    const gridHeight = GRID_SIZE * TOTAL_SIZE;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Calculer la position pour centrer le point central de la spirale
    const centerX = (windowWidth / 2) - (CENTER_X * TOTAL_SIZE);
    const centerY = (windowHeight / 2) - (CENTER_Y * TOTAL_SIZE);
    
    setPosition({ x: centerX, y: centerY });
    console.log("Grille centrée sur le point central de la spirale");
  };
  
  // Fonction pour détecter le type de curseur en fonction de l'élément survolé
  const detectCursorTypeFromElement = (clientX: number, clientY: number): CursorType => {
    // Obtenir l'élément sous le curseur
    const elementUnderCursor = document.elementFromPoint(clientX, clientY);
    
    if (elementUnderCursor) {
      // Rechercher l'attribut data-cursor-type sur l'élément ou ses parents
      let current: Element | null = elementUnderCursor;
      
      while (current) {
        const cursorTypeValue = current.getAttribute('data-cursor-type');
        if (Object.values(CursorType).includes(cursorTypeValue as CursorType)) {
          return cursorTypeValue as CursorType;
        }
        current = current.parentElement;
      }
    }
    
    // Par défaut, curseur de saisie (grab) ou de déplacement (grabbing) selon l'état
    return isDragging ? CursorType.GRAB : CursorType.GRAB;
  };
  
  // Gestionnaire d'événements pour mettre à jour le curseur et la position
  const handleMouseMoveForCursor = (e: React.MouseEvent) => {
    // Mettre à jour la position du curseur
    setCursorPosition({ x: e.clientX, y: e.clientY });
    
    // Gestion du curseur et du déplacement selon l'état
    if (isDragging) {
      setCursorType(CursorType.GRAB);
      // Mettre à jour la position de la grille
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else {
      // Sinon, détecter le type de curseur en fonction de l'élément survolé
      const detectedCursorType = detectCursorTypeFromElement(e.clientX, e.clientY);
      setCursorType(detectedCursorType);
    }
  };
  
  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-gray-100"
      style={{ cursor: 'none' }} // Masquer le curseur par défaut
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
            
            {/* Point central de la grille */}
            <div 
              className="absolute bg-red-500 rounded-full"
              style={{
                left: CENTER_X * TOTAL_SIZE - 4,
                top: CENTER_Y * TOTAL_SIZE - 4,
                width: 8,
                height: 8,
                zIndex: 100
              }}
            />
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
              
              {/* Pas de panel au niveau colonne - les panels sont maintenant gérés de façon indépendante */}
              
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
      
      {/* Contrôles d'ajout de containers */}
      {renderControls()}
      
      {/* Bouton pour centrer la grille */}
      <button
        className="absolute top-4 right-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 z-50"
        onClick={handleCenterGrid}
      >
        Centrer sur la spirale
      </button>
      
      {/* Les panels sont rendus dans un conteneur qui se déplace avec la grille */}
      <div
        className="absolute"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          zIndex: 1990,
          pointerEvents: "none",
          width: '100%',
          height: '100%'
        }}
      >
        {/* On parcourt les panels actifs pour les afficher */}
        {Array.from(activePanels.entries()).map(([containerId, panelInfo]) => {
          // Récupérer le container associé à ce panel
          const container = containers.find(c => c.id === containerId);
          if (!container || !container.position) return null;
          
          // Position relative au container, garantissant que le panel se déplace exactement avec la grille
          const panelPosition = {
            left: container.position.x * TOTAL_SIZE + CONTAINER_SIZE + CONTAINER_SPACING,
            top: container.position.y * TOTAL_SIZE
          };
          
          return (
            <Panel
              key={`panel-${containerId}`}
              containerId={containerId}
              columnIndex={panelInfo.columnIndex}
              position={panelPosition}
              onClose={handlePanelToggle}
            />
          );
        })}
      </div>
      
      {/* Curseur personnalisé */}
      <CustomCursor
        cursorType={cursorType}
        position={cursorPosition}
      />
    </div>
  );
}