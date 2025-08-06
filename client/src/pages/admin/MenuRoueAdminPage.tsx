import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Grid, 
  Layers, 
  Database, 
  Layout, 
  Save, 
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Menu,
  ArrowLeft,
  Home
} from 'lucide-react';
import { Link } from 'wouter';

import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { MenuRoueFrontend } from '@/components/MenuRoueFrontend';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { PAGE_STATUS_CONFIG } from './AdminHomePage';
import { generateAutoMenuSections, detectNewAdminPages, autoAssignCategory } from '@/utils/autoMenuSync';

interface MenuRoueSection {
  id: string;
  name: string;
  icon: string;
  visible: boolean;
  hasSubMenu: boolean;
  subItems?: MenuRoueSubItem[];
  order: number;
}

interface MenuRoueSubItem {
  id: string;
  name: string;
  visible: boolean;
  order: number;
  tsxFile?: string;
  tags?: string[];
  type?: string;
}

export function MenuRoueAdminPage() {
  const queryClient = useQueryClient();

  // Configuration automatique complète via autoMenuSync
  const getDefaultMenuSections = (): MenuRoueSection[] => {
    return generateAutoMenuSections();
  };

  // Système de synchronisation automatique 100%
  const [syncStatus, setSyncStatus] = useState<'checking' | 'synced' | 'new-pages'>('checking');
  const [lastSync, setLastSync] = useState<Date>(new Date());

  useEffect(() => {
    const detectAndSyncNewPages = () => {
      setSyncStatus('checking');
      const newPages = detectNewAdminPages();
      
      if (newPages.length > 0) {
        console.log('🔄 SYNC AUTO: Nouvelles pages détectées:', newPages);
        newPages.forEach(page => {
          const assignment = autoAssignCategory(page);
          console.log(`📍 AUTO-ASSIGN: ${page} → ${assignment.category} (${assignment.name})`);
        });
        setSyncStatus('new-pages');
        queryClient.invalidateQueries({ queryKey: ['/api/menu-roue-config'] });
      } else {
        setSyncStatus('synced');
      }
      
      setLastSync(new Date());
    };

    detectAndSyncNewPages();
    
    // Test direct : vérifier que STYLES GLOBAL est détecté
    const testAutoSync = () => {
      const autoSections = generateAutoMenuSections();
      const stylesGlobalSection = autoSections.find(section => 
        section.subItems?.some(item => item.tsxFile === '/admin/styles-global')
      );
      
      if (stylesGlobalSection) {
        console.log('✅ STYLES GLOBAL détecté dans autoMenuSync:', stylesGlobalSection);
        setSyncStatus('synced');
      } else {
        console.log('❌ STYLES GLOBAL non détecté dans autoMenuSync');
        setSyncStatus('new-pages');
      }
    };
    
    testAutoSync();
    
    // Synchronisation automatique toutes les 30 secondes
    const syncInterval = setInterval(detectAndSyncNewPages, 30000);
    
    return () => clearInterval(syncInterval);
  }, [queryClient]);

  // States locaux pour l'interface
  const [displayMode, setDisplayMode] = useState<'full' | 'categories-only' | 'custom'>('full');
  const [buttonPosition, setButtonPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');
  const [expandedSections, setExpandedSections] = useState<string[]>(['app-grid', 'components', 'contents', 'interface-admin']);
  const [hasChanges, setHasChanges] = useState(false);
  const [menuSections, setMenuSections] = useState<MenuRoueSection[]>(getDefaultMenuSections());
  
  // Options d'affichage des tags
  const [showTags, setShowTags] = useState(true);
  const [showVersions, setShowVersions] = useState(true);

  // Charger la configuration depuis l'API
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['/api/menu-roue-config'],
    queryFn: async () => {
      const response = await fetch('/api/menu-roue-config');
      if (!response.ok) throw new Error('Failed to load config');
      return response.json();
    }
  });

  // Mutation pour sauvegarder la configuration
  const saveConfigMutation = useMutation({
    mutationFn: async (configData: any) => {
      console.log('🚀 Envoi de la configuration:', configData);
      const response = await apiRequest('POST', '/api/menu-roue-config', configData);
      return response.json();
    },
    onSuccess: (data) => {
      // Invalider le cache local ET global
      queryClient.invalidateQueries({ queryKey: ['/api/menu-roue-config'] });
      queryClient.refetchQueries({ queryKey: ['/api/menu-roue-config'] });
      setHasChanges(false);
      console.log('✅ Configuration sauvegardée avec succès:', data);
    },
    onError: (error) => {
      console.error('❌ Erreur lors de la sauvegarde:', error);
    }
  });

  // Synchronisation avec les données chargées
  useEffect(() => {
    if (configData && configData.sections && Object.keys(configData.sections).length > 0) {
      // Convertir l'objet sections en array
      const sectionsArray = Object.values(configData.sections) as MenuRoueSection[];
      setMenuSections(sectionsArray.sort((a, b) => a.order - b.order));
      setDisplayMode(configData.displayMode || 'full');
      setButtonPosition(configData.buttonPosition || 'bottom-right');
    } else {
      // Utiliser la configuration par défaut si pas de données en base
      setMenuSections(getDefaultMenuSections());
    }
  }, [configData]);

  const toggleSectionVisibility = (sectionId: string) => {
    setMenuSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, visible: !section.visible }
        : section
    ));
    setHasChanges(true);
  };

  const toggleSubItemVisibility = (sectionId: string, subItemId: string) => {
    setMenuSections(prev => prev.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            subItems: section.subItems?.map(item =>
              item.id === subItemId
                ? { ...item, visible: !item.visible }
                : item
            )
          }
        : section
    ));
    setHasChanges(true);
  };

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const saveConfiguration = () => {
    // Convertir les sections en objet pour la base de données
    const sectionsObject = menuSections.reduce((acc, section) => {
      acc[section.id] = section;
      return acc;
    }, {} as Record<string, MenuRoueSection>);

    const configData = {
      name: `Menu Configuration - ${new Date().toLocaleDateString()}`,
      displayMode,
      buttonPosition,
      sections: sectionsObject
    };

    saveConfigMutation.mutate(configData);
  };

  const resetToDefault = () => {
    // Reset uniquement l'interface locale, sans toucher à la base de données
    setDisplayMode('full');
    setButtonPosition('bottom-right');
    setExpandedSections(['app-grid', 'components', 'contents', 'interface-admin']);
    setMenuSections(getDefaultMenuSections().map((section: MenuRoueSection) => ({ 
      ...section, 
      visible: true,
      subItems: section.subItems?.map((item: MenuRoueSubItem) => ({ ...item, visible: true }))
    })));
    setHasChanges(true); // Marquer comme modifié pour permettre la sauvegarde
  };

  return (
    <AdminCursorProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <div className="flex-1">
            <div className="max-w-7xl mx-auto p-4">
              <AdminHeaderTemplate
                title="Menu Roue Admin"
                filePath="MenuRoueAdminPage.tsx"
              />
              
              <div className="mb-6 flex gap-2 items-center">
                <button
                  onClick={resetToDefault}
                  className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </button>
                <button
                  onClick={saveConfiguration}
                  disabled={!hasChanges}
                  className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {hasChanges ? 'Sauvegarder *' : 'Sauvegardé'}
                </button>
                
                {/* Indicateur de synchronisation automatique */}
                <div className="ml-auto flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className={`w-2 h-2 rounded-full ${
                    syncStatus === 'checking' ? 'bg-yellow-500 animate-pulse' :
                    syncStatus === 'synced' ? 'bg-green-500' :
                    'bg-orange-500 animate-pulse'
                  }`}></div>
                  <span className="text-xs text-blue-700 font-mono">
                    {syncStatus === 'checking' ? 'SYNC...' :
                     syncStatus === 'synced' ? 'AUTO SYNC ✓' :
                     'NOUVELLES PAGES DÉTECTÉES'}
                  </span>
                  <span className="text-xs text-blue-500 font-mono">
                    {lastSync.toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                {/* Configuration globale */}
                <div className="col-span-4 space-y-4">
                  <div className="bg-white rounded-lg border p-4">
                    <h3 className="font-medium mb-4 flex items-center uppercase" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                      <Settings className="w-4 h-4 mr-2" />
                      MODE D'AFFICHAGE
                    </h3>
                    
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="displayMode"
                          value="full"
                          checked={displayMode === 'full'}
                          onChange={(e) => {
                            setDisplayMode(e.target.value as any);
                            setHasChanges(true);
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm uppercase" style={{ fontFamily: 'Roboto Mono, monospace' }}>COMPLET (AVEC SOUS-MENUS)</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="displayMode"
                          value="categories-only"
                          checked={displayMode === 'categories-only'}
                          onChange={(e) => {
                            setDisplayMode(e.target.value as any);
                            setHasChanges(true);
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm uppercase" style={{ fontFamily: 'Roboto Mono, monospace' }}>CATÉGORIES SEULEMENT</span>
                      </label>
                    </div>
                  </div>

                  {/* Options d'affichage des tags */}
                  <div className="bg-white rounded-lg border p-4">
                    <h3 className="font-medium mb-4 flex items-center uppercase" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                      <Settings className="w-4 h-4 mr-2" />
                      AFFICHAGE TAGS
                    </h3>
                    
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={showTags}
                          onChange={(e) => {
                            setShowTags(e.target.checked);
                            setHasChanges(true);
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm uppercase" style={{ fontFamily: 'Roboto Mono, monospace' }}>AFFICHER STATUTS (✓, beta, draft)</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={showVersions}
                          onChange={(e) => {
                            setShowVersions(e.target.checked);
                            setHasChanges(true);
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm uppercase" style={{ fontFamily: 'Roboto Mono, monospace' }}>AFFICHER VERSIONS (v3, v2)</span>
                      </label>
                    </div>
                  </div>

                  {/* Position du bouton */}
                  <div className="bg-white rounded-lg border p-4">
                    <h3 className="font-medium mb-4 flex items-center uppercase" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                      <Settings className="w-4 h-4 mr-2" />
                      POSITION BOUTON
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="buttonPosition"
                          value="top-left"
                          checked={buttonPosition === 'top-left'}
                          onChange={(e) => {
                            setButtonPosition(e.target.value as any);
                            setHasChanges(true);
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">Haut Gauche</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="buttonPosition"
                          value="top-right"
                          checked={buttonPosition === 'top-right'}
                          onChange={(e) => {
                            setButtonPosition(e.target.value as any);
                            setHasChanges(true);
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">Haut Droite</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="buttonPosition"
                          value="bottom-left"
                          checked={buttonPosition === 'bottom-left'}
                          onChange={(e) => {
                            setButtonPosition(e.target.value as any);
                            setHasChanges(true);
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">Bas Gauche</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="buttonPosition"
                          value="bottom-right"
                          checked={buttonPosition === 'bottom-right'}
                          onChange={(e) => {
                            setButtonPosition(e.target.value as any);
                            setHasChanges(true);
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">Bas Droite</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Configuration des sections - Liste hiérarchique */}
                <div className="col-span-8">
                  <div className="bg-white rounded-lg border p-4">
                    <h3 className="font-medium mb-4 flex items-center uppercase" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                      <Layout className="w-4 h-4 mr-2" />
                      SECTIONS DU MENU
                    </h3>
                    
                    <div className="space-y-3">
                      {menuSections.map((section, sectionIndex) => (
                        <div key={section.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleSectionVisibility(section.id)}
                                className={`p-1 rounded ${
                                  section.visible 
                                    ? 'text-green-600 hover:bg-green-100' 
                                    : 'text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                              
                              <span className="font-medium uppercase" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                                {section.name}
                              </span>
                              
                              {section.hasSubMenu && (
                                <button
                                  onClick={() => toggleSectionExpansion(section.id)}
                                  className="p-1 rounded hover:bg-gray-100"
                                >
                                  {expandedSections.includes(section.id) ? 
                                    <ChevronDown className="w-4 h-4" /> : 
                                    <ChevronRight className="w-4 h-4" />
                                  }
                                </button>
                              )}
                            </div>
                          </div>

                          {section.hasSubMenu && expandedSections.includes(section.id) && section.subItems && (
                            <div className="ml-8 space-y-2">
                              {section.subItems.map((item, itemIndex) => (
                                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-sm">{item.name}</span>
                                    
                                    {/* Affichage des tags automatiques */}
                                    <div className="flex items-center space-x-1">
                                      {showTags && item.tags?.filter(tag => ['✓', 'beta', 'draft'].includes(tag)).map(tag => (
                                        <span 
                                          key={tag}
                                          className="px-1 py-0.5 text-xs rounded uppercase"
                                          style={{ 
                                            fontFamily: 'Roboto, sans-serif',
                                            backgroundColor: tag === '✓' ? '#dcfce7' : tag === 'beta' ? '#fef3c7' : '#fee2e2',
                                            color: tag === '✓' ? '#166534' : tag === 'beta' ? '#92400e' : '#991b1b'
                                          }}
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                      
                                      {showVersions && item.tags?.filter(tag => tag.startsWith('v')).map(tag => (
                                        <span 
                                          key={tag}
                                          className="px-1 py-0.5 text-xs rounded uppercase"
                                          style={{ 
                                            fontFamily: 'Roboto, sans-serif',
                                            backgroundColor: '#e0e7ff',
                                            color: '#3730a3'
                                          }}
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                      
                                      {item.tags?.includes('new') && (
                                        <span 
                                          className="px-1 py-0.5 text-xs rounded uppercase"
                                          style={{ 
                                            fontFamily: 'Roboto, sans-serif',
                                            backgroundColor: '#f0fdf4',
                                            color: '#166534'
                                          }}
                                        >
                                          new
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <button
                                    onClick={() => toggleSubItemVisibility(section.id, item.id)}
                                    className={`p-1 rounded ${
                                      item.visible 
                                        ? 'text-green-600 hover:bg-green-100' 
                                        : 'text-gray-400 hover:bg-gray-200'
                                    }`}
                                  >
                                    {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview section */}
              <div className="mt-6">
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="font-medium mb-4 flex items-center uppercase" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    <Eye className="w-4 h-4 mr-2" />
                    APERÇU MENU ROUE
                  </h3>
                  
                  <div className="relative min-h-[200px] bg-gray-50 rounded-lg p-4">
                    <div className="text-center text-gray-500 py-8">
                      <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm uppercase" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                        Aperçu en temps réel disponible sur le site
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Menu largeur étendue: {menuSections.filter(s => s.visible).length} sections visibles
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </AdminCursorProvider>
  );
}
