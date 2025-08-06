import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Settings, Plus, Save, Loader2, Trash2 } from 'lucide-react';
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
  modified?: boolean;
}

export function GridMapModelsPageV2() {
  const { toast } = useToast();
  
  // Fonction de calcul automatique des SuperContainers (architecture V2)
  const calculateSuperContainers = (rows: number, cols: number) => {
    const CONTAINER_SIZE = 128;
    const CONTAINER_GAP = 4;
    const cellSize = CONTAINER_SIZE + CONTAINER_GAP; // 132px
    
    const gridTotalHeight = rows * cellSize - CONTAINER_GAP;
    const gridTotalWidth = cols * cellSize - CONTAINER_GAP;
    
    return {
      count: cols, // UN SuperContainer par colonne
      width: 304, // Largeur fixe d'un SuperContainer
      gridTotalHeight: gridTotalHeight,
      gridTotalWidth: gridTotalWidth,
      cellSize: cellSize,
      containerSize: CONTAINER_SIZE,
      superContainers: cols,
      superContainerWidth: 304
    };
  };

  // États pour le formulaire
  const [currentModel, setCurrentModel] = useState<GridModelForm>({
    name: '',
    description: '',
    rows: 32,
    cols: 32,
    modified: false
  });

  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

  // Query pour récupérer tous les modèles de grilles
  const modelsQuery = useQuery({
    queryKey: ['/api/grid-models'],
    queryFn: () => fetch('/api/grid-models').then(res => res.json()) as Promise<GridModel[]>
  });

  // Mutation pour créer un nouveau modèle
  const createModelMutation = useMutation({
    mutationFn: async (modelData: { name: string; description?: string; dimensions: { width: number; height: number } }) => {
      return apiRequest('/api/grid-models', {
        method: 'POST',
        body: JSON.stringify(modelData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grid-models'] });
      toast({
        title: "Succès",
        description: "Modèle de grille créé avec succès"
      });
      // Reset du formulaire
      setCurrentModel({
        name: '',
        description: '',
        rows: 32,
        cols: 32,
        modified: false
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer le modèle: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mutation pour supprimer un modèle
  const deleteModelMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/grid-models/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grid-models'] });
      toast({
        title: "Succès",
        description: "Modèle supprimé avec succès"
      });
      setSelectedModelId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le modèle: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Recalcul automatique des dimensions quand les lignes/colonnes changent
  useEffect(() => {
    const calculations = calculateSuperContainers(currentModel.rows, currentModel.cols);
    // Pas besoin de modifier l'état ici, les calculs sont faits à la volée dans l'affichage
  }, [currentModel.rows, currentModel.cols]);

  // Fonction pour sauvegarder le modèle
  const handleSaveModel = () => {
    if (!currentModel.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du modèle est obligatoire",
        variant: "destructive"
      });
      return;
    }

    const calculations = calculateSuperContainers(currentModel.rows, currentModel.cols);
    
    const modelData = {
      name: currentModel.name,
      description: currentModel.description,
      dimensions: {
        width: calculations.gridTotalWidth,
        height: calculations.gridTotalHeight
      }
    };

    createModelMutation.mutate(modelData);
  };

  // Fonction pour charger un modèle existant
  const loadModel = (model: GridModel) => {
    setSelectedModelId(model.id);
    // Pour l'instant, on utilise des valeurs par défaut pour rows/cols
    // car elles ne sont pas stockées dans la DB
    setCurrentModel({
      name: model.name,
      description: model.description || '',
      rows: 32, // Valeur par défaut
      cols: 32, // Valeur par défaut
      modified: false
    });
  };

  const calculations = calculateSuperContainers(currentModel.rows, currentModel.cols);

  if (modelsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Chargement des modèles de grilles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour Admin
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Créateur de Modèles de Grilles</h1>
              <p className="text-sm text-gray-600">Système V3 - Architecture 32x32 native</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Grille Chimérique V3</span>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* GAUCHE: Liste des modèles existants */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Modèles Existants
            </h3>
            
            {modelsQuery.data && modelsQuery.data.length > 0 ? (
              <div className="space-y-3">
                {modelsQuery.data.map((model) => (
                  <div 
                    key={model.id} 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedModelId === model.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => loadModel(model)}
                  >
                    <div className="font-medium text-sm">{model.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {model.dimensions.width}x{model.dimensions.height}px
                    </div>
                    {model.description && (
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {model.description}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(model.createdAt).toLocaleDateString()}
                      </span>
                      {selectedModelId === model.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Supprimer ce modèle ?')) {
                              deleteModelMutation.mutate(model.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-sm">Aucun modèle existant</div>
                <div className="text-xs mt-1">Créez votre premier modèle</div>
              </div>
            )}
          </div>

          {/* CENTRE: Configuration du modèle */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Configuration du Modèle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom du Modèle</label>
                <input 
                  type="text" 
                  value={currentModel.name}
                  onChange={(e) => setCurrentModel({...currentModel, name: e.target.value, modified: true})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ex: Grille Principale 32x32"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Lignes</label>
                  <input 
                    type="number" 
                    value={currentModel.rows}
                    onChange={(e) => setCurrentModel({...currentModel, rows: parseInt(e.target.value) || 1, modified: true})}
                    className="w-full border rounded px-3 py-2"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Colonnes</label>
                  <input 
                    type="number" 
                    value={currentModel.cols}
                    onChange={(e) => setCurrentModel({...currentModel, cols: parseInt(e.target.value) || 1, modified: true})}
                    className="w-full border rounded px-3 py-2"
                    min="1"
                  />
                </div>
              </div>

              {/* SuperContainers auto-calculés */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">SuperContainers (Auto-calculés)</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium mb-1">Nombre</label>
                    <div className="bg-white p-2 rounded border font-mono">{calculations.superContainers}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Largeur</label>
                    <div className="bg-white p-2 rounded border font-mono">{calculations.superContainerWidth}px</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Hauteur grille</label>
                    <div className="bg-white p-2 rounded border font-mono">{calculations.gridTotalHeight}px</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Largeur grille</label>
                    <div className="bg-white p-2 rounded border font-mono">{calculations.gridTotalWidth}px</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  <div><strong>Architecture V2:</strong> 1 SuperContainer par COLONNE</div>
                  <div><strong>Grille:</strong> {currentModel.rows} lignes x {currentModel.cols} colonnes = {calculations.superContainers} SuperContainers</div>
                  <div><strong>Containers:</strong> {currentModel.rows * currentModel.cols} containers (128px) répartis sur {currentModel.cols} colonnes</div>
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
                onClick={handleSaveModel}
                disabled={!currentModel.modified || createModelMutation.isPending || !currentModel.name.trim()}
                className={`w-full px-4 py-2 rounded flex items-center justify-center space-x-2 ${
                  currentModel.modified && currentModel.name.trim() && !createModelMutation.isPending
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {createModelMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Enregistrer Modèle</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* DROITE: Prévisualisation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Prévisualisation</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-3">
                <div><strong>Modèle:</strong> {currentModel.name || 'Sans nom'}</div>
                <div><strong>Dimensions:</strong> {currentModel.rows}x{currentModel.cols}</div>
                <div><strong>Taille totale:</strong> {calculations.gridTotalWidth}x{calculations.gridTotalHeight}px</div>
              </div>
              
              {/* Mini aperçu de la grille */}
              <div className="border rounded p-2 bg-white">
                <div className="text-xs text-gray-500 mb-2">Aperçu schématique:</div>
                <div 
                  className="grid gap-1 max-w-full max-h-32 overflow-hidden"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(currentModel.cols, 8)}, 1fr)`,
                    gridTemplateRows: `repeat(${Math.min(currentModel.rows, 8)}, 1fr)`
                  }}
                >
                  {Array.from({ length: Math.min(currentModel.rows * currentModel.cols, 64) }, (_, i) => (
                    <div key={i} className="w-3 h-3 bg-blue-200 border border-blue-300 rounded-sm"></div>
                  ))}
                </div>
                {(currentModel.rows > 8 || currentModel.cols > 8) && (
                  <div className="text-xs text-gray-400 mt-2">Aperçu tronqué (8x8 max)</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default GridMapModelsPageV2;