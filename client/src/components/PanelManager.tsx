import React, { useState, useEffect } from 'react';
import { ContainerData, PanelInfo, ContainerState, ContainerType } from '@/types/common';

// Constants importées depuis GrilleChimerique
const CONTAINER_SIZE = 128;
const CONTAINER_SPACING = 4;
const PANEL_WIDTH = 392;
const GRID_SIZE = 32;

// Type pour le contenu de la Map d'activePanels
type PanelEntry = [number, PanelInfo];

interface PanelManagerProps {
  containers: ContainerData[];
  activePanels: Map<number, PanelInfo>;
  setActivePanels: (panels: Map<number, PanelInfo>) => void;
  setContainerShifts: (shifts: Map<number, number>) => void;
  getGridPosition: (container: ContainerData) => { col: number; row: number };
  setForceRender?: (fn: (prev: number) => number) => void;
}

export function usePanelManager({
  containers,
  activePanels,
  setActivePanels,
  setContainerShifts,
  getGridPosition,
  setForceRender
}: PanelManagerProps) {
  
  // Fonction pour calculer les décalages des containers
  const calculateContainerShifts = () => {
    const newShifts = new Map<number, number>();
    
    // Pour chaque container actif
    containers.forEach(container => {
      if (!container.position) return;
      
      // Calculer le décalage pour ce container
      const shift = scanGridAndGetShift(container.id);
      
      // Si un décalage est nécessaire, l'ajouter à la map
      if (shift > 0) {
        newShifts.set(container.id, shift);
      }
    });
    
    return newShifts;
  };
  
  // Scanner la grille pour obtenir le décalage d'un container
  const scanGridAndGetShift = (containerId: number) => {
    const targetContainer = containers.find(c => c.id === containerId);
    if (!targetContainer || !targetContainer.position) return 0;
    
    const targetPos = getGridPosition(targetContainer);
    
    // Stocker les panelIds pour tous les panels à la gauche de ce container
    const panelsToLeft: number[] = [];
    
    // Parcourir tous les panels actifs
    Array.from(activePanels.entries()).forEach(([panelId, panelInfo]) => {
      // Trouver le container associé au panel
      const panelContainer = containers.find(c => c.id === panelId);
      if (!panelContainer || !panelContainer.position) return;
      
      const panelPos = getGridPosition(panelContainer);
      
      // Si le panel est à gauche de la colonne cible
      if (panelPos.col < targetPos.col) {
        panelsToLeft.push(panelId);
      }
    });
    
    // Calculer le décalage total (un panel = PANEL_WIDTH+4px de décalage)
    const totalShift = panelsToLeft.length * (PANEL_WIDTH + 4);
    
    if (totalShift > 0 && panelsToLeft.length > 0) {
      console.log(`Container ${containerId} (${targetPos.row},${targetPos.col}) a ${panelsToLeft.length} panel(s) à sa gauche: ${panelsToLeft.map(id => `panel ${id} (col=${getGridPosition(containers.find(c => c.id === id)!).col})`).join(', ')}`);
      console.log(`Container ${containerId} (${targetPos.row},${targetPos.col}) décalé de ${totalShift}px au total`);
    }
    
    return totalShift;
  };
  
  // Gestion de la fermeture d'un panel
  const handleClosePanel = (containerId: number) => {
    // Faire une copie des panels actuels sans celui qu'on ferme
    const panelsToKeep = Array.from(activePanels.keys())
      .filter(id => id !== containerId);
    
    // Créer un nouvel ensemble de panels
    rebuildPanels(panelsToKeep);
  };
  
  // Reconstruire complètement tous les panels
  const rebuildPanels = (panelIds: number[]) => {
    // Vider les panels actuels
    setActivePanels(new Map());
    setContainerShifts(new Map());
    
    // Délai court pour s'assurer que le vidage est effectué
    setTimeout(() => {
      if (panelIds.length === 0) {
        // Si plus aucun panel, rien à faire
        if (setForceRender) setForceRender(prev => prev + 1);
        return;
      }
      
      // Trier les panels par colonne (gauche à droite)
      const sortedPanelData = panelIds
        .map(id => {
          const container = containers.find(c => c.id === id);
          if (!container || !container.position) return null;
          
          const pos = getGridPosition(container);
          return { id, col: pos.col, row: pos.row };
        })
        .filter(panel => panel !== null)
        .sort((a, b) => a!.col - b!.col);
      
      // Reconstruire les panels dans l'ordre
      const newPanels = new Map<number, PanelInfo>();
      
      sortedPanelData.forEach((panelInfo, index) => {
        if (!panelInfo) return;
        
        // Trouver le container associé
        const container = containers.find(c => c.id === panelInfo.id);
        if (!container || !container.position) return;
        
        const gridPos = getGridPosition(container);
        
        // Positionnement horizontal simplifié:
        // 1. Position de base du container
        const containerLeft = gridPos.col * (CONTAINER_SIZE + CONTAINER_SPACING);
        
        // 2. Position initiale du panel (juste à droite du container)
        const initialPanelLeft = containerLeft + CONTAINER_SIZE + 20;
        
        // 3. Décalage progressif vers la droite en fonction de l'index
        // Ce grand décalage (450px) garantit que les panels ne se chevauchent jamais
        const panelOffset = index * 450;
        
        // 4. Position finale du panel
        const finalLeft = initialPanelLeft + panelOffset;
        
        // Position verticale - légèrement décalée vers le haut
        const baseTop = Math.max(0, gridPos.row * (CONTAINER_SIZE + CONTAINER_SPACING) - 64);
        
        // Ajouter le panel
        newPanels.set(panelInfo.id, {
          columnIndex: gridPos.col,
          position: {
            left: finalLeft,
            top: baseTop
          }
        });
      });
      
      // Appliquer les changements
      setActivePanels(newPanels);
      
      // Recalculer les décalages des containers
      const newShifts = calculateContainerShifts();
      setContainerShifts(newShifts);
      
      // Forcer un rafraîchissement
      if (setForceRender) setForceRender(prev => prev + 1);
    }, 50);
  };
  
  // Gestion de l'ouverture/fermeture des panels
  const handlePanelToggle = (containerId: number) => {
    // Trouver le container
    const targetContainer = containers.find(c => c.id === containerId);
    if (!targetContainer || !targetContainer.position) {
      console.error("Container non trouvé ou sans position:", containerId);
      return;
    }
    
    // Vérifier si le panel est déjà actif (fermeture)
    const isAlreadyActive = activePanels.has(containerId);
    
    if (isAlreadyActive) {
      // Fermeture: retirer ce panel de la liste
      handleClosePanel(containerId);
    } else {
      // Ouverture: ajouter ce panel à la liste existante
      const panelIds = [...Array.from(activePanels.keys()), containerId];
      rebuildPanels(panelIds);
    }
  };
  
  return {
    handlePanelToggle,
    handleClosePanel,
    rebuildPanels
  };
}