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
  // Configuration de la grille (fusion des valeurs par défaut avec celles fournies)
  const config = { ...DEFAULT_GRID_CONFIG, ...(userConfig || {}) };
  
  // Déterminer le centre visible
  const center = visibleCenter || {
    col: config.centerCol,
    row: config.centerRow
  };
  
  // État de la grille
  const [containers, setContainers] = useState<Container[]>([]);
  const [panels, setPanels] = useState<Map<number, PanelData>>(new Map());
  
  // État des décalages
  const [columnOffsets, setColumnOffsets] = useState<number[]>(
    Array(config.gridCols).fill(0)
  );
  const [verticalShifts, setVerticalShifts] = useState<Map<number, number>>(
    new Map()
  );
  
  // Générer les containers initiaux
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
        
        // Type basé sur la distance
        let type: ContainerType;
        if (distanceFromCenter < 3) {
          type = ContainerType.FREE;
        } else if (distanceFromCenter < 6) {
          type = ContainerType.ADOPT;
        } else if (distanceFromCenter < 10) {
          type = ContainerType.ADOPTED;
        } else {
          type = ContainerType.EDITORIAL;
        }
        
        // Type d'expansion
        const expansionIndex = (col * row) % 4;
        const expansionTypes = [
          ContainerExpansionType.NONE,
          ContainerExpansionType.ONEONE_UP,
          ContainerExpansionType.ONEONE_DWN,
          ContainerExpansionType.ONEHALF_DWN
        ];
        const expansionType = expansionTypes[expansionIndex];
        
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
    
    setContainers(initialContainers);
    if (debug) {
      console.log(`FluidGrid: ${initialContainers.length} containers générés`);
    }
  }, [center.col, center.row, config.centerCol, config.centerRow, config.gridCols, config.gridRows, config.visibleCols, config.visibleRows, debug]);
  
  // Calculer les décalages horizontaux et verticaux
  useEffect(() => {
    if (containers.length === 0) return;
    
    // Calculer les décalages horizontaux (pour les panels)
    const newColumnOffsets = Array(config.gridCols).fill(0);
    
    // Parcourir tous les panels ouverts
    Array.from(panels.entries())
      .filter(([_, panel]) => panel.isOpen)
      .sort(([_, a], [__, b]) => a.containerCol - b.containerCol)
      .forEach(([_, panel]) => {
        const panelCol = panel.containerCol;
        
        // Décaler toutes les colonnes à droite de celle-ci
        for (let col = panelCol + 1; col < config.gridCols; col++) {
          newColumnOffsets[col] += config.panelWidth + config.panelGap;
        }
      });
    
    // Calculer les décalages verticaux (pour les containers expandés)
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
        
        // Appliquer le décalage accumulé à ce container
        if (accumulatedShift > 0) {
          newVerticalShifts.set(container.id, accumulatedShift);
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
          const expansionInfo = config.expansions[ContainerExpansionType.ONEONE_UP];
          
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
    
    setColumnOffsets(newColumnOffsets);
    setVerticalShifts(newVerticalShifts);
    
    if (debug) {
      console.log('Décalages horizontaux:', newColumnOffsets);
      console.log('Décalages verticaux:', Array.from(newVerticalShifts.entries())
        .map(([id, shift]) => `#${id}: ${shift}px`)
      );
    }
  }, [containers, panels, config, debug]);
  
  // Gérer l'expansion ou la réduction d'un container
  const handleContainerExpand = useCallback((containerId: number) => {
    const containerIndex = containers.findIndex(c => c.id === containerId);
    if (containerIndex === -1) return;
    
    // Créer une copie pour modification
    const newContainers = [...containers];
    const container = newContainers[containerIndex];
    
    // Inverser l'état d'expansion
    const newExpanded = !container.isExpanded;
    
    // Si on réduit le container et qu'il a un panel ouvert, fermer le panel aussi
    if (!newExpanded && panels.has(containerId)) {
      const newPanels = new Map(panels);
      newPanels.delete(containerId);
      setPanels(newPanels);
      if (debug) console.log(`Panel fermé lors de la réduction du container ${containerId}`);
    }
    
    // Mettre à jour le container
    newContainers[containerIndex] = {
      ...newContainers[containerIndex],
      isExpanded: newExpanded
    };
    
    setContainers(newContainers);
    if (debug) console.log(`Container ${containerId} ${newExpanded ? 'agrandi' : 'réduit'} (${container.expansionType})`);
  }, [containers, panels, debug]);
  
  // Gérer l'ouverture ou la fermeture d'un panel
  const handlePanelToggle = useCallback((containerId: number) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    // Un container doit être expandé pour avoir un panel
    if (!container.isExpanded) {
      if (debug) console.log(`Le container ${containerId} doit être agrandi avant d'ouvrir un panel`);
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
      if (debug) console.log(`Panel fermé: ${existingPanelInColumn.containerId}`);
    }
    
    // Si ce panel existe déjà, le fermer
    if (newPanels.has(containerId)) {
      newPanels.delete(containerId);
      if (debug) console.log(`Panel fermé: ${containerId}`);
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
      if (debug) console.log(`Panel ouvert: ${containerId}`);
    }
    
    // Mettre à jour l'état
    setPanels(newPanels);
  }, [containers, panels, debug]);
  
  // Afficher les containers avec leurs positions calculées
  const renderContainers = () => {
    return containers.map(container => {
      // Ajuster la position avec les décalages
      const left = (container.col - (center.col - Math.floor(config.visibleCols / 2))) * 
                   (config.containerSize + config.containerGap) + 
                   columnOffsets[container.col];
      
      // Position de base
      let top = (container.row - (center.row - Math.floor(config.visibleRows / 2))) * 
                (config.containerSize + config.containerGap);
      
      // Ajouter le décalage vertical
      const verticalShift = verticalShifts.get(container.id) || 0;
      top += verticalShift;
      
      // Récupérer les infos d'expansion
      const expansion = config.expansions[container.isExpanded ? container.expansionType : ContainerExpansionType.NONE];
      
      // Ajuster la position verticale pour les expansions vers le haut
      if (container.isExpanded && container.expansionType === ContainerExpansionType.ONEONE_UP) {
        top += expansion.offsetTop;
      }
      
      // Hauteur selon l'expansion
      const height = container.isExpanded ? expansion.height : config.containerSize;
      
      // Vérifier si un panel est ouvert pour ce container
      const hasOpenPanel = panels.has(container.id) && panels.get(container.id)!.isOpen;
      
      return (
        <FluidContainer
          key={`container-${container.id}`}
          container={container}
          size={config.containerSize}
          position={{ left, top }}
          height={height}
          hasOpenPanel={hasOpenPanel}
          onExpand={handleContainerExpand}
          onPanelToggle={handlePanelToggle}
          debug={debug}
        />
      );
    });
  };
  
  // Afficher les panels pour les containers avec des panels ouverts
  const renderPanels = () => {
    // Hauteur totale de la zone visible
    const gridHeight = config.visibleRows * (config.containerSize + config.containerGap);
    
    return Array.from(panels.entries())
      .filter(([_, panel]) => panel.isOpen)
      .map(([containerId, panel]) => {
        // Trouver le container associé à ce panel
        const container = containers.find(c => c.id === containerId);
        if (!container) return null;
        
        // Position du panel (juste à droite du container)
        const left = (container.col - (center.col - Math.floor(config.visibleCols / 2))) * 
                     (config.containerSize + config.containerGap) + 
                     columnOffsets[container.col] + 
                     config.containerSize + 
                     config.containerGap;
        
        // Le panel s'étend du haut de la grille
        const top = 0;
        
        // Calculer la position alignée avec le container
        // (Pour positionner la zone de contenu au même niveau que le container)
        const containerTop = (container.row - (center.row - Math.floor(config.visibleRows / 2))) * 
                            (config.containerSize + config.containerGap);
        
        // Ajouter le décalage vertical du container
        const verticalShift = verticalShifts.get(container.id) || 0;
        let alignedContentTop = containerTop + verticalShift;
        
        // Si le container a une expansion vers le haut, ajuster la position
        if (container.isExpanded && container.expansionType === ContainerExpansionType.ONEONE_UP) {
          const expansion = config.expansions[ContainerExpansionType.ONEONE_UP];
          alignedContentTop += expansion.offsetTop;
        }
        
        return (
          <FluidPanel
            key={`panel-${containerId}`}
            panel={panel}
            container={container}
            position={{ left, top }}
            gridHeight={gridHeight}
            alignedContentTop={alignedContentTop}
            onClose={handlePanelToggle}
            debug={debug}
          />
        );
      });
  };
  
  // Afficher la grille avec les bordures de débug
  return (
    <div 
      className="fluid-grid-container"
      style={{ 
        position: 'relative',
        width: '100%',
        height: config.visibleRows * (config.containerSize + config.containerGap),
        border: debug ? '1px dashed #ccc' : 'none',
        backgroundColor: '#f9f9f9',
        overflow: 'hidden' 
      }}
    >
      {/* Containers */}
      {renderContainers()}
      
      {/* Panels */}
      {renderPanels()}
      
      {/* Info de débug */}
      {debug && (
        <div style={{ 
          position: 'absolute', 
          bottom: 5, 
          right: 5, 
          background: 'rgba(0,0,0,0.7)', 
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px'
        }}>
          {containers.length} containers • {Array.from(panels.values()).filter(p => p.isOpen).length} panels
        </div>
      )}
    </div>
  );
}