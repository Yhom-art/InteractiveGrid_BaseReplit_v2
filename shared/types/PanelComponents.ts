/**
 * Types pour les composants spécialisés des panels
 * Ces types permettent de définir des composants modulaires à intégrer dans les panels
 */

// Type d'un composant de panel
export enum PanelComponentType {
  // Composants de base
  TEXT = 'text',
  IMAGE = 'image',
  BUTTON = 'button',
  DIVIDER = 'divider',
  
  // Composants spécialisés
  MAP = 'map',
  PODCAST = 'podcast',
  WALLET = 'wallet',
  GALLERY = 'gallery',
  VIDEO = 'video',
  AUDIO = 'audio',
  
  // Composants interactifs
  FORM = 'form',
  SOCIAL = 'social',
  LINK = 'link'
}

// Configuration de base pour tous les composants
export interface BasePanelComponent {
  id: string;
  type: PanelComponentType;
  order: number; // Position dans le panel
  title?: string;
  description?: string;
  isVisible: boolean;
}

// Composant texte riche
export interface TextComponent extends BasePanelComponent {
  type: PanelComponentType.TEXT;
  content: string; // Contenu HTML
  formatting?: {
    fontSize?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    color?: string;
  };
}

// Composant image
export interface ImageComponent extends BasePanelComponent {
  type: PanelComponentType.IMAGE;
  imageUrl: string;
  altText?: string;
  caption?: string;
  sizing?: {
    width?: string;
    height?: string;
    fit?: 'cover' | 'contain' | 'fill';
  };
}

// Composant bouton
export interface ButtonComponent extends BasePanelComponent {
  type: PanelComponentType.BUTTON;
  text: string;
  action: 'link' | 'function';
  target?: string; // URL pour l'action 'link'
  style?: {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    color?: string;
    size?: 'sm' | 'md' | 'lg';
  };
}

// Composant séparateur
export interface DividerComponent extends BasePanelComponent {
  type: PanelComponentType.DIVIDER;
  style?: {
    width?: string;
    color?: string;
    type?: 'solid' | 'dashed' | 'dotted';
  };
}

// Composant carte
export interface MapComponent extends BasePanelComponent {
  type: PanelComponentType.MAP;
  coordinates: {
    lat: number;
    lng: number;
  };
  zoom: number;
  markers?: Array<{
    id: string;
    lat: number;
    lng: number;
    label?: string;
  }>;
  mapStyle?: 'standard' | 'satellite' | 'terrain';
  interactive?: boolean;
}

// Composant podcast
export interface PodcastComponent extends BasePanelComponent {
  type: PanelComponentType.PODCAST;
  audioUrl: string;
  coverImageUrl?: string;
  author?: string;
  duration?: number; // En secondes
  chapters?: Array<{
    title: string;
    startTime: number; // En secondes
  }>;
  transcriptUrl?: string;
}

// Composant wallet
export interface WalletComponent extends BasePanelComponent {
  type: PanelComponentType.WALLET;
  address: string;
  network: 'ethereum' | 'polygon' | 'solana' | 'bitcoin';
  displayBalance: boolean;
  actions?: Array<{
    type: 'send' | 'receive' | 'swap' | 'buy';
    enabled: boolean;
  }>;
}

// Composant galerie
export interface GalleryComponent extends BasePanelComponent {
  type: PanelComponentType.GALLERY;
  images: Array<{
    id: string;
    imageUrl: string;
    altText?: string;
    caption?: string;
  }>;
  display: 'grid' | 'carousel' | 'masonry';
  columns?: number;
}

// Composant vidéo
export interface VideoComponent extends BasePanelComponent {
  type: PanelComponentType.VIDEO;
  videoUrl: string;
  thumbnailUrl?: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  provider?: 'youtube' | 'vimeo' | 'self-hosted';
}

// Composant audio
export interface AudioComponent extends BasePanelComponent {
  type: PanelComponentType.AUDIO;
  audioUrl: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  visualizer?: boolean;
}

// Composant formulaire
export interface FormComponent extends BasePanelComponent {
  type: PanelComponentType.FORM;
  fields: Array<{
    id: string;
    name: string;
    label: string;
    type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox';
    required: boolean;
    placeholder?: string;
    options?: string[]; // Pour les champs select
  }>;
  submitButtonText: string;
  successMessage?: string;
  submitUrl?: string;
}

// Composant réseaux sociaux
export interface SocialComponent extends BasePanelComponent {
  type: PanelComponentType.SOCIAL;
  networks: Array<{
    name: 'twitter' | 'instagram' | 'discord' | 'telegram' | 'facebook' | 'youtube';
    url: string;
    icon?: string;
  }>;
  displayStyle: 'icons' | 'buttons' | 'links';
}

// Composant lien
export interface LinkComponent extends BasePanelComponent {
  type: PanelComponentType.LINK;
  url: string;
  text: string;
  openInNewTab: boolean;
  icon?: string;
  style?: 'button' | 'text' | 'card';
}

// Union type pour tous les composants
export type PanelComponent =
  | TextComponent
  | ImageComponent
  | ButtonComponent
  | DividerComponent
  | MapComponent
  | PodcastComponent
  | WalletComponent
  | GalleryComponent
  | VideoComponent
  | AudioComponent
  | FormComponent
  | SocialComponent
  | LinkComponent;

// Type pour les données complètes d'un panel
export interface PanelData {
  id: number;
  title: string;
  chimeraId?: number;
  editorialId?: number;
  components: PanelComponent[];
  theme?: 'light' | 'dark' | 'custom';
  customTheme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  isPublished: boolean;
}