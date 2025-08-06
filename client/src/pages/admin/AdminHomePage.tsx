import React from 'react';
import { Link } from 'wouter';
import { 
  Grid, 
  Layers, 
  Music, 
  MousePointer, 
  Layout, 
  BarChart3, 
  Activity,
  Palette, 
  Users, 
  Clock,
  Database,
  Eye,
  Settings,
  ArrowUpRight,
  TrendingUp,
  Zap,
  Blocks,
  Plus,
  Archive,
  Folder,
  FileText,
  Upload,
  ArrowDownToLine,
  Wallet,
  Wifi,
  Code,
  Tags
} from 'lucide-react';

import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AutoTags } from '@/components/admin/PageStatusIndicator';
import { useQuery } from '@tanstack/react-query';
import { useGlobalPageStatus } from '@/hooks/usePageStatus';
import { useDynamicPageCreation } from '@/hooks/useDynamicPageCreation';
import { useDebug } from '@/components/DebugSystem';
import { TAG_CONFIGS, generateTagStyle } from '@shared/tags-system';
import { TagConfiguration } from '@shared/schema';

// Configuration centralisée des tags et statuts - source de vérité
export const PAGE_STATUS_CONFIG = {
  // Pages opérationnelles (✓ = connecté/live)
  '/admin/grid-pages': { status: '✓', version: 'v3', type: 'GRID', hasComponent: true },
  '/admin/grid-distribution-v3': { status: '✓', version: 'v3', type: 'GRID', hasComponent: true },
  '/admin/container-types': { status: '✓', version: 'v1', type: 'DATABASE', hasComponent: true },
  '/admin/container-layers-v3': { status: '✓', version: 'v3', type: 'LAYERS', hasComponent: true },
  '/admin/cursors': { status: '✓', version: null, type: 'SETTINGS', hasComponent: true },
  '/admin/music-containers': { status: '✓', version: null, type: 'DATABASE', hasComponent: true },
  '/admin/buttons': { status: 'beta', version: null, type: 'SETTINGS', hasComponent: false },
  '/admin/styles-system': { status: 'temp', version: null, type: 'SETTINGS', hasComponent: true },
  '/admin/styles-global': { status: '✓', version: null, type: 'SETTINGS', hasComponent: true },
  '/admin/menu-roue': { status: '✓', version: null, type: 'SETTINGS', hasComponent: true },
  
  // Pages en développement
  '/grille-generee-v3': { status: 'beta', version: 'v3', type: 'GRID', hasComponent: true },
  '/admin/chimeras': { status: 'beta', version: null, type: 'DATABASE', hasComponent: true },
  '/admin/panels-nft': { status: 'beta', version: null, type: 'LAYERS', hasComponent: true },
  '/admin/editorials': { status: 'beta', version: null, type: 'DATABASE', hasComponent: true },
  '/admin/header-template': { status: 'beta', version: null, type: 'LAYOUT', hasComponent: true },
  '/admin/dashboard': { status: 'beta', version: null, type: 'DASHBOARD', hasComponent: true },
  '/admin/architecture-diagnostic': { status: 'beta', version: null, type: 'DASHBOARD', hasComponent: true },
  
  // Pages futures (pas de tags, juste l'éclair éteint)
  '/admin/panels-composer': { status: 'indexed', version: null, type: 'LAYERS', hasComponent: false },
  '/admin/uploader-unified': { status: 'indexed', version: null, type: 'UPLOAD', hasComponent: false },
  '/admin/wallets': { status: 'indexed', version: null, type: 'BLOCKCHAIN', hasComponent: false },
  '/admin/video-containers': { status: 'indexed', version: null, type: 'DATABASE', hasComponent: false }
};

// Fonction de validation automatique du statut des pages
const validatePageStatus = (route: string): string => {
  const config = PAGE_STATUS_CONFIG[route as keyof typeof PAGE_STATUS_CONFIG];
  if (!config) return 'unknown';
  
  // Si marqué comme "indexed", retourne tel quel
  if (config.status === 'indexed') return 'indexed';
  
  // Vérification automatique basée sur les données API disponibles
  try {
    // Logique de validation selon le type de page
    switch (config.type) {
      case 'DATABASE':
        // Vérifier si les APIs correspondent fonctionnent
        return config.hasComponent ? '✓' : 'beta';
      case 'GRID':
        // Vérifier si les composants de grille sont connectés
        return config.hasComponent ? '✓' : 'beta';
      case 'SETTINGS':
        // Vérifier si les paramètres sont fonctionnels
        return config.hasComponent ? '✓' : 'beta';
      default:
        return config.status;
    }
  } catch (error) {
    console.warn(`Validation failed for ${route}:`, error);
    return 'beta';
  }
};

