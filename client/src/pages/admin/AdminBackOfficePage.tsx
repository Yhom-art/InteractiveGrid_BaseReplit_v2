import React, { useState } from 'react';
import { Settings, Database, Users, FileText, BarChart3, Shield, Server, Globe, Palette, MousePointer2, Grid3X3, Music, Image, Layers } from 'lucide-react';

import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AdminLayoutTemplate } from '@/components/admin/AdminLayoutTemplate';

interface AdminSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'content' | 'system' | 'interface' | 'media';
  status: 'active' | 'maintenance' | 'development';
  lastUpdate: string;
  route: string;
}

function AdminBackOfficePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const adminSections: AdminSection[] = [
    // Content Management
    {
      id: 'chimeras',
      title: 'Chimères NFT',
      description: 'Gestion des fiches fantômes et contenus NFT',
      icon: <Layers className="w-5 h-5" />,
      category: 'content',
      status: 'active',
      lastUpdate: '2025-06-11',
      route: '/admin/chimeras'
    },
    {
      id: 'editorials',
      title: 'Éditoriaux',
      description: 'Contenus éditoriaux et articles',
      icon: <FileText className="w-5 h-5" />,
      category: 'content',
      status: 'active',
      lastUpdate: '2025-06-10',
      route: '/admin/editorials'
    },
    {
      id: 'music-containers',
      title: 'Containers Musicaux',
      description: 'Gestion des contenus audio et playlists',
      icon: <Music className="w-5 h-5" />,
      category: 'media',
      status: 'active',
      lastUpdate: '2025-06-11',
      route: '/admin/music-containers'
    },

    // Interface & Design
    {
      id: 'cursors-v2',
      title: 'Curseurs Dynamiques V2',
      description: 'Système avancé de curseurs avec familles et assignations',
      icon: <MousePointer2 className="w-5 h-5" />,
      category: 'interface',
      status: 'development',
      lastUpdate: '2025-06-11',
      route: '/admin/cursors'
    },
    {
      id: 'admin-buttons',
      title: 'Boutons Admin',
      description: 'Gestion centralisée des boutons d\'interface',
      icon: <Palette className="w-5 h-5" />,
      category: 'interface',
      status: 'active',
      lastUpdate: '2025-06-11',
      route: '/admin/buttons'
    },
    {
      id: 'templates-admin',
      title: 'Templates Admin',
      description: 'Système modulaire de templates d\'administration',
      icon: <Grid3X3 className="w-5 h-5" />,
      category: 'interface',
      status: 'active',
      lastUpdate: '2025-06-11',
      route: '/admin/templates'
    },

    // System & Configuration
    {
      id: 'grid-models',
      title: 'Modèles de Grille',
      description: 'Configuration des grilles 32x32 et règles de distribution',
      icon: <Grid3X3 className="w-5 h-5" />,
      category: 'system',
      status: 'active',
      lastUpdate: '2025-06-10',
      route: '/admin/grid-models'
    },
    {
      id: 'panels',
      title: 'Panels Système',
      description: 'Gestion des panels d\'interaction avancés',
      icon: <Layers className="w-5 h-5" />,
      category: 'system',
      status: 'active',
      lastUpdate: '2025-06-09',
      route: '/admin/panels'
    },
    {
      id: 'app-pages',
      title: 'Pages Application',
      description: 'Configuration des pages et assignations de modèles',
      icon: <Globe className="w-5 h-5" />,
      category: 'system',
      status: 'active',
      lastUpdate: '2025-06-10',
      route: '/admin/app-pages'
    }
  ];

  const categories = [
    { id: 'all', label: 'Toutes', count: adminSections.length },
    { id: 'content', label: 'Contenu', count: adminSections.filter(s => s.category === 'content').length },
    { id: 'interface', label: 'Interface', count: adminSections.filter(s => s.category === 'interface').length },
    { id: 'system', label: 'Système', count: adminSections.filter(s => s.category === 'system').length },
    { id: 'media', label: 'Média', count: adminSections.filter(s => s.category === 'media').length }
  ];

  const filteredSections = selectedCategory === 'all' 
    ? adminSections 
    : adminSections.filter(section => section.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'development': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'maintenance': return 'Maintenance';
      case 'development': return 'Développement';
      default: return 'Inconnu';
    }
  };

  const headerButtons = [
    {
      label: 'Nouveau Module',
      icon: <Settings className="w-4 h-4" />,
      variant: 'default' as const,
      onClick: () => console.log('Nouveau module')
    },
    {
      label: 'Statistiques',
      icon: <BarChart3 className="w-4 h-4" />,
      variant: 'outline' as const,
      onClick: () => console.log('Statistiques')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-64 p-8">
        <AdminHeaderTemplate
          title="Admin BackOffice"
          subtitle="Interface d'administration unifiée pour la Grille Chimérique"
          buttons={headerButtons}
        />

        <AdminLayoutTemplate layout="1-3">
          {/* Zone principale : Categories et filtres */}
          <div className="space-y-6">
            {/* Filtres par catégorie */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">catégories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {category.label}
                    <span className="ml-2 text-xs opacity-75">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">aperçu système</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {adminSections.filter(s => s.status === 'active').length}
                  </div>
                  <div className="text-sm text-green-600">Modules Actifs</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">
                    {adminSections.filter(s => s.status === 'development').length}
                  </div>
                  <div className="text-sm text-blue-600">En Développement</div>
                </div>
              </div>
            </div>
          </div>

          {/* Zone de contenu : Liste des sections admin */}
          <div className="lg:col-span-2 space-y-4">
            {filteredSections.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group"
                onClick={() => window.location.href = section.route}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                      {section.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {section.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(section.status)}`}>
                          {getStatusLabel(section.status)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">
                        {section.description}
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>Mis à jour: {section.lastUpdate}</span>
                        <span>•</span>
                        <span>Catégorie: {section.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AdminLayoutTemplate>
      </div>
    </div>
  );
}

export default AdminBackOfficePage;