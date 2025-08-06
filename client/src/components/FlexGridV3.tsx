import React, { useState, useEffect } from 'react';
import { generateSpiralPositions } from '@/utils/spiralAlgorithm';

// Types d'expansion des containers (conservés de V2)
enum ContainerType {
  NEUTRAL = "neutral",
  ONE = "one",
  ONE_AND_HALF_DWN = "oneAndHalfDwn", 
  ONE_ONE_UP = "oneOneUp",
  ONE_ONE_DWN = "oneOneDwn"
}

enum ContainerExpansionType {
  NONE = "none",
  ONEONE_UP = "oneone_up",
  ONEHALF_DWN = "onehalf_dwn",
  ONEONE_DWN = "oneone_dwn"
}

// Constantes critiques V2 (IMMUTABLES)
const CONTAINER_SIZE = 128;
const CONTAINER_GAP = 4;
const GRID_SIZE = 32;
const CENTER_COL = 16;
const CENTER_ROW = 16;

// Expansions exactes V2 (CONSERVÉES)
const EXPANSIONS = {
  [ContainerExpansionType.NONE]: { 
    height: CONTAINER_SIZE, 
    offsetTop: 0, 
    pushAmount: 0 
  },
  [ContainerExpansionType.ONEONE_UP]: { 
    height: 260, 
    offsetTop: -(260 - CONTAINER_SIZE), 
    pushAmount: 260 - CONTAINER_SIZE
  },
  [ContainerExpansionType.ONEONE_DWN]: { 
    height: 260, 
    offsetTop: 0, 
    pushAmount: 260 - CONTAINER_SIZE
  },
  [ContainerExpansionType.ONEHALF_DWN]: { 
    height: 192, 
    offsetTop: 0, 
    pushAmount: 192 - CONTAINER_SIZE
  }
};

// Interface Container V3 (étendue)
interface Container {
  id: number;
  col: number;
  row: number;
  type: ContainerType;
  expansionType: ContainerExpansionType;
  isExpanded: boolean;
  isOpen: boolean;
  contentId?: string; // Nouveau : ID du contenu NFT assigné
  distributionRule?: string; // Nouveau : Règle de distribution appliquée
}

// Interface DeploymentRule V3
interface DeploymentRule {
  id: string;
  name: string;
  type: 'spiral' | 'random-active' | 'random-inactive';
  contentTypes: string[];
  priority: number;
  enabled: boolean;
  description: string;
  modified?: boolean;
  maxItems?: number;
  spiralConfig?: {
    centerX: number;
    centerY: number;
    direction: 'clockwise' | 'counterclockwise';
    startDirection: 'right' | 'down' | 'left' | 'up';
    skipOccupied: boolean;
  };
  randomActiveConfig?: {
    randomType: 'uniform' | 'weighted' | 'clustered';
    minDistanceFromBorder: number;
    maxDistanceFromBorder: number;
    replacementRatio: number;
    minSpacing: number;
    preferredZone: 'center' | 'all' | 'ring';
  };
  randomInactiveConfig?: {
    minDistanceFromActive: number;
    maxDistanceFromActive: number;
    dispersion: 'low' | 'medium' | 'high';
    avoidanceZones: 'none' | 'corners' | 'borders';
    placementPriority: 'proximity' | 'distance' | 'balanced';
  };
}

// Interface FlexGridV3 Props
interface FlexGridV3Props {
  distributionRules: DeploymentRule[];
  containerTypes?: ContainerType[];
  gridConfig?: {
    size: number;
    centerCol: number;
    centerRow: number;
  };
  deploymentMode?: 'preview' | 'live';
  onContainerToggle?: (id: number, action: 'expand' | 'panel') => void;
  onDistributionChange?: (containers: Container[]) => void;
}