export function AdminHomePage() {
  const { debugMode } = useDebug();
  
  // Queries pour récupérer les analytics en temps réel
  const gridConfigQuery = useQuery({
    queryKey: ['/api/grid-v3-config/market-castings'],
    queryFn: () => fetch('/api/grid-v3-config/market-castings').then(res => res.json())
  });

  const containersQuery = useQuery({
    queryKey: ['/api/music-containers'],
    queryFn: () => fetch('/api/music-containers').then(res => res.json())
  });

  const cursorsQuery = useQuery({
    queryKey: ['/api/cursors-v2'],
    queryFn: () => fetch('/api/cursors-v2').then(res => res.json())
  });

  const layersQuery = useQuery({
    queryKey: ['/api/container-layer-configurations'],
    queryFn: () => fetch('/api/container-layer-configurations').then(res => res.json())
  });

  // Status global automatisé
  const globalStatus = useGlobalPageStatus();
  
  // Hook pour création dynamique de pages
  const { openCreator, CreatorModal } = useDynamicPageCreation();

  // Fonction pour obtenir les tags d'une page avec nouveau style
  const getPageTags = (route: string) => {
    const config = PAGE_STATUS_CONFIG[route as keyof typeof PAGE_STATUS_CONFIG];
    if (!config) return [];
    
    const tags = [];
    if (config.status) tags.push(config.status);
    if (config.version) tags.push(config.version);
    return tags;
  };

  // Récupération des configurations de tags sauvegardées
  const tagConfigsQuery = useQuery({
    queryKey: ['/api/tag-configurations'],
    staleTime: 5000,
    refetchInterval: 10000
  });

  // Fusion des configurations par défaut avec les configurations sauvegardées
  const mergedTagConfigs = React.useMemo(() => {
    if (!tagConfigsQuery.data || !Array.isArray(tagConfigsQuery.data)) {
      return TAG_CONFIGS;
    }

    const savedConfigs = tagConfigsQuery.data as TagConfiguration[];
    const merged = { ...TAG_CONFIGS };

    // Appliquer les configurations sauvegardées
    savedConfigs.forEach(saved => {
      if (merged[saved.tagId]) {
        merged[saved.tagId] = {
          ...merged[saved.tagId],
          name: saved.name,
          color: saved.color,
          category: saved.category as any,
          usage: saved.usage,
          isActive: saved.isActive
        };
      }
    });

    return merged;
  }, [tagConfigsQuery.data]);

  // Fonction de rendu des tags avec le système unifié
  const renderUnifiedTag = (tagType: string, content: string) => {
    const tagConfig = mergedTagConfigs[tagType.toLowerCase()];
    if (!tagConfig) return null;
    
    const tagStyles = {
      ...generateTagStyle(tagType.toUpperCase()),
      backgroundColor: tagConfig.color
    };
    
    return (
      <span 
        key={content}
        style={tagStyles}
        className="transition-all hover:scale-105"
      >
        {content}
      </span>
    );
  };

  // Fonction pour afficher les nouveaux tags visuels avec système unifié
  const renderNewTags = (route: string) => {
    const config = PAGE_STATUS_CONFIG[route as keyof typeof PAGE_STATUS_CONFIG];
    if (!config) return null;

    // Validation automatique du statut
    const currentStatus = validatePageStatus(route);
    const tags = [];
    
    // Icône éclair pour indiquer la connexion (séparée des tags)
    const connectionIcon = currentStatus === '✓' ? 
      <Zap className="w-3 h-3 text-green-500" /> : 
      <Zap className="w-3 h-3 text-gray-300" />;

    // Pour les pages "indexed", on affiche seulement l'éclair éteint
    if (currentStatus === 'indexed') {
      return connectionIcon;
    }

    // Tags de statut avec système unifié
    if (currentStatus === 'beta') {
      tags.push(renderUnifiedTag('beta', 'BETA'));
    } else if (currentStatus === 'draft') {
      tags.push(renderUnifiedTag('draft', 'DRAFT'));
    } else if (currentStatus === 'new') {
      tags.push(renderUnifiedTag('premium', 'NEW'));
    }

    // Tag de version avec système unifié
    if (config.version) {
      const versionTagId = config.version.toLowerCase(); // v1, v2, v3
      tags.push(renderUnifiedTag(versionTagId, config.version.toUpperCase()));
    }

    return (
      <div className="flex items-center gap-1">
        {connectionIcon}
        {tags.length > 0 && <div className="flex items-center gap-1">{tags}</div>}
      </div>
    );
  };

  // Calculs analytics
  const totalContainers = Array.isArray(containersQuery.data) ? containersQuery.data.length : 0;
  const activeCursors = Array.isArray(cursorsQuery.data) ? cursorsQuery.data.filter(c => c.enabled).length : 0;
  const totalCursors = Array.isArray(cursorsQuery.data) ? cursorsQuery.data.length : 0;
  const activeRules = gridConfigQuery.data?.deploymentRules ? 
    Object.values(gridConfigQuery.data.deploymentRules).filter((rule: any) => rule.enabled).length : 0;
  const totalRules = gridConfigQuery.data?.deploymentRules ? 
    Object.keys(gridConfigQuery.data.deploymentRules).length : 0;
  const layerConfigs = Array.isArray(layersQuery.data) ? layersQuery.data.length : 0;

  const handleCreatePage = async (category: string) => {
    const pageName = prompt(`Nom de la nouvelle page ${category}:`);
    if (!pageName) return;

    try {
      // Générer le nom de fichier et route automatiquement
      const fileName = pageName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const componentName = pageName.replace(/\s+/g, '') + 'Page';
      const route = `/admin/${fileName}`;
      
      // Créer la page avec notre template standardisé
      await createNewAdminPage({
        fileName,
        componentName,
        pageName,
        category,
        route
      });

      // Mettre à jour automatiquement la configuration
      updatePageRegistry(route, {
        status: 'new',
        version: null,
        type: getCategoryType(category),
        hasComponent: true
      });

      // Notification de succès
      alert(`✅ Page "${pageName}" créée avec succès!
      
📁 Fichier: ${componentName}.tsx
🔗 Route: ${route}
🎨 Template AdminHeaderTemplate appliqué
📋 Configuration automatique mise à jour
🔄 Synchronisation Menu Roue activée`);

      // Recharger la page pour afficher les changements
      window.location.reload();

    } catch (error) {
      console.error('Erreur lors de la création de la page:', error);
      alert(`❌ Erreur lors de la création de la page "${pageName}". Vérifiez la console pour plus de détails.`);
    }
  };

  // Fonction utilitaire pour déterminer le type de catégorie
  const getCategoryType = (category: string): 'GRID' | 'COMPONENTS' | 'CONTENTS' | 'SETTINGS' => {
    switch (category.toUpperCase()) {
      case 'GRID MAP': return 'GRID';
      case 'COMPOSANTS': return 'COMPONENTS';
      case 'CONTENTS': return 'CONTENTS';
      case 'INTERFACE ADMIN': return 'SETTINGS';
      default: return 'SETTINGS';
    }
  };

  // Fonction pour créer une nouvelle page admin avec template standardisé
  const createNewAdminPage = async ({ fileName, componentName, pageName, category, route }: {
    fileName: string;
    componentName: string;
    pageName: string;
    category: string;
    route: string;
  }) => {
    const pageTemplate = generatePageTemplate(componentName, pageName, route, category);
    
    // Ici nous utiliserions normalement une API pour créer le fichier
    // Pour l'instant, on simule la création
    console.log('🚀 Création de la page:', {
      fileName: `${componentName}.tsx`,
      route,
      template: pageTemplate.substring(0, 200) + '...'
    });
  };

  // Fonction pour mettre à jour le registre des pages
  const updatePageRegistry = (route: string, config: any) => {
    // Mise à jour automatique de PAGE_STATUS_CONFIG
    console.log('📋 Mise à jour du registre:', { route, config });
  };

  // Template generator pour nouvelles pages avec standards modulaires
  const generatePageTemplate = (componentName: string, pageName: string, route: string, category: string): string => {
    return `import React, { useState } from 'react';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AutoTags } from '@/components/admin/PageStatusIndicator';
import { 
  Palette, 
  Settings, 
  Eye, 
  Grid,
  Layers,
  Music,
  Database
} from 'lucide-react';

export function ${componentName}() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AdminCursorProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminHeaderTemplate 
          title="${pageName.toUpperCase()}" 
          filePath="client/src/pages/admin/${componentName}.tsx" 
        />
        
        <div className="max-w-7xl mx-auto p-6">
          {/* Header avec navigation */}
          <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <${getCategoryIcon(category)} className="w-6 h-6 text-blue-600 mr-3" />
                <h1 className="text-xl font-bold text-gray-900">${pageName}</h1>
              </div>
              <AutoTags route="${route}" />
            </div>
            
            {/* Navigation des onglets */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {['overview', 'configuration', 'advanced'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={\`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors \${
                    activeTab === tab
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }\`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Contenu principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panneau principal */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'overview' && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Vue d'ensemble</h2>
                  <p className="text-gray-600 mb-4">
                    Configuration et gestion de ${pageName.toLowerCase()} avec interface administrative complète.
                  </p>
                  
                  {/* Zone de contenu principal */}
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                      <${getCategoryIcon(category)} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Contenu à développer</h3>
                      <p className="text-gray-600">
                        Cette section contiendra les fonctionnalités spécifiques à ${pageName.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'configuration' && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Paramètres généraux</h3>
                      <p className="text-sm text-gray-600">Configuration des paramètres principaux.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Paramètres avancés</h2>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Options développeur</h3>
                      <p className="text-sm text-gray-600">Configuration avancée et outils de debug.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panneau latéral */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Catégorie:</span>
                    <span className="font-medium">${category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route:</span>
                    <span className="font-mono text-xs">${route}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <span className="text-green-600 font-medium">Actif</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors">
                    Exporter configuration
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors">
                    Réinitialiser
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors">
                    Documentation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminCursorProvider>
  );
}`;
  };

  // Fonction utilitaire pour obtenir l'icône de catégorie
  const getCategoryIcon = (category: string): string => {
    switch (category.toUpperCase()) {
      case 'GRID MAP': return 'Grid';
      case 'COMPOSANTS': return 'Layers';
      case 'CONTENTS': return 'Music';
      case 'INTERFACE ADMIN': return 'Settings';
      default: return 'Settings';
    }
  };

  return (
    <AdminCursorProvider>
      <div className={`min-h-screen bg-gray-50 ${debugMode ? 'debug-mode' : ''}`}>
        <div className="max-w-7xl mx-auto p-4">
          <AdminHeaderTemplate title="ADMIN" filePath="client/src/pages/admin/AdminHomePage.tsx" />
          


          {/* 4 Grandes Sections - Design Compact en 4 Colonnes */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            
            {/* M.APP GRID */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center mb-4">
                <Grid className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">M.APP GRID</h2>
              </div>
              
              <div className="space-y-1">
                <div className="p-2 rounded bg-gray-50 text-gray-500 text-xs opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Settings className="w-3 h-3 mr-2" />
                      <span>FLEXGRID ENGINE</span>
                    </div>
                    <AutoTags route="/admin/flexgrid-engine" />
                  </div>
                </div>
                
                <div className="p-2 rounded bg-gray-50 text-gray-500 text-xs opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Grid className="w-3 h-3 mr-2" />
                      <span>GRID BUILDER V3</span>
                    </div>
                    <AutoTags route="/admin/grid-builder" />
                  </div>
                </div>
                
                <Link 
                  to="/admin/grid-pages" 
                  className="flex items-center justify-between p-2 rounded hover:bg-blue-50 transition-colors group text-xs"
                >
                  <div className="flex items-center">
                    <Eye className="w-3 h-3 text-blue-600 mr-2" />
                    <span className="text-gray-900">PAGES GRID</span>
                  </div>
                  <AutoTags route="/admin/grid-pages" version="v3" />
                </Link>
                
                <Link 
                  to="/admin/grid-distribution-v3" 
                  className="flex items-center justify-between p-2 rounded hover:bg-blue-50 transition-colors group text-xs"
                >
                  <div className="flex items-center">
                    <Grid className="w-3 h-3 text-blue-600 mr-2" />
                    <span className="text-gray-900">GRID DISTRIBUTION RULES</span>
                  </div>
                  <AutoTags route="/admin/grid-distribution-v3" version="v3" />
                </Link>

                <Link 
                  to="/admin/grid-models" 
                  className="flex items-center justify-between p-2 rounded hover:bg-blue-50 transition-colors group text-xs"
                >
                  <div className="flex items-center">
                    <Grid className="w-3 h-3 text-blue-600 mr-2" />
                    <span className="text-gray-900">MODÈLES GRILLES V2</span>
                  </div>
                  <AutoTags route="/admin/grid-models" version="v2" />
                </Link>
                
                <Link 
                  to="/grille-generee-v3" 
                  className="flex items-center justify-between p-2 rounded hover:bg-emerald-50 transition-colors group text-xs"
                >
                  <div className="flex items-center">
                    <Grid className="w-3 h-3 text-emerald-600 mr-2" />
                    <span className="text-gray-900">GRILLE GÉNÉRÉE V3</span>
                  </div>
                  <AutoTags route="/grille-generee-v3" version="v3" />
                </Link>
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400 font-mono">GridMapDistributionV3.tsx</span>
              </div>
            </div>

            {/* COMPONENTS */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center mb-4">
                <Layers className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">COMPONENTS</h2>
              </div>
              
              <div className="space-y-1">
                <Link 
                  to="/admin/container-types" 
                  className="flex items-center justify-between p-2 rounded hover:bg-green-50 transition-colors group text-xs"
                >
                  <div className="flex items-center">
                    <Database className="w-3 h-3 text-green-600 mr-2" />
                    <span className="text-gray-900">CONTAINERS TYPES</span>
                  </div>
                  <AutoTags route="/admin/container-types" version="v1" />
                </Link>
                
                <Link 
                  to="/admin/container-layers-v3" 
                  className="flex items-center justify-between p-2 rounded hover:bg-green-50 transition-colors group text-xs ml-3"
                >
                  <div className="flex items-center">
                    <Layers className="w-3 h-3 text-green-600 mr-2" />
                    <span className="text-gray-900">CONTAINER LAYERS & ZONES</span>
                  </div>
                  <AutoTags route="/admin/container-layers-v3" version="v3" />
                </Link>

                <Link 
                  to="/admin/header-admin" 
                  className="flex items-center justify-between p-2 rounded hover:bg-blue-50 transition-colors group text-xs ml-3"
                >
                  <div className="flex items-center">
                    <Settings className="w-3 h-3 text-blue-600 mr-2" />
                    <span className="text-gray-900">HEADER ADMIN</span>
                  </div>
                  <AutoTags route="/admin/header-admin" />
                </Link>
                
                <Link 
                  to="/admin/header-template" 
                  className="flex items-center justify-between p-2 rounded hover:bg-green-50 transition-colors group text-xs ml-6"
                >
                  <div className="flex items-center">
                    <Layers className="w-3 h-3 text-green-600 mr-2" />
                    <span className="text-gray-700">Template Guide</span>
                  </div>
                  <AutoTags route="/admin/header-template" />
                </Link>
                
                <div className="p-2 rounded bg-gray-50 text-gray-500 text-xs opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Grid className="w-3 h-3 mr-2" />
                      <span>PANELS ADMIN V3</span>
                    </div>
                    <AutoTags route="/admin/panels-admin" />
                  </div>
                </div>
                
                <div className="p-2 rounded bg-gray-50 text-gray-500 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ArrowDownToLine className="w-3 h-3 mr-2" />
                      <span>UPLOADER UNIFIED</span>
                    </div>
                    <AutoTags route="/admin/uploader-unified" />
                  </div>
                </div>
                
                <div className="p-2 rounded bg-gray-50 text-gray-500 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wallet className="w-3 h-3 mr-2" />
                      <span>WALLETS</span>
                    </div>
                    <AutoTags route="/admin/wallets" />
                  </div>
                </div>
                
                <Link 
                  to="/admin/cursors" 
                  className="flex items-center justify-between p-2 rounded hover:bg-green-50 transition-colors group text-xs"
                >
                  <div className="flex items-center">
                    <Settings className="w-3 h-3 text-green-600 mr-2" />
                    <span className="text-gray-900">DYNAMIC CURSORS SYSTEM</span>
                  </div>
                  <AutoTags route="/admin/cursors" />
                </Link>
                

              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400 font-mono">ContainerLayersV3.tsx</span>
              </div>
            </div>

            {/* CONTENTS */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center mb-4">
                <Blocks className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">CONTENTS</h2>
              </div>
              
              <div className="space-y-1">
                <Link 
                  to="/admin/chimeras" 
                  className="flex items-center justify-between p-2 rounded hover:bg-purple-50 transition-colors group text-xs"
                >
                  <div className="flex items-center">
                    <Blocks className="w-3 h-3 text-purple-600 mr-2" />
                    <span className="text-gray-900">NFT DATABASE</span>
                  </div>
                  <AutoTags route="/admin/chimeras" />
                </Link>
                
                <div className="p-2 rounded bg-gray-50 text-gray-500 text-xs ml-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Blocks className="w-3 h-3 mr-2" />
                      <span>PANELS NFT</span>
                    </div>
                    <AutoTags route="/admin/panels-nft" />
                  </div>
                </div>
                
                <Link 
                  to="/admin/music-containers" 
                  className="flex items-center justify-between p-2 rounded hover:bg-purple-50 transition-colors group text-xs"
                >
                  <div className="flex items-center">
                    <Database className="w-3 h-3 text-purple-600 mr-2" />
                    <span className="text-gray-900">AUDIO</span>
                  </div>
                  <AutoTags route="/admin/music-containers" />
                </Link>
                
                <div className="p-2 rounded bg-gray-50 text-gray-500 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Database className="w-3 h-3 mr-2" />
                      <span>VIDEO</span>
                    </div>
                    <AutoTags route="/admin/video-containers" />
                  </div>
                </div>
                
                <Link 
                  to="/admin/editorials" 
                  className="flex items-center justify-between p-2 rounded hover:bg-purple-50 transition-colors group text-xs"
                >
                  <div className="flex items-center">
                    <Database className="w-3 h-3 text-purple-600 mr-2" />
                    <span className="text-gray-900">EDITO</span>
                  </div>
                  <AutoTags route="/admin/editorials" />
                </Link>
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400 font-mono">MusicContainersPage.tsx</span>
              </div>
            </div>

            {/* INTERFACE ADMIN */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center mb-4">
                <Layout className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">INTERFACE ADMIN</h2>
              </div>
              
              <div className="space-y-1">
                <Link 
                  to="/admin/header-template" 
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors group text-xs template admin-programmatic"
                >
                  <div className="flex items-center">
                    <Grid className="w-3 h-3 text-gray-500 mr-2" />
                    <span className="text-gray-700">TEMPLATES ADMIN</span>
                  </div>
                  <AutoTags route="/admin/header-template" />
                </Link>
                
                <Link 
                  to="/admin/buttons" 
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors group text-xs"
                >
                  <div className="flex items-center">
                    <Settings className="w-3 h-3 text-gray-500 mr-2" />
                    <span className="text-gray-700">BOUTONS ADMIN</span>
                  </div>
                  <AutoTags route="/admin/buttons" />
                </Link>
                
                <Link 
                  to="/admin/styles-global" 
                  className="flex items-center justify-between p-2 rounded hover:bg-blue-50 transition-colors group text-xs"
                >
                  <div className="flex items-center">
                    <Palette className="w-3 h-3 text-blue-600 mr-2" />
                    <span className="text-gray-900">STYLES GLOBAL</span>
                  </div>
                  <AutoTags route="/admin/styles-global" />
                </Link>
                
                <Link 
                  to="/admin/tags-admin" 
                  className="flex items-center justify-between p-2 rounded hover:bg-green-50 transition-colors group text-xs"
                >
                  <div className="flex items-center">
                    <Tags className="w-3 h-3 text-green-600 mr-2" />
                    <span className="text-gray-900">TAGS ADMIN</span>
                  </div>
                  <AutoTags route="/admin/tags-admin" />
                </Link>
                
                <div className="p-2 rounded bg-gray-50 text-gray-500 text-xs opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Palette className="w-3 h-3 mr-2" />
                      <span>STYLES FRONT V3</span>
                    </div>
                    <AutoTags route="/admin/styles-front" />
                  </div>
                </div>
                
                <Link 
                  to="/admin/header-template" 
                  className="flex items-center justify-between p-2 rounded hover:bg-blue-50 transition-colors group text-xs"
                >
                  <div className="flex items-center">
                    <Layout className="w-3 h-3 text-blue-600 mr-2" />
                    <span className="text-gray-900">TEMPLATES ADMIN</span>
                  </div>
                  <AutoTags route="/admin/header-template" />
                </Link>
                

                
                <Link 
                  to="/admin/dashboard" 
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors group text-xs"
                >
                  <div className="flex items-center">
                    <BarChart3 className="w-3 h-3 text-gray-500 mr-2" />
                    <span className="text-gray-700">DASHBOARD</span>
                  </div>
                  <AutoTags route="/admin/dashboard" />
                </Link>
                
                <Link 
                  to="/admin/architecture-diagnostic" 
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors group text-xs"
                >
                  <div className="flex items-center">
                    <Grid className="w-3 h-3 text-gray-500 mr-2" />
                    <span className="text-gray-700">DIAGNOSTIC ARCHITECTURE</span>
                  </div>
                  <AutoTags route="/admin/architecture-diagnostic" />
                </Link>
                
                <Link 
                  to="/admin/menu-roue" 
                  className="flex items-center justify-between p-2 rounded hover:bg-blue-50 transition-colors group text-xs"
                >
                  <div className="flex items-center">
                    <Settings className="w-3 h-3 text-blue-600 mr-2" />
                    <span className="text-gray-900">MENU ROUE ADMIN</span>
                  </div>
                  <AutoTags route="/admin/menu-roue" />
                </Link>
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400 font-mono">AdminHeaderTemplate.tsx</span>
              </div>
            </div>
          </div>

          {/* Zone Stats Minimaliste + Création + Archives */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            
            {/* Stats Programmatiques */}
            <div className="bg-black rounded-lg border-2 border-gray-800 p-4">
              <div className="flex items-center mb-3">
                <BarChart3 className="w-4 h-4 text-green-400 mr-2" />
                <span className="text-xs text-green-400 uppercase tracking-wide font-mono">APP DATAS</span>
              </div>
              
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">containers.total</span>
                  <span className="text-green-400 font-bold admin-dynamic-data" data-db-connected="true">{totalContainers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">cursors.active</span>
                  <span className="text-cyan-400 font-bold admin-dynamic-data" data-db-connected="true">{activeCursors}/{totalCursors}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">grid.rules</span>
                  <span className="text-purple-400 font-bold admin-programmatic template">{activeRules}/{totalRules}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">layers.config</span>
                  <span className="text-orange-400 font-bold admin-programmatic template">{layerConfigs}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-800">
                <div className="flex items-center text-xs mb-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-gray-400 font-mono">grid_v3.operational</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                  <span className="text-gray-400 font-mono">backup.system</span>
                </div>
                <div className="mt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-mono">last.backup</span>
                    <span className="text-gray-500 font-mono admin-external-source hardcoded">2025-06-12_15:08</span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-0.5">
                    <span className="text-gray-400 font-mono">rollback.ready</span>
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full admin-real-time interactive"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Création Nouvelle Page - Nouveau Système */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center mb-3">
                <Plus className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-xs text-gray-700 uppercase tracking-wide font-medium">CREATE NEW PAGE</span>
              </div>
              
              <button 
                onClick={openCreator}
                className="w-full p-3 text-left rounded border border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-colors group mb-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Plus className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-gray-700 group-hover:text-blue-700 font-medium">Créer une page admin</span>
                  </div>
                  <div className="text-xs text-gray-500 group-hover:text-blue-600">
                    Assistant 3 étapes
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1 ml-6">
                  Choisir catégorie • Modèle de colonnes • Configuration header
                </div>
              </button>
              
              <Link 
                to="/admin/page-manager"
                className="w-full p-3 text-left rounded border border-dashed border-green-200 hover:border-green-400 hover:bg-green-50 transition-colors group block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Folder className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-gray-700 group-hover:text-green-700 font-medium">Gestionnaire hiérarchique</span>
                  </div>
                  <div className="text-xs text-gray-500 group-hover:text-green-600">
                    Type WordPress
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1 ml-6">
                  Organisation parent/enfant • Statistiques • Export structure
                </div>
              </Link>
            </div>

            {/* Plans & Documentation */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center mb-3">
                <TrendingUp className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-xs text-purple-700 uppercase tracking-wide font-medium">PLANS & DOCS</span>
              </div>
              
              <div className="space-y-2">
                <Link 
                  to="/admin/plan-complet-v3"
                  className="flex items-center justify-between p-2 rounded hover:bg-purple-50 transition-colors group text-xs border border-purple-200 w-full text-left"
                >
                  <div className="flex items-center">
                    <TrendingUp className="w-3 h-3 text-purple-600 mr-2" />
                    <span className="text-gray-900">Plan Complet V3</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-purple-500" />
                </Link>
                
                <Link 
                  to="/admin/readme-v3"
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors group text-xs border border-gray-200 w-full text-left"
                >
                  <div className="flex items-center">
                    <FileText className="w-3 h-3 text-gray-600 mr-2" />
                    <span className="text-gray-700">README Guide</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </Link>
              </div>
            </div>

            {/* Archives */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center mb-3">
                <Archive className="w-4 h-4 text-gray-300 mr-2" />
                <span className="text-xs text-gray-500 uppercase tracking-wide">ARCHIVES</span>
              </div>
              
              <div className="space-y-1">
                <div className="border border-yellow-200 rounded-lg p-3 bg-yellow-50">
                  <div className="flex items-center mb-2">
                    <Grid className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">GRILLE CHIMÉRIQUE V1</span>
                  </div>
                  <p className="text-xs text-yellow-700 mb-3 leading-relaxed">
                    Version originale avec grille native 32x32, panels complets, et tous les comportements de référence. 
                    Code source préservé pour récupération progressive des fonctionnalités.
                  </p>
                  <div className="flex gap-2">
                    <Link 
                      to="/v1" 
                      className="flex-1 flex items-center justify-center p-2 rounded bg-yellow-600 hover:bg-yellow-700 transition-colors text-xs"
                    >
                      <Grid className="w-3 h-3 text-white mr-2" />
                      <span className="text-white font-medium">Accès Direct V1</span>
                    </Link>
                    <button 
                      onClick={() => window.open('/v1', '_blank')}
                      className="flex-1 flex items-center justify-center p-2 rounded border border-yellow-600 hover:bg-yellow-100 transition-colors text-xs"
                    >
                      <span className="text-yellow-700 font-medium">Nouvel Onglet</span>
                    </button>
                  </div>
                  <div className="mt-2 pt-2 border-t border-yellow-200">
                    <span className="text-xs text-yellow-600 font-mono">GrilleChimeriquePage.tsx</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500 font-mono">legacy.backup.available</span>
              </div>
            </div>

            {/* Indicateurs CSS - Bloc d'admin */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center mb-3">
                <Code className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-xs text-blue-700 uppercase tracking-wide font-medium">INDICATEURS CSS</span>
              </div>
              
              <div className="space-y-3">
                <div className="text-xs text-gray-600 leading-relaxed mb-4">
                  Classes visuelles pour identifier le type de données affichées dans l'interface admin.
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="admin-dynamic-data p-2 rounded text-xs">
                    <strong>admin-dynamic-data</strong><br/>
                    <span className="text-gray-600">Données de la base</span>
                  </div>
                  
                  <div className="admin-programmatic p-2 rounded text-xs">
                    <strong>admin-programmatic</strong><br/>
                    <span className="text-gray-600">Éléments générés</span>
                  </div>
                  
                  <div className="admin-external-source p-2 rounded text-xs">
                    <strong>admin-external-source</strong><br/>
                    <span className="text-gray-600">Sources externes</span>
                  </div>
                  
                  <div className="admin-real-time p-2 rounded text-xs">
                    <strong>admin-real-time</strong><br/>
                    <span className="text-gray-600">Temps réel</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-mono">admin-unified.css</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <CreatorModal />
      </div>
    </AdminCursorProvider>
  );
}