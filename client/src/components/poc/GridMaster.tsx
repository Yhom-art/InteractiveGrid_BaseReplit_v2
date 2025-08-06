import React, { useState, useEffect, useRef } from 'react';
import { ContainerState, ContainerType, CursorType, ContainerData, Position } from '@/types/common';

// Constants
const GRID_SIZE = 32; // Grille 32×32
const CONTAINER_SIZE = 128; // Taille d'un container en px
const CONTAINER_SPACING = 4; // Espacement entre containers en px
const PANEL_WIDTH = 512; // Largeur d'un panel ouvert en px (élargi pour meilleure visibilité)
const GRID_CENTER = { x: 16, y: 16 }; // Centre de la grille (position 16,16)

// Dimensions précises selon le document de spécifications
// Hauteurs fixes des différents types de containers
const CONTAINER_HEIGHT = {
  DEFAULT: 128,       // Taille standard (fermé)
  
  // Containers selon les spécifications du PDF
  ONE: 128,           // container-one: Taille normale pour liens externes
  ONEONE_UP: 194,     // container-oneone_up: Extension vers le HAUT (194px)
  ONEONE_DOWN: 194,   // container-oneone_down: Extension vers le BAS (194px)
  ONEHALF: 192,       // container-onehalf: Demi-extension (192px)
  
  // Pour compatibilité avec le code existant
  ADOPT: 192,         // correspond à container-onehalf (+66px)
  ADOPTED: 194,       // correspond à container-oneone_down (+66px vers le bas)
  FREE: 260           // correspond à une extension complète (+132px)
};

/**
 * Composant maître qui gère l'ensemble de la grille
 */