// Moteur de distribution V3
class DistributionEngine {
  static applyRules(rules: DeploymentRule[], totalContainers: number): Container[] {
    const containers: Container[] = [];
    let containerId = 1;
    
    // Appliquer les règles par ordre de priorité
    const sortedRules = rules.filter(rule => rule.enabled).sort((a, b) => b.priority - a.priority);
    
    for (const rule of sortedRules) {
      const positions = this.generatePositionsForRule(rule, totalContainers);
      const maxItems = rule.maxItems || positions.length;
      
      positions.slice(0, maxItems).forEach((position, index) => {
        const container = this.createContainerFromRule(containerId++, position, rule, index);
        containers.push(container);
      });
    }
    
    // Remplir les positions restantes avec des containers NEUTRAL
    if (containers.length < totalContainers) {
      const usedPositions = new Set(containers.map(c => `${c.col},${c.row}`));
      const allPositions = generateSpiralPositions(CENTER_COL, CENTER_ROW, 'clockwise', 'right', totalContainers);
      
      allPositions.forEach(position => {
        const posKey = `${position.x},${position.y}`;
        if (!usedPositions.has(posKey) && containers.length < totalContainers) {
          containers.push({
            id: containerId++,
            col: position.x,
            row: position.y,
            type: ContainerType.NEUTRAL,
            expansionType: ContainerExpansionType.NONE,
            isExpanded: false,
            isOpen: false,
            distributionRule: 'default'
          });
        }
      });
    }
    
    return containers.slice(0, totalContainers);
  }
  
  private static generatePositionsForRule(rule: DeploymentRule, totalContainers: number) {
    switch (rule.type) {
      case 'spiral':
        return this.generateSpiralDistribution(rule.spiralConfig || {
          centerX: CENTER_COL,
          centerY: CENTER_ROW,
          direction: 'clockwise',
          startDirection: 'right',
          skipOccupied: false
        }, totalContainers);
      
      case 'random-active':
        return this.generateRandomActiveDistribution(rule.randomActiveConfig || {
          randomType: 'uniform',
          minDistanceFromBorder: 2,
          maxDistanceFromBorder: 10,
          replacementRatio: 0.3,
          minSpacing: 1,
          preferredZone: 'center'
        }, totalContainers);
      
      case 'random-inactive':
        return this.generateRandomInactiveDistribution(rule.randomInactiveConfig || {
          minDistanceFromActive: 2,
          maxDistanceFromActive: 8,
          dispersion: 'medium',
          avoidanceZones: 'corners',
          placementPriority: 'balanced'
        }, totalContainers);
      
      default:
        return generateSpiralPositions(CENTER_COL, CENTER_ROW, 'clockwise', 'right', totalContainers);
    }
  }
  
  private static generateSpiralDistribution(config: any, totalContainers: number) {
    return generateSpiralPositions(
      config.centerX,
      config.centerY,
      config.direction,
      config.startDirection,
      totalContainers
    );
  }
  
  private static generateRandomActiveDistribution(config: any, totalContainers: number) {
    const positions = [];
    const gridCenter = GRID_SIZE / 2;
    
    for (let i = 0; i < totalContainers; i++) {
      let x, y;
      
      if (config.preferredZone === 'center') {
        // Génération centrée
        const radius = Math.random() * (config.maxDistanceFromBorder - config.minDistanceFromBorder) + config.minDistanceFromBorder;
        const angle = Math.random() * 2 * Math.PI;
        x = Math.round(gridCenter + radius * Math.cos(angle));
        y = Math.round(gridCenter + radius * Math.sin(angle));
      } else {
        // Génération uniforme
        x = Math.floor(Math.random() * GRID_SIZE);
        y = Math.floor(Math.random() * GRID_SIZE);
      }
      
      // Contraintes de bordure
      x = Math.max(config.minDistanceFromBorder, Math.min(GRID_SIZE - 1 - config.minDistanceFromBorder, x));
      y = Math.max(config.minDistanceFromBorder, Math.min(GRID_SIZE - 1 - config.minDistanceFromBorder, y));
      
      positions.push({ x, y });
    }
    
    return positions;
  }
  
  private static generateRandomInactiveDistribution(config: any, totalContainers: number) {
    const positions = [];
    
    for (let i = 0; i < totalContainers; i++) {
      let x, y;
      
      // Éviter les coins si configuré
      if (config.avoidanceZones === 'corners') {
        do {
          x = Math.floor(Math.random() * GRID_SIZE);
          y = Math.floor(Math.random() * GRID_SIZE);
        } while (
          (x < 3 && y < 3) || 
          (x > GRID_SIZE - 4 && y < 3) || 
          (x < 3 && y > GRID_SIZE - 4) || 
          (x > GRID_SIZE - 4 && y > GRID_SIZE - 4)
        );
      } else {
        x = Math.floor(Math.random() * GRID_SIZE);
        y = Math.floor(Math.random() * GRID_SIZE);
      }
      
      positions.push({ x, y });
    }
    
    return positions;
  }
  
