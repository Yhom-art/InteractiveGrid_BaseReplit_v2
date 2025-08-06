import React, { useState } from 'react';
import { Link } from 'wouter';
import { Settings, Grid3X3, Package, Database, BarChart3, ArrowLeft, Grid, Map, ChevronDown, ChevronRight, Archive, Layers } from 'lucide-react';

export function AdminMenuV2() {
  const [isOpen, setIsOpen] = useState(false);
  const [showArchives, setShowArchives] = useState(false);

  return (
    <>
      {/* Bouton d'ouverture visible */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-6 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border border-white/20"
        style={{ zIndex: 9999999, top: '54px', cursor: 'none' }}
        data-cursor-type="navigation"
      >
        <Settings className="w-6 h-6 text-white" />
      </button>

      {/* Menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" style={{ zIndex: 9999998 }}>
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl" data-cursor-type="navigation">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b admin-interface">
              <div className="flex-1">
                <h2 className="admin-title">ADMIN</h2>
                <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  client/src/components/admin/AdminMenuV2.tsx
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                data-cursor-type="navigation"
                style={{ cursor: 'none' }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-3 space-y-1.5 max-h-[calc(100vh-100px)] overflow-y-auto">
              {/* Accueil Admin */}
              <Link 
                href="/admin" 
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors border-b mb-1.5"
                onClick={() => setIsOpen(false)}
                data-cursor-type="navigation"
                style={{ cursor: 'none' }}
              >
                <Settings className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-medium">Accueil Admin</span>
              </Link>

              {/* GRID MAP */}
              <div className="space-y-0.5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">GRID MAP <span className="text-xs text-gray-400 normal-case font-mono">(GridMapDistributionV3.tsx)</span></h3>
                <Link 
                  href="/admin/grid-pages" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Map className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-medium">PAGES GRID</span>
                  <span className="text-xs bg-green-100 text-green-800 px-1 rounded">✓</span>
                </Link>
                <Link 
                  href="/admin/grid-map-distribution-v3" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Grid className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-medium">RÈGLES DISTRIBUTION</span>
                  <span className="text-xs bg-green-100 text-green-800 px-1 rounded">✓</span>
                </Link>
                <Link 
                  href="/grille-generee-v3" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Grid className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-medium">GRILLE GÉNÉRÉE V3</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">TEST</span>
                </Link>
              </div>

              {/* COMPOSANTS */}
              <div className="space-y-0.5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">COMPOSANTS <span className="text-xs text-gray-400 normal-case font-mono">(ContainerLayersV3.tsx)</span></h3>
                <Link 
                  href="/admin/container-layers-v3" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Layers className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-medium">CONTAINER LAYERS</span>
                  <span className="text-xs bg-green-100 text-green-800 px-1 rounded">✓</span>
                </Link>
                <Link 
                  href="/admin/container-types-index" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Package className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-medium">TYPES DE CONTAINERS</span>
                  <span className="text-xs bg-green-100 text-green-800 px-1 rounded">✓</span>
                </Link>
                <Link 
                  href="/admin/panels-models" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-400"
                  onClick={() => setIsOpen(false)}
                >
                  <Grid3X3 className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs">GESTION MODÈLES PANELS</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">NEW</span>
                </Link>
                <Link 
                  href="/admin/cursors" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-medium">DYNAMIC CURSORS SYSTEM</span>
                  <span className="text-xs bg-green-100 text-green-800 px-1 rounded">✓</span>
                </Link>
                <Link 
                  href="/admin/menu-roue" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs font-medium">MENU ROUE ADMIN</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-1 rounded">NEW</span>
                </Link>
              </div>

              {/* CONTENU NFT */}
              <div className="space-y-0.5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">CONTENU NFT <span className="text-xs text-gray-400 normal-case font-mono">(MusicContainersPage.tsx)</span></h3>
                <Link 
                  href="/admin/chimeras" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-400"
                  onClick={() => setIsOpen(false)}
                >
                  <Database className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs">CONTAINERS NFT</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">-</span>
                </Link>
                <Link 
                  href="/admin/panels" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-400 ml-3"
                  onClick={() => setIsOpen(false)}
                >
                  <Package className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs">PANELS NFT</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">-</span>
                </Link>
                <Link 
                  href="/admin/music-containers" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-400"
                  onClick={() => setIsOpen(false)}
                >
                  <Database className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs">CONTAINERS AUDIO</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">-</span>
                </Link>
                <Link 
                  href="/admin/video-containers" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-400"
                  onClick={() => setIsOpen(false)}
                >
                  <Database className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs">CONTAINERS VIDÉO</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">-</span>
                </Link>
                <Link 
                  href="/admin/editorials" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-400"
                  onClick={() => setIsOpen(false)}
                >
                  <Database className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs">CONTAINERS ÉDITORIAUX</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">-</span>
                </Link>
              </div>

              {/* INTERFACE ADMIN */}
              <div className="space-y-0.5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">INTERFACE ADMIN <span className="text-xs text-gray-400 normal-case font-mono">(AdminHeaderTemplate.tsx)</span></h3>
                <Link 
                  href="/admin/header-template" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Grid className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-xs font-medium">TEMPLATES ADMIN</span>
                  <span className="text-xs bg-green-100 text-green-800 px-1 rounded">✓</span>
                </Link>
                <Link 
                  href="/admin/buttons" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-xs font-medium">BOUTONS ADMIN</span>
                  <span className="text-xs bg-green-100 text-green-800 px-1 rounded">✓</span>
                </Link>
                <Link 
                  href="/admin/dashboard" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-xs font-medium">DASHBOARD</span>
                  <span className="text-xs bg-green-100 text-green-800 px-1 rounded">✓</span>
                </Link>
                <Link 
                  href="/admin/architecture-diagnostic" 
                  className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Grid className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-xs font-medium">DIAGNOSTIC ARCHITECTURE</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">NEW</span>
                </Link>
              </div>

              {/* Archives & Tests */}
              <div className="pt-2 border-t space-y-1">
                <button 
                  onClick={() => setShowArchives(!showArchives)}
                  className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-2">
                    <Archive className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Archives & Tests</span>
                  </div>
                  {showArchives ? (
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-gray-500" />
                  )}
                </button>
                
                {showArchives && (
                  <div className="ml-6 space-y-1">
                    <Link 
                      href="/admin/grid-map-v2" 
                      className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50 transition-colors text-gray-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="text-xs">Grid Map V2</span>
                    </Link>
                    <Link 
                      href="/admin/grid-map-distribution-32" 
                      className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50 transition-colors text-gray-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="text-xs">Grid Distribution 32</span>
                    </Link>
                    <Link 
                      href="/admin/grid-distribution-unified" 
                      className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50 transition-colors text-gray-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="text-xs">Distribution Unified</span>
                    </Link>
                    <Link 
                      href="/admin/container-layers-admin" 
                      className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50 transition-colors text-gray-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="text-xs">Container Layers Admin (ONE/ONEONE)</span>
                    </Link>
                    <Link 
                      href="/admin/container-layers-new" 
                      className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50 transition-colors text-gray-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="text-xs">Container Layers Alternative</span>
                    </Link>
                    <Link 
                      href="/admin/music-containers" 
                      className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50 transition-colors text-gray-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="text-xs">Music Containers</span>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}