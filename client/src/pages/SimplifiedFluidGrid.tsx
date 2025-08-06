import React, { useState, useEffect } from 'react';
import { ContainerType } from '@/types/common';

// Constantes pour la grille
const GRID_SIZE = 8; // Taille visible de la grille
const CONTAINER_SIZE = 128; // Taille de base des containers (128x128)
const CONTAINER_GAP = 4; // 4px d'écart entre les containers
const PANEL_WIDTH = 304; // Largeur des panels

// Types d'expansion des containers
enum ExpansionType {
  NONE = "none",           // Pas d'expansion (container standard 128px)
  ONEONE_UP = "oneone_up", // Expansion vers le haut (260px total)
  ONEONE_DWN = "oneone_dwn", // Expansion vers le bas (260px total)
  ONEHALF_DWN = "onehalf_dwn" // Expansion vers le bas (192px total)
}

// Hauteurs correspondantes aux types d'expansion
const EXPANSIONS = {
  [ExpansionType.NONE]: { height: 128, offsetTop: 0, pushAmount: 0 },
  [ExpansionType.ONEONE_UP]: { 
    height: 260, 
    offsetTop: -(260 - 128), 
    pushAmount: 260 - 128 // 132px vers le haut
  },
  [ExpansionType.ONEONE_DWN]: { 
    height: 260, 
    offsetTop: 0, 
    pushAmount: 260 - 128 // 132px vers le bas
  },
  [ExpansionType.ONEHALF_DWN]: { 
    height: 192, 
    offsetTop: 0, 
    pushAmount: 192 - 128 // 64px vers le bas
  }
};

// Types pour nos données
interface Container {
  id: number;
  col: number;
  row: number;
  type: ContainerType;
  expansionType: ExpansionType;
  isExpanded: boolean;
}

interface Panel {
  containerId: number;
  containerCol: number;
  containerRow: number;
  containerType: ContainerType;
}

/**
 * Grille Fluide Simplifiée
 * Version intégrale et optimisée pour l'affichage de containers et panels
 */
