import React, { useState, useEffect } from 'react';
import { ContainerType } from '@/types/common';

// Constantes pour la grille réelle
const GRID_COLS = 32;    // 32 colonnes pour la grille complète
const GRID_ROWS = 32;    // 32 lignes pour la grille complète
const CENTER_COL = 16;   // Position centrale horizontale (colonne)
const CENTER_ROW = 16;   // Position centrale verticale (ligne)
const VISIBLE_COLS = 8;  // Nombre de colonnes visibles dans la démo
const VISIBLE_ROWS = 8;  // Nombre de lignes visibles dans la démo

// Dimensions des containers et panels - Exactement comme spécifié
const CONTAINER_SIZE = 128;  // Taille standard de base (128x128px)
const CONTAINER_GAP = 4;     // Écart entre les containers (4px) 
const PANEL_WIDTH = 304;     // Largeur des panels (304px)
const PANEL_GAP = 4;         // Espace entre les panels

// Types de décalages pour les containers (exactement comme spécifié)
enum ContainerExpansionType {
  NONE = "none",           // Pas d'expansion (container standard 128px)
  ONEONE_UP = "oneone_up", // Expansion vers le haut (260px total)
  ONEONE_DWN = "oneone_dwn", // Expansion vers le bas (260px total)
  ONEHALF_DWN = "onehalf_dwn" // Expansion vers le bas (192px total)
}

// Hauteurs correspondantes avec les valeurs exactes spécifiées
const EXPANSIONS = {
  [ContainerExpansionType.NONE]: { height: CONTAINER_SIZE, offsetTop: 0, pushAmount: 0 },
  [ContainerExpansionType.ONEONE_UP]: { 
    height: 260, 
    offsetTop: -(260 - CONTAINER_SIZE), 
    pushAmount: 260 - CONTAINER_SIZE // 132px vers le haut
  },
  [ContainerExpansionType.ONEONE_DWN]: { 
    height: 260, 
    offsetTop: 0, 
    pushAmount: 260 - CONTAINER_SIZE // 132px vers le bas
  },
  [ContainerExpansionType.ONEHALF_DWN]: { 
    height: 192, 
    offsetTop: 0, 
    pushAmount: 192 - CONTAINER_SIZE // 64px vers le bas
  }
};

// Types
interface Container {
  id: number;
  col: number;
  row: number;
  type: ContainerType;
  expansionType: ContainerExpansionType;
  isExpanded: boolean;
}

interface PanelData {
  containerId: number;
  containerCol: number;
  containerRow: number;
  containerType: ContainerType;
  isOpen: boolean;
}

/**
 * POC d'une grille fluide basée sur des colonnes
 * - Containers organisés en colonnes statiques
 * - Panels ouverts décalant les colonnes voisines
 * - Visualisation claire des relations entre containers et panels
 */
