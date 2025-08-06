import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Settings, Plus, Save, Loader2, Eye } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Types correspondant à la vraie structure de la base de données
interface GridModel {
  id: number;
  name: string;
  description?: string;
  dimensions: { width: number; height: number };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface pour le formulaire (calculs locaux)
interface GridModelForm {
  name: string;
  description?: string;
  rows: number;
  cols: number;
  superContainers: number;
  superContainerWidth: number;
  gridTotalHeight: number;
  modified?: boolean;
}

export function GridMapModelsPage() {
  // Fonction de calcul automatique des SuperContainers (architecture V2)
  const calculateSuperContainers = (rows: number, cols: number) => {
    // Dans la grille V2: 1 SuperContainer par COLONNE (pas par cellule)
    // Dimensions de la grille V2: CONTAINER_SIZE=128px + CONTAINER_GAP=4px = 132px par cellule
    // Formule grille V2: gridSize * (CONTAINER_SIZE + CONTAINER_GAP) - CONTAINER_GAP
    const CONTAINER_SIZE = 128;
    const CONTAINER_GAP = 4;
    const cellSize = CONTAINER_SIZE + CONTAINER_GAP; // 132px
    
    // Calcul exact de la grille V2 avec calage sur limite haute
    const gridTotalHeight = rows * cellSize - CONTAINER_GAP; // Ex: 32*132-4 = 4220px
    const gridTotalWidth = cols * cellSize - CONTAINER_GAP;
    
    return {
      count: cols, // UN SuperContainer par colonne
      width: 304, // Largeur fixe d'un SuperContainer
      gridTotalHeight: gridTotalHeight, // Hauteur totale avec calage correct
      gridTotalWidth: gridTotalWidth, // Largeur totale
      cellSize: cellSize, // 132px par cellule
      containerSize: CONTAINER_SIZE // 128px par container
    };
  };

  // États pour les modèles
  const [savedModels] = useState<GridModel[]>([
    { 
      id: 1, 
      name: 'Grille Principale', 
      dimensions: { width: 32, height: 32 },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: 'Modèle principal pour la page d\'accueil' 
    },
    { 
      id: 2, 
      name: 'Galerie NFT', 
      dimensions: { width: 16, height: 16 },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: 'Modèle pour la galerie' 
    },
    { 
      id: 3, 
      name: 'Admin Preview 5x5', 
      dimensions: { width: 5, height: 5 },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: 'Modèle 5x5 pour preview admin avec tous types de containers' 
    }
  ]);

  const [currentModel, setCurrentModel] = useState<GridModelForm>({
    name: 'Grille Test 16x16',
    description: 'Grille de test 16x16 pour validation',
    rows: 16,
    cols: 16,
    superContainers: 16,
    superContainerWidth: 304,
    gridTotalHeight: 2100
  });
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

  // Pages disponibles dans l'application
  const [availablePages, setAvailablePages] = useState([
    { id: 'main-grid', name: 'Grille Principale (HomePage)', path: '/' },
    { id: 'gallery', name: 'Galerie NFT', path: '/gallery' },
    { id: 'collections', name: 'Collections', path: '/collections' },
    { id: 'marketplace', name: 'Marketplace', path: '/marketplace' },
    { id: 'profile', name: 'Profil Utilisateur', path: '/profile' },
    { id: 'temp-grid', name: 'Page Temporaire Test', path: '/temp-grid' }
  ]);

  // États pour les assignations
  const [modelAssignments, setModelAssignments] = useState<{[key: string]: string[]}>({
    'main-32x32': ['main-grid'],
    'gallery-16x16': ['gallery']
  });

  const [assignmentsModified, setAssignmentsModified] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPagePath, setNewPagePath] = useState('');

  // Mise à jour automatique des SuperContainers quand les dimensions changent
  useEffect(() => {
    const calc = calculateSuperContainers(currentModel.rows, currentModel.cols);
    setCurrentModel(prev => ({
      ...prev,
      superContainers: calc.count,
      superContainerWidth: calc.width,
      gridTotalHeight: calc.gridTotalHeight,
      modified: true
    }));
  }, [currentModel.rows, currentModel.cols]);

  // Mutation pour sauvegarder une grille
  const { toast } = useToast();
  
  const createGridMutation = useMutation({
    mutationFn: (gridData: any) => apiRequest('/api/grid-models', 'POST', gridData),
    onSuccess: (data) => {
      toast({ 
        title: "Grille sauvegardée", 
        description: "Grille créée avec succès. Clique sur 'Voir Grille' pour visualiser." 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-models'] });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: "Impossible de sauvegarder la grille" });
    }
  });

  // Fonction de test rapide : créer et sauvegarder la grille 16x16
  const saveTestGrid = () => {
    const gridData = {
      name: currentModel.name,
      description: currentModel.description,
      dimensions: {
        width: currentModel.cols,
        height: currentModel.rows
      }
    };
    
    createGridMutation.mutate(gridData);
  };

  // Ajout d'une nouvelle page
  const addNewPage = () => {
    if (!newPageName.trim() || !newPagePath.trim()) return;
    
    const newPage = {
      id: newPageName.toLowerCase().replace(/\s+/g, '-'),
      name: newPageName,
      path: newPagePath.startsWith('/') ? newPagePath : `/${newPagePath}`
    };
    
    setAvailablePages(prev => [...prev, newPage]);
    setNewPageName('');
    setNewPagePath('');
  };

  return (
    <div className="bg-gray-50">
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/" className="p-2 hover:bg-gray-200 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Modèles de Grille</h1>
              <p className="text-gray-600">Configuration et règles de distribution</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={saveTestGrid}
              disabled={createGridMutation.isPending}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {createGridMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Sauvegarder Grille Test 16x16</span>
            </button>
            <Link 
              href="/temp-grid"
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              <Eye className="w-4 h-4" />
              <span>Voir Grille</span>
            </Link>
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              <span>Nouveau Modèle</span>
            </button>
          </div>
        </div>

        {/* BLOC 1: MODÈLES DE GRILLE */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Modèles de Grille</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* GAUCHE: Configuration du Modèle */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Configuration du Modèle</h3>
              <div className="space-y-4">
                {/* Sélecteur de modèle intégré */}
                <div>
                  <label className="block text-sm font-medium mb-2">Modèle de Grille</label>
                  <select 
                    value={selectedModelId}
                    onChange={(e) => {
                      setSelectedModelId(e.target.value);
                      const model = savedModels.find(m => m.id === e.target.value);
                      if (model) setCurrentModel(model);
                    }}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {savedModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.rows}×{model.cols})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nom du modèle</label>
                  <input 
                    type="text" 
                    value={currentModel.name}
                    onChange={(e) => setCurrentModel({...currentModel, name: e.target.value, modified: true})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Lignes</label>
                    <input 
                      type="number" 
                      value={currentModel.rows}
                      onChange={(e) => setCurrentModel({...currentModel, rows: parseInt(e.target.value) || 1})}
                      className="w-full border rounded px-3 py-2"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Colonnes</label>
                    <input 
                      type="number" 
                      value={currentModel.cols}
                      onChange={(e) => setCurrentModel({...currentModel, cols: parseInt(e.target.value) || 1})}
                      className="w-full border rounded px-3 py-2"
                      min="1"
                    />
                  </div>
                </div>

                {/* SuperContainers auto-calculés */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">SuperContainers (Architecture V2)</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="block text-xs font-medium mb-1">Nombre (auto)</label>
                      <div className="bg-white p-2 rounded border font-mono">{currentModel.superContainers}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Largeur (auto)</label>
                      <div className="bg-white p-2 rounded border font-mono">{currentModel.superContainerWidth}px</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Hauteur grille (auto)</label>
                      <div className="bg-white p-2 rounded border font-mono">{currentModel.gridTotalHeight}px</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Cellule unitaire (auto)</label>
                      <div className="bg-gray-100 p-2 rounded text-xs">132px (128+4px marge)</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    <div><strong>Architecture V2:</strong> 1 SuperContainer par COLONNE (pas par cellule)</div>
                    <div><strong>Grille:</strong> {currentModel.rows} lignes x {currentModel.cols} colonnes = {currentModel.cols} SuperContainers</div>
                    <div><strong>Dimensions:</strong> Chaque SuperContainer = {currentModel.superContainerWidth}px x {currentModel.gridTotalHeight}px</div>
                    <div><strong>Containers:</strong> {currentModel.rows * currentModel.cols} containers (128px) répartis sur {currentModel.cols} colonnes</div>
                    <div><strong>Organisation:</strong> Chaque colonne = 1 SuperContainer contenant {currentModel.rows} containers verticalement</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea 
                    value={currentModel.description || ''}
                    onChange={(e) => setCurrentModel({...currentModel, description: e.target.value, modified: true})}
                    className="w-full border rounded px-3 py-2 h-20"
                    placeholder="Description du modèle de grille..."
                  />
                </div>
              </div>

              {/* Bouton sauvegarde modèle */}
              <div className="mt-6 pt-4 border-t">
                <button 
                  onClick={() => {
                    console.log('Sauvegarde modèle grille:', currentModel);
                    setCurrentModel({...currentModel, modified: false});
                  }}
                  disabled={!currentModel.modified}
                  className={`w-full px-4 py-2 rounded flex items-center justify-center space-x-2 ${
                    currentModel.modified 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer Modèle</span>
                </button>
              </div>
            </div>

            {/* DROITE: Assignations aux pages */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Assignations aux Pages</h3>
              
              {/* Statistiques du modèle actuel */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="text-sm text-gray-600">
                  <div><strong>Pages assignées:</strong> {modelAssignments[selectedModelId]?.length || 0}</div>
                  <div><strong>Dernière modif:</strong> {new Date().toLocaleDateString()}</div>
                  <div><strong>Statut:</strong> {currentModel.modified ? 'Modifié' : 'Sauvegardé'}</div>
                </div>
              </div>

              <div className="space-y-3">
                {availablePages.map((page) => (
                  <div key={page.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`page-${page.id}`}
                      checked={modelAssignments[selectedModelId]?.includes(page.id) || false}
                      onChange={(e) => {
                        setModelAssignments(prev => ({
                          ...prev,
                          [selectedModelId]: e.target.checked 
                            ? [...(prev[selectedModelId] || []), page.id]
                            : (prev[selectedModelId] || []).filter(id => id !== page.id)
                        }));
                        setAssignmentsModified(true);
                      }}
                      className="rounded"
                    />
                    <label htmlFor={`page-${page.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium text-sm">{page.name}</div>
                      <div className="text-xs text-gray-500">{page.path}</div>
                    </label>
                  </div>
                ))}
                
                {/* Ajout d'une nouvelle page */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium mb-2">Ajouter une nouvelle page</h5>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Nom de la page"
                      value={newPageName}
                      onChange={(e) => setNewPageName(e.target.value)}
                      className="flex-1 border rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Chemin (ex: /nouvelle-page)"
                      value={newPagePath}
                      onChange={(e) => setNewPagePath(e.target.value)}
                      className="flex-1 border rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={addNewPage}
                      disabled={!newPageName.trim() || !newPagePath.trim()}
                      className={`px-3 py-1 rounded text-sm flex items-center ${
                        newPageName.trim() && newPagePath.trim()
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>

              {/* Bouton sauvegarde assignations */}
              <div className="mt-6 pt-4 border-t">
                <button 
                  onClick={() => {
                    console.log('Sauvegarde assignations:', modelAssignments[selectedModelId]);
                    setAssignmentsModified(false);
                  }}
                  disabled={!assignmentsModified}
                  className={`w-full px-4 py-2 rounded flex items-center justify-center space-x-2 ${
                    assignmentsModified 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer Assignations</span>
                </button>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}