export default function SimplifiedFluidGrid() {
  // État de la grille
  const [containers, setContainers] = useState<Container[]>([]);
  const [activePanels, setActivePanels] = useState<Record<number, Panel>>({});
  
  // État des décalages
  const [columnOffsets, setColumnOffsets] = useState<number[]>(Array(GRID_SIZE).fill(0));
  const [verticalShifts, setVerticalShifts] = useState<Record<number, number>>({});
  
  // Charger les containers au montage du composant
  useEffect(() => {
    const initialContainers: Container[] = [];
    
    // Générer une grille de containers
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        // Déterminer le type selon un pattern simple
        const typeIndex = (col + row) % 4;
        const types = [
          'free' as ContainerType,
          'adopt' as ContainerType, 
          'adopted' as ContainerType,
          'editorial' as ContainerType
        ];
        
        // Déterminer le type d'expansion
        const expansionIndex = (col * 2 + row) % 4;
        const expansionTypes = [
          ExpansionType.NONE,
          ExpansionType.ONEONE_UP,
          ExpansionType.ONEONE_DWN,
          ExpansionType.ONEHALF_DWN
        ];
        
        initialContainers.push({
          id: row * GRID_SIZE + col,
          col,
          row,
          type: types[typeIndex],
          expansionType: expansionTypes[expansionIndex],
          isExpanded: false
        });
      }
    }
    
    setContainers(initialContainers);
    console.log("Grille initialisée avec", initialContainers.length, "containers");
  }, []);
  
  // Calculer les décalages quand les containers ou panels changent
  useEffect(() => {
    // 1. Calculer les décalages horizontaux (colonnes)
    const newColumnOffsets = Array(GRID_SIZE).fill(0);
    
    Object.values(activePanels).forEach(panel => {
      const panelCol = panel.containerCol;
      
      // Décaler toutes les colonnes à droite
      for (let col = panelCol + 1; col < GRID_SIZE; col++) {
        newColumnOffsets[col] += PANEL_WIDTH + CONTAINER_GAP;
      }
    });
    
    // 2. Calculer les décalages verticaux
    const newVerticalShifts: Record<number, number> = {};
    
    // Pour chaque colonne
    for (let col = 0; col < GRID_SIZE; col++) {
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
          newVerticalShifts[container.id] = accumulatedShift;
        }
        
        // Si ce container est expandé, calculer combien il pousse les suivants
        if (container.isExpanded) {
          const expansionType = container.expansionType;
          const expansionInfo = EXPANSIONS[expansionType];
          
          // Pour les expansions vers le bas, on accumule le décalage
          if (expansionType === ExpansionType.ONEONE_DWN || 
              expansionType === ExpansionType.ONEHALF_DWN) {
            accumulatedShift += expansionInfo.pushAmount;
          }
        }
      }
      
      // Deuxième passe pour les expansions vers le haut
      for (let i = colContainers.length - 1; i >= 0; i--) {
        const container = colContainers[i];
        
        if (container.isExpanded && container.expansionType === ExpansionType.ONEONE_UP) {
          const expansionInfo = EXPANSIONS[container.expansionType];
          
          // Décaler tous les containers au-dessus
          for (let j = i - 1; j >= 0; j--) {
            const upperContainer = colContainers[j];
            const currentShift = newVerticalShifts[upperContainer.id] || 0;
            newVerticalShifts[upperContainer.id] = 
              currentShift - Math.abs(expansionInfo.offsetTop);
          }
        }
      }
    }
    
    setColumnOffsets(newColumnOffsets);
    setVerticalShifts(newVerticalShifts);
  }, [containers, activePanels]);
  
  // Types d'actions pour les zones de clic
  enum ClickAction {
    EXPAND = "expand",  // Agrandir/réduire le container
    OPEN_PANEL = "openPanel" // Ouvrir/fermer le panel
  }
  
  // Gérer l'expansion ou la réduction d'un container
  const handleExpand = (containerId: number) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    // Créer une copie des containers pour modification
    const newContainers = [...containers];
    const containerIndex = newContainers.findIndex(c => c.id === containerId);
    
    // Inverser l'état d'expansion
    newContainers[containerIndex] = {
      ...newContainers[containerIndex],
      isExpanded: !container.isExpanded
    };
    
    // Si on réduit un container qui a un panel ouvert, fermer aussi le panel
    if (container.isExpanded && activePanels[containerId]) {
      const newActivePanels = { ...activePanels };
      delete newActivePanels[containerId];
      setActivePanels(newActivePanels);
      console.log(`Panel fermé pour le container ${containerId}`);
    }
    
    setContainers(newContainers);
    console.log(`Container ${containerId} ${!container.isExpanded ? 'agrandi' : 'réduit'} (${container.expansionType})`);
  };
  
  // Gérer l'ouverture ou la fermeture d'un panel
  const handlePanelToggle = (containerId: number) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    // Si le container n'est pas expandé, l'expandre d'abord
    if (!container.isExpanded) {
      const newContainers = [...containers];
      const containerIndex = newContainers.findIndex(c => c.id === containerId);
      
      newContainers[containerIndex] = {
        ...newContainers[containerIndex],
        isExpanded: true
      };
      
      setContainers(newContainers);
      console.log(`Container ${containerId} agrandi (${container.expansionType})`);
    }
    
    // Si le panel est déjà ouvert, le fermer
    if (activePanels[containerId]) {
      const newActivePanels = { ...activePanels };
      delete newActivePanels[containerId];
      setActivePanels(newActivePanels);
      console.log(`Panel fermé pour le container ${containerId}`);
      return;
    }
    
    // Vérifier s'il y a déjà un panel dans cette colonne
    const existingPanelInColumn = Object.values(activePanels).find(
      panel => panel.containerCol === container.col
    );
    
    // Créer une copie pour modification
    const newActivePanels = { ...activePanels };
    
    // Si un panel existe déjà dans cette colonne, le remplacer
    if (existingPanelInColumn && existingPanelInColumn.containerId !== containerId) {
      delete newActivePanels[existingPanelInColumn.containerId];
    }
    
    // Ajouter le nouveau panel
    newActivePanels[containerId] = {
      containerId,
      containerCol: container.col,
      containerRow: container.row,
      containerType: container.type
    };
    
    setActivePanels(newActivePanels);
    console.log(`Panel ouvert pour le container ${containerId}`);
  };
  
  // Gérer les clics sur les zones spécifiques
  const handleZoneClick = (action: ClickAction, containerId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la propagation de l'événement
    
    switch (action) {
      case ClickAction.EXPAND:
        handleExpand(containerId);
        break;
      case ClickAction.OPEN_PANEL:
        handlePanelToggle(containerId);
        break;
    }
  };
  
  // Rendu d'un container
  const renderContainer = (container: Container) => {
    // Calculer la position avec décalages
    const left = (container.col * (CONTAINER_SIZE + CONTAINER_GAP)) + columnOffsets[container.col];
    let top = container.row * (CONTAINER_SIZE + CONTAINER_GAP);
    
    // Ajouter le décalage vertical
    const verticalShift = verticalShifts[container.id] || 0;
    top += verticalShift;
    
    // Appliquer l'expansion
    const expansion = container.isExpanded 
      ? EXPANSIONS[container.expansionType] 
      : EXPANSIONS[ExpansionType.NONE];
    
    if (container.isExpanded) {
      top += expansion.offsetTop;
    }
    
    // Hauteur selon l'expansion
    const height = container.isExpanded ? expansion.height : CONTAINER_SIZE;
    
    // Couleur selon le type
    const colors: Record<string, string> = {
      'free': '#58C4DD',
      'adopt': '#F2C94C',
      'adopted': '#EB5757',
      'editorial': '#6FCF97',
      'inactive': '#cccccc'
    };
    
    // Panel ouvert pour ce container
    const hasOpenPanel = !!activePanels[container.id];
    
    return (
      <div
        key={`container-${container.id}`}
        style={{
          width: CONTAINER_SIZE,
          height,
          backgroundColor: colors[container.type],
          position: 'absolute',
          left,
          top,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'default',
          border: hasOpenPanel 
            ? '3px solid black' 
            : container.isExpanded 
              ? '2px solid rgba(0,0,0,0.3)' 
              : '1px solid rgba(0,0,0,0.1)',
          borderRadius: '8px',
          transition: 'all 0.3s ease-out',
          boxShadow: container.isExpanded ? '0 0 10px rgba(0,0,0,0.15)' : 'none',
          zIndex: hasOpenPanel ? 2 : 1,
          overflow: 'visible' // Changé de 'hidden' à 'visible' pour les click zones
        }}
      >
        {/* Zone de clic principale - pour l'expansion */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            cursor: 'pointer'
          }}
          onClick={(e) => handleZoneClick(ClickAction.EXPAND, container.id, e)}
        />
        
        {/* Zone de clic pour l'ouverture du panel (à droite) - version discrète */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '20%',
            height: '100%',
            zIndex: 3,
            cursor: 'pointer'
          }}
          onClick={(e) => handleZoneClick(ClickAction.OPEN_PANEL, container.id, e)}
        />
        
        {/* Contenu du container */}
        <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>#{container.id}</div>
          <div style={{ fontSize: '12px', marginBottom: '4px' }}>({container.col}, {container.row})</div>
          <div style={{ 
            fontSize: '11px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: '2px 6px',
            borderRadius: '4px',
            marginBottom: '6px'
          }}>
            {container.type}
          </div>
          
          {container.expansionType !== ExpansionType.NONE && container.isExpanded && (
            <div style={{
              fontSize: '10px',
              backgroundColor: 'rgba(0,0,0,0.1)',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: '4px',
              marginTop: '6px'
            }}>
              {container.expansionType}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Rendu d'un panel
  const renderPanel = (containerId: number, panel: Panel) => {
    // Trouver le container associé
    const container = containers.find(c => c.id === containerId);
    if (!container) return null;
    
    // Position du panel
    const left = (container.col * (CONTAINER_SIZE + CONTAINER_GAP)) + 
                columnOffsets[container.col] + CONTAINER_SIZE + CONTAINER_GAP;
    
    // Hauteur totale de la grille
    const totalGridHeight = (CONTAINER_SIZE + CONTAINER_GAP) * GRID_SIZE;
    
    // Couleurs selon le type
    const colors: Record<string, { bg: string, border: string }> = {
      'free': { bg: '#E0F4FF', border: '#58C4DD' },
      'adopt': { bg: '#FEF8E2', border: '#F2C94C' },
      'adopted': { bg: '#FFECEC', border: '#EB5757' },
      'editorial': { bg: '#E8FFF3', border: '#6FCF97' },
      'inactive': { bg: '#f5f5f5', border: '#cccccc' }
    };
    
    // Position du contenu aligné avec le container
    const containerTop = container.row * (CONTAINER_SIZE + CONTAINER_GAP);
    const verticalShift = verticalShifts[container.id] || 0;
    let alignedContentTop = containerTop + verticalShift;
    
    // Si le container est expandé vers le haut, ajuster
    if (container.isExpanded && container.expansionType === ExpansionType.ONEONE_UP) {
      const expansion = EXPANSIONS[ExpansionType.ONEONE_UP];
      alignedContentTop += expansion.offsetTop;
    }
    
    return (
      <div
        key={`panel-${containerId}`}
        style={{
          width: PANEL_WIDTH,
          height: totalGridHeight,
          backgroundColor: colors[container.type].bg,
          position: 'absolute',
          left,
          top: 0, // Commence en haut de la grille
          padding: 0,
          borderRadius: '8px',
          border: `2px solid ${colors[container.type].border}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease-out',
          zIndex: 10,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* En-tête du panel */}
        <div style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${colors[container.type].border}`,
          background: `linear-gradient(to right, ${colors[container.type].bg}, white)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              backgroundColor: colors[container.type].border,
              marginRight: '8px'
            }} />
            <h3 style={{ margin: 0, fontSize: '16px' }}>
              Panel #{containerId}
            </h3>
          </div>
          
          <button 
            style={{
              background: '#eee',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}
            onClick={(e) => {
              e.preventDefault();
              handlePanelToggle(containerId);
            }}
          >
            ×
          </button>
        </div>
        
        {/* Zone de contenu alignée avec le container parent */}
        <div style={{
          padding: '16px',
          marginTop: alignedContentTop - 40, // Positionne le contenu au niveau du container
          borderTop: `1px solid ${colors[container.type].border}`,
          background: 'white',
          maxHeight: CONTAINER_SIZE * 1.5,
          overflow: 'auto',
          boxShadow: '0 -2px 4px rgba(0,0,0,0.05)'
        }}>          
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
            Position: (Col {container.col}, Row {container.row})
          </p>
          
          <p style={{ marginTop: '16px', fontSize: '14px', lineHeight: '1.4' }}>
            Ce panel est aligné avec son container parent et occupe toute
            la hauteur de la grille.
          </p>
          
          <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '16px', color: '#777' }}>
            Type d'expansion: {container.expansionType}
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="simplified-fluid-grid" style={{ padding: '24px' }}>
      <h1 className="text-2xl font-bold mb-6">Grille Fluide Simplifiée</h1>
      
      <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-200">
        <h2 className="font-bold mb-2">Mode d'emploi</h2>
        <ul className="list-disc pl-5 space-y-1 mb-2">
          <li><strong>Clic simple</strong> sur un container pour l'agrandir/réduire</li>
          <li><strong>Clic</strong> sur un container agrandi pour ouvrir/fermer son panel</li>
          <li><strong>Double-clic</strong> pour agrandir ET ouvrir le panel en une seule action</li>
        </ul>
        <p className="text-sm text-blue-700">Un seul panel par colonne peut être ouvert à la fois</p>
      </div>
      
      {/* Grille et ses containers */}
      <div className="grid-container" style={{
        position: 'relative',
        width: '100%',
        height: (CONTAINER_SIZE + CONTAINER_GAP) * GRID_SIZE,
        border: '1px solid #eee',
        borderRadius: '8px',
        background: '#f9f9f9',
        overflow: 'hidden'
      }}>
        {/* Conteneurs */}
        {containers.map(container => renderContainer(container))}
        
        {/* Panels */}
        {Object.entries(activePanels).map(([id, panel]) => 
          renderPanel(parseInt(id), panel)
        )}
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
        <h3 className="font-bold mb-2">État actuel</h3>
        <div><strong>Containers expandés:</strong> {containers.filter(c => c.isExpanded).length}</div>
        <div><strong>Panels ouverts:</strong> {Object.keys(activePanels).length}</div>
      </div>
    </div>
  );
}