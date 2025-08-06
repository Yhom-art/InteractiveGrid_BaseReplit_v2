import React, { useState } from 'react';
import { Link } from 'wouter';

interface DashboardMetrics {
  totalContainers: number;
  activeContainers: number;
  totalPanels: number;
  activeSessions: number;
  gridVersion: string;
  systemStatus: 'operational' | 'maintenance' | 'error';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  route: string;
  category: 'navigation' | 'administration' | 'content';
  priority: 'high' | 'medium' | 'low';
}

const mockMetrics: DashboardMetrics = {
  totalContainers: 1024,
  activeContainers: 847,
  totalPanels: 126,
  activeSessions: 23,
  gridVersion: 'V2.1.0',
  systemStatus: 'operational'
};

const quickActions: QuickAction[] = [
  {
    id: 'grid-v2',
    title: 'Grille V2',
    description: 'Mode Map 32x32 - Navigation principale',
    route: '/v2',
    category: 'navigation',
    priority: 'high'
  },
  {
    id: 'admin-dashboard',
    title: 'Administration',
    description: 'Interface admin complète',
    route: '/admin/dashboard',
    category: 'administration',
    priority: 'high'
  },
  {
    id: 'cursor-admin',
    title: 'Gestion Curseurs',
    description: 'Configuration curseurs dynamiques',
    route: '/admin/cursors',
    category: 'administration',
    priority: 'medium'
  },
  {
    id: 'grid-rules',
    title: 'Règles Grille',
    description: 'Configuration algorithmes placement',
    route: '/admin/grid-rules',
    category: 'administration',
    priority: 'medium'
  },
  {
    id: 'panels-management',
    title: 'Gestion Panels',
    description: 'Contenus et composants panels',
    route: '/admin/panels',
    category: 'content',
    priority: 'medium'
  },
  {
    id: 'chimera-import',
    title: 'Import Chimères',
    description: 'Gestion collections NFT',
    route: '/admin/chimera-nft-import',
    category: 'content',
    priority: 'low'
  }
];

export default function DashboardV2Page() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredActions = selectedCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation': return 'bg-blue-100 text-blue-700';
      case 'administration': return 'bg-purple-100 text-purple-700';
      case 'content': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-300';
      case 'medium': return 'border-yellow-300';
      case 'low': return 'border-gray-300';
      default: return 'border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] p-8" style={{ fontFamily: 'Roboto Mono, monospace' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête principal */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Dashboard V2</h1>
          <p className="text-xl text-gray-600 mb-6">Grille Chimérique - Interface Unifiée</p>
          
          <div className="flex justify-center items-center gap-4">
            <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(mockMetrics.systemStatus)}`}>
              {mockMetrics.systemStatus === 'operational' ? 'Opérationnel' : 
               mockMetrics.systemStatus === 'maintenance' ? 'Maintenance' : 'Erreur'}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
              Version {mockMetrics.gridVersion}
            </span>
          </div>
        </div>

        {/* Métriques système */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white border border-gray-300 p-6 text-center">
            <div className="text-3xl font-bold text-gray-800 mb-2">{mockMetrics.totalContainers}</div>
            <div className="text-sm text-gray-600">Containers Total</div>
          </div>
          <div className="bg-white border border-gray-300 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{mockMetrics.activeContainers}</div>
            <div className="text-sm text-gray-600">Containers Actifs</div>
          </div>
          <div className="bg-white border border-gray-300 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{mockMetrics.totalPanels}</div>
            <div className="text-sm text-gray-600">Panels Disponibles</div>
          </div>
          <div className="bg-white border border-gray-300 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{mockMetrics.activeSessions}</div>
            <div className="text-sm text-gray-600">Sessions Actives</div>
          </div>
        </div>

        {/* Filtres actions rapides */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Actions Rapides</h2>
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 border transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-gray-800 text-white border-gray-800' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setSelectedCategory('navigation')}
              className={`px-4 py-2 border transition-colors ${
                selectedCategory === 'navigation' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              Navigation
            </button>
            <button
              onClick={() => setSelectedCategory('administration')}
              className={`px-4 py-2 border transition-colors ${
                selectedCategory === 'administration' 
                  ? 'bg-purple-600 text-white border-purple-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              Administration
            </button>
            <button
              onClick={() => setSelectedCategory('content')}
              className={`px-4 py-2 border transition-colors ${
                selectedCategory === 'content' 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              Contenu
            </button>
          </div>
        </div>

        {/* Grille des actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredActions.map(action => (
            <Link key={action.id} href={action.route}>
              <div className={`bg-white border-2 ${getPriorityColor(action.priority)} p-6 hover:border-gray-500 transition-all cursor-pointer h-full`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-800">{action.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(action.category)}`}>
                    {action.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Priorité: {action.priority === 'high' ? 'Haute' : action.priority === 'medium' ? 'Moyenne' : 'Basse'}
                  </span>
                  <span className="text-blue-600 text-sm">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* État système détaillé */}
        <div className="bg-white border border-gray-300 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">État Système</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Composants Actifs</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>CustomCursorV2</span>
                  <span className="text-green-600">✓ Opérationnel</span>
                </div>
                <div className="flex justify-between">
                  <span>Algorithme Spirale</span>
                  <span className="text-green-600">✓ Opérationnel</span>
                </div>
                <div className="flex justify-between">
                  <span>Système Panels</span>
                  <span className="text-green-600">✓ Opérationnel</span>
                </div>
                <div className="flex justify-between">
                  <span>Admin Interface</span>
                  <span className="text-green-600">✓ Opérationnel</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Configuration</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Mode Grille</span>
                  <span className="text-blue-600">32x32 Map</span>
                </div>
                <div className="flex justify-between">
                  <span>Container Size</span>
                  <span className="text-blue-600">128px</span>
                </div>
                <div className="flex justify-between">
                  <span>Container Gap</span>
                  <span className="text-blue-600">4px</span>
                </div>
                <div className="flex justify-between">
                  <span>Curseur Système</span>
                  <span className="text-blue-600">Dynamique</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}