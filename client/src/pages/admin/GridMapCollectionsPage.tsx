import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Database, Plus, Eye, Settings, Copy, Trash2, Globe, Users, Image } from 'lucide-react';

interface GridPage {
  id: string;
  name: string;
  url: string;
  gridModelId: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  nftCount: number;
  collections: NFTCollection[];
}

interface NFTCollection {
  id: string;
  name: string;
  contractAddress: string;
  totalSupply: number;
  assignedCount: number;
  distributionRules: string[];
  priority: number;
  enabled: boolean;
}

export function GridMapCollectionsPage() {
  const [gridPages, setGridPages] = useState<GridPage[]>([
    {
      id: 'main-grid',
      name: 'Grille Principale',
      url: '/',
      gridModelId: 'main-32x32',
      status: 'active',
      createdAt: '2024-01-15',
      nftCount: 1247,
      collections: [
        {
          id: 'collection-1',
          name: 'Chimères Genesis',
          contractAddress: '0x1234...abcd',
          totalSupply: 10000,
          assignedCount: 847,
          distributionRules: ['nft-spiral', 'info-containers'],
          priority: 1,
          enabled: true
        },
        {
          id: 'collection-2',
          name: 'Audio Abstracts',
          contractAddress: '0x5678...efgh',
          totalSupply: 5000,
          assignedCount: 400,
          distributionRules: ['music-spatial'],
          priority: 2,
          enabled: true
        }
      ]
    },
    {
      id: 'test-grid',
      name: 'Grille Test 50x50',
      url: '/test',
      gridModelId: 'large-50x50',
      status: 'draft',
      createdAt: '2024-02-20',
      nftCount: 0,
      collections: []
    },
    {
      id: 'demo-grid',
      name: 'Grille Demo 16x16',
      url: '/demo',
      gridModelId: 'compact-16x16',
      status: 'active',
      createdAt: '2024-02-10',
      nftCount: 256,
      collections: [
        {
          id: 'collection-demo',
          name: 'Demo Collection',
          contractAddress: '0x9999...demo',
          totalSupply: 1000,
          assignedCount: 256,
          distributionRules: ['nft-spiral'],
          priority: 1,
          enabled: true
        }
      ]
    }
  ]);

  const [selectedPageId, setSelectedPageId] = useState<string>('main-grid');
  const [showNewPageForm, setShowNewPageForm] = useState(false);
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);

  const selectedPage = gridPages.find(p => p.id === selectedPageId);

  const handleAssignCollection = (pageId: string, collectionData: Partial<NFTCollection>) => {
    setGridPages(prev => prev.map(page => {
      if (page.id === pageId) {
        const newCollection: NFTCollection = {
          id: `collection-${Date.now()}`,
          name: collectionData.name || '',
          contractAddress: collectionData.contractAddress || '',
          totalSupply: collectionData.totalSupply || 0,
          assignedCount: 0,
          distributionRules: ['nft-spiral'],
          priority: page.collections.length + 1,
          enabled: true
        };
        return {
          ...page,
          collections: [...page.collections, newCollection]
        };
      }
      return page;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-orange-600 bg-orange-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/" className="p-2 hover:bg-gray-200 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Collections & Pages Grille</h1>
              <p className="text-gray-600">Gestion des collections NFT et assignation aux pages grille</p>
            </div>
          </div>
          <button 
            onClick={() => setShowNewPageForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Page Grille</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Liste des Pages Grille */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Pages Grille</h2>
              <div className="space-y-3">
                {gridPages.map((page) => (
                  <div 
                    key={page.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPageId === page.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPageId(page.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{page.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(page.status)}`}>
                        {page.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>URL: {page.url}</div>
                      <div>NFT: {page.nftCount} • Collections: {page.collections.length}</div>
                      <div>Modèle: {page.gridModelId}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulaire nouvelle page */}
            {showNewPageForm && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-medium mb-4">Créer Nouvelle Page Grille</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom de la page</label>
                    <input 
                      type="text" 
                      className="w-full border rounded px-3 py-2"
                      placeholder="Ex: Grille Collection Spéciale"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL</label>
                    <input 
                      type="text" 
                      className="w-full border rounded px-3 py-2"
                      placeholder="Ex: /special"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Modèle de grille</label>
                    <select className="w-full border rounded px-3 py-2">
                      <option value="main-32x32">Grille 32x32 (Production)</option>
                      <option value="large-50x50">Grille 50x50 (Test)</option>
                      <option value="compact-16x16">Grille 16x16 (Demo)</option>
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                      Créer
                    </button>
                    <button 
                      onClick={() => setShowNewPageForm(false)}
                      className="bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Configuration de la Page Sélectionnée */}
          <div className="space-y-6">
            {selectedPage && (
              <>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{selectedPage.name}</h2>
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-gray-200 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>URL:</span>
                      <span className="font-mono">{selectedPage.url}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Modèle:</span>
                      <span>{selectedPage.gridModelId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedPage.status)}`}>
                        {selectedPage.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>NFT Total:</span>
                      <span>{selectedPage.nftCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Collections:</span>
                      <span>{selectedPage.collections.length}</span>
                    </div>
                  </div>
                </div>

                {/* Collections assignées */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Collections Assignées</h3>
                    <button 
                      onClick={() => setShowNewCollectionForm(true)}
                      className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Assigner Collection</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedPage.collections.map((collection) => (
                      <div key={collection.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Image className="w-4 h-4 text-purple-600" />
                            <span className="font-medium">{collection.name}</span>
                          </div>
                          <div className="flex space-x-1">
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <Copy className="w-3 h-3" />
                            </button>
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <Settings className="w-3 h-3" />
                            </button>
                            <button className="p-1 hover:bg-red-100 rounded">
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Contract: {collection.contractAddress}</div>
                          <div>Supply: {collection.totalSupply} • Assignées: {collection.assignedCount}</div>
                          <div>Règles: {collection.distributionRules.join(', ')}</div>
                          <div className="flex items-center space-x-2">
                            <span>Priorité: {collection.priority}</span>
                            <span className={`px-1 py-0.5 rounded text-xs ${collection.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                              {collection.enabled ? 'Activée' : 'Désactivée'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Formulaire assignation collection */}
                  {showNewCollectionForm && (
                    <div className="mt-4 p-4 border border-green-200 rounded-lg bg-green-50">
                      <h4 className="font-medium mb-3">Assigner Collection NFT</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Nom de la collection</label>
                          <input 
                            type="text" 
                            className="w-full border rounded px-2 py-1"
                            placeholder="Ex: Nouvelle Collection"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Adresse du contrat</label>
                          <input 
                            type="text" 
                            className="w-full border rounded px-2 py-1"
                            placeholder="0x..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Total Supply</label>
                          <input 
                            type="number" 
                            className="w-full border rounded px-2 py-1"
                            placeholder="10000"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                            Assigner
                          </button>
                          <button 
                            onClick={() => setShowNewCollectionForm(false)}
                            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Analytics et Statistiques */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Analytics Global</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>Pages Actives</span>
                  </div>
                  <span className="font-mono text-lg">{gridPages.filter(p => p.status === 'active').length}</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-purple-600" />
                    <span>Collections Total</span>
                  </div>
                  <span className="font-mono text-lg">
                    {gridPages.reduce((acc, page) => acc + page.collections.length, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-2">
                    <Image className="w-4 h-4 text-green-600" />
                    <span>NFT Distribuées</span>
                  </div>
                  <span className="font-mono text-lg">
                    {gridPages.reduce((acc, page) => acc + page.nftCount, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span>Taux d'Occupation</span>
                  </div>
                  <span className="font-mono text-lg">73%</span>
                </div>
              </div>
            </div>

            {/* Distribution par Page */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-medium mb-4">Distribution par Page</h3>
              <div className="space-y-3">
                {gridPages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{page.name}</div>
                      <div className="text-xs text-gray-500">{page.collections.length} collections</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">{page.nftCount}</div>
                      <div className="text-xs text-gray-500">NFT</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Rapides */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-medium mb-4">Actions Rapides</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Import Collection en Masse</span>
                </button>
                <button className="w-full flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                  <Copy className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Dupliquer Configuration</span>
                </button>
                <button className="w-full flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Prévisualiser Toutes les Pages</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}