export function GridMaster() {
  // État des containers
  const [containers, setContainers] = useState<ContainerData[]>([]);
  
  // Position globale (pour le déplacement/drag)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  
  // État des rails (colonnes qui peuvent contenir un panel)
  // Map: colIndex => { isOpen: boolean, containerId: number | null }
  const [rails, setRails] = useState<Map<number, { isOpen: boolean, containerId: number | null }>>(
    new Map()
  );
  
  // État du déplacement
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  
  // État pour le curseur personnalisé
  const [cursorPosition, setCursorPosition] = useState<Position>({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState<CursorType>(CursorType.GRAB);
  
  // Référence au div principal de la grille
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Initialisation de la grille
  useEffect(() => {
    // Centrer la grille au démarrage
    if (gridRef.current) {
      const gridWidth = GRID_SIZE * (CONTAINER_SIZE + CONTAINER_SPACING);
      const gridHeight = GRID_SIZE * (CONTAINER_SIZE + CONTAINER_SPACING);
      
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      const centerX = (windowWidth - gridWidth) / 2;
      const centerY = (windowHeight - gridHeight) / 2;
      
      setPosition({ x: centerX, y: centerY });
      console.log("Grille centrée au chargement initial");
    }
    
    // Initialiser les containers
    initializeContainers();
    
    // Initialiser les rails (un rail par colonne)
    const initialRails = new Map();
    for (let col = 0; col < GRID_SIZE; col++) {
      initialRails.set(col, { isOpen: false, containerId: null });
    }
    setRails(initialRails);
    
  }, []);
  
  // Initialisation des containers
  const initializeContainers = () => {
    const initialContainers: ContainerData[] = [];
    
    // Créer un container pour chaque cellule de la grille
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const id = row * GRID_SIZE + col;
        
        // Déterminer si ce container est actif (80 containers actifs répartis dans la grille)
        const isActive = Math.random() < 0.08; // ~8% des containers sont actifs
        
        if (isActive) {
          // Pour les containers actifs, déterminer leur type
          // 25% éditorial, 25% adopt, 25% adopted, 25% free
          const randomType = Math.random();
          let type: ContainerType;
          
          if (randomType < 0.25) {
            type = ContainerType.EDITORIAL;
          } else if (randomType < 0.5) {
            type = ContainerType.ADOPT;
          } else if (randomType < 0.75) {
            type = ContainerType.ADOPTED;
          } else {
            type = ContainerType.FREE;
          }
          
          // État initial du container (tous fermés par défaut)
          const state = ContainerState.CLOSED;
          
          initialContainers.push({
            id,
            type,
            state,
            position: { x: col - GRID_CENTER.x, y: row - GRID_CENTER.y }
          });
        } else {
          // Container inactif
          initialContainers.push({
            id,
            type: ContainerType.INACTIVE,
            state: ContainerState.CLOSED,
            position: { x: col - GRID_CENTER.x, y: row - GRID_CENTER.y }
          });
        }
      }
    }
    
    setContainers(initialContainers);
  };
  
  // Conversion position container => position grille
  const getGridPosition = (container: ContainerData) => {
    if (!container.position) return { row: 0, col: 0 };
    
    // Position relative au centre de la grille
    const relX = container.position.x + GRID_CENTER.x;
    const relY = container.position.y + GRID_CENTER.y;
    
    return { row: relY, col: relX };
  };
  
  // Gestion de l'ouverture/fermeture des rails (et donc des panels)
  const handleRailToggle = (colIndex: number, containerId: number) => {
    // Récupérer le container concerné pour vérifier son état
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    // Ne pas activer le rail si le container est en état CLOSED
    if (container.state === ContainerState.CLOSED) {
      return;
    }
    
    console.log(`Toggle rail à la colonne ${colIndex} pour le container ${containerId}`);
    
    setRails(prevRails => {
      const newRails = new Map(prevRails);
      const currentRail = newRails.get(colIndex);
      
      if (currentRail) {
        // Si le rail est déjà ouvert pour ce container, on le ferme
        if (currentRail.isOpen && currentRail.containerId === containerId) {
          newRails.set(colIndex, { isOpen: false, containerId: null });
          console.log(`Rail ${colIndex} fermé`);
        } 
        // Si le rail est ouvert pour un autre container, on change le container
        else if (currentRail.isOpen && currentRail.containerId !== containerId) {
          newRails.set(colIndex, { isOpen: true, containerId: containerId });
          console.log(`Rail ${colIndex} change de container: ${currentRail.containerId} -> ${containerId}`);
        }
        // Si le rail est fermé, on l'ouvre pour ce container
        else {
          newRails.set(colIndex, { isOpen: true, containerId: containerId });
          console.log(`Rail ${colIndex} ouvert pour le container ${containerId}`);
        }
      }
      
      return newRails;
    });
  };
  
  // Calcul le décalage horizontal d'un container basé sur les rails ouverts
  const getHorizontalShift = (container: ContainerData) => {
    if (!container.position) return 0;
    
    const { col } = getGridPosition(container);
    let shift = 0;
    
    // Parcourir tous les rails à gauche de ce container
    for (let c = 0; c < col; c++) {
      const rail = rails.get(c);
      
      // Si le rail est ouvert, ajouter la largeur exacte du rail ouvert
      if (rail && rail.isOpen) {
        // Le décalage exact est la différence entre la largeur du panel et la largeur d'un container
        // La largeur du panel est maintenant 512px
        // La largeur d'un container + espacement est 132px
        // Donc le décalage supplémentaire est 512px - 132px = 380px
        shift += 380;
      }
    }
    
    return shift;
  };
  
  // Calcul du décalage vertical d'un container
  const getVerticalShift = (container: ContainerData) => {
    if (!container.position) return 0;
    
    const { row, col } = getGridPosition(container);
    let shift = 0;
    
    // ===== LOGIQUE AMÉLIORÉE: PUSH STRICT SANS SUPERPOSITION =====
    
    // Taille exacte de la hauteur de base d'un container (avec marge)
    const BASE_HEIGHT = CONTAINER_HEIGHT.DEFAULT;
    const SPACING = CONTAINER_SPACING;
    const TOTAL_BASE_HEIGHT = BASE_HEIGHT + SPACING;
    
    // ========== 1. FACTEUR DE PUSH POUR CE CONTAINER ==========
    
    // COMPORTEMENT SPÉCIFIQUE selon les 4 types définis dans le PDF
    // Par défaut, les containers ne se déplacent pas eux-mêmes
    shift = 0;
    
    // ========== 2. EFFET DE CE CONTAINER SUR LES AUTRES ==========
    
    // On trie les containers dans la même colonne, de haut en bas
    const colContainers = containers
      .filter(c => {
        if (!c.position) return false;
        const pos = getGridPosition(c);
        return pos.col === col;
      })
      .sort((a, b) => {
        const posA = getGridPosition(a);
        const posB = getGridPosition(b);
        return posA.row - posB.row;
      });
    
    // Trouver l'index de ce container dans la colonne
    const currentIndex = colContainers.findIndex(c => c.id === container.id);
    if (currentIndex === -1) return shift; // Devrait jamais arriver
    
    // ===== VÉRIFIER SI CE CONTAINER DOIT ÊTRE POUSSÉ VERS LE HAUT =====
    
    // Parcourir les containers en-dessous de celui-ci pour voir s'il y a un container-oneone_up
    // qui le pousse vers le haut
    for (let i = currentIndex + 1; i < colContainers.length; i++) {
      const containerBelow = colContainers[i];
      
      // Vérifier si le container juste en-dessous est un container-oneone_up ouvert
      if (i === currentIndex + 1 && 
          containerBelow.type === ContainerType.FREE && 
          containerBelow.state === ContainerState.FREE) {
        // Si le container en-dessous est un oneone_up ouvert,
        // ce container doit être poussé vers le haut de 132px
        console.log(`Container ${container.id} poussé vers le haut de -132px par le container-oneone_up ${containerBelow.id} en-dessous`);
        return -132; // Décalage négatif = vers le haut
      }
    }
    
    // ===== DÉCALAGE LIÉ AUX CONTAINERS AU-DESSUS =====
    
    // On parcourt les containers dans la colonne pour calculer combien ce container est poussé
    let cumulativeShift = 0;
    
    // Effet des containers au-dessus de celui-ci (push down)
    for (let i = 0; i < currentIndex; i++) {
      const containerAbove = colContainers[i];
      
      // Vérifier le type et l'état du container au-dessus
      if (containerAbove.type === ContainerType.ADOPTED && containerAbove.state === ContainerState.ADOPTED) {
        // container-oneone_down: pousse +66px vers le bas
        cumulativeShift += 66 + SPACING;
      }
      else if (containerAbove.type === ContainerType.ADOPT && containerAbove.state === ContainerState.ADOPT) {
        // container-onehalf: pousse +66px vers le bas
        cumulativeShift += 66 + SPACING;
      }
      // Les containers FREE (oneone_up) ne poussent pas vers le bas
    }
    
    // Ajouter le décalage cumulatif à ce container
    shift += cumulativeShift;
    
    return shift;
  };
  
  // Gestionnaire de clic sur un container
  const handleContainerClick = (containerId: number) => {
    const container = containers.find(c => c.id === containerId);
    if (!container || !container.position) return;
    
    const { col } = getGridPosition(container);
    const containerState = container.state;
    
    if (containerState === ContainerState.CLOSED) {
      // ÉTAPE 1: Si container fermé, on l'ouvre selon son type
      console.log(`Ouverture du container ${containerId} de type ${container.type}`);
      
      setContainers(prevContainers => {
        return prevContainers.map(c => {
          if (c.id !== containerId) return c;
          
          // Déterminer le nouvel état selon le type de container
          let newState;
          
          if (c.type === ContainerType.FREE) {
            newState = ContainerState.FREE; // oneone_up
          }
          else if (c.type === ContainerType.ADOPT) {
            newState = ContainerState.ADOPT; // onehalf
          }
          else if (c.type === ContainerType.ADOPTED) {
            newState = ContainerState.ADOPTED; // oneone_down
          }
          else {
            newState = ContainerState.CLOSED;
          }
          
          console.log(`Container ${containerId} de type ${c.type}: ${c.state} -> ${newState}`);
          return { ...c, state: newState };
        });
      });
      
      // Pas d'activation du rail ici - il faut un second clic
    }
    else {
      // ÉTAPE 2: Si container déjà ouvert, on active/désactive le panel
      console.log(`Activation du panel pour container ${containerId} (état: ${containerState})`);
      
      // Note: On ne change pas l'état du container ici, il reste ouvert
      // L'activation/désactivation du panel est gérée par handleRailToggle
      handleRailToggle(col, containerId);
    }
  };
  
  // Gestionnaire de mouvement de souris pour le déplacement de la grille
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
    
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Rendu du composant principal
  return (
    <div 
      ref={gridRef}
      className="relative w-full h-full overflow-hidden bg-gray-100"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grille principale - sera déplacée selon position */}
      <div 
        className="absolute transition-transform duration-100"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: GRID_SIZE * (CONTAINER_SIZE + CONTAINER_SPACING),
          height: GRID_SIZE * (CONTAINER_SIZE + CONTAINER_SPACING),
          willChange: 'transform', // Optimisation des performances
        }}
      >
        {/* Système de rails (un rail par colonne) */}
        <div className="absolute inset-0">
          {Array.from(rails.entries()).map(([colIndex, railInfo]) => {
            // NOUVELLE LOGIQUE: Position à partir du bord droit du container émetteur
            const containerInfo = railInfo.containerId !== null 
              ? containers.find(c => c.id === railInfo.containerId) 
              : null;
            
            const containerPosition = containerInfo && containerInfo.position 
              ? getGridPosition(containerInfo) 
              : { row: 0, col: colIndex };
            
            // Calcul de la position absolue du container émetteur
            const emitterContainer = railInfo.containerId !== null 
              ? containers.find(c => c.id === railInfo.containerId) 
              : null;
            
            // Si nous avons un container émetteur, positionner le rail directement par rapport à lui
            let railLeft = colIndex * (CONTAINER_SIZE + CONTAINER_SPACING);
            
            if (emitterContainer && emitterContainer.position) {
              // Position absolue du container dans la grille (en tenant compte des décalages)
              const { col } = getGridPosition(emitterContainer);
              const horizontalShift = getHorizontalShift(emitterContainer);
              
              // Position finale du container émetteur (bord gauche)
              const emitterLeft = col * (CONTAINER_SIZE + CONTAINER_SPACING) + horizontalShift;
              
              // Positionner le rail exactement à droite du container émetteur
              // La colonne suivante est à emitterLeft + CONTAINER_SIZE + CONTAINER_SPACING
              railLeft = emitterLeft + CONTAINER_SIZE + CONTAINER_SPACING;
              
              // Logs de débug pour vérifier les calculs de position
              console.log(`Rail pour container ${railInfo.containerId} - Col: ${col}, EmitterLeft: ${emitterLeft}, RailLeft: ${railLeft}`);
            }
            
            return (
              <div 
                key={`rail-${colIndex}`}
                className="absolute top-0 h-full transition-all duration-300"
                style={{
                  // Positionner le rail au bord droit du container qui l'a activé
                  left: railLeft,
                  width: railInfo.isOpen ? PANEL_WIDTH : 4,
                  backgroundColor: railInfo.isOpen ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                  zIndex: 10,
                  borderRight: railInfo.isOpen ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                {/* Contenu du panel si le rail est ouvert */}
                {railInfo.isOpen && railInfo.containerId !== null && (
                  <div className="p-6 h-full overflow-auto bg-white rounded-l-lg shadow-lg border-l-4 border-indigo-500">
                    <h2 className="text-2xl font-bold mb-6 text-indigo-700">
                      Panel du container {railInfo.containerId}
                    </h2>
                    
                    <button 
                      className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                      onClick={() => handleRailToggle(colIndex, railInfo.containerId!)}
                    >
                      Fermer le panel
                    </button>
                    
                    <div className="mt-6 space-y-4">
                      <div className="p-4 bg-gray-50 rounded-md">
                        <h3 className="font-semibold mb-2">Informations</h3>
                        <p className="text-gray-700">
                          <span className="font-medium">ID:</span> {railInfo.containerId}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Type:</span> {containers.find(c => c.id === railInfo.containerId)?.type}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">État:</span> {containers.find(c => c.id === railInfo.containerId)?.state}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-indigo-50 rounded-md">
                        <h3 className="font-semibold mb-2">Contenu du panel</h3>
                        <p className="text-gray-700">Ce contenu pourrait être spécifique au type de container.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Couche des containers */}
        <div className="absolute inset-0">
          {containers.map(container => {
            if (!container.position) return null;
            
            const { row, col } = getGridPosition(container);
            const horizontalShift = getHorizontalShift(container);
            const verticalShift = getVerticalShift(container);
            
            // Position de base
            const baseLeft = col * (CONTAINER_SIZE + CONTAINER_SPACING);
            const baseTop = row * (CONTAINER_SIZE + CONTAINER_SPACING);
            
            // Position finale avec décalages
            const finalLeft = baseLeft + horizontalShift;
            const finalTop = baseTop + verticalShift;
            
            // Déterminer la couleur en fonction du type
            let bgColor = 'bg-white'; // Par défaut pour INACTIVE
            if (container.type === ContainerType.ADOPT) bgColor = 'bg-pink-200';
            else if (container.type === ContainerType.ADOPTED) bgColor = 'bg-blue-200';
            else if (container.type === ContainerType.FREE) bgColor = 'bg-green-200';
            else if (container.type === ContainerType.EDITORIAL) bgColor = 'bg-purple-200';
            
            // Calculer la hauteur du container en fonction de son état et de son type
            let containerHeight = CONTAINER_HEIGHT.DEFAULT;
            
            if (container.state === ContainerState.FREE) {
              containerHeight = CONTAINER_HEIGHT.FREE; // Container FREE a une hauteur de 260px
            } 
            else if (container.state === ContainerState.ADOPT) {
              containerHeight = CONTAINER_HEIGHT.ADOPT; // Container ADOPT a une hauteur de 192px
            }
            else if (container.state === ContainerState.ADOPTED) {
              containerHeight = CONTAINER_HEIGHT.ADOPTED; // Container ADOPTED a une hauteur de 194px
            }
            
            return (
              <div
                key={`container-${container.id}`}
                className={`absolute transition-all duration-300 ${bgColor} border border-gray-300`}
                style={{
                  left: finalLeft,
                  top: finalTop,
                  width: CONTAINER_SIZE,
                  height: containerHeight,
                  cursor: container.type === ContainerType.INACTIVE ? 'default' : 'pointer',
                  zIndex: 20,
                }}
                onClick={() => container.type !== ContainerType.INACTIVE && handleContainerClick(container.id)}
              >
                <div className="flex items-center justify-center h-full text-xs">
                  {container.type !== ContainerType.INACTIVE ? (
                    <>
                      <div className="text-center">
                        <div className="font-bold">{container.type}</div>
                        <div>ID: {container.id}</div>
                        <div>Pos: ({col}, {row})</div>
                        <div className="mt-1 text-[10px]">
                          {container.state === ContainerState.FREE && "OUVERT (260px)"}
                          {container.state === ContainerState.ADOPT && "MINI (192px)"}
                          {container.state === ContainerState.ADOPTED && "BASE (128px)"}
                          {container.state === ContainerState.CLOSED && "FERMÉ (128px)"}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}