import React, { useState, useEffect, useRef } from 'react';
import { ContainerType } from '@/types/common';

// Constantes pour la grille
const GRID_SIZE = 8; // Grille 8x8 simplifiée 
const CONTAINER_SIZE = 128;
const CONTAINER_SPACING = 4;
const PANEL_WIDTH = 300; // Panel plus petit pour l'exemple

// Types simplifiés
interface SimpleContainer {
  id: number;
  col: number;
  row: number;
  type: ContainerType;
}

interface PanelInfo {
  containerId: number;
  position: {
    left: number;
    top: number;
  };
  columnIndex: number;
}

// POC pour démontrer uniquement le fonctionnement panels-grille
export function GridPanelPoc() {
  // État simplifié
  const [containers, setContainers] = useState<SimpleContainer[]>([]);
  const [activePanels, setActivePanels] = useState<Map<number, PanelInfo>>(new Map());
  const [containerShifts, setContainerShifts] = useState<Map<number, number>>(new Map());
  
  // Pour déboguer l'état des panels actifs
  const [panelDebugInfo, setPanelDebugInfo] = useState<string>("Aucun panel actif");
  
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Initialiser des containers simples
  useEffect(() => {
    const initialContainers: SimpleContainer[] = [];
    
    // Créer une grille 8x8 avec des containers divers
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        // Utiliser différents types de container pour tester
        const type = (col + row) % 4 === 0 ? ContainerType.FREE :
                     (col + row) % 4 === 1 ? ContainerType.ADOPT :
                     (col + row) % 4 === 2 ? ContainerType.ADOPTED :
                     ContainerType.EDITORIAL;
        
        initialContainers.push({
          id: row * GRID_SIZE + col,
          col,
          row,
          type
        });
      }
    }
    
    setContainers(initialContainers);
  }, []);
  
  // Calculer les décalages pour la grille
  const calculateContainerShifts = () => {
    const shifts = new Map<number, number>();
    
    // Parcourir tous les containers
    containers.forEach(container => {
      // Calculer le décalage pour ce container
      const shift = getPanelShiftAmount(container.id);
      
      // Si un décalage est nécessaire, l'ajouter à la map
      if (shift > 0) {
        shifts.set(container.id, shift);
      }
    });
    
    return shifts;
  };
  
  // Obtenir le décalage d'un container en fonction des panels à sa gauche
  const getPanelShiftAmount = (containerId: number) => {
    const targetContainer = containers.find(c => c.id === containerId);
    if (!targetContainer) return 0;
    
    // Nombre de panels à gauche de ce container
    let panelsToLeft = 0;
    
    // Parcourir tous les panels actifs
    Array.from(activePanels.entries()).forEach(([id, panelInfo]) => {
      const panelContainer = containers.find(c => c.id === id);
      if (!panelContainer) return;
      
      // Si le panel est à gauche de ce container, incrémenter le compte
      if (panelContainer.col < targetContainer.col) {
        panelsToLeft++;
      }
    });
    
    // Le décalage total est le nombre de panels à gauche multiplié par la largeur du panel
    const shift = panelsToLeft * (PANEL_WIDTH + 10);
    
    return shift;
  };
  
  // Version complètement repensée pour gérer l'ouverture et la fermeture des panels
  const handlePanelToggle = (containerId: number) => {
    console.log(`Container ${containerId} cliqué`);
    
    // Vérifier si le panel est déjà ouvert
    const isAlreadyOpen = activePanels.has(containerId);
    
    // Créer une copie de l'état actuel des panels
    const newPanels = new Map(activePanels);
    
    if (isAlreadyOpen) {
      console.log(`Fermeture du panel ${containerId}`);
      // Fermer ce panel spécifique
      newPanels.delete(containerId);
    } else {
      console.log(`Ouverture d'un nouveau panel pour ${containerId}`);
      // Trouver le container correspondant
      const container = containers.find(c => c.id === containerId);
      if (!container) {
        console.error(`Container ${containerId} non trouvé!`);
        return;
      }
      
      // Calculer la position de base du panel (près du container)
      const baseLeft = container.col * (CONTAINER_SIZE + CONTAINER_SPACING) + CONTAINER_SIZE + 20;
      const baseTop = container.row * (CONTAINER_SIZE + CONTAINER_SPACING) - 50;
      
      // Ajouter le nouveau panel à la collection
      newPanels.set(containerId, {
        containerId,
        position: {
          left: baseLeft,
          top: baseTop > 0 ? baseTop : 0
        },
        columnIndex: container.col
      });
    }
    
    // Afficher le debug des panels
    const debugMsg = newPanels.size === 0 
      ? "Aucun panel actif" 
      : `Panels actifs: ${Array.from(newPanels.keys()).join(', ')}`;
    setPanelDebugInfo(debugMsg);
    
    // IMPORTANT: Pour s'assurer que les panels sont visibles
    console.log("État des panels après modification:", 
                Array.from(newPanels.entries()).map(([id, info]) => ({
                  id, 
                  colIndex: info.columnIndex,
                  left: info.position.left,
                  top: info.position.top
                })));
    
    // Mettre à jour l'état avec les nouveaux panels
    setActivePanels(newPanels);
    
    // Calculer les décalages pour la grille
    setTimeout(() => {
      console.log(`Recalcul des décalages après changement des panels. ${newPanels.size} panels actifs.`);
      const shifts = calculateContainerShifts();
      setContainerShifts(shifts);
    }, 50);
  };
  
  // Fermer un panel spécifique
  const handleClosePanel = (containerId: number) => {
    // Retirer ce panel
    const newPanels = new Map(activePanels);
    newPanels.delete(containerId);
    setActivePanels(newPanels);
    
    // Recalculer les décalages
    setTimeout(() => {
      const shifts = calculateContainerShifts();
      setContainerShifts(shifts);
    }, 50);
  };
  
  // Rendu d'un container simple
  const renderContainer = (container: SimpleContainer) => {
    // Calculer la position de base
    let left = container.col * (CONTAINER_SIZE + CONTAINER_SPACING);
    const top = container.row * (CONTAINER_SIZE + CONTAINER_SPACING);
    
    // Ajouter le décalage si nécessaire
    const shift = containerShifts.get(container.id) || 0;
    left += shift;
    
    // Couleur en fonction du type
    const getBgColor = () => {
      switch(container.type) {
        case ContainerType.FREE: return '#58C4DD';
        case ContainerType.ADOPT: return '#F2C94C';
        case ContainerType.ADOPTED: return '#EB5757';
        case ContainerType.EDITORIAL: return '#6FCF97';
        default: return '#CCC';
      }
    };
    
    return (
      <div
        key={container.id}
        style={{
          width: CONTAINER_SIZE,
          height: CONTAINER_SIZE,
          backgroundColor: getBgColor(),
          position: 'absolute',
          left,
          top,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '1px solid rgba(0,0,0,0.1)',
          transition: 'left 0.3s ease-out',
          boxSizing: 'border-box'
        }}
        onClick={() => handlePanelToggle(container.id)}
      >
        <div>
          <div><strong>ID: {container.id}</strong></div>
          <div>({container.col}, {container.row})</div>
          <div>{container.type.toString()}</div>
        </div>
      </div>
    );
  };
  
  // Rendu d'un panel avec approche Flexbox
  const renderPanel = (panelId: number, panelInfo: PanelInfo) => {
    const container = containers.find(c => c.id === panelId);
    if (!container) return null;
    
    // Obtenons juste les informations du type de container pour l'affichage
    const containerTypeColor = (() => {
      switch(container.type) {
        case ContainerType.FREE: return '#58C4DD33';
        case ContainerType.ADOPT: return '#F2C94C33';
        case ContainerType.ADOPTED: return '#EB575733';
        case ContainerType.EDITORIAL: return '#6FCF9733';
        default: return '#f5f5f5';
      }
    })();
    
    return (
      <div
        key={`panel-${panelId}`}
        style={{
          width: PANEL_WIDTH,
          backgroundColor: 'white',
          minHeight: '300px',
          maxHeight: 'calc(100vh - 200px)',
          marginRight: '16px', // Espacement entre les panels
          marginBottom: '16px', // Espacement en cas de retour à la ligne
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #000', // Bordure noire visible
          position: 'relative', // Pour pouvoir positionner le bouton de fermeture
          overflow: 'auto',
          background: `linear-gradient(to bottom, ${containerTypeColor}, white)`
        }}
      >
        <button 
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#eee',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}
          onClick={() => handleClosePanel(panelId)}
        >
          ×
        </button>
        
        <h2 className="text-lg font-bold mb-2">Panel {panelId}</h2>
        <div className="flex items-center gap-2 mb-3">
          <div 
            style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              backgroundColor: containerTypeColor.replace('33', 'FF') 
            }} 
          />
          <p>Type: {container.type}</p>
        </div>
        <p className="text-sm mb-2">Position: ({container.col}, {container.row})</p>
        <div style={{ marginTop: '20px' }}>
          <p className="text-base mb-2">Contenu du panel pour container #{panelId}</p>
          <p className="text-sm text-gray-600">Ce panel utilise la nouvelle approche Flexbox pour le positionnement.</p>
        </div>
      </div>
    );
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>POC - Grille et Panels</h1>
      <p>Cliquez sur un container pour ouvrir/fermer son panel</p>
      <div style={{
        padding: '10px',
        margin: '10px 0',
        backgroundColor: '#e6f7ff',
        border: '1px solid #91d5ff',
        borderRadius: '4px'
      }}>
        <strong>Mode d'emploi:</strong> Cliquez sur plusieurs containers différents pour ouvrir plusieurs panels simultanément. 
        Cliquez à nouveau sur un container pour fermer son panel spécifique.
      </div>
      
      {/* Grille de containers */}
      <div
        ref={gridRef}
        style={{
          position: 'relative',
          width: (CONTAINER_SIZE + CONTAINER_SPACING) * GRID_SIZE,
          height: (CONTAINER_SIZE + CONTAINER_SPACING) * GRID_SIZE,
          margin: '50px auto',
          border: '1px dashed #ccc'
        }}
      >
        {containers.map(container => renderContainer(container))}
      </div>
      
      {/* Panels actifs - Avec la nouvelle approche Flexbox */}
      <div className="active-panels-container" style={{ 
        display: 'flex',
        flexWrap: 'wrap',
        marginTop: '20px',
        minHeight: '50px',
        padding: '16px',
        background: activePanels.size > 0 ? '#f0f5ff' : 'transparent',
        borderRadius: '8px',
        transition: 'all 0.3s ease'
      }}>
        {activePanels.size > 0 ? (
          Array.from(activePanels.entries()).map(([id, panelInfo]) => 
            renderPanel(id, panelInfo)
          )
        ) : (
          <div style={{ 
            padding: '12px',
            color: '#aaa',
            fontStyle: 'italic',
            textAlign: 'center',
            width: '100%'
          }}>
            Aucun panel actif. Cliquez sur un container pour ouvrir un panel.
          </div>
        )}
      </div>
      
      {/* Debug info */}
      <div style={{ marginTop: '30px', padding: '10px', background: '#f5f5f5' }}>
        <h3>État du système</h3>
        <p>Panels actifs: {activePanels.size}</p>
        <p><strong>IDs des panels ouverts:</strong> {Array.from(activePanels.keys()).join(', ') || 'Aucun'}</p>
        <p>Décalages: {Array.from(containerShifts.entries()).map(([id, shift]) => 
          `#${id}:${shift}px`
        ).join(', ') || 'Aucun'}</p>
        <p>{panelDebugInfo}</p>
      </div>
    </div>
  );
}