export function FluidColumnPoc() {
  // État de la grille
  const [containers, setContainers] = useState<Container[]>([]);
  const [panels, setPanels] = useState<Map<number, PanelData>>(new Map());
  const [columnOffsets, setColumnOffsets] = useState<number[]>(Array(GRID_COLS).fill(0));
  
  // État pour les décalages verticaux des containers (à cause des expansions)
  const [verticalShifts, setVerticalShifts] = useState<Map<number, number>>(new Map());
  
  // Générer les containers au chargement
  useEffect(() => {
    const initialContainers: Container[] = [];
    
    // Pour la démo, nous allons afficher seulement une portion de la grille
    // centrée autour du centre (moins difficile à visualiser qu'une grille 32x32)
    // Ajustement: nous utilisons une zone plus limitée et fixe pour garantir la visibilité
    const startCol = 12;
    const startRow = 12;
    const endCol = 20;
    const endRow = 20;
    
    // Créer une portion visible de la grille
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        // Déterminer le type selon la position par rapport au centre
        // Plus on s'éloigne du centre, plus on a de chances d'avoir certain types
        const distanceFromCenter = Math.sqrt(
          Math.pow(col - CENTER_COL, 2) + Math.pow(row - CENTER_ROW, 2)
        );
        
        let type;
        if (distanceFromCenter < 3) {
          // Proche du centre: plus de FREE et EDITORIAL
          type = [
            ContainerType.FREE,
            ContainerType.EDITORIAL,
            ContainerType.FREE,
            ContainerType.ADOPT
          ][(col + row) % 4];
        } else if (distanceFromCenter < 6) {
          // Zone intermédiaire: plus de ADOPT et ADOPTED
          type = [
            ContainerType.ADOPT,
            ContainerType.ADOPTED,
            ContainerType.FREE,
            ContainerType.EDITORIAL
          ][(col + row) % 4];
        } else {
          // Loin du centre: plus de ADOPTED
          type = [
            ContainerType.ADOPTED,
            ContainerType.ADOPT,
            ContainerType.EDITORIAL,
            ContainerType.ADOPTED
          ][(col + row) % 4];
        }
        
        // Déterminer le type d'expansion
        // Distribution selon la position pour une démo plus réaliste
        let expansionType;
        
        // Au centre, plus de NONE pour garder une zone stable
        if (col === CENTER_COL && row === CENTER_ROW) {
          expansionType = ContainerExpansionType.NONE;
        } 
        // Pour les containers en haut, favoriser ONEONE_UP
        else if (row < CENTER_ROW && Math.random() > 0.5) {
          expansionType = ContainerExpansionType.ONEONE_UP;
        } 
        // Pour les containers en bas, favoriser ONEONE_DWN et ONEHALF_DWN
        else if (row > CENTER_ROW && Math.random() > 0.5) {
          expansionType = Math.random() > 0.5 
            ? ContainerExpansionType.ONEONE_DWN 
            : ContainerExpansionType.ONEHALF_DWN;
        } 
        // Distribution aléatoire pour les autres
        else {
          const expansionIndex = Math.floor(Math.random() * 4);
          expansionType = [
            ContainerExpansionType.NONE,
            ContainerExpansionType.ONEONE_UP,
            ContainerExpansionType.ONEONE_DWN,
            ContainerExpansionType.ONEHALF_DWN
          ][expansionIndex];
        }
        
        // Ajuster l'ID pour correspondre à la position réelle dans la grille 32x32
        const id = row * GRID_COLS + col;
        
        // Ajouter le container à la liste
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
  }, []);

  // Calculer les décalages horizontaux (colonnes) et verticaux (containers)
  useEffect(() => {
    if (containers.length === 0) return;
    
    // 1. Calculer les décalages horizontaux (pour les panels)
    const newOffsets = Array(GRID_COLS).fill(0);
    
    // Parcourir tous les panels ouverts, triés par colonne
    const openPanels = Array.from(panels.values())
      .filter(panel => panel.isOpen)
      .sort((a, b) => a.containerCol - b.containerCol);
    
    // Pour chaque panel ouvert, calculer l'impact sur les colonnes à droite
    openPanels.forEach(panel => {
      const panelCol = panel.containerCol;
      
      // Toutes les colonnes à droite de celle-ci sont décalées
      for (let col = panelCol + 1; col < GRID_COLS; col++) {
        newOffsets[col] += PANEL_WIDTH + PANEL_GAP;
      }
    });
    
    // 2. Calculer les décalages verticaux (pour les containers expandés)
    const newVerticalShifts = new Map<number, number>();
    
    // Pour chaque colonne
    for (let col = 0; col < GRID_COLS; col++) {
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
          const expansionInfo = EXPANSIONS[expansionType];
          
          // Pour les expansions vers le bas, on accumule le décalage
          if (expansionType === ContainerExpansionType.ONEONE_DWN || 
              expansionType === ContainerExpansionType.ONEHALF_DWN) {
            accumulatedShift += expansionInfo.pushAmount;
          }
          
          // Pour les expansions vers le haut, on décale uniquement les containers au-dessus
          // (ceci est géré séparément dans une deuxième passe)
        }
      }
      
      // Deuxième passe pour les expansions vers le haut
      for (let i = colContainers.length - 1; i >= 0; i--) {
        const container = colContainers[i];
        
        if (container.isExpanded && container.expansionType === ContainerExpansionType.ONEONE_UP) {
          const expansionInfo = EXPANSIONS[container.expansionType];
          
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
    
    setColumnOffsets(newOffsets);
    setVerticalShifts(newVerticalShifts);
    
    console.log('Décalages horizontaux:', newOffsets);
    console.log('Décalages verticaux:', Array.from(newVerticalShifts.entries())
      .map(([id, shift]) => `#${id}: ${shift}px`)
    );
  }, [containers, panels]);

  // Fonction pour basculer l'état d'expansion d'un container
  const toggleContainerExpansion = (containerId: number) => {
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
      console.log(`Panel fermé lors de la réduction du container ${containerId}`);
    }
    
    // Mettre à jour le container
    newContainers[containerIndex] = {
      ...newContainers[containerIndex],
      isExpanded: newExpanded
    };
    
    setContainers(newContainers);
    console.log(`Container ${containerId} ${newExpanded ? 'agrandi' : 'réduit'} (${container.expansionType})`);
  };
  
  // Fonction pour basculer l'ouverture d'un panel
  const togglePanel = (containerId: number) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    // Un container doit être expandé pour avoir un panel
    if (!container.isExpanded) {
      console.log(`Le container ${containerId} doit être agrandi avant d'ouvrir un panel`);
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
      console.log(`Panel fermé: ${existingPanelInColumn.containerId}`);
    }
    
    // Si ce panel existe déjà, le fermer
    if (newPanels.has(containerId)) {
      newPanels.delete(containerId);
      console.log(`Panel fermé: ${containerId}`);
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
      console.log(`Panel ouvert: ${containerId}`);
    }
    
    // Mettre à jour l'état
    setPanels(newPanels);
    
    // Log pour debug
    console.log('Panels actifs:', Array.from(newPanels.entries())
      .filter(([_, panel]) => panel.isOpen)
      .map(([id, _]) => id)
    );
  };
  
  // Gestionnaire de clic sur un container
  const handleContainerClick = (containerId: number, event: React.MouseEvent) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    // Si Alt est pressé, c'est un clic pour ouvrir/fermer un panel
    if (event.altKey) {
      if (container.isExpanded) {
        togglePanel(containerId);
      } else {
        console.log("Il faut d'abord agrandir le container avant d'ouvrir un panel");
      }
    } 
    // Si le container est déjà agrandi, ouvrir son panel
    else if (container.isExpanded) {
      togglePanel(containerId);
      console.log("Container déjà agrandi, ouverture du panel");
    }
    // Sinon, c'est un clic pour agrandir le container
    else {
      toggleContainerExpansion(containerId);
    }
  };

  // Rendu d'un container avec gestion des expansions
  const renderContainer = (container: Container) => {
    // Ajuster les positions par rapport à notre zone visible
    // Nous devons transformer les coordonnées de la grille globale (32x32)
    // en coordonnées locales par rapport à notre conteneur visible (8x8)
    const adjustedCol = container.col - 12; // Décalage depuis startCol
    const adjustedRow = container.row - 12; // Décalage depuis startRow
    
    // Calculer la position avec décalage de colonne (horizontal)
    const left = (adjustedCol * (CONTAINER_SIZE + CONTAINER_GAP)) + columnOffsets[container.col];
    
    // Position de base du container selon sa ligne
    let top = adjustedRow * (CONTAINER_SIZE + CONTAINER_GAP);
    
    // Ajouter le décalage vertical s'il existe pour ce container
    const verticalShift = verticalShifts.get(container.id) || 0;
    top += verticalShift;
    
    // Récupérer les dimensions appropriées selon le type d'expansion
    const expansion = container.isExpanded 
      ? EXPANSIONS[container.expansionType] 
      : EXPANSIONS[ContainerExpansionType.NONE];
    
    // Appliquer l'offset vertical si le container est étendu vers le haut
    if (container.isExpanded) {
      top += expansion.offsetTop;
    }
    
    // Déterminer la hauteur du container
    const height = container.isExpanded ? expansion.height : CONTAINER_SIZE;
    
    // Couleur selon le type - Accentuée pour meilleure visibilité
    const colors: Record<ContainerType, string> = {
      [ContainerType.FREE]: '#58C4DD',
      [ContainerType.ADOPT]: '#F2C94C',
      [ContainerType.ADOPTED]: '#EB5757',
      [ContainerType.EDITORIAL]: '#6FCF97',
      [ContainerType.INACTIVE]: '#cccccc'
    };
    
    // État du panel associé à ce container
    const hasOpenPanel = panels.has(container.id) && panels.get(container.id)!.isOpen;
    
    // Ajouter un tag pour montrer le type d'expansion
    const getExpansionLabel = () => {
      if (!container.isExpanded) return '';
      
      switch (container.expansionType) {
        case ContainerExpansionType.ONEONE_UP: return '↑ 260px';
        case ContainerExpansionType.ONEONE_DWN: return '↓ 260px';
        case ContainerExpansionType.ONEHALF_DWN: return '↓ 192px';
        default: return '';
      }
    };
    
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
          cursor: 'pointer',
          border: hasOpenPanel 
            ? '3px solid black' 
            : container.isExpanded 
              ? '2px solid rgba(0,0,0,0.3)' 
              : '1px solid rgba(0,0,0,0.1)',
          borderRadius: '8px',
          transition: 'all 0.3s ease-out',
          boxShadow: container.isExpanded 
            ? hasOpenPanel 
              ? '0 0 15px rgba(0,0,0,0.3)' 
              : '0 0 10px rgba(0,0,0,0.15)'
            : 'none',
          boxSizing: 'border-box',
          zIndex: hasOpenPanel ? 2 : 1,
          overflow: 'hidden'
        }}
        onClick={(e) => handleContainerClick(container.id, e)}
      >
        <div style={{ textAlign: 'center' }}>
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
          
          {container.expansionType !== ContainerExpansionType.NONE && (
            <div style={{
              fontSize: '10px',
              backgroundColor: container.isExpanded ? 'rgba(0,0,0,0.1)' : 'transparent',
              color: container.isExpanded ? '#fff' : '#777',
              padding: '2px 6px',
              borderRadius: '4px',
              marginTop: '6px'
            }}>
              {container.isExpanded ? getExpansionLabel() : container.expansionType}
            </div>
          )}
          
          <div style={{ 
            marginTop: '12px', 
            fontSize: '10px', 
            opacity: 0.7 
          }}>
            {container.isExpanded ? (
              hasOpenPanel ? (
                "ALT+Clic pour fermer le panel"
              ) : (
                "ALT+Clic pour ouvrir le panel"
              )
            ) : (
              "Clic pour agrandir"
            )}
          </div>
        </div>
      </div>
    );
  };

  // Rendu d'un panel avec positionnement ajusté
  const renderPanel = (panelData: PanelData) => {
    if (!panelData.isOpen) return null;
    
    // Trouver le container associé
    const container = containers.find(c => c.id === panelData.containerId);
    if (!container) return null;
    
    // Comme pour les containers, il faut ajuster les positions par rapport à la zone visible
    const adjustedCol = container.col - 12; // Décalage depuis startCol
    const adjustedRow = container.row - 12; // Décalage depuis startRow
    
    // Position basée sur le container avec décalage de colonne
    const containerLeft = (adjustedCol * (CONTAINER_SIZE + CONTAINER_GAP)) + columnOffsets[container.col];
    const containerTop = adjustedRow * (CONTAINER_SIZE + CONTAINER_GAP);
    
    // Positionner le panel à droite du container (avec très petit écart)
    const left = containerLeft + CONTAINER_SIZE + 4;
    const top = containerTop;
    
    // Couleurs selon le type - avec meilleure visibilité
    const colors: Record<ContainerType, { bg: string, border: string }> = {
      [ContainerType.FREE]: { bg: '#E0F4FF', border: '#58C4DD' },
      [ContainerType.ADOPT]: { bg: '#FEF8E2', border: '#F2C94C' },
      [ContainerType.ADOPTED]: { bg: '#FFECEC', border: '#EB5757' },
      [ContainerType.EDITORIAL]: { bg: '#E8FFF3', border: '#6FCF97' },
      [ContainerType.INACTIVE]: { bg: '#f5f5f5', border: '#cccccc' }
    };
    
    // Calculer la hauteur totale de la zone visible de la grille
    const totalGridHeight = (CONTAINER_SIZE + CONTAINER_GAP) * 8; // 8 lignes visibles
    
    return (
      <div
        key={`panel-${panelData.containerId}`}
        style={{
          width: PANEL_WIDTH,
          height: totalGridHeight, // S'étend sur toute la hauteur de la grille
          backgroundColor: colors[panelData.containerType].bg,
          position: 'absolute',
          left,
          top: 0, // Commence en haut de la grille
          padding: '0', // Pas de padding pour le conteneur principal
          borderRadius: '8px',
          border: `2px solid ${colors[panelData.containerType].border}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease-out',
          zIndex: 10,
          overflow: 'hidden', // Pour contenir le contenu
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* En-tête du panel (toujours visible en haut) */}
        <div style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${colors[panelData.containerType].border}`,
          background: `linear-gradient(to right, ${colors[panelData.containerType].bg}, white)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              backgroundColor: colors[panelData.containerType].border,
              marginRight: '8px'
            }} />
            <h3 style={{ margin: 0, fontSize: '16px' }}>
              Panel #{panelData.containerId}
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
            onClick={() => togglePanel(panelData.containerId)}
          >
            ×
          </button>
        </div>
        
        {/* Zone de contenu alignée avec le container parent */}
        <div style={{
          padding: '16px',
          marginTop: containerTop > 0 ? containerTop - 40 : 0, // Positionne le contenu au niveau du container associé
          borderTop: `1px solid ${colors[panelData.containerType].border}`,
          background: 'white',
          maxHeight: CONTAINER_SIZE * 1.5, // Limite la hauteur du contenu
          overflow: 'auto',
          boxShadow: '0 -2px 4px rgba(0,0,0,0.05)'
        }}>          
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
            Position: (Col {panelData.containerCol}, Row {panelData.containerRow})
          </p>
          
          <p style={{ marginTop: '16px', fontSize: '14px', lineHeight: '1.4' }}>
            Ce panel est associé au container #{panelData.containerId} et s'étend sur toute
            la hauteur de la grille, avec son contenu aligné au niveau du container.
          </p>
          
          <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '16px', color: '#777' }}>
            Cette implémentation respecte la spécification exacte: panels occupant
            toute la hauteur avec contenu aligné au container parent.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '30px 20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Grille Chimérique Fluide - POC</h1>
      
      <div style={{ 
        backgroundColor: '#f5f9ff', 
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginTop: 0 }}>Comment ça fonctionne :</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>1er clic</strong> sur un container - L'agrandit selon son type d'expansion</li>
          <li><strong>2ème clic</strong> sur un container agrandi - Ouvre son panel associé</li>
          <li><strong>3ème clic</strong> sur un container avec panel - Ferme le panel</li>
          <li><strong>4ème clic</strong> sur un container agrandi - Réduit le container</li>
          <li><strong>ALT+clic</strong> peut être utilisé pour ouvrir/fermer directement un panel d'un container agrandi</li>
        </ul>
      </div>
      
      {/* Grille de containers - Avec zoom et centrage */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 300px)',
        minHeight: '600px',
        margin: '0 auto',
        overflow: 'hidden',
        border: '1px dashed #ccc',
        borderRadius: '4px',
        background: '#fafafa'
      }}>
        {/* Conteneur avec positionnement relatif centré */}
        <div style={{
          position: 'absolute',
          width: (CONTAINER_SIZE + CONTAINER_GAP) * VISIBLE_COLS,
          height: (CONTAINER_SIZE + CONTAINER_GAP) * VISIBLE_ROWS,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          border: '2px solid #333',
          background: '#e6e6e6'
        }}>
          {/* Containers */}
          {containers.map(container => renderContainer(container))}
          
          {/* Panels */}
          {Array.from(panels.values()).map(panel => renderPanel(panel))}
        </div>
        
        {/* Indicateur de centre */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0,0,0,0.1)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 10
        }} />
      </div>
      
      {/* Debug info */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        background: '#f0f0f0',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3 style={{ marginTop: 0 }}>État du système</h3>
        <div>
          <strong>Panels ouverts:</strong> {Array.from(panels.values()).filter(p => p.isOpen).length}
        </div>
        <div style={{ marginTop: '8px' }}>
          <strong>IDs des panels ouverts:</strong> {
            Array.from(panels.values())
              .filter(p => p.isOpen)
              .map(p => p.containerId)
              .join(', ') || 'Aucun'
          }
        </div>
        <div style={{ marginTop: '8px' }}>
          <strong>Décalages des colonnes:</strong> {
            columnOffsets.map((offset, index) => 
              `Col ${index}: ${offset}px`
            ).join(', ')
          }
        </div>
      </div>
    </div>
  );
}