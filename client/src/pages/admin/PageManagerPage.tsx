import React from 'react';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { HierarchicalPageManager, useHierarchicalPages } from '@/components/admin/HierarchicalPageManager';
import { Folder, FileText, Settings, Plus } from 'lucide-react';

// Pages d'exemple pour démonstration
const defaultPages = [
  {
    id: 'grid-system',
    name: 'Système de Grilles',
    type: 'folder' as const,
    status: 'active' as const,
    lastModified: '2025-06-16',
    description: 'Configuration et gestion des grilles',
    children: [
      {
        id: 'grid-pages',
        name: 'Grid Pages V3',
        route: '/admin/grid-pages',
        type: 'page' as const,
        status: 'active' as const,
        lastModified: '2025-06-16',
        description: 'Interface de gestion des pages de grilles'
      },
      {
        id: 'grid-distribution',
        name: 'Grid Distribution',
        route: '/admin/grid-distribution-v3',
        type: 'page' as const,
        status: 'active' as const,
        lastModified: '2025-06-16',
        description: 'Règles de distribution automatique'
      }
    ]
  },
  {
    id: 'containers',
    name: 'Containers & Layers',
    type: 'folder' as const,
    status: 'active' as const,
    lastModified: '2025-06-16',
    description: 'Gestion des conteneurs et couches visuelles',
    children: [
      {
        id: 'container-layers',
        name: 'Container Layers V3',
        route: '/admin/container-layers-v3',
        type: 'page' as const,
        status: 'active' as const,
        lastModified: '2025-06-16',
        description: 'Configuration des couches de conteneurs'
      },
      {
        id: 'music-containers',
        name: 'Music Containers',
        route: '/admin/music-containers',
        type: 'page' as const,
        status: 'active' as const,
        lastModified: '2025-06-16',
        description: 'Gestion des conteneurs audio'
      }
    ]
  },
  {
    id: 'interface',
    name: 'Interface Administration',
    type: 'folder' as const,
    status: 'active' as const,
    lastModified: '2025-06-16',
    description: 'Outils d\'interface et styles',
    children: [
      {
        id: 'styles-global',
        name: 'Styles Global',
        route: '/admin/styles-global',
        type: 'page' as const,
        status: 'active' as const,
        lastModified: '2025-06-16',
        description: 'Configuration globale des styles'
      },
      {
        id: 'cursors',
        name: 'Cursors Admin',
        route: '/admin/cursors',
        type: 'page' as const,
        status: 'active' as const,
        lastModified: '2025-06-16',
        description: 'Gestion des curseurs personnalisés'
      },
      {
        id: 'template-header',
        name: 'Template Header',
        route: '/admin/template-header',
        type: 'page' as const,
        status: 'active' as const,
        lastModified: '2025-06-16',
        description: 'Modèles d\'en-têtes administratifs'
      }
    ]
  },
  {
    id: 'documentation',
    name: 'Documentation',
    type: 'folder' as const,
    status: 'active' as const,
    lastModified: '2025-06-16',
    description: 'Plans et documentation technique',
    children: [
      {
        id: 'readme-v3',
        name: 'README V3',
        route: '/admin/readme-v3',
        type: 'page' as const,
        status: 'active' as const,
        lastModified: '2025-06-16',
        description: 'Guide de déploiement V3'
      },
      {
        id: 'plan-deploiement',
        name: 'Plan de Déploiement',
        route: '/admin/plan-deploiement',
        type: 'page' as const,
        status: 'active' as const,
        lastModified: '2025-06-16',
        description: 'Stratégie de déploiement technique'
      }
    ]
  }
];

export default function PageManagerPage() {
  const { pages, createPage, deletePage, setPages } = useHierarchicalPages();

  // Initialiser avec les pages par défaut si vide
  React.useEffect(() => {
    if (pages.length === 0) {
      setPages(defaultPages);
    }
  }, [pages.length, setPages]);

  const handleCreatePage = (parentId?: string) => {
    createPage(parentId);
  };

  const handleDeletePage = (pageId: string) => {
    deletePage(pageId);
  };

  const stats = {
    totalPages: countPages(pages),
    activePages: countPagesByStatus(pages, 'active'),
    draftPages: countPagesByStatus(pages, 'draft'),
    folders: countFolders(pages)
  };

  return (
    <AdminCursorProvider>
        <div className="max-w-7xl mx-auto p-6">
          <AdminHeaderTemplate 
            title="Gestionnaire de Pages Hiérarchique"
          />
          
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="admin-body-text text-sm text-gray-600">Total Pages</p>
                  <p className="admin-section-title text-2xl font-bold text-gray-900 admin-dynamic-data">{stats.totalPages}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <p className="admin-body-text text-sm text-gray-600">Pages Actives</p>
                  <p className="admin-section-title text-2xl font-bold text-green-600 admin-dynamic-data">{stats.activePages}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                </div>
                <div>
                  <p className="admin-body-text text-sm text-gray-600">Brouillons</p>
                  <p className="admin-section-title text-2xl font-bold text-yellow-600 admin-dynamic-data">{stats.draftPages}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <Folder className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="admin-body-text text-sm text-gray-600">Dossiers</p>
                  <p className="admin-section-title text-2xl font-bold text-purple-600 admin-dynamic-data">{stats.folders}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="admin-section-title mb-4">Actions Rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleCreatePage()}
                className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <Plus className="w-5 h-5 text-blue-600" />
                <span className="admin-body-text text-blue-700 font-medium">Créer une page racine</span>
              </button>
              
              <button
                onClick={() => {
                  const folderName = prompt('Nom du nouveau dossier:');
                  if (folderName) {
                    setPages(prev => [...prev, {
                      id: `folder-${Date.now()}`,
                      name: folderName,
                      type: 'folder',
                      status: 'active',
                      lastModified: new Date().toISOString().split('T')[0],
                      description: `Dossier ${folderName}`,
                      children: []
                    }]);
                  }
                }}
                className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors group"
              >
                <Folder className="w-5 h-5 text-purple-600" />
                <span className="admin-body-text text-purple-700 font-medium">Créer un dossier</span>
              </button>
              
              <button
                onClick={() => {
                  const exported = JSON.stringify(pages, null, 2);
                  navigator.clipboard.writeText(exported);
                  alert('Structure exportée dans le presse-papiers');
                }}
                className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors group"
              >
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="admin-body-text text-gray-700 font-medium">Exporter la structure</span>
              </button>
            </div>
          </div>

          {/* Gestionnaire hiérarchique */}
          <HierarchicalPageManager
            pages={pages}
            onCreatePage={handleCreatePage}
            onDeletePage={handleDeletePage}
          />
        </div>
    </AdminCursorProvider>
  );
}

// Fonctions utilitaires pour les statistiques
function countPages(pages: any[]): number {
  return pages.reduce((count, page) => {
    let pageCount = page.type === 'page' ? 1 : 0;
    if (page.children) {
      pageCount += countPages(page.children);
    }
    return count + pageCount;
  }, 0);
}

function countPagesByStatus(pages: any[], status: string): number {
  return pages.reduce((count, page) => {
    let pageCount = (page.type === 'page' && page.status === status) ? 1 : 0;
    if (page.children) {
      pageCount += countPagesByStatus(page.children, status);
    }
    return count + pageCount;
  }, 0);
}

function countFolders(pages: any[]): number {
  return pages.reduce((count, page) => {
    let folderCount = page.type === 'folder' ? 1 : 0;
    if (page.children) {
      folderCount += countFolders(page.children);
    }
    return count + folderCount;
  }, 0);
}