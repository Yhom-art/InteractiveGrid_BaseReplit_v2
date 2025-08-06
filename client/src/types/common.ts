// Types pour les différents containers
export enum ContainerType {
  FREE = "free",            // Container oneone_up: extension vers le haut
  ADOPTED = "adopted",      // Container oneone_down: extension vers le bas
  ADOPT = "adopt",          // Container onehalf_down: extension partielle vers le bas
  EDITORIAL = "editorial",  // Container éditorial
  INACTIVE = "inactive",    // Container inactif (ne peut pas être ouvert)
  MUSIC = "music"           // Container musical intégré à la grille
}

// États possibles pour les containers
export enum ContainerState {
  CLOSED = "closed",    // Container fermé (128x128px)
  FREE = "free",        // Container FREE ouvert
  ADOPT = "adopt",      // Container ADOPT ouvert
  ADOPTED = "adopted"   // Container ADOPTED ouvert
}

// Données d'un container dans la grille
export interface ContainerData {
  id: number;
  type: ContainerType;
  state: ContainerState;
  position?: {
    x: number;
    y: number;
  };
  // Propriétés additionnelles pour les containers éditoriaux
  editorialImage?: string;
  url?: string;
  title?: string;
}

// Types de contenus possibles pour un container
export enum ContentType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  MIXED = "mixed"
}

// Informations d'un panel actif
export interface PanelInfo {
  columnIndex: number;       // Index de la colonne où se trouve le panel
  containerId?: number;      // ID du conteneur source (optionnel pour compatibilité)
  containerType?: ContainerType; // Type du conteneur source (optionnel pour compatibilité)
  sourceImageUrl?: string;   // URL de l'image source (optionnelle)
  width?: number;            // Largeur du panel (par défaut 3 colonnes)
  tab?: string;              // Onglet actif dans le panel
  position: {                // Position absolue du panel
    left: number;            // Position horizontale en pixels
    top: number;             // Position verticale en pixels
  };
}

// Types de curseurs
export enum CursorType {
  DEFAULT = "default",
  GRAB = "grab",
  GRABBING = "grabbing",
  CLOSE = "close",
  ADOPT = "adopt",
  MEET = "meet",
  KNOK = "knok",
  // Curseurs "pill" pour les interactions spéciales
  MEET_PILL = "meetPill",
  ADOPT_PILL = "adoptPill",
  KNOK_PILL = "knokPill",
  // Nouveaux curseurs personnalisés
  INFO = "info",
  PANEL = "panel",
  PANEL2 = "panel2",
  SCALE = "scale",
  // Curseur administration
  ADMIN = "admin"
}

// Actions possibles sur un clic
export enum ClickAction {
  CLOSE = "close",         // Fermer un conteneur ouvert
  OPEN = "open",           // Ouvrir un conteneur fermé
  OPEN_PANEL = "openPanel" // Ouvrir/fermer le panneau latéral
}