  private static createContainerFromRule(id: number, position: any, rule: DeploymentRule, index: number): Container {
    // Distribution cyclique des types selon l'index
    const typeIndex = index % 5;
    let type: ContainerType;
    let expansionType: ContainerExpansionType;
    
    switch (typeIndex) {
      case 0:
        type = ContainerType.NEUTRAL;
        expansionType = ContainerExpansionType.NONE;
        break;
      case 1:
        type = ContainerType.ONE;
        expansionType = ContainerExpansionType.NONE;
        break;
      case 2:
        type = ContainerType.ONE_ONE_UP;
        expansionType = ContainerExpansionType.ONEONE_UP;
        break;
      case 3:
        type = ContainerType.ONE_AND_HALF_DWN;
        expansionType = ContainerExpansionType.ONEHALF_DWN;
        break;
      case 4:
      default:
        type = ContainerType.ONE_ONE_DWN;
        expansionType = ContainerExpansionType.ONEONE_DWN;
        break;
    }
    
    return {
      id,
      col: position.x,
      row: position.y,
      type,
      expansionType,
      isExpanded: false,
      isOpen: false,
      distributionRule: rule.id
    };
  }
}

// Composant Container V3 (conservé de V2 avec modifications mineures)
function ContainerV3Component({ container, position, onToggleExpansion, onTogglePanel }: {
  container: Container;
  position: { left: number; top: number };
  onToggleExpansion: (id: number) => void;
  onTogglePanel: (id: number) => void;
}) {
  const expansion = EXPANSIONS[container.expansionType];
  const height = container.isExpanded ? expansion.height : CONTAINER_SIZE;
  const offsetTop = container.isExpanded ? expansion.offsetTop : 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: position.left,
        top: position.top + offsetTop,
        width: CONTAINER_SIZE,
        height: height,
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        transition: 'all 0.3s ease',
        zIndex: container.isExpanded ? 2 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#374151',
        fontSize: '8px',
        fontFamily: 'Roboto Mono, monospace',
        pointerEvents: 'none'
      }}
    >
      <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
        <div>{container.type.toUpperCase()}</div>
        <div style={{ fontSize: '6px', color: '#9CA3AF', marginTop: '2px' }}>
          {container.distributionRule}
        </div>
      </div>
      
      {/* Zone centrale ronde 32px - Toggle expansion */}
      <div
        className="container-zone-clickable"
        style={{
          position: 'absolute',
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: 'transparent',
          zIndex: 10,
          pointerEvents: 'auto',
          cursor: 'pointer'
        }}
        onClick={() => onToggleExpansion(container.id)}
      />
      
      {/* Zone panel */}
      <div
        className="container-zone-clickable"
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 16,
          height: 16,
          backgroundColor: container.isOpen ? '#F59E0B' : 'rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          zIndex: 10,
          pointerEvents: 'auto',
          cursor: 'pointer'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePanel(container.id);
        }}
      >
        P
      </div>
    </div>
  );
}

// Composant FlexGridV3 principal
export function FlexGridV3({
  distributionRules,
  containerTypes,
  gridConfig = { size: GRID_SIZE, centerCol: CENTER_COL, centerRow: CENTER_ROW },
  deploymentMode = 'preview',
  onContainerToggle,
  onDistributionChange
}: FlexGridV3Props) {
  const [containers, setContainers] = useState<Container[]>([]);
  const [openPanels, setOpenPanels] = useState<number[]>([]);

  // Générer les containers selon les règles de distribution
  useEffect(() => {
    if (distributionRules.length > 0) {
      const totalContainers = gridConfig.size * gridConfig.size;
      const generatedContainers = DistributionEngine.applyRules(distributionRules, totalContainers);
      setContainers(generatedContainers);
      
      if (onDistributionChange) {
        onDistributionChange(generatedContainers);
      }
    }
  }, [distributionRules, gridConfig, onDistributionChange]);

  // Dimensions totales de la grille
  const gridWidth = gridConfig.size * (CONTAINER_SIZE + CONTAINER_GAP) - CONTAINER_GAP;
  const gridHeight = gridConfig.size * (CONTAINER_SIZE + CONTAINER_GAP) - CONTAINER_GAP;

  // Calcul des positions avec logique de poussée V2 (CONSERVÉE)
  const getContainerPosition = (container: Container) => {
    let adjustedTop = container.row * (CONTAINER_SIZE + CONTAINER_GAP);
    let adjustedLeft = container.col * (CONTAINER_SIZE + CONTAINER_GAP);
    
    // Poussée verticale dans la même colonne UNIQUEMENT (Algorithme V2)
    containers.forEach(otherContainer => {
      if (otherContainer.id === container.id || !otherContainer.isExpanded) return;
      if (otherContainer.col !== container.col) return;
      
      const expansion = EXPANSIONS[otherContainer.expansionType];
      
      if (otherContainer.expansionType === ContainerExpansionType.ONEONE_UP) {
        if (container.row < otherContainer.row) {
          adjustedTop -= expansion.pushAmount;
        }
      } else if (otherContainer.expansionType === ContainerExpansionType.ONEONE_DWN || 
                 otherContainer.expansionType === ContainerExpansionType.ONEHALF_DWN) {
        if (container.row > otherContainer.row) {
          adjustedTop += expansion.pushAmount;
        }
      }
    });
    
    // Poussée horizontale par les panels ouverts (V2)
    openPanels.forEach(panelId => {
      const panelContainer = containers.find(c => c.id === panelId);
      if (!panelContainer) return;
      
      if (container.col > panelContainer.col) {
        adjustedLeft += 308; // 304 (largeur panel) + 4 (gap)
      }
    });
    
    return { left: adjustedLeft, top: adjustedTop };
  };

  // Gestion des interactions
  const handleToggleExpansion = (id: number) => {
    setContainers(prev => prev.map(container => 
      container.id === id 
        ? { ...container, isExpanded: !container.isExpanded }
        : container
    ));
    
    if (onContainerToggle) {
      onContainerToggle(id, 'expand');
    }
  };

  const handleTogglePanel = (id: number) => {
    const targetContainer = containers.find(c => c.id === id);
    if (!targetContainer) return;

    // Un seul panel par colonne (logique V2)
    const existingPanelInColumn = openPanels.find(panelId => {
      const panelContainer = containers.find(c => c.id === panelId);
      return panelContainer && panelContainer.col === targetContainer.col;
    });

    setContainers(prev => prev.map(container => {
      if (container.id === id) {
        return { ...container, isOpen: !container.isOpen };
      }
      if (existingPanelInColumn && container.id === existingPanelInColumn) {
        return { ...container, isOpen: false };
      }
      return container;
    }));
    
    setOpenPanels(prev => {
      const filteredPanels = existingPanelInColumn 
        ? prev.filter(panelId => panelId !== existingPanelInColumn)
        : prev;
      
      return filteredPanels.includes(id) 
        ? filteredPanels.filter(panelId => panelId !== id)
        : [...filteredPanels, id];
    });
    
    if (onContainerToggle) {
      onContainerToggle(id, 'panel');
    }
  };

  if (containers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-500 mb-2">Aucune règle de distribution configurée</div>
          <div className="text-sm text-gray-400">Ajoutez des règles pour générer la grille</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grid-v3-container">
      <div 
        className="relative overflow-auto bg-[#F0F0F0] rounded-lg"
        style={{
          width: '100%',
          height: '600px',
          fontFamily: 'Roboto Mono, monospace'
        }}
      >
        <div 
          style={{
            position: 'relative',
            width: gridWidth + 200,
            height: gridHeight + 200,
            padding: '100px'
          }}
        >
          {/* Rendu des containers */}
          {containers.map(container => {
            const position = getContainerPosition(container);
            return (
              <ContainerV3Component
                key={container.id}
                container={container}
                position={{ left: position.left + 100, top: position.top + 100 }}
                onToggleExpansion={handleToggleExpansion}
                onTogglePanel={handleTogglePanel}
              />
            );
          })}
        </div>
      </div>
      
      {/* Informations de distribution */}
      <div className="mt-4 p-4 bg-white rounded-lg border">
        <h3 className="text-sm font-medium mb-2">Distribution Active</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Containers générés: {containers.length}</div>
          <div>Règles appliquées: {distributionRules.filter(r => r.enabled).length}</div>
          <div>Mode: {deploymentMode}</div>
        </div>
      </div>
    </div>
  );
}

export default FlexGridV3;