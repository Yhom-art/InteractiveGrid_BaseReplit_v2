import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Trash2, Plus, Play, RotateCcw, ChevronDown, ChevronRight, Save } from 'lucide-react';

// Types pour le système de containers
interface ContainerModel {
  id: string;
  name: string;
  type: 'NFT' | 'INFO' | 'EDITORIAL' | 'MUSIC' | 'ADOPT';
  dimensions: {
    width: number;
    height: number;
  };
  expansionType: 'none' | 'oneone_up' | 'onehalf_dwn' | 'oneone_dwn';
  cursorType: 'FREE' | 'ADOPT' | 'KNOK' | 'MEET' | 'INFO' | 'PANEL';
  description?: string;
  modified?: boolean;
}

interface ContainerTemplate {
  id: string;
  name: string;
  category: 'standard' | 'expansion' | 'special';
  enabled: boolean;
  priority: number;
  description: string;
  modified?: boolean;
  containerConfig: {
    type: 'NFT' | 'INFO' | 'EDITORIAL' | 'MUSIC' | 'ADOPT';
    expansionType: 'none' | 'oneone_up' | 'onehalf_dwn' | 'oneone_dwn';
    cursorType: 'FREE' | 'ADOPT' | 'KNOK' | 'MEET' | 'INFO' | 'PANEL';
    dimensions: { width: number; height: number };
  };
}

interface ContainerAssignment {
  id: string;
  containerModelId: string;
  gridModelId: string;
  position: { col: number; row: number };
  enabled: boolean;
}

export function ContainersAdminPage() {
  // Navigation
  const goBack = () => window.history.back();

  // États pour les modèles de containers
  const [savedContainerModels] = useState<ContainerModel[]>([
    {
      id: 'container-nft-standard',
      name: 'Container NFT Standard',
      type: 'NFT',
      dimensions: { width: 128, height: 128 },
      expansionType: 'none',
      cursorType: 'FREE',
      description: 'Container standard pour NFT avec curseur FREE'
    },
    {
      id: 'container-nft-expand-up',
      name: 'Container NFT Expansion Haute',
      type: 'NFT',
      dimensions: { width: 128, height: 260 },
      expansionType: 'oneone_up',
      cursorType: 'FREE',
      description: 'Container NFT avec expansion vers le haut'
    },
    {
      id: 'container-adopt',
      name: 'Container ADOPT',
      type: 'ADOPT',
      dimensions: { width: 128, height: 192 },
      expansionType: 'onehalf_dwn',
      cursorType: 'ADOPT',
      description: 'Container spécialisé pour NFT ADOPT'
    },
    {
      id: 'container-info',
      name: 'Container INFO',
      type: 'INFO',
      dimensions: { width: 128, height: 128 },
      expansionType: 'none',
      cursorType: 'INFO',
      description: 'Container pour éléments informatifs'
    }
  ]);

  const [currentContainerModel, setCurrentContainerModel] = useState<ContainerModel>(savedContainerModels[0]);
  const [selectedContainerModelId, setSelectedContainerModelId] = useState<string>('container-nft-standard');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  // États pour les templates et assignations
  const [containerTemplates, setContainerTemplates] = useState<ContainerTemplate[]>([
    {
      id: 'template-nft-spiral',
      name: 'NFT Spirale Principale',
      category: 'standard',
      enabled: true,
      priority: 1,
      description: 'Template principal pour NFT dans la spirale depuis le centre',
      containerConfig: {
        type: 'NFT',
        expansionType: 'none',
        cursorType: 'FREE',
        dimensions: { width: 128, height: 128 }
      }
    },
    {
      id: 'template-info-integration',
      name: 'INFO Intégration',
      category: 'standard',
      enabled: true,
      priority: 2,
      description: '1 container INFO tous les 4 NFT dans la spirale',
      containerConfig: {
        type: 'INFO',
        expansionType: 'none',
        cursorType: 'INFO',
        dimensions: { width: 128, height: 128 }
      }
    },
    {
      id: 'template-adopt-borders',
      name: 'ADOPT Bordures',
      category: 'special',
      enabled: true,
      priority: 3,
      description: 'Containers ADOPT placés sur les bordures de la grille',
      containerConfig: {
        type: 'ADOPT',
        expansionType: 'onehalf_dwn',
        cursorType: 'ADOPT',
        dimensions: { width: 128, height: 192 }
      }
    },
    {
      id: 'template-music-random',
      name: 'Musique Aléatoire',
      category: 'special',
      enabled: false,
      priority: 4,
      description: 'Distribution aléatoire des containers musicaux',
      containerConfig: {
        type: 'MUSIC',
        expansionType: 'oneone_dwn',
        cursorType: 'PANEL',
        dimensions: { width: 128, height: 260 }
      }
    }
  ]);

  const [containerAssignments, setContainerAssignments] = useState<ContainerAssignment[]>([
    {
      id: 'assign-1',
      containerModelId: 'container-nft-standard',
      gridModelId: 'main-32x32',
      position: { col: 16, row: 16 },
      enabled: true
    }
  ]);

  const [templatesModified, setTemplatesModified] = useState(false);
  const [assignmentsModified, setAssignmentsModified] = useState(false);

  // Gestion des tiroirs
  const toggleTemplateExpansion = (templateId: string) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  // Sauvegarde des templates
  const saveTemplates = () => {
    console.log('Sauvegarde templates containers:', containerTemplates);
    setTemplatesModified(false);
  };

  // Sauvegarde des assignations
  const saveAssignments = () => {
    console.log('Sauvegarde assignations containers:', containerAssignments);
    setAssignmentsModified(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button onClick={goBack} className="p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Administration des Containers</h1>
            <p className="text-gray-600">Gestion des modèles, templates et assignations de containers</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">Admin Containers</span>
        </div>
      </div>

      {/* BLOC 1: MODÈLES DE CONTAINERS */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Modèles de Containers</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GAUCHE: Configuration du modèle */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Configuration du Modèle</h3>
            
            {/* Sélecteur de modèle */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Modèle de Container</label>
              <select 
                value={selectedContainerModelId}
                onChange={(e) => {
                  setSelectedContainerModelId(e.target.value);
                  const model = savedContainerModels.find(m => m.id === e.target.value);
                  if (model) setCurrentContainerModel(model);
                }}
                className="w-full border rounded-lg px-3 py-2"
              >
                {savedContainerModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Configuration détaillée */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom du modèle</label>
                <input 
                  type="text" 
                  value={currentContainerModel.name}
                  onChange={(e) => setCurrentContainerModel({...currentContainerModel, name: e.target.value, modified: true})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select 
                    value={currentContainerModel.type}
                    onChange={(e) => setCurrentContainerModel({...currentContainerModel, type: e.target.value as any, modified: true})}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="NFT">NFT</option>
                    <option value="INFO">INFO</option>
                    <option value="EDITORIAL">EDITORIAL</option>
                    <option value="MUSIC">MUSIC</option>
                    <option value="ADOPT">ADOPT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Curseur</label>
                  <select 
                    value={currentContainerModel.cursorType}
                    onChange={(e) => setCurrentContainerModel({...currentContainerModel, cursorType: e.target.value as any, modified: true})}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="FREE">FREE</option>
                    <option value="ADOPT">ADOPT</option>
                    <option value="KNOK">KNOK</option>
                    <option value="MEET">MEET</option>
                    <option value="INFO">INFO</option>
                    <option value="PANEL">PANEL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type d'expansion</label>
                <select 
                  value={currentContainerModel.expansionType}
                  onChange={(e) => setCurrentContainerModel({...currentContainerModel, expansionType: e.target.value as any, modified: true})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="none">Aucune (128px)</option>
                  <option value="oneone_up">+1↑ (260px vers le haut)</option>
                  <option value="onehalf_dwn">+0.5↓ (192px vers le bas)</option>
                  <option value="oneone_dwn">+1↓ (260px vers le bas)</option>
                </select>
              </div>

              {/* Dimensions auto-calculées */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Dimensions (Auto-calculées)</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium mb-1">Largeur (px)</label>
                    <div className="bg-white p-2 rounded border font-mono">{currentContainerModel.dimensions.width}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Hauteur (px)</label>
                    <div className="bg-white p-2 rounded border font-mono">{currentContainerModel.dimensions.height}</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  <div><strong>Type:</strong> {currentContainerModel.type} avec curseur {currentContainerModel.cursorType}</div>
                  <div><strong>Expansion:</strong> {currentContainerModel.expansionType === 'none' ? 'Standard' : currentContainerModel.expansionType}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  value={currentContainerModel.description || ''}
                  onChange={(e) => setCurrentContainerModel({...currentContainerModel, description: e.target.value, modified: true})}
                  className="w-full border rounded px-3 py-2 h-20"
                  placeholder="Description du modèle de container..."
                />
              </div>
            </div>

            {/* Bouton sauvegarde modèle */}
            <div className="mt-6 pt-4 border-t">
              <button 
                onClick={() => {
                  console.log('Sauvegarde modèle container:', currentContainerModel);
                  setCurrentContainerModel({...currentContainerModel, modified: false});
                }}
                disabled={!currentContainerModel.modified}
                className={`w-full px-4 py-2 rounded flex items-center justify-center space-x-2 ${
                  currentContainerModel.modified 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer Modèle</span>
              </button>
            </div>
          </div>

          {/* DROITE: Visualisation et preview */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Visualisation</h3>
            
            <div className="bg-gray-100 p-6 rounded-lg min-h-64 flex items-center justify-center">
              <div 
                className="bg-white border-2 border-gray-300 rounded flex items-center justify-center text-xs font-mono"
                style={{
                  width: `${Math.min(currentContainerModel.dimensions.width / 2, 120)}px`,
                  height: `${Math.min(currentContainerModel.dimensions.height / 2, 120)}px`
                }}
              >
                <div className="text-center">
                  <div className="font-bold">{currentContainerModel.type}</div>
                  <div className="text-gray-500">{currentContainerModel.dimensions.width}×{currentContainerModel.dimensions.height}</div>
                  <div className="text-blue-600 mt-1">{currentContainerModel.cursorType}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <div><strong>Aperçu:</strong> Container {currentContainerModel.type}</div>
              <div><strong>Curseur:</strong> {currentContainerModel.cursorType}</div>
              <div><strong>Expansion:</strong> {currentContainerModel.expansionType}</div>
              <div><strong>Dimensions réelles:</strong> {currentContainerModel.dimensions.width}×{currentContainerModel.dimensions.height}px</div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOC 2: TEMPLATES ET ASSIGNATIONS */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-6">Templates et Assignations</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GAUCHE: Templates avec tiroirs */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-4">Templates de Distribution</h3>
            
            {containerTemplates.map((template) => (
              <div key={template.id} className="border rounded-lg">
                {/* En-tête de template */}
                <div 
                  onClick={() => toggleTemplateExpansion(template.id)}
                  className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        template.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {template.enabled ? 'Actif' : 'Inactif'}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        Priorité {template.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                  {expandedTemplate === template.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>

                {/* Contenu dépliable */}
                {expandedTemplate === template.id && (
                  <div className="px-4 pb-4 border-t bg-gray-50">
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Catégorie</label>
                          <select 
                            value={template.category}
                            onChange={(e) => {
                              setContainerTemplates(prev => prev.map(t => 
                                t.id === template.id ? {...t, category: e.target.value as any, modified: true} : t
                              ));
                              setTemplatesModified(true);
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          >
                            <option value="standard">Standard</option>
                            <option value="expansion">Expansion</option>
                            <option value="special">Spécial</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Priorité</label>
                          <input 
                            type="number" 
                            value={template.priority}
                            onChange={(e) => {
                              setContainerTemplates(prev => prev.map(t => 
                                t.id === template.id ? {...t, priority: parseInt(e.target.value) || 1, modified: true} : t
                              ));
                              setTemplatesModified(true);
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Configuration Container</label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2 rounded border">
                            <strong>Type:</strong> {template.containerConfig.type}
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <strong>Curseur:</strong> {template.containerConfig.cursorType}
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <strong>Dimensions:</strong> {template.containerConfig.dimensions.width}×{template.containerConfig.dimensions.height}
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <strong>Expansion:</strong> {template.containerConfig.expansionType}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={template.enabled}
                            onChange={(e) => {
                              setContainerTemplates(prev => prev.map(t => 
                                t.id === template.id ? {...t, enabled: e.target.checked, modified: true} : t
                              ));
                              setTemplatesModified(true);
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">Template actif</span>
                        </label>
                        
                        <button 
                          onClick={() => {
                            console.log('Sauvegarde template:', template);
                            setContainerTemplates(prev => prev.map(t => 
                              t.id === template.id ? {...t, modified: false} : t
                            ));
                          }}
                          disabled={!template.modified}
                          className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                            template.modified 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Save className="w-3 h-3" />
                          <span>Sauvegarder</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Bouton sauvegarde globale templates */}
            <div className="mt-6 pt-4 border-t">
              <button 
                onClick={saveTemplates}
                disabled={!templatesModified}
                className={`w-full px-4 py-2 rounded flex items-center justify-center space-x-2 ${
                  templatesModified 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer Tous les Templates</span>
              </button>
            </div>
          </div>

          {/* DROITE: Assignations et simulation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Assignations et Simulation</h3>
            
            <div className="space-y-4">
              {/* Liste des assignations */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Assignations actives</h4>
                <div className="space-y-2">
                  {containerAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="text-sm">
                        <div className="font-medium">Container {assignment.containerModelId}</div>
                        <div className="text-gray-500">Grille {assignment.gridModelId} - Position ({assignment.position.col},{assignment.position.row})</div>
                      </div>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={assignment.enabled}
                          onChange={(e) => {
                            setContainerAssignments(prev => prev.map(a => 
                              a.id === assignment.id ? {...a, enabled: e.target.checked} : a
                            ));
                            setAssignmentsModified(true);
                          }}
                          className="rounded"
                        />
                        <span className="text-xs">Actif</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulation */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Simulation de Distribution</h4>
                <div className="bg-gray-100 p-4 rounded min-h-32 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Play className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm">Cliquez pour simuler la distribution</div>
                  </div>
                </div>
                <button className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Lancer Simulation</span>
                </button>
              </div>
            </div>

            {/* Bouton sauvegarde assignations */}
            <div className="mt-6 pt-4 border-t">
              <button 
                onClick={saveAssignments}
                disabled={!assignmentsModified}
                className={`w-full px-4 py-2 rounded flex items-center justify-center space-x-2 ${
                  assignmentsModified 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
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
  );
}