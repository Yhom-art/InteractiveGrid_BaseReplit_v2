import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Plus, Settings, Eye, Grid, Users, Layout, AlertTriangle, CheckCircle } from 'lucide-react';

import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AdminLayoutTemplate } from '@/components/admin/AdminLayoutTemplate';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { useQuery } from '@tanstack/react-query';
import { TAG_CONFIGS, generateTagStyle } from '@shared/tags-system';
import { TagConfiguration } from '@shared/schema';

export function GridPagesPage() {
  
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
    const tagConfig = mergedTagConfigs[tagType.toUpperCase()];
    if (!tagConfig) return null;
    
    const tagStyles = {
      ...generateTagStyle(tagType.toUpperCase()),
      backgroundColor: tagConfig.color
    };
    
    return (
      <span 
        style={tagStyles}
        className="transition-all hover:scale-105"
      >
        {content}
      </span>
    );
  };
  
  // Récupération de la vraie configuration Market Castings depuis la BDD
  const marketCastingsQuery = useQuery({
    queryKey: ['/api/grid-v3-config/market-castings'],
    queryFn: () => fetch('/api/grid-v3-config/market-castings').then(res => res.json())
  });

  // Configuration des pages grid avec connexion BDD
  const gridPages = [
    {
      id: 'market-castings',
      name: 'Market Castings',
      description: 'Page principale avec distribution NFT + contenus',
      status: marketCastingsQuery.isSuccess ? 'active' : 'disconnected',
      lastModified: marketCastingsQuery.data?.updatedAt ? new Date(marketCastingsQuery.data.updatedAt).toLocaleDateString() : '---',
      containers: {
        nft: 1000, // Ces données viendront plus tard de l'API de distribution
        info: marketCastingsQuery.data?.deploymentRules?.filter((r: any) => r.contentTypes?.includes('info')).length || 0,
        audio: marketCastingsQuery.data?.deploymentRules?.filter((r: any) => r.contentTypes?.includes('audio')).length || 0,
        video: marketCastingsQuery.data?.deploymentRules?.filter((r: any) => r.contentTypes?.includes('video')).length || 0
      },
      configData: marketCastingsQuery.data
    }
  ];

  // Configuration sections pour la colonne gauche
  const configSections = (
    <>
      {/* Configuration pages */}
      <div className="bg-white rounded-lg p-3 shadow">
        <h3 className="font-medium text-gray-900 mb-2 flex items-center text-sm admin-h2">
          <Users className="w-4 h-4 mr-2" />
          FILTRES
        </h3>
        <select className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 admin-select">
          <option value="all">Toutes les pages</option>
          <option value="active">Pages actives</option>
          <option value="draft">Brouillons</option>
        </select>
      </div>

      {/* Connexion BDD Status */}
      <div className="bg-white rounded-lg p-3 shadow">
        <h3 className="font-medium text-gray-900 mb-2 flex items-center text-sm admin-h2">
          <Layout className="w-4 h-4 mr-2" />
          CONNEXION BDD
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span>Market Castings Config</span>
            {marketCastingsQuery.isSuccess ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : marketCastingsQuery.isError ? (
              <AlertTriangle className="w-3 h-3 text-red-600" />
            ) : (
              <div className="w-3 h-3 border border-gray-300 rounded-full animate-spin" />
            )}
          </div>
          <div className="text-xs text-gray-500">
            {marketCastingsQuery.isSuccess && `${marketCastingsQuery.data?.deploymentRules?.length || 0} règles configurées`}
            {marketCastingsQuery.isError && 'Erreur de connexion'}
            {marketCastingsQuery.isLoading && 'Vérification...'}
          </div>
        </div>
      </div>

      {/* Modèles disponibles */}
      <div className="bg-white rounded-lg p-3 shadow">
        <h3 className="font-medium text-gray-900 mb-2 flex items-center text-sm admin-h2">
          <Layout className="w-4 h-4 mr-2" />
          MODÈLES GRILLE
        </h3>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>32x32 Distribution</span>
            <span className="text-green-600">✓</span>
          </div>
          <div className="flex justify-between">
            <span>Spiral Layout</span>
            <span className="text-green-600">✓</span>
          </div>
          <div className="flex justify-between">
            <span>Random Active</span>
            <span className="text-green-600">✓</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <AdminCursorProvider>
        <div className="max-w-7xl mx-auto p-4">
          <AdminHeaderTemplate title="PAGES GRID" filePath="client/src/pages/admin/GridPagesPage.tsx" />
          
          <AdminLayoutTemplate leftColumn={configSections}>
          {/* Liste des pages */}
          <div className="space-y-4">
            {gridPages.map(page => (
              <div key={page.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{page.name}</h3>
                      {page.status === 'active' 
                        ? renderUnifiedTag('active', 'ACTIVE')
                        : renderUnifiedTag('draft', 'DRAFT')
                      }
                    </div>
                    
                    <p className="text-gray-600 mb-3">{page.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>Modifié le {page.lastModified}</span>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          {page.containers.nft} NFT
                        </span>
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                          {page.containers.info} INFO
                        </span>
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
                          {page.containers.audio} AUDIO
                        </span>
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                          {page.containers.video} VIDEO
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Link href={`/admin/grid-map-distribution-v3?page=${page.id}`}>
                      <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <Settings className="w-5 h-5" />
                      </button>
                    </Link>
                    <Link href={`/${page.id}`}>
                      <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </AdminLayoutTemplate>
        </div>
    </AdminCursorProvider>
  );
}