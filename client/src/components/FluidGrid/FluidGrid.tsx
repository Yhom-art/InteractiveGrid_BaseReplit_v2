import React, { useState, useEffect, useCallback } from 'react';
import { Container, ContainerExpansionType, PanelData, DEFAULT_GRID_CONFIG, GridConfig } from './types';
import { FluidContainer } from './FluidContainer';
import { FluidPanel } from './FluidPanel';
import { ContainerType } from '@/types/common';

interface FluidGridProps {
  // Configuration optionnelle (utilisera les valeurs par défaut si non fournies)
  config?: Partial<GridConfig>;
  
  // Centre optionnel de la grille visible (par défaut = le centre de la grille complète)
  visibleCenter?: { col: number, row: number };
  
  // Fonction de debug optionnelle
  debug?: boolean;
}

/**
 * FluidGrid - Grille fluide avec containers et panels
 * - Système de containers avec expansions multidirectionnelles
 * - Panels liés aux containers ouverts avec décalage des colonnes
 * - Interface complètement réactive
 */
export function FluidGrid({ 
  config: userConfig, 
  visibleCenter,
  debug = false 
}: FluidGridProps) {
  // Utiliser useRef pour stocker la configuration et éviter les re-rendus
  const configRef = React.useRef({ ...DEFAULT_GRID_CONFIG, ...(userConfig || {}) });
  const config = configRef.current;
  
  // Déterminer le centre visible - également avec useRef pour stabilité
  const centerRef = React.useRef(visibleCenter || {
    col: config.centerCol,
    row: config.centerRow
  });
  const center = centerRef.current;
  
  // Fonction pour générer les containers initiaux
  const generateInitialContainers = React.useCallback(() => {
    const initialContainers: Container[] = [];
    
    // Calculer la zone visible
    const startCol = center.col - Math.floor(config.visibleCols / 2);
    const startRow = center.row - Math.floor(config.visibleRows / 2);
    const endCol = startCol + config.visibleCols;
    const endRow = startRow + config.visibleRows;
    
    // Créer une portion visible de la grille
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        // Skip les positions hors limites de la grille
        if (row < 0 || row >= config.gridRows || col < 0 || col >= config.gridCols) {
          continue;
        }
        
        // Déterminer le type selon la position par rapport au centre
        const distanceFromCenter = Math.sqrt(
          Math.pow(col - config.centerCol, 2) + Math.pow(row - config.centerRow, 2)
        );
        
        // Type basé sur la distance
        let type: any;
        if (distanceFromCenter < 3) {
          type = 'free';
        } else if (distanceFromCenter < 6) {
          type = 'adopt';
        } else if (distanceFromCenter < 10) {
          type = 'adopted';
        } else {
          type = 'editorial';
        }
        
        // Type d'expansion
        const expansionType = ((col + row) % 4 === 0) 
          ? ContainerExpansionType.NONE
          : ((col + row) % 4 === 1)
            ? ContainerExpansionType.ONEONE_UP
            : ((col + row) % 4 === 2)
              ? ContainerExpansionType.ONEONE_DWN
              : ContainerExpansionType.ONEHALF_DWN;
        
        // ID unique
        const id = row * config.gridCols + col;
        
        initialContainers.push({
          id,
          col,
          row,
          type,
          expansionType,
          isExpanded: false
        });
      }
    }
    
    return initialContainers;
  }, []);
  
  // État de la grille - initialiser directement avec les containers
  const [containers, setContainers] = useState<Container[]>(() => {
    const initial = generateInitialContainers();
    if (debug) console.log(`FluidGrid: ${initial.length} containers générés`);
    return initial;
  });
  
  const [panels, setPanels] = useState<Map<number, PanelData>>(new Map());
  
  // État des décalages
  const [columnOffsets, setColumnOffsets] = useState<number[]>(
    Array(config.gridCols).fill(0)
  );
  const [verticalShifts, setVerticalShifts] = useState<Map<number, number>>(
    new Map()
  );
  
  // Générer les containers initiaux une seule fois au montage ou quand le centre change
  useEffect(() => {
    const initialContainers: Container[] = [];
    
    // Calculer la zone visible
    const startCol = center.col - Math.floor(config.visibleCols / 2);
    const startRow = center.row - Math.floor(config.visibleRows / 2);
    const endCol = startCol + config.visibleCols;
    const endRow = startRow + config.visibleRows;
    
    // Créer une portion visible de la grille
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        // Skip les positions hors limites de la grille
        if (row < 0 || row >= config.gridRows || col < 0 || col >= config.gridCols) {
          continue;
        }
        
        // Déterminer le type selon la position par rapport au centre
        const distanceFromCenter = Math.sqrt(
          Math.pow(col - config.centerCol, 2) + Math.pow(row - config.centerRow, 2)
        );
        
        // Cette partie peut être remplacée par une distribution de types plus personnalisée
        // Pour l'instant, on utilise une distribution basée sur la distance du centre
        let type: any; // Utiliser le bon type ContainerType
        if (distanceFromCenter < 3) {
          type = 'free'; // ContainerType.FREE
        } else if (distanceFromCenter < 6) {
          type = 'adopt'; // ContainerType.ADOPT
        } else if (distanceFromCenter < 10) {
          type = 'adopted'; // ContainerType.ADOPTED
        } else {
          type = 'editorial'; // ContainerType.EDITORIAL
        }
        
        // Déterminer le type d'expansion
        // Pour l'instant, distribution pseudo-aléatoire mais déterministe
        let expansionType: ContainerExpansionType;
        
        // Au centre, plus de NONE pour garder une zone stable
        if (col === config.centerCol && row === config.centerRow) {
          expansionType = ContainerExpansionType.NONE;
        } 
        // Pour les containers en haut, favoriser ONEONE_UP
        else if (row < config.centerRow && (col * row) % 3 === 0) {
          expansionType = ContainerExpansionType.ONEONE_UP;
        } 
        // Pour les containers en bas, favoriser ONEONE_DWN et ONEHALF_DWN
        else if (row > config.centerRow && (col * row) % 3 === 1) {
          expansionType = (col + row) % 2 === 0
            ? ContainerExpansionType.ONEONE_DWN 
            : ContainerExpansionType.ONEHALF_DWN;
        } 
        // Distribution pour les autres
        else {
          const expansionIndex = (col * row) % 4;
          expansionType = [
            ContainerExpansionType.NONE,
            ContainerExpansionType.ONEONE_UP,
            ContainerExpansionType.ONEONE_DWN,
            ContainerExpansionType.ONEHALF_DWN
          ][expansionIndex];
        }
        
        // Ajuster l'ID pour correspondre à la position réelle dans la grille
        const id = row * config.gridCols + col;
        
        initialContainers.push({
          id,
          col,
          row,
          type,
          expansionType,
          isExpanded: false
        });
      }
    }
    
    setContainers(initialContainers);
    if (debug) {
      console.log(`FluidGrid: ${initialContainers.length} containers générés`);
    }
    
    // Dépendances réduites : uniquement le centre, pas la config complète qui change à chaque rendu
  }, [center.col, center.row, config.centerCol, config.centerRow, config.gridCols, config.gridRows, config.visibleCols, config.visibleRows, debug]);

  // Calculer les décalages horizontaux et verticaux
  useEffect(() => {
    if (containers.length === 0) return;
    
    // 1. Calculer les décalages horizontaux (colonnes)
    const newOffsets = Array(config.gridCols).fill(0);
    
    // Parcourir tous les panels ouverts, triés par colonne
    const openPanels = Array.from(panels.values())
      .filter(panel => panel.isOpen)
      .sort((a, b) => a.containerCol - b.containerCol);
    
    // Pour chaque panel ouvert, calculer l'impact sur les colonnes à droite
    openPanels.forEach(panel => {
      const panelCol = panel.containerCol;
      
      // Toutes les colonnes à droite de celle-ci sont décalées
      for (let col = panelCol + 1; col < config.gridCols; col++) {
        newOffsets[col] += config.panelWidth + config.panelGap;
      }
    });
    
    // 2. Calculer les décalages verticaux (containers)
    const newVerticalShifts = new Map<number, number>();
    
    // Pour chaque colonne
    for (let col = 0; col < config.gridCols; col++) {
      // Récupérer les containers de cette colonne, triés par row
      const colContainers = containers
        .filter(c => c.col === col)
        .sort((a, b) => a.row - b.row);
      
      // Accumuler le décalage vertical en parcourant la colonne de haut en bas
      let accumulatedShift = 0;
      
      for (let i = 0; i < colContainers.length; i++) {
        const container = colContainers[i];
        const containerId = container.id;
        
        // Appliquer le décalage accumulé à ce container
        if (accumulatedShift > 0) {
          newVerticalShifts.set(containerId, accumulatedShift);
        }
        
        // Si ce container est expandé, calculer combien il pousse les suivants
        if (container.isExpanded) {
          const expansionType = container.expansionType;
          const expansionInfo = config.expansions[expansionType];
          
          // Pour les expansions vers le bas, on accumule le décalage
          if (expansionType === ContainerExpansionType.ONEONE_DWN || 
              expansionType === ContainerExpansionType.ONEHALF_DWN) {
            accumulatedShift += expansionInfo.pushAmount;
          }
        }
      }
      
      // Deuxième passe pour les expansions vers le haut
      for (let i = colContainers.length - 1; i >= 0; i--) {
        const container = colContainers[i];
        
        if (container.isExpanded && container.expansionType === ContainerExpansionType.ONEONE_UP) {
          const expansionInfo = config.expansions[container.expansionType];
          
          // Décaler tous les containers au-dessus
          for (let j = i - 1; j >= 0; j--) {
            const upperContainer = colContainers[j];
            const currentShift = newVerticalShifts.get(upperContainer.id) || 0;
            newVerticalShifts.set(
              upperContainer.id, 
              currentShift - Math.abs(expansionInfo.offsetTop)
            );
          }
        }
      }
    }
    
    // Mettre à jour les états
    setColumnOffsets(newOffsets);
    setVerticalShifts(newVerticalShifts);
    
    if (debug) {
      console.log('Décalages horizontaux:', newOffsets);
      console.log('Décalages verticaux:', Array.from(newVerticalShifts.entries())
        .map(([id, shift]) => `#${id}: ${shift}px`)
      );
    }
  }, [containers, panels, config, debug]);

  // Fonction pour basculer l'état d'expansion d'un container
  const toggleContainerExpansion = useCallback((containerId: number) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    const newContainers = [...containers];
    const containerIndex = newContainers.findIndex(c => c.id === containerId);
    
    if (containerIndex === -1) return;
    
    // Inverser l'état d'expansion
    const newExpanded = !container.isExpanded;
    
    // Si on réduit le container, vérifier si un panel était ouvert et le fermer
    if (!newExpanded && panels.has(containerId)) {
      const newPanels = new Map(panels);
      newPanels.delete(containerId);
      setPanels(newPanels);
      if (debug) {
        console.log(`Panel fermé lors de la réduction du container ${containerId}`);
      }
    }
    
    // Mettre à jour le container
    newContainers[containerIndex] = {
      ...newContainers[containerIndex],
      isExpanded: newExpanded
    };
    
    setContainers(newContainers);
    if (debug) {
      console.log(`Container ${containerId} ${newExpanded ? 'agrandi' : 'réduit'} (${container.expansionType})`);
    }
  }, [containers, panels, debug]);
  
  // Fonction pour basculer l'ouverture d'un panel
  const togglePanel = useCallback((containerId: number) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    // Un container doit être expandé pour avoir un panel
    if (!container.isExpanded) {
      if (debug) {
        console.log(`Le container ${containerId} doit être agrandi avant d'ouvrir un panel`);
      }
      return;
    }
    
    // Créer une copie pour modification
    const newPanels = new Map(panels);
    
    // Règle: Un seul panel par colonne
    // Chercher si un autre panel est déjà ouvert dans cette colonne
    const existingPanelInColumn = Array.from(newPanels.values()).find(
      panel => panel.containerCol === container.col && panel.isOpen && panel.containerId !== containerId
    );
    
    // Si un autre panel existe déjà dans cette colonne, le fermer
    if (existingPanelInColumn) {
      newPanels.delete(existingPanelInColumn.containerId);
      if (debug) {
        console.log(`Panel fermé: ${existingPanelInColumn.containerId}`);
      }
    }
    
    // Si ce panel existe déjà, le fermer
    if (newPanels.has(containerId)) {
      newPanels.delete(containerId);
      if (debug) {
        console.log(`Panel fermé: ${containerId}`);
      }
    } 
    // Sinon, ouvrir un nouveau panel
    else {
      newPanels.set(containerId, {
        containerId,
        containerCol: container.col,
        containerRow: container.row,
        containerType: container.type,
        isOpen: true
      });
      if (debug) {
        console.log(`Panel ouvert: ${containerId}`);
      }
    }
    
    // Mettre à jour l'état
    setPanels(newPanels);
    
    if (debug) {
      console.log('Panels actifs:', Array.from(newPanels.entries())
        .filter(([_, panel]) => panel.isOpen)
        .map(([id, _]) => id)
      );
    }
  }, [containers, panels, debug]);
  
  // Gestionnaire de clic sur un container
  const handleContainerClick = useCallback((containerId: number, event: React.MouseEvent) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    // Si Alt est pressé, c'est un clic pour ouvrir/fermer un panel
    if (event.altKey) {
      if (container.isExpanded) {
        togglePanel(containerId);
      } else {
        if (debug) {
          console.log("Il faut d'abord agrandir le container avant d'ouvrir un panel");
        }
      }
    } 
    // Si le container est déjà agrandi, ouvrir son panel
    else if (container.isExpanded) {
      togglePanel(containerId);
      if (debug) {
        console.log("Container déjà agrandi, ouverture du panel");
      }
    }
    // Sinon, c'est un clic pour agrandir le container
    else {
      toggleContainerExpansion(containerId);
    }
  }, [containers, toggleContainerExpansion, togglePanel, debug]);

  // Calculer les coordonnées pour la zone d'affichage de la grille
  const viewportWidth = (config.containerSize + config.containerGap) * config.visibleCols;
  const viewportHeight = (config.containerSize + config.containerGap) * config.visibleRows;

  return (
    <div className="fluid-grid-wrapper" style={{ padding: '10px' }}>
      {/* Conteneur global */}
      <div className="fluid-grid-viewport" 
        style={{
          position: 'relative',
          width: '100%',
          height: 'calc(100vh - 200px)', // Hauteur adaptable
          minHeight: '600px',
          overflow: 'hidden',
          border: '1px solid #ddd',
          borderRadius: '8px',
          background: '#fafafa'
        }}
      >
        {/* Zone visible centrée */}
        <div className="fluid-grid-content"
          style={{
            position: 'absolute',
            width: viewportWidth,
            height: viewportHeight,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            border: debug ? '1px dashed #999' : 'none'
          }}
        >
          {/* Containers */}
          {containers.map(container => (
            <FluidContainer
              key={`container-${container.id}`}
              container={container}
              config={config}
              columnOffset={columnOffsets[container.col] || 0}
              verticalShift={verticalShifts.get(container.id) || 0}
              hasPanel={panels.has(container.id) && panels.get(container.id)!.isOpen}
              onContainerClick={handleContainerClick}
              visibleStartCol={center.col - Math.floor(config.visibleCols / 2)}
              visibleStartRow={center.row - Math.floor(config.visibleRows / 2)}
            />
          ))}
          
          {/* Panels */}
          {Array.from(panels.values())
            .filter(panel => panel.isOpen)
            .map(panel => (
              <FluidPanel
                key={`panel-${panel.containerId}`}
                panel={panel}
                config={config}
                container={containers.find(c => c.id === panel.containerId)!}
                onClose={() => togglePanel(panel.containerId)}
                columnOffset={columnOffsets[panel.containerCol] || 0}
                visibleStartCol={center.col - Math.floor(config.visibleCols / 2)}
                visibleStartRow={center.row - Math.floor(config.visibleRows / 2)}
              />
            ))
          }
          
          {/* Indicateur de centre (visible en mode debug) */}
          {debug && (
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,0,0,0.5)',
              transform: 'translate(-50%, -50%)',
              zIndex: 100
            }} />
          )}
        </div>
      </div>
      
      {/* Zone de debug - visible uniquement en mode debug */}
      {debug && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          background: '#f0f0f0',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <h3>Debug Info</h3>
          <div>
            <strong>Centre visible:</strong> Col {center.col}, Row {center.row}
          </div>
          <div>
            <strong>Containers:</strong> {containers.length}
          </div>
          <div>
            <strong>Panels ouverts:</strong> {Array.from(panels.values()).filter(p => p.isOpen).length}
          </div>
          <div>
            <strong>Colonnes décalées:</strong> {columnOffsets.filter(o => o > 0).length}
          </div>
        </div>
      )}
    </div>
  );
}