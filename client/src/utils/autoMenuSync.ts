import { PAGE_STATUS_CONFIG } from '@/pages/admin/AdminHomePage';

// Interface pour les éléments de menu automatiques
interface AutoMenuSection {
  id: string;
  name: string;
  icon: string;
  visible: boolean;
  hasSubMenu: boolean;
  order: number;
  subItems: AutoMenuSubItem[];
}

interface AutoMenuSubItem {
  id: string;
  name: string;
  visible: boolean;
  order: number;
  tsxFile: string;
  tags?: string[];
  type?: string;
}

// Mapping automatique des routes vers les catégories
interface RouteConfig {
  category: string;
  name: string;
  order: number;
  visible?: boolean;
}

const ROUTE_CATEGORIES: { [key: string]: RouteConfig } = {
  // M.APP GRID
  '/admin/grid-pages': { category: 'app-grid', name: 'PAGES GRID', order: 1 },
  '/admin/grid-distribution-v3': { category: 'app-grid', name: 'GRID DISTRIBUTION RULES', order: 2 },
  '/grille-generee-v3': { category: 'app-grid', name: 'GRILLE GÉNÉRÉE V3', order: 3 },
  
  // COMPONENTS
  '/admin/container-types': { category: 'components', name: 'CONTAINERS TYPES', order: 1 },
  '/admin/container-layers-v3': { category: 'components', name: 'CONTAINER LAYERS & ZONES', order: 2 },
  '/admin/panels-composer': { category: 'components', name: 'PANELS COMPOSER', order: 3, visible: false },
  '/admin/uploader-unified': { category: 'components', name: 'UPLOADER UNIFIED', order: 4, visible: false },
  '/admin/wallets': { category: 'components', name: 'WALLETS', order: 5, visible: false },
  '/admin/cursors': { category: 'components', name: 'DYNAMIC CURSORS SYSTEM', order: 6 },
  
  // CONTENTS
  '/admin/chimeras': { category: 'contents', name: 'NFT DATABASE', order: 1, visible: false },
  '/admin/panels-nft': { category: 'contents', name: 'PANELS NFT', order: 2, visible: false },
  '/admin/music-containers': { category: 'contents', name: 'AUDIO', order: 3, visible: false },
  '/admin/video-containers': { category: 'contents', name: 'VIDEO', order: 4, visible: false },
  '/admin/editorials': { category: 'contents', name: 'EDITO', order: 5, visible: false },
  
  // INTERFACE ADMIN
  '/admin/header-template': { category: 'interface-admin', name: 'TEMPLATES ADMIN', order: 1 },
  '/admin/buttons': { category: 'interface-admin', name: 'BOUTONS ADMIN', order: 2 },
  '/admin/styles-system': { category: 'interface-admin', name: 'STYLES SYSTEM (TEMP)', order: 3, visible: false },
  '/admin/styles-global': { category: 'interface-admin', name: 'STYLES GLOBAL', order: 3 },
  '/admin/dashboard': { category: 'interface-admin', name: 'DASHBOARD', order: 4 },
  '/admin/architecture-diagnostic': { category: 'interface-admin', name: 'DIAGNOSTIC ARCHITECTURE', order: 5 },
  '/admin/menu-roue': { category: 'interface-admin', name: 'MENU ROUE ADMIN', order: 6 },
};

// Configuration des catégories
const CATEGORIES_CONFIG = {
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
    icon: 'Database',
    visible: true,
    hasSubMenu: true,
    order: 3
  },
  'interface-admin': {
    id: 'interface-admin',
    name: 'INTERFACE ADMIN',
    icon: 'Layout',
    visible: true,
    hasSubMenu: true,
    order: 4
  }
};

// Fonction d'injection automatique des tags
function injectTagsFromConfig(route: string): { tags: string[]; type?: string } {
  const config = PAGE_STATUS_CONFIG[route as keyof typeof PAGE_STATUS_CONFIG];
  const tags: string[] = [];
  
  if (config) {
    if (config.status) tags.push(config.status);
    if (config.version) tags.push(config.version);
  }
  
  return { tags, type: config?.type };
}

// Génération automatique du menu complet
export function generateAutoMenuSections(): AutoMenuSection[] {
  const sections: { [key: string]: AutoMenuSection } = {};
  
  // Initialiser les catégories
  Object.values(CATEGORIES_CONFIG).forEach(cat => {
    sections[cat.id] = {
      ...cat,
      subItems: []
    };
  });
  
  // Créer la liste complète des routes (existantes + nouvelles détectées)
  const allRoutes = { ...ROUTE_CATEGORIES };
  
  // Détecter et ajouter les nouvelles pages depuis PAGE_STATUS_CONFIG
  Object.keys(PAGE_STATUS_CONFIG).forEach(route => {
    if (route.startsWith('/admin/') && !allRoutes[route]) {
      const assignment = autoAssignCategory(route);
      allRoutes[route] = assignment;
    }
  });
  
  // Parcourir toutes les routes (existantes + nouvelles)
  Object.entries(allRoutes).forEach(([route, config]) => {
    const { tags, type } = injectTagsFromConfig(route);
    
    const subItem: AutoMenuSubItem = {
      id: route.replace('/admin/', '').replace('/', '-'),
      name: config.name,
      visible: config.visible !== false,
      order: config.order,
      tsxFile: route,
      tags,
      type
    };
    
    if (sections[config.category]) {
      sections[config.category].subItems.push(subItem);
    }
  });
  
  // Trier les sous-éléments par ordre
  Object.values(sections).forEach(section => {
    section.subItems.sort((a, b) => a.order - b.order);
  });
  
  return Object.values(sections).sort((a, b) => a.order - b.order);
}

// Fonction pour détecter automatiquement les nouvelles pages
export function detectNewAdminPages(): string[] {
  // Cette fonction sera appelée pour détecter les nouvelles pages
  // En comparant les routes existantes avec la configuration actuelle
  const currentRoutes = Object.keys(ROUTE_CATEGORIES);
  const configuredRoutes = Object.keys(PAGE_STATUS_CONFIG);
  
  // Nouvelles pages détectées dans PAGE_STATUS_CONFIG mais pas dans ROUTE_CATEGORIES
  const newPages = configuredRoutes.filter(route => 
    route.startsWith('/admin/') && !currentRoutes.includes(route)
  );
  
  return newPages;
}

// Fonction pour auto-assigner une nouvelle page à une catégorie
export function autoAssignCategory(route: string): { category: string; name: string; order: number } {
  // Logique d'assignation automatique basée sur le nom de la route
  const routeName = route.replace('/admin/', '');
  
  // Règles d'assignation automatique
  if (routeName.includes('grid') || routeName.includes('distribution')) {
    return { category: 'app-grid', name: routeName.toUpperCase().replace('-', ' '), order: 99 };
  }
  
  if (routeName.includes('container') || routeName.includes('panel') || routeName.includes('cursor')) {
    return { category: 'components', name: routeName.toUpperCase().replace('-', ' '), order: 99 };
  }
  
  if (routeName.includes('chimera') || routeName.includes('nft') || routeName.includes('music') || routeName.includes('video') || routeName.includes('editorial')) {
    return { category: 'contents', name: routeName.toUpperCase().replace('-', ' '), order: 99 };
  }
  
  // Par défaut, assigner à INTERFACE ADMIN
  return { category: 'interface-admin', name: routeName.toUpperCase().replace('-', ' '), order: 99 };
}

export default {
  generateAutoMenuSections,
  detectNewAdminPages,
  autoAssignCategory,
  ROUTE_CATEGORIES,
  CATEGORIES_CONFIG
};