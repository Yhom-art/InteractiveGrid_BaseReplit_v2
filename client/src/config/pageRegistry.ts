// Configuration centralisée pour toutes les pages admin
// Ce fichier est la source unique de vérité pour l'automatisation

export interface PageStatus {
  status: 'connected' | 'new' | 'temp' | '✓';
  version: string | null;
  type: 'GRID' | 'COMPONENTS' | 'CONTENTS' | 'SETTINGS';
  hasComponent: boolean;
}

// Configuration des statuts de pages (source unique de vérité)
export const PAGE_STATUS_CONFIG: Record<string, PageStatus> = {
  // APP GRID
  '/admin/grid-distribution-v3': { status: '✓', version: 'v3', type: 'GRID', hasComponent: true },
  '/grille-generee-v3': { status: '✓', version: 'v3', type: 'GRID', hasComponent: true },
  '/admin/grid/models-v2': { status: '✓', version: 'v2', type: 'GRID', hasComponent: true },

  // COMPONENTS
  '/admin/container-types': { status: '✓', version: 'v1', type: 'COMPONENTS', hasComponent: true },
  '/admin/container-layers-v3': { status: '✓', version: 'v3', type: 'COMPONENTS', hasComponent: true },
  '/admin/panels-composer': { status: 'temp', version: null, type: 'COMPONENTS', hasComponent: false },
  '/admin/uploader-unified': { status: 'temp', version: null, type: 'COMPONENTS', hasComponent: false },
  '/admin/cursors': { status: '✓', version: null, type: 'COMPONENTS', hasComponent: true },

  // CONTENTS
  '/admin/chimeras': { status: '✓', version: null, type: 'CONTENTS', hasComponent: true },
  '/admin/music-containers': { status: '✓', version: null, type: 'CONTENTS', hasComponent: true },
  '/admin/panels-nft': { status: '✓', version: null, type: 'CONTENTS', hasComponent: true },
  '/admin/video-containers': { status: 'temp', version: null, type: 'CONTENTS', hasComponent: false },
  '/admin/editorials': { status: '✓', version: null, type: 'CONTENTS', hasComponent: true },

  // INTERFACE ADMIN
  '/admin/header-template': { status: '✓', version: null, type: 'SETTINGS', hasComponent: true },
  '/admin/buttons': { status: '✓', version: null, type: 'SETTINGS', hasComponent: true },
  '/admin/styles-system': { status: 'temp', version: null, type: 'SETTINGS', hasComponent: true },
  '/admin/styles-global': { status: 'new', version: null, type: 'SETTINGS', hasComponent: true },
  '/admin/tags-admin': { status: 'new', version: null, type: 'SETTINGS', hasComponent: true },
  '/admin/dashboard': { status: '✓', version: null, type: 'SETTINGS', hasComponent: true },
  '/admin/architecture-diagnostic': { status: '✓', version: null, type: 'SETTINGS', hasComponent: true },
  '/admin/menu-roue': { status: '✓', version: null, type: 'SETTINGS', hasComponent: true },
};

// Configuration des routes pour le menu automatique
export const ROUTE_CATEGORIES: { [key: string]: { category: string; name: string; order: number; visible?: boolean } } = {
  // APP GRID
  '/admin/grid-distribution-v3': { category: 'app-grid', name: 'DISTRIBUTION GRID V3', order: 1 },
  '/grille-generee-v3': { category: 'app-grid', name: 'GRILLE GÉNÉRÉE V3', order: 2 },
  '/admin/grid-models': { category: 'app-grid', name: 'MODÈLES GRILLES V2', order: 3 },
  
  // COMPONENTS
  '/admin/container-types': { category: 'components', name: 'CONTAINERS TYPES', order: 1 },
  '/admin/container-layers-v3': { category: 'components', name: 'CONTAINER LAYERS V3', order: 2 },
  '/admin/panels-composer': { category: 'components', name: 'PANELS COMPOSER', order: 3, visible: false },
  '/admin/uploader-unified': { category: 'components', name: 'UPLOADER UNIFIED', order: 4, visible: false },
  '/admin/cursors': { category: 'components', name: 'CURSORS ADMIN', order: 5 },
  
  // CONTENTS
  '/admin/chimeras': { category: 'contents', name: 'CHIMÈRES', order: 1 },
  '/admin/music-containers': { category: 'contents', name: 'MUSIC', order: 2 },
  '/admin/panels-nft': { category: 'contents', name: 'PANELS NFT', order: 3 },
  '/admin/video-containers': { category: 'contents', name: 'VIDEO', order: 4, visible: false },
  '/admin/editorials': { category: 'contents', name: 'EDITO', order: 5 },
  
  // INTERFACE ADMIN
  '/admin/header-template': { category: 'interface-admin', name: 'TEMPLATES ADMIN', order: 1 },
  '/admin/buttons': { category: 'interface-admin', name: 'BOUTONS ADMIN', order: 2 },
  '/admin/styles-global': { category: 'interface-admin', name: 'STYLES GLOBAL', order: 3 },
  '/admin/styles-system': { category: 'interface-admin', name: 'STYLES SYSTEM (TEMP)', order: 4, visible: false },
  '/admin/dashboard': { category: 'interface-admin', name: 'DASHBOARD', order: 5 },
  '/admin/architecture-diagnostic': { category: 'interface-admin', name: 'DIAGNOSTIC ARCHITECTURE', order: 6 },
  '/admin/menu-roue': { category: 'interface-admin', name: 'MENU ROUE ADMIN', order: 7 },
};

// Configuration des catégories
export const CATEGORIES_CONFIG = {
  'app-grid': {
    id: 'app-grid',
    name: 'M.APP GRID',
    icon: 'Grid',
    visible: true,
    hasSubMenu: true,
    order: 1
  },
  'components': {
    id: 'components',
    name: 'COMPONENTS',
    icon: 'Layers',
    visible: true,
    hasSubMenu: true,
    order: 2
  },
  'contents': {
    id: 'contents',
    name: 'CONTENTS',
    icon: 'Music',
    visible: true,
    hasSubMenu: true,
    order: 3
  },
  'interface-admin': {
    id: 'interface-admin',
    name: 'INTERFACE ADMIN',
    icon: 'Settings',
    visible: true,
    hasSubMenu: true,
    order: 4
  }
};

// Fonction pour détecter automatiquement de nouvelles pages
export function detectNewPages(): string[] {
  // Logique de détection basée sur le système de fichiers ou l'API
  // Cette fonction sera appelée périodiquement pour détecter de nouvelles pages
  const allPages = Object.keys(PAGE_STATUS_CONFIG);
  const configuredPages = Object.keys(ROUTE_CATEGORIES);
  
  return allPages.filter(page => !configuredPages.includes(page));
}

// Auto-assignation de catégorie pour nouvelles pages
export function autoAssignCategory(route: string): { category: string; name: string; order: number } {
  const routeName = route.replace('/admin/', '');
  
  if (routeName.includes('grid') || routeName.includes('distribution')) {
    return { category: 'app-grid', name: routeName.toUpperCase().replace(/-/g, ' '), order: 99 };
  }
  
  if (routeName.includes('container') || routeName.includes('panel') || routeName.includes('cursor')) {
    return { category: 'components', name: routeName.toUpperCase().replace(/-/g, ' '), order: 99 };
  }
  
  if (routeName.includes('chimera') || routeName.includes('nft') || routeName.includes('music') || routeName.includes('video') || routeName.includes('editorial')) {
    return { category: 'contents', name: routeName.toUpperCase().replace(/-/g, ' '), order: 99 };
  }
  
  return { category: 'interface-admin', name: routeName.toUpperCase().replace(/-/g, ' '), order: 99 };
}