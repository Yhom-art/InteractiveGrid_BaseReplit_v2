import React, { useState, useEffect } from 'react';
import { ContainerData, ContainerState, ContainerType } from '@/types/common';
import { ContainerFactory } from '../containers';

// Constantes
const GRID_SIZE = 32; // Taille de la grille (32×32)
const CONTAINER_SIZE = 128; // Taille d'un container en px
const CONTAINER_SPACING = 4; // Espacement entre containers en px
const TOTAL_SIZE = CONTAINER_SIZE + CONTAINER_SPACING; // 132px au total par case

interface ChimericGridProps {
  debugMode?: boolean;
}

/**
 * ChimericGrid - Grille qui gère les containers et leurs déplacements
 * selon les spécifications du PDF
 */
export function ChimericGrid({ debugMode = false }: ChimericGridProps) {
  // État des containers
  const [containers, setContainers] = useState<ContainerData[]>([]);
  // État pour les déplacements de containers
  const [containerShifts, setContainerShifts] = useState<Map<number, {x: number, y: number}>>(new Map());
  // Panels actifs
  const [activePanels, setActivePanels] = useState<Map<number, {columnIndex: number}>>(new Map());
  
  // Position du conteneur de la grille
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // État pour le déplacement de la grille
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
    
    // Générer des containers
    initializeContainers();
  }, []);

  // Initialisation des containers
  const initializeContainers = () => {
    const initialContainers: ContainerData[] = [];
    
    // Créer une zone de test concentrée (5x15) au centre de la grille
    const testZoneStartX = 13; // Centre X de la grille (32/2 - 3)
    const testZoneStartY = 8;  // Centre Y de la grille (32/2 - 8)
    const testZoneWidth = 5;
    const testZoneHeight = 15;
    
    // Zone de test avec tous les types de containers
    for (let y = 0; y < testZoneHeight; y++) {
      for (let x = 0; x < testZoneWidth; x++) {
        const col = testZoneStartX + x;
        const row = testZoneStartY + y;
        const id = row * GRID_SIZE + col;
        
        // Colonne 1: Containers FREE (oneone_up)
        if (x === 0 && y % 3 === 0) {
          initialContainers.push({
            id,
            type: ContainerType.FREE,
            state: ContainerState.CLOSED,
            position: { x: col, y: row }
          });
        }
        
        // Colonne 2: Containers ADOPT (onehalf_down)
        if (x === 1 && y % 3 === 0) {
          initialContainers.push({
            id,
            type: ContainerType.ADOPT,
            state: ContainerState.CLOSED,
            position: { x: col, y: row }
          });
        }
        
        // Colonne 3: Containers ADOPTED (oneone_down)
        if (x === 2 && y % 3 === 0) {
          initialContainers.push({
            id,
            type: ContainerType.ADOPTED,
            state: ContainerState.CLOSED,
            position: { x: col, y: row }
          });
        }
        
        // Colonne 4: Containers EDITORIAL (fixes)
        if (x === 3 && y % 3 === 0) {
          initialContainers.push({
            id,
            type: ContainerType.EDITORIAL,
            state: ContainerState.CLOSED,
            position: { x: col, y: row },
            title: `Editorial ${y}`
          });
        }
        
        // Colonne 5: Mélange de tous les types
        if (x === 4) {
          if (y % 4 === 0) {
            initialContainers.push({
              id,
              type: ContainerType.FREE,
              state: ContainerState.CLOSED,
              position: { x: col, y: row }
            });
          } else if (y % 4 === 1) {
            initialContainers.push({
              id,
              type: ContainerType.ADOPT,
              state: ContainerState.CLOSED,
              position: { x: col, y: row }
            });
          } else if (y % 4 === 2) {
            initialContainers.push({
              id,
              type: ContainerType.ADOPTED,
              state: ContainerState.CLOSED,
              position: { x: col, y: row }
            });
          } else {
            initialContainers.push({
              id,
              type: ContainerType.EDITORIAL,
              state: ContainerState.CLOSED,
              position: { x: col, y: row },
              title: `Mix ${y}`
            });
          }
        }
      }
    }
    
    // Ajouter quelques containers aléatoires dans le reste de la grille (moins nombreux)
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        // Éviter la zone de test
        if (col >= testZoneStartX && col < testZoneStartX + testZoneWidth &&
            row >= testZoneStartY && row < testZoneStartY + testZoneHeight) {
          continue;
        }
        
        const id = row * GRID_SIZE + col;
        
        // Seulement ~5% des containers sont actifs en dehors de la zone de test
        const isActive = Math.random() < 0.05;
        
        if (isActive) {
          // Déterminer le type aléatoirement
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
          
          initialContainers.push({
            id,
            type,
            state: ContainerState.CLOSED,
            position: { x: col, y: row }
          });
        }
      }
    }
    
    console.log(`Zone de test créée avec ${initialContainers.length} containers`);
    setContainers(initialContainers);
  };
  
  // Convertir position grille en pixels
  const gridToPixels = (gridX: number, gridY: number) => {
    return {
      left: gridX * TOTAL_SIZE,
      top: gridY * TOTAL_SIZE
    };
  };
  
  // Gestionnaire de clic sur un container
  const handleContainerClick = (containerId: number) => {
    const container = containers.find(c => c.id === containerId);
    if (!container || !container.position) return;
    
    if (container.state === ContainerState.CLOSED) {
      // Ouvrir le container selon son type
      setContainers(prevContainers => {
        return prevContainers.map(c => {
          if (c.id !== containerId) return c;
          
          // Nouvel état selon le type
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
            // Pour EDITORIAL ou autres
            newState = container.state;
          }
          
          return { ...c, state: newState };
        });
      });
      
      // Calculer les décalages pour tous les containers affectés
      updateContainerShifts(container);
    }
    else {
      // Si déjà ouvert, on active le panel
      handlePanelToggle(containerId);
    }
  };
  
  // Mettre à jour les décalages pour tous les containers
  const updateContainerShifts = (targetContainer: ContainerData) => {
    if (!targetContainer.position) return;
    
    const { x: col, y: row } = targetContainer.position;
    const newShifts = new Map(containerShifts);
    
    // Si le container cible est fermé, on supprime son effet
    if (targetContainer.state === ContainerState.CLOSED) {
      // Réinitialiser les décalages pour les containers affectés par celui-ci
      containers.forEach(container => {
        if (!container.position) return;
        
        // Ne traiter que les containers dans la même colonne
        if (container.position.x !== col) return;
        
        // Vérifier si ce container était affecté par le container cible
        const isAbove = container.position.y < row;
        const isBelow = container.position.y > row;
        
        if ((targetContainer.type === ContainerType.FREE && isAbove) ||
            ((targetContainer.type === ContainerType.ADOPTED || 
              targetContainer.type === ContainerType.ADOPT) && isBelow)) {
          
          // Recalculer les décalages sans l'effet de ce container
          recalculateColumnShifts(col);
        }
      });
      
      return;
    }
    
    // Recalculer tous les décalages pour la colonne
    recalculateColumnShifts(col);
  };
  
  // Recalculer tous les décalages pour une colonne
  const recalculateColumnShifts = (col: number) => {
    // Récupérer tous les containers dans cette colonne
    const colContainers = containers
      .filter(c => c.position && c.position.x === col)
      .sort((a, b) => {
        // Trier par position Y (de haut en bas)
        return (a.position?.y || 0) - (b.position?.y || 0);
      });
    
    // Créer une nouvelle map pour les décalages
    const newShifts = new Map(containerShifts);
    
    // Tableau pour suivre les décalages cumulatifs
    const cumulativeShifts = Array(colContainers.length).fill(0);
    
    // 1. Parcourir de haut en bas pour calculer les décalages vers le bas
    for (let i = 0; i < colContainers.length; i++) {
      const currentContainer = colContainers[i];
      
      // Appliquer le décalage cumulatif des containers au-dessus
      cumulativeShifts[i] = i > 0 ? cumulativeShifts[i-1] : 0;
      
      // Si ce container est ouvert, calculer son effet sur les containers en-dessous
      if (currentContainer.state !== ContainerState.CLOSED) {
        // Déterminer le décalage selon le type
        let pushDown = 0;
        
        if (currentContainer.type === ContainerType.ADOPTED && 
            currentContainer.state === ContainerState.ADOPTED) {
          // container-oneone_down: pousse vers le bas de 132px
          pushDown = 132;
          console.log(`Container ${currentContainer.id} (oneone_down) pousse vers le bas de 132px`);
        }
        else if (currentContainer.type === ContainerType.ADOPT && 
                 currentContainer.state === ContainerState.ADOPT) {
          // container-onehalf_down: pousse vers le bas de 64px
          pushDown = 64;
          console.log(`Container ${currentContainer.id} (onehalf_down) pousse vers le bas de 64px`);
        }
        
        // Appliquer ce décalage à tous les containers en-dessous
        for (let j = i + 1; j < colContainers.length; j++) {
          cumulativeShifts[j] += pushDown;
        }
      }
    }
    
    // 2. Parcourir de bas en haut pour calculer les décalages vers le haut
    for (let i = colContainers.length - 1; i >= 0; i--) {
      const currentContainer = colContainers[i];
      
      // Si ce container est un oneone_up ouvert, il pousse les containers au-dessus vers le haut
      if (currentContainer.type === ContainerType.FREE && 
          currentContainer.state === ContainerState.FREE) {
        
        console.log(`Container ${currentContainer.id} (FREE) pousse vers le haut de 132px`);
        
        // Appliquer un décalage vers le haut de 132px pour tous les containers au-dessus
        for (let j = 0; j < i; j++) {
          cumulativeShifts[j] -= 132; // Décalage négatif = vers le haut
          console.log(`Container ${colContainers[j].id} poussé vers le haut de -132px par container-oneone_up ${currentContainer.id}`);
        }
      }
    }
    
    // Appliquer les décalages calculés
    for (let i = 0; i < colContainers.length; i++) {
      const shift = cumulativeShifts[i];
      if (shift !== 0) {
        newShifts.set(colContainers[i].id, { x: 0, y: shift });
      } else {
        // Si pas de décalage, supprimer l'entrée de la map
        newShifts.delete(colContainers[i].id);
      }
    }
    
    setContainerShifts(newShifts);
  };
  
  // Gestionnaire d'activation/désactivation de panel
  // Approche simplifiée: un seul panel par colonne, qui suit son container maître
  const handlePanelToggle = (containerId: number) => {
    const container = containers.find(c => c.id === containerId);
    if (!container || !container.position) return;
    
    const { x: col } = container.position;
    
    setActivePanels(prevPanels => {
      const newPanels = new Map(prevPanels);
      
      // Vérifier si ce container a déjà un panel (fermeture)
      if (newPanels.has(containerId)) {
        // Fermer le panel
        newPanels.delete(containerId);
        console.log(`Panel fermé pour container ${containerId}`);
      }
      else {
        // Vérifier s'il existe déjà un panel dans la même colonne
        let panelExistsInColumn = false;
        
        // Parcourir tous les panels actifs
        Array.from(newPanels.entries()).forEach(([panelId, panelInfo]) => {
          const panelContainer = containers.find(c => c.id === panelId);
          if (!panelContainer || !panelContainer.position) return;
          
          // Si un panel existe dans la même colonne, le fermer
          if (panelContainer.position.x === col) {
            panelExistsInColumn = true;
            newPanels.delete(panelId);
            console.log(`Panel du container ${panelId} fermé car nouveau panel dans la même colonne`);
          }
        });
        
        // Enregistrer simplement la colonne du panel, sa position sera calculée dynamiquement
        // lors du rendu en fonction des décalages appliqués aux conteneurs
        newPanels.set(containerId, { columnIndex: col });
        
        if (panelExistsInColumn) {
          console.log(`Panel ouvert pour container ${containerId} (remplace un panel existant dans la colonne ${col})`);
        } else {
          console.log(`Panel ouvert pour container ${containerId} (colonne ${col})`);
        }
      }
      
      return newPanels;
    });
  };

  // Calculer la position finale de chaque container avec détection directe des décalages
  const getContainerPosition = (container: ContainerData) => {
    if (!container.position) return { left: 0, top: 0 };
    
    // Position de base en pixels
    const basePosition = gridToPixels(container.position.x, container.position.y);
    
    // Calculer les décalages
    let shiftY = 0;
    let shiftX = 0;
    const { x: col, y: row } = container.position;
    
    // 1. DÉCALAGES VERTICAUX (haut/bas)
    // Pour chaque container ouvert dans la même colonne
    containers.forEach(otherContainer => {
      if (!otherContainer.position) return;
      if (otherContainer.id === container.id) return; // Ne pas se comparer soi-même
      if (otherContainer.state === ContainerState.CLOSED) return; // Ignorer les containers fermés
      if (otherContainer.position.x !== col) return; // Même colonne seulement
      
      // ÉLÉMENT AU-DESSUS QUI POUSSE VERS LE BAS
      if (otherContainer.position.y < row) {
        // ONEONE_DOWN (ADOPTED): pousse 132px vers le bas
        if (otherContainer.type === ContainerType.ADOPTED && 
            otherContainer.state === ContainerState.ADOPTED) {
          shiftY += 132;
          console.log(`Container ${container.id} poussé vers le bas de 132px par ${otherContainer.id} (oneone_down)`);
        } 
        // ONEHALF_DOWN (ADOPT): pousse 64px vers le bas
        else if (otherContainer.type === ContainerType.ADOPT && 
                 otherContainer.state === ContainerState.ADOPT) {
          shiftY += 64;
          console.log(`Container ${container.id} poussé vers le bas de 64px par ${otherContainer.id} (onehalf_down)`);
        }
      }
      
      // ÉLÉMENT EN-DESSOUS QUI POUSSE VERS LE HAUT
      if (otherContainer.position.y > row) {
        // ONEONE_UP (FREE): pousse 132px vers le haut
        if (otherContainer.type === ContainerType.FREE && 
            otherContainer.state === ContainerState.FREE) {
          shiftY -= 132;
          console.log(`Container ${container.id} poussé vers le haut de 132px par ${otherContainer.id} (oneone_up)`);
        }
      }
    });
    
    // 2. DÉCALAGES HORIZONTAUX (pour panels)
    // Calculer les décalages horizontaux pour les panels
    
    // Classer tous les panels actifs par colonne (de gauche à droite)
    const activePanelsList = Array.from(activePanels.entries())
      .map(([panelId, info]) => {
        const panelContainer = containers.find(c => c.id === panelId);
        if (!panelContainer || !panelContainer.position) return null;
        return {
          id: panelId,
          column: panelContainer.position.x
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => a!.column - b!.column);
    
    // Si le container a son propre panel, ne pas le décaler
    if (activePanels.has(container.id)) {
      // Ne pas décaler le container maître lui-même
    } 
    else {
      // Pour chaque panel actif
      let panelsToLeft = 0;
      
      activePanelsList.forEach(panelInfo => {
        if (!panelInfo) return;
        
        // Si le panel est à gauche de ce container, compter un décalage
        if (container.position && panelInfo.column < container.position.x) {
          panelsToLeft++;
        }
      });
      
      // Appliquer le décalage total (3 colonnes par panel)
      if (panelsToLeft > 0) {
        shiftX += panelsToLeft * TOTAL_SIZE * 3;
        console.log(`Container ${container.id} (col=${container.position.x}) poussé vers la droite par ${panelsToLeft} panel(s)`);
      }
    }
    
    return {
      left: basePosition.left + shiftX,
      top: basePosition.top + shiftY
    };
  };
  
  // Gestionnaires pour le déplacement de la grille
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
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

  // Organiser les containers par colonne et par rangée
  // Structure: Map<colonne, Map<rangée, container>>
  const containersByPosition = new Map<number, Map<number, ContainerData>>();
  
  // 1. Remplir la map avec les containers par position
  containers.forEach(container => {
    if (!container.position) return;
    
    const col = container.position.x;
    const row = container.position.y;
    
    if (!containersByPosition.has(col)) {
      containersByPosition.set(col, new Map());
    }
    
    containersByPosition.get(col)!.set(row, container);
  });
  
  // 2. Obtenir toutes les colonnes et les trier
  const allColumns = Array.from(containersByPosition.keys()).sort((a, b) => a - b);
  
  // 3. Obtenir toutes les rangées et les trier
  const allRowsSet = new Set<number>();
  containersByPosition.forEach((rowMap) => {
    // Convertir en Array pour résoudre les problèmes d'itérateur
    Array.from(rowMap.keys()).forEach((row) => {
      allRowsSet.add(row);
    });
  });
  const allRows = Array.from(allRowsSet).sort((a, b) => a - b);
  
  // Créer une map pour les décalages verticaux pour CSS Grid
  const verticalShifts = new Map<number, number>();
  
  // Parcourir les containers par colonne pour calculer les décalages verticaux
  containersByPosition.forEach((rowMap, colIndex) => {
    // Convertir en tableau pour éviter les problèmes d'itérateur
    const colContainersArray = Array.from(rowMap.entries());
    
    // Trier par position verticale (haut en bas)
    const sortedContainers = colContainersArray
      .map(([row, container]) => ({ row, container }))
      .sort((a, b) => a.row - b.row);
    
    // Important : Free ne modifie pas sa position ni celle des autres containers
    // ADOPTED pousse vers le bas de 132px
    // ADOPT pousse vers le bas de 64px
    for (let i = 0; i < sortedContainers.length; i++) {
      const { container, row } = sortedContainers[i];
      
      if (container.state === ContainerState.CLOSED) continue;
      
      // Container oneone_down (ADOPTED): pousse vers le bas de 132px
      if (container.type === ContainerType.ADOPTED && container.state === ContainerState.ADOPTED) {
        console.log(`Container ${container.id} (oneone_down) pousse vers le bas de 132px`);
        // Appliquer le décalage à tous les containers en-dessous
        for (let j = i + 1; j < sortedContainers.length; j++) {
          const targetContainer = sortedContainers[j].container;
          verticalShifts.set(targetContainer.id, (verticalShifts.get(targetContainer.id) || 0) + 132);
        }
      }
      // Container onehalf_down (ADOPT): pousse vers le bas de 64px
      else if (container.type === ContainerType.ADOPT && container.state === ContainerState.ADOPT) {
        console.log(`Container ${container.id} (onehalf_down) pousse vers le bas de 64px`);
        // Appliquer le décalage à tous les containers en-dessous
        for (let j = i + 1; j < sortedContainers.length; j++) {
          const targetContainer = sortedContainers[j].container;
          verticalShifts.set(targetContainer.id, (verticalShifts.get(targetContainer.id) || 0) + 64);
        }
      }
      // Pour FREE (oneone_up), il ne pousse pas les autres containers
      // Son expansion vers le haut sera gérée visuellement lors de l'affichage
    }
  });
  
  // Analyse des colonnes et des conteneurs pour la grille CSS
  const columnInfo = allColumns.map(colIndex => {
    const colContainers = containersByPosition.get(colIndex);
    if (!colContainers) return { hasActivePanel: false, expandedContainers: [] };
    
    // Convertir en tableau pour éviter les problèmes d'itérateur
    const colContainersArray = Array.from(colContainers.entries());
    const containers = colContainersArray.map(([row, container]) => ({ row, container }));
    
    // Trier les containers par position (haut en bas)
    containers.sort((a, b) => a.row - b.row);
    
    // Vérifier si cette colonne a un panel actif
    let hasActivePanel = false;
    const expandedContainers: { id: number, row: number, type: ContainerType, state: ContainerState }[] = [];
    
    for (const { row, container } of containers) {
      if (activePanels.has(container.id)) {
        hasActivePanel = true;
      }
      
      // Identifier les containers qui sont dans un état "ouvert"
      if (container.state !== ContainerState.CLOSED) {
        expandedContainers.push({
          id: container.id,
          row,
          type: container.type,
          state: container.state
        });
      }
    }
    
    return { hasActivePanel, expandedContainers, containers };
  });
  
  // Générer le template de colonnes
  const gridTemplateColumns = columnInfo.map(info => {
    // Si la colonne a un panel actif, elle prend 4 colonnes de large
    return info.hasActivePanel ? `${TOTAL_SIZE * 4}px` : `${TOTAL_SIZE}px`;
  }).join(' ');
  
  // Créer le template de lignes avec des tailles ajustées pour les conteneurs expandés
  const gridTemplateRows = allRows.map(rowIndex => {
    // Vérifier si une cellule dans cette ligne nécessite une hauteur spéciale
    let height = TOTAL_SIZE; // Taille par défaut
    
    for (const column of columnInfo) {
      for (const expanded of column.expandedContainers) {
        if (expanded.row === rowIndex) {
          // Container oneone_up (FREE): agrandir en hauteur mais garder le point d'ancrage
          if (expanded.type === ContainerType.FREE && expanded.state === ContainerState.FREE) {
            height = TOTAL_SIZE; // La hauteur ne change pas, le container s'étire vers le haut et garde sa position
            break;
          }
          // Container oneone_down (ADOPTED): 260px au lieu de 128px
          else if (expanded.type === ContainerType.ADOPTED && expanded.state === ContainerState.ADOPTED) {
            height = 260;
            break;
          }
          // Container onehalf_down (ADOPT): 192px au lieu de 128px
          else if (expanded.type === ContainerType.ADOPT && expanded.state === ContainerState.ADOPT) {
            height = 192;
            break;
          }
        }
      }
    }
    
    return `${height}px`;
  }).join(' ');
  
  // Créer les cellules de la grille
  const gridCells = [];

  // Parcourir chaque position définie (colonnes × rangées)
  for (const col of allColumns) {
    const colContainers = containersByPosition.get(col);
    if (!colContainers) continue;

    // Vérifier si cette colonne a un panel actif
    const colContainersArray = Array.from(colContainers.values());
    const hasColPanel = colContainersArray.some(container => activePanels.has(container.id));
    
    // Déterminer la "span" horizontale pour cette colonne
    const colSpan = hasColPanel ? 4 : 1;
    
    // Index de la colonne dans la grille
    const colIndex = allColumns.indexOf(col);
    
    // Pour chaque container dans cette colonne
    for (const [row, container] of Array.from(colContainers.entries())) {
      // Récupérer le décalage vertical (s'il y en a)
      const verticalOffset = verticalShifts.get(container.id) || 0;
      
      // Position de la ligne dans la grille
      const rowIndex = allRows.indexOf(row);
      
      // Le panel associé à ce container est-il actif?
      const isPanelActive = activePanels.has(container.id);
      
      // Traitement spécial pour les containers ouverts
      if (container.state !== ContainerState.CLOSED) {
        // Pour le container FREE (oneone_up)
        if (container.type === ContainerType.FREE && container.state === ContainerState.FREE) {
          // Ajouter un container FREE avec expansion vers le haut
          gridCells.push(
            <div
              key={`container-${container.id}`}
              className="relative"
              style={{
                gridColumn: `${colIndex + 1} / span ${colSpan}`,
                gridRow: `${rowIndex + 1}`,
                transform: `translateY(${verticalOffset}px)`,
                transition: 'transform 0.3s ease',
                zIndex: isPanelActive ? 50 : 10
              }}
            >
              {/* Container avec expansion vers le haut */}
              <div className="absolute" style={{ width: CONTAINER_SIZE, height: 260, left: 0, top: -132 }}>
                <div className="bg-green-100 absolute w-full h-full z-0 opacity-40 rounded-md"></div>
                <Container
                  id={container.id}
                  state={container.state}
                  type={container.type}
                  position={{ left: 0, top: 132 }} // Décaler pour que la partie basse soit positionnée correctement
                  onClick={() => handleContainerClick(container.id)}
                  onPanelToggle={() => handlePanelToggle(container.id)}
                  debugMode={debugMode}
                />
              </div>
              
              {/* Bande du panel dormant */}
              <div
                className="absolute bg-white"
                style={{
                  left: CONTAINER_SIZE,
                  top: 0,
                  width: 4,
                  height: CONTAINER_SIZE,
                  opacity: isPanelActive ? 1 : 0.2,
                  zIndex: 5
                }}
              />
              
              {/* Panel actif */}
              {isPanelActive && (
                <div
                  className="absolute bg-white shadow rounded-md"
                  style={{
                    left: CONTAINER_SIZE + 8,
                    top: 0,
                    width: (TOTAL_SIZE * 3) - 16,
                    maxHeight: '80vh',
                    zIndex: 100
                  }}
                >
                  <div className="p-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-bold">Container #{container.id}</h3>
                      <button className="rounded-full w-6 h-6 bg-gray-100 hover:bg-gray-200"
                        onClick={() => handlePanelToggle(container.id)}>×</button>
                    </div>
                    <p>Type: {container.type} (oneone_up)</p>
                    <p>State: {container.state}</p>
                  </div>
                </div>
              )}
            </div>
          );
        }
        // Pour le container ADOPTED (oneone_down)
        else if (container.type === ContainerType.ADOPTED && container.state === ContainerState.ADOPTED) {
          // Calculer le span vertical (2 lignes pour 260px)
          const rowSpan = 2;
          
          gridCells.push(
            <div
              key={`container-${container.id}`}
              className="relative"
              style={{
                gridColumn: `${colIndex + 1} / span ${colSpan}`,
                gridRow: `${rowIndex + 1} / span ${rowSpan}`,
                transform: `translateY(${verticalOffset}px)`,
                transition: 'transform 0.3s ease',
                zIndex: isPanelActive ? 50 : 10
              }}
            >
              {/* Container avec extension vers le bas */}
              <div className="absolute" style={{ width: CONTAINER_SIZE, height: 260, left: 0, top: 0 }}>
                <ContainerFactory
                  id={container.id}
                  state={container.state}
                  type={container.type}
                  position={{ left: 0, top: 0 }}
                  onClick={() => handleContainerClick(container.id)}
                  onPanelToggle={() => handlePanelToggle(container.id)}
                  debugMode={debugMode}
                />
              </div>
              
              {/* Bande du panel dormant */}
              <div
                className="absolute bg-white"
                style={{
                  left: CONTAINER_SIZE,
                  top: 0,
                  width: 4,
                  height: 260,
                  opacity: isPanelActive ? 1 : 0.2,
                  zIndex: 5
                }}
              />
              
              {/* Panel actif */}
              {isPanelActive && (
                <div
                  className="absolute bg-white shadow rounded-md"
                  style={{
                    left: CONTAINER_SIZE + 8,
                    top: 0, 
                    width: (TOTAL_SIZE * 3) - 16,
                    maxHeight: '80vh',
                    zIndex: 100
                  }}
                >
                  <div className="p-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-bold">Container #{container.id}</h3>
                      <button className="rounded-full w-6 h-6 bg-gray-100 hover:bg-gray-200"
                        onClick={() => handlePanelToggle(container.id)}>×</button>
                    </div>
                    <p>Type: {container.type} (oneone_down)</p>
                    <p>State: {container.state}</p>
                  </div>
                </div>
              )}
            </div>
          );
        }
        // Pour le container ADOPT (onehalf_down)
        else if (container.type === ContainerType.ADOPT && container.state === ContainerState.ADOPT) {
          // Calculer le span vertical (2 lignes pour 192px)
          const rowSpan = 2;
          
          gridCells.push(
            <div
              key={`container-${container.id}`}
              className="relative"
              style={{
                gridColumn: `${colIndex + 1} / span ${colSpan}`,
                gridRow: `${rowIndex + 1} / span ${rowSpan}`,
                transform: `translateY(${verticalOffset}px)`,
                transition: 'transform 0.3s ease',
                zIndex: isPanelActive ? 50 : 10
              }}
            >
              {/* Container avec extension partielle vers le bas */}
              <div className="absolute" style={{ width: CONTAINER_SIZE, height: 192, left: 0, top: 0 }}>
                <ContainerFactory
                  id={container.id}
                  state={container.state}
                  type={container.type}
                  position={{ left: 0, top: 0 }}
                  onClick={() => handleContainerClick(container.id)}
                  onPanelToggle={() => handlePanelToggle(container.id)}
                  debugMode={debugMode}
                />
              </div>
              
              {/* Bande du panel dormant */}
              <div
                className="absolute bg-white"
                style={{
                  left: CONTAINER_SIZE,
                  top: 0,
                  width: 4,
                  height: 192,
                  opacity: isPanelActive ? 1 : 0.2,
                  zIndex: 5
                }}
              />
              
              {/* Panel actif */}
              {isPanelActive && (
                <div
                  className="absolute bg-white shadow rounded-md"
                  style={{
                    left: CONTAINER_SIZE + 8,
                    top: 0,
                    width: (TOTAL_SIZE * 3) - 16,
                    maxHeight: '80vh',
                    zIndex: 100
                  }}
                >
                  <div className="p-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-bold">Container #{container.id}</h3>
                      <button className="rounded-full w-6 h-6 bg-gray-100 hover:bg-gray-200"
                        onClick={() => handlePanelToggle(container.id)}>×</button>
                    </div>
                    <p>Type: {container.type} (onehalf_down)</p>
                    <p>State: {container.state}</p>
                  </div>
                </div>
              )}
            </div>
          );
        }
      } 
      // Container fermé (standard)
      else {
        gridCells.push(
          <div
            key={`container-${container.id}`}
            className="relative"
            style={{
              gridColumn: `${colIndex + 1} / span ${colSpan}`,
              gridRow: `${rowIndex + 1}`,
              transform: `translateY(${verticalOffset}px)`,
              transition: 'transform 0.3s ease',
              zIndex: isPanelActive ? 50 : 10
            }}
          >
            {/* Container standard */}
            <div className="absolute" style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE, left: 0, top: 0 }}>
              <ContainerFactory
                id={container.id}
                state={container.state}
                type={container.type}
                position={{ left: 0, top: 0 }}
                onClick={() => handleContainerClick(container.id)}
                onPanelToggle={() => handlePanelToggle(container.id)}
                debugMode={debugMode}
              />
            </div>
            
            {/* Bande du panel dormant */}
            <div
              className="absolute bg-white"
              style={{
                left: CONTAINER_SIZE,
                top: 0,
                width: 4,
                height: CONTAINER_SIZE,
                opacity: isPanelActive ? 1 : 0.2,
                zIndex: 5
              }}
            />
            
            {/* Panel actif */}
            {isPanelActive && (
              <div
                className="absolute bg-white shadow rounded-md"
                style={{
                  left: CONTAINER_SIZE + 8,
                  top: 0,
                  width: (TOTAL_SIZE * 3) - 16,
                  maxHeight: '80vh',
                  zIndex: 100
                }}
              >
                <div className="p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-bold">Container #{container.id}</h3>
                    <button className="rounded-full w-6 h-6 bg-gray-100 hover:bg-gray-200"
                      onClick={() => handlePanelToggle(container.id)}>×</button>
                  </div>
                  <p>Type: {container.type}</p>
                  <p>State: {container.state}</p>
                </div>
              </div>
            )}
          </div>
        );
      }
    }
  }
  
  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-gray-100"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grille principale avec CSS Grid */}
      <div
        className="absolute transition-transform duration-100"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`,
          display: 'grid',
          gridTemplateColumns,
          gridTemplateRows,
          gridAutoFlow: 'dense', // Important pour que les cellules remplissent l'espace disponible
          gap: '0px'
        }}
      >
        {/* Grid lignes de debug */}
        {debugMode && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              width: GRID_SIZE * TOTAL_SIZE,
              height: GRID_SIZE * TOTAL_SIZE
            }}
          >
            {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
              <div
                key={`h-line-${i}`}
                className="absolute bg-gray-200"
                style={{
                  left: 0,
                  top: i * TOTAL_SIZE,
                  width: '100%',
                  height: '1px'
                }}
              />
            ))}
            {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
              <div
                key={`v-line-${i}`}
                className="absolute bg-gray-200"
                style={{
                  left: i * TOTAL_SIZE,
                  top: 0,
                  width: '1px',
                  height: '100%'
                }}
              />
            ))}
          </div>
        )}

        {/* Cellules de la grille */}
        {gridCells}
      </div>
    </div>
  );
}