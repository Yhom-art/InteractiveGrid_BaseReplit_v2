import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Grid,
  Layers,
  Database,
  Layout,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Upload,
  Wallet,
  BarChart3,
  Bug,
  Eye,
  EyeOff
} from 'lucide-react';
import { generateAutoMenuSections } from '@/utils/autoMenuSync';


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

interface MenuRoueConfig {
  id: number;
  name: string;
  displayMode: 'full' | 'categories-only' | 'custom';
  buttonPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  sections: { [key: string]: MenuRoueSection };
  isActive: boolean;
}

interface MenuRoueFrontendProps {
  sections?: MenuRoueSection[];
  displayMode?: 'full' | 'categories-only' | 'custom';
  buttonPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showTags?: boolean;
  showVersions?: boolean;
}

export function MenuRoueFrontend(props?: MenuRoueFrontendProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Récupérer la configuration active du menu roue
  const menuConfigQuery = useQuery({
    queryKey: ['/api/menu-roue-config'],
    queryFn: () => fetch('/api/menu-roue-config').then(res => res.json())
  });

  const config: MenuRoueConfig | undefined = menuConfigQuery.data;

  // Utiliser la configuration automatique ou fallback vers l'API
  const getSortedSections = (): MenuRoueSection[] => {
    // Priorité 1: Configuration depuis props
    if (props?.sections) {
      return props.sections.filter(section => section.visible).sort((a, b) => a.order - b.order);
    }
    
    // Priorité 2: Configuration automatique générée
    const autoSections = generateAutoMenuSections();
    if (autoSections.length > 0) {
      return autoSections.filter(section => section.visible).sort((a, b) => a.order - b.order);
    }
    
    // Priorité 3: Configuration depuis l'API (legacy)
    if (!config?.sections) return [];
    return Object.values(config.sections)
      .filter(section => section.visible)
      .sort((a, b) => a.order - b.order);
  };

  const getVisibleSubItems = (section: MenuRoueSection): MenuRoueSubItem[] => {
    if (!section.subItems) return [];
    return section.subItems
      .filter(item => item.visible)
      .sort((a, b) => a.order - b.order);
  };



  const getSectionColorCode = (sectionId: string) => {
    const colorCodes: { [key: string]: { bg: string; border: string; text: string } } = {
      'app-grid': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      'components': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
      'contents': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
      'interface-admin': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' }
    };
    return colorCodes[sectionId] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };
  };

  const getSubItemTags = (subItem: MenuRoueSubItem): string[] => {
    // Utilise les tags injectés depuis AdminHomePage PAGE_STATUS_CONFIG
    return subItem.tags || [];
  };

  const getIconComponent = (iconName: string, sectionId?: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Grid,
      Layers,
      Database,
      Layout,
      Settings,
      Menu,
      Upload,
      Wallet,
      BarChart3
    };
    
    // Couleurs spécifiques par section
    const iconColors: { [key: string]: string } = {
      'app-grid': 'text-blue-500',
      'components': 'text-green-500', 
      'contents': 'text-purple-500',
      'interface-admin': 'text-orange-500'
    };
    
    const colorClass = sectionId ? iconColors[sectionId] || 'text-gray-600' : 'text-gray-600';
    const IconComponent = icons[iconName] || Menu;
    return <IconComponent className={`w-5 h-5 ${colorClass}`} />;
  };

  const getSubItemIcon = (subItem: MenuRoueSubItem) => {
    // Déterminer le type fonctionnel basé sur le nom et la route
    const getItemType = (name: string, route: string) => {
      const fullText = (name + ' ' + route).toLowerCase();
      
      if (fullText.includes('grid') || fullText.includes('grille')) return 'GRID';
      if (fullText.includes('container') || fullText.includes('music') || fullText.includes('video') || fullText.includes('editorial') || fullText.includes('audio') || fullText.includes('chimera') || fullText.includes('nft')) return 'DATABASE';
      if (fullText.includes('layer') || fullText.includes('distribution') || fullText.includes('panel') || fullText.includes('composer')) return 'LAYERS';
      if (fullText.includes('dashboard') || fullText.includes('diagnostic')) return 'DASHBOARD';
      if (fullText.includes('wallet') || fullText.includes('blockchain')) return 'BLOCKCHAIN';
      if (fullText.includes('template') || fullText.includes('header') || fullText.includes('layout')) return 'LAYOUT';
      if (fullText.includes('button') || fullText.includes('admin') || fullText.includes('menu') || fullText.includes('cursor')) return 'SETTINGS';
      if (fullText.includes('upload')) return 'UPLOAD';
      return 'DEFAULT';
    };

    // Icônes et couleurs par type fonctionnel
    const typeConfigs = {
      'GRID': { icon: Grid, color: 'text-blue-500' },
      'DATABASE': { icon: Database, color: 'text-green-500' },
      'LAYERS': { icon: Layers, color: 'text-purple-500' },
      'DASHBOARD': { icon: BarChart3, color: 'text-orange-500' },
      'BLOCKCHAIN': { icon: Wallet, color: 'text-yellow-500' },
      'LAYOUT': { icon: Layout, color: 'text-pink-500' },
      'SETTINGS': { icon: Settings, color: 'text-red-500' },
      'UPLOAD': { icon: Upload, color: 'text-indigo-500' },
      'DEFAULT': { icon: Menu, color: 'text-gray-400' }
    };
    
    const itemType = getItemType(subItem.name || '', subItem.tsxFile || '');
    const config = typeConfigs[itemType];
    const IconComponent = config.icon;
    return <IconComponent className={`w-4 h-4 ${config.color}`} />;
  };



  const getRouteForSubItem = (subItem: MenuRoueSubItem): string => {
    // Utilise directement la route stockée dans tsxFile
    return subItem.tsxFile || '#';
  };

  const getTagColor = (tag: string) => {
    const tagColors: { [key: string]: string } = {
      '✓': 'bg-green-100 text-green-700',
      'beta': 'bg-yellow-100 text-yellow-700', 
      'draft': 'bg-purple-100 text-purple-700',
      'v3': 'bg-blue-100 text-blue-700',
      'new': 'bg-cyan-100 text-cyan-700'
    };
    return tagColors[tag] || 'bg-gray-100 text-gray-600';
  };

  if (menuConfigQuery.isLoading) {
    return null;
  }

  const sortedSections = getSortedSections();

  const getButtonPositionClasses = () => {
    const position = config?.buttonPosition || 'bottom-right';
    switch (position) {
      case 'top-left':
        return 'top-8 left-8';
      case 'top-right':
        return 'top-8 right-8';
      case 'bottom-left':
        return 'bottom-8 left-8';
      case 'bottom-right':
      default:
        return 'bottom-8 right-8';
    }
  };

  return (
    <>
      {/* Bouton d'ouverture du menu roue */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${getButtonPositionClasses()} w-16 h-16 bg-black/80 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border-2 border-white/20 backdrop-blur-sm z-[10000000] ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ cursor: 'none' }}
        data-cursor-type="navigation"
      >
        <Settings className="w-6 h-6" />
      </button>
      




      {/* Overlay du menu roue */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999998]" onClick={() => setIsOpen(false)}>
          <div 
            className="fixed top-0 right-0 h-full w-96 bg-gray-50 shadow-2xl flex flex-col border-l border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec légende des types et bouton fermer */}
            <div className="flex justify-between items-center p-3 bg-white border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-500 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Types:
                </span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Grid className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>grid</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Database className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>data</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Layers className="w-3 h-3 text-purple-500" />
                    <span className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>layer</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>dash</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 transition-colors rounded"
                style={{ cursor: 'none' }}
                data-cursor-type="navigation"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Contenu du menu - flex-1 pour prendre toute la hauteur restante */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {sortedSections.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune section visible</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-2 space-y-1 overflow-y-auto">
                  {/* Lien vers l'accueil admin */}
                  <Link
                    href="/admin"
                    className="flex items-center p-3 bg-white hover:bg-gray-100 transition-colors border border-gray-200 mb-3 rounded"
                    onClick={() => setIsOpen(false)}
                    style={{ cursor: 'none' }}
                    data-cursor-type="navigation"
                  >
                    <Layout className="w-5 h-5 mr-3 text-cyan-500" />
                    <span className="font-medium text-sm uppercase text-gray-700" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                      ACCUEIL ADMIN
                    </span>
                  </Link>

                  {sortedSections.map((section) => {
                    const visibleSubItems = getVisibleSubItems(section);
                    const hasSubItems = section.hasSubMenu && visibleSubItems.length > 0;
                    const colorCode = getSectionColorCode(section.id);

                    return (
                      <div key={section.id} className="mb-4">
                        {/* Catégorie principale - plus grande */}
                        <div className="flex items-center p-3 mb-2">
                          <div className="flex items-center">
                            {getIconComponent(section.icon, section.id)}
                            <span className="ml-3 font-bold text-base uppercase text-gray-800" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                              {section.name}
                            </span>
                          </div>
                        </div>

                        {/* Sous-éléments - arborescence simple */}
                        {hasSubItems && (
                          <div className="ml-4 space-y-1">
                            {visibleSubItems.map((subItem) => {
                              const tags = getSubItemTags(subItem);
                              return (
                                <Link
                                  key={subItem.id}
                                  href={getRouteForSubItem(subItem)}
                                  className="flex items-center justify-between p-2 pl-4 hover:bg-gray-100 transition-colors text-sm text-gray-700 rounded"
                                  onClick={() => setIsOpen(false)}
                                  style={{ cursor: 'none' }}
                                  data-cursor-type="navigation"
                                >
                                  <div className="flex items-center">
                                    {getSubItemIcon(subItem)}
                                    <span className="ml-2" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                                      {subItem.name}
                                    </span>
                                  </div>
                                  {tags.length > 0 && (
                                    <div className="flex gap-1">
                                      {tags.map((tag) => (
                                        <span
                                          key={tag}
                                          className={`px-2 py-0.5 rounded-full text-xs ${getTagColor(tag)}`}
                                          style={{ fontSize: '10px', fontFamily: 'Roboto, sans-serif' }}
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer avec nom du composant */}
            <div className="border-t border-gray-200 p-2 bg-white">
              <div className="text-xs text-gray-400 text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
                MenuRoueFrontend
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}