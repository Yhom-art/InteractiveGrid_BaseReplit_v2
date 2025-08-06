// Types pour les données des Chimères et de leurs panels

// Type d'une coordonnée géographique
export interface GeoLocation {
  latitude: number;
  longitude: number;
  name?: string;
  description?: string;
}

// Type pour les données de NFT
export interface NFTData {
  tokenId: string;
  contractAddress: string;
  owner: string;
  creationDate: string;
  metadata?: Record<string, any>;
}

// Type pour les éléments audio
export interface AudioContent {
  id: string;
  title: string;
  artist?: string;
  duration: number;
  url: string;
  type: 'podcast' | 'sample' | 'music';
}

// Indicateurs dynamiques pour les Chimères
export interface ChimereIndicators {
  rarity: number;       // De 0 à 100
  popularity: number;   // De 0 à 100
  activity: number;     // De 0 à 100
  energy: number;       // De 0 à 100
  // Autres indicateurs personnalisés
  [key: string]: number;
}

// Type principal pour les données complètes d'une Chimère
export interface ChimereData {
  id: number;
  name: string;
  reference: string;
  description: string;
  imageUrl: string;
  type: 'adopt' | 'adopted' | 'free';
  
  // Contenu riche
  nftData?: NFTData;
  location?: GeoLocation;
  audioContent?: AudioContent[];
  indicators: ChimereIndicators;
  
  // Texte libre administrable
  administratedContent?: {
    title?: string;
    body?: string;
    tags?: string[];
    lastUpdate?: string;
  };
  
  // Autres attributs spécifiques
  attributes?: Record<string, any>;
}

// Types pour la gestion de l'état des panels
export enum PanelTab {
  INFO = 'info',        // Informations générales
  NFT = 'nft',          // Détails du NFT
  AUDIO = 'audio',      // Contenu audio
  MAP = 'map',          // Localisation
  STATS = 'stats'       // Statistiques et indicateurs
}

// Configuration d'un panel
export interface PanelConfig {
  columnIndex: number;   // Index de la colonne
  chimereId: number;     // ID de la Chimère affichée
  position: {
    left: number;
    top: number;
  };
  activeTab: PanelTab;   // Onglet actif par défaut
}