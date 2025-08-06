import { ContainerType } from '@/types/common';

// Types d'expansion des containers
export enum ContainerExpansionType {
  NONE = "none",           // Pas d'expansion (container standard 128px)
  ONEONE_UP = "oneone_up", // Expansion vers le haut (260px total)
  ONEONE_DWN = "oneone_dwn", // Expansion vers le bas (260px total)
  ONEHALF_DWN = "onehalf_dwn" // Expansion vers le bas (192px total)
}

// Interface pour un container dans la grille
export interface Container {
  id: number;
  col: number;
  row: number;
  type: ContainerType;
  expansionType: ContainerExpansionType;
  isExpanded: boolean;
}

// Interface pour les données d'un panel
export interface PanelData {
  containerId: number;
  containerCol: number;
  containerRow: number;
  containerType: ContainerType;
  isOpen: boolean;
}

// Configuration des dimensions pour la grille
export interface GridDimensions {
  // Dimensions de la grille
  gridCols: number;
  gridRows: number;
  centerCol: number;
  centerRow: number;
  
  // Dimensions des éléments
  containerSize: number;
  containerGap: number;
  panelWidth: number;
  panelGap: number;
}

// Configuration des expansions de containers
export interface ExpansionConfig {
  height: number;
  offsetTop: number;
  pushAmount: number;
}

// Configuration complète de la grille
export interface GridConfig extends GridDimensions {
  // Dimensions visibles (pour le viewport)
  visibleCols: number;
  visibleRows: number;
  
  // Expansions configurées
  expansions: Record<ContainerExpansionType, ExpansionConfig>;
}

// Interface pour les données de position des panels
export interface PanelInfo {
  containerId: number;
  position: {
    left: number;
    top: number;
  };
  columnIndex: number;
}

// Données par défaut pour les dimensions de la grille
export const DEFAULT_GRID_CONFIG: GridConfig = {
  // Dimensions de la grille complète
  gridCols: 32,
  gridRows: 32,
  centerCol: 16,
  centerRow: 16,
  
  // Nombre de colonnes/lignes visibles à la fois
  visibleCols: 8,
  visibleRows: 8,
  
  // Dimensions des éléments
  containerSize: 128,
  containerGap: 4,
  panelWidth: 304,
  panelGap: 4,
  
  // Configuration des expansions
  expansions: {
    [ContainerExpansionType.NONE]: { 
      height: 128, 
      offsetTop: 0, 
      pushAmount: 0 
    },
    [ContainerExpansionType.ONEONE_UP]: { 
      height: 260, 
      offsetTop: -(260 - 128), 
      pushAmount: 260 - 128 // 132px vers le haut
    },
    [ContainerExpansionType.ONEONE_DWN]: { 
      height: 260, 
      offsetTop: 0, 
      pushAmount: 260 - 128 // 132px vers le bas
    },
    [ContainerExpansionType.ONEHALF_DWN]: { 
      height: 192, 
      offsetTop: 0, 
      pushAmount: 192 - 128 // 64px vers le bas
    }
  }
};