// Système centralisé de gestion des tags pour l'application et l'admin

export interface TagConfig {
  id: string;
  name: string;
  color: string;
  category: 'content' | 'status' | 'version' | 'user' | 'system' | 'priority';
  usage: string;
  isActive: boolean;
}

export interface TagRenderOptions {
  adaptToTextSize: boolean;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  borderRadius?: string;
  paddingRatio?: 'compact' | 'normal' | 'comfortable';
}

// Configuration centralisée des tags du système
export const TAG_CONFIGS: Record<string, TagConfig> = {
  // Contenu
  nft: {
    id: 'nft',
    name: 'NFT',
    color: '#10b981',
    category: 'content',
    usage: 'Type contenu NFT',
    isActive: true
  },
  audio: {
    id: 'audio',
    name: 'AUDIO',
    color: '#3b82f6',
    category: 'content',
    usage: 'Contenu sonore',
    isActive: true
  },
  video: {
    id: 'video',
    name: 'VIDEO',
    color: '#8b5cf6',
    category: 'content',
    usage: 'Contenu vidéo',
    isActive: true
  },
  info: {
    id: 'info',
    name: 'INFO',
    color: '#f59e0b',
    category: 'content',
    usage: 'Information',
    isActive: true
  },
  
  // Statuts
  active: {
    id: 'active',
    name: 'ACTIVE',
    color: '#06b6d4',
    category: 'status',
    usage: 'Statut actif',
    isActive: true
  },
  inactive: {
    id: 'inactive',
    name: 'INACTIVE',
    color: '#6b7280',
    category: 'status',
    usage: 'Statut inactif',
    isActive: true
  },
  
  // Versions
  v1: {
    id: 'v1',
    name: 'V1',
    color: '#6b7280',
    category: 'version',
    usage: 'Version 1',
    isActive: true
  },
  v2: {
    id: 'v2',
    name: 'V2',
    color: '#374151',
    category: 'version',
    usage: 'Version 2',
    isActive: true
  },
  v3: {
    id: 'v3',
    name: 'V3',
    color: '#111827',
    category: 'version',
    usage: 'Version 3',
    isActive: true
  },
  beta: {
    id: 'beta',
    name: 'BETA',
    color: '#f59e0b',
    category: 'version',
    usage: 'Version beta',
    isActive: true
  },
  draft: {
    id: 'draft',
    name: 'DRAFT',
    color: '#9ca3af',
    category: 'version',
    usage: 'Brouillon',
    isActive: true
  },
  live: {
    id: 'live',
    name: 'LIVE',
    color: '#059669',
    category: 'version',
    usage: 'En production',
    isActive: true
  },
  
  // Utilisateurs
  user: {
    id: 'user',
    name: 'USER',
    color: '#84cc16',
    category: 'user',
    usage: 'Utilisateur',
    isActive: true
  },
  premium: {
    id: 'premium',
    name: 'PREMIUM',
    color: '#f97316',
    category: 'user',
    usage: 'Premium',
    isActive: true
  },
  
  // Système
  system: {
    id: 'system',
    name: 'SYSTEM',
    color: '#ef4444',
    category: 'system',
    usage: 'Système',
    isActive: true
  },
  
  // Priorité / Layers - versions unifiées
  'priority-1-grid-nativ': {
    id: 'priority-1-grid-nativ',
    name: '#1 GRID NATIV',
    color: '#dc2626',
    category: 'priority',
    usage: 'Priorité 1 - Layer natif',
    isActive: true
  },
  'priority-2-grid-activ': {
    id: 'priority-2-grid-activ',
    name: '#2 GRID ACTIV',
    color: '#ea580c',
    category: 'priority',
    usage: 'Priorité 2 - Layer actif',
    isActive: true
  },
  'priority-3-grid-inactiv': {
    id: 'priority-3-grid-inactiv',
    name: '#3 GRID INACTIV',
    color: '#ca8a04',
    category: 'priority',
    usage: 'Priorité 3 - Layer inactif',
    isActive: true
  }
};

// Logique d'adaptation de taille selon la typographie
export const getTagPadding = (fontSize: number, ratio: TagRenderOptions['paddingRatio'] = 'normal'): string => {
  const baseMultiplier = {
    compact: 0.25,
    normal: 0.4,
    comfortable: 0.6
  }[ratio];
  
  const verticalPadding = Math.max(1, Math.round(fontSize * baseMultiplier));
  const horizontalPadding = Math.max(2, Math.round(fontSize * baseMultiplier * 1.5));
  
  return `${verticalPadding}px ${horizontalPadding}px`;
};

// Fonction utilitaire pour générer le style d'un tag
export const generateTagStyle = (
  tagId: string, 
  renderOptions: Partial<TagRenderOptions> = {}
): React.CSSProperties => {
  const config = TAG_CONFIGS[tagId];
  if (!config) return {};
  
  // TOUJOURS utiliser 8px comme taille de référence unifié
  const fontSize = 8;
  const adaptToTextSize = renderOptions.adaptToTextSize ?? true;
  
  return {
    backgroundColor: config.color,
    color: 'white',
    fontSize: '8px',
    fontFamily: 'Roboto Mono, monospace',
    fontWeight: '500',
    padding: adaptToTextSize ? 
      getTagPadding(fontSize, renderOptions.paddingRatio || 'compact') : 
      '1px 2px',
    borderRadius: '2px',
    display: 'inline-block',
    whiteSpace: 'nowrap' as const,
    lineHeight: '1.2'
  };
};

// Fonction pour obtenir les tags par catégorie
export const getTagsByCategory = (
  category: TagConfig['category'], 
  configs: Record<string, TagConfig> = TAG_CONFIGS
): TagConfig[] => {
  return Object.values(configs).filter(tag => tag.category === category && tag.isActive);
};

// Fonction pour obtenir tous les tags actifs
export const getAllActiveTags = (): TagConfig[] => {
  return Object.values(TAG_CONFIGS).filter(tag => tag.isActive);
};