import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Trash2, Plus, Play, RotateCcw, ChevronDown, ChevronRight, Save, Music, FileText, Image } from 'lucide-react';

// Types pour le système de panels
interface PanelModel {
  id: string;
  name: string;
  type: 'AUDIO' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'MIXED';
  containerTypes: ('NFT' | 'INFO' | 'EDITORIAL' | 'MUSIC' | 'ADOPT')[];
  dimensions: {
    width: number;
    height: number;
  };
  expansionBehavior: 'overlay' | 'push' | 'slide';
  openDirection: 'up' | 'down' | 'left' | 'right' | 'center';
  description?: string;
  modified?: boolean;
}

interface PanelTemplate {
  id: string;
  name: string;
  category: 'content' | 'interaction' | 'system';
  enabled: boolean;
  priority: number;
  description: string;
  modified?: boolean;
  panelConfig: {
    type: 'AUDIO' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'MIXED';
    expansionBehavior: 'overlay' | 'push' | 'slide';
    openDirection: 'up' | 'down' | 'left' | 'right' | 'center';
    dimensions: { width: number; height: number };
    containerTypes: string[];
  };
}

interface PanelAssignment {
  id: string;
  panelModelId: string;
  containerModelId: string;
  triggerType: 'click' | 'hover' | 'proximity' | 'auto';
  enabled: boolean;
}

export function PanelsAdminPage() {
  // Navigation
  const goBack = () => window.history.back();

  // États pour les modèles de panels
  const [savedPanelModels] = useState<PanelModel[]>([
    {
      id: 'panel-audio-music',
      name: 'Panel Audio Musical',
      type: 'AUDIO',
      containerTypes: ['MUSIC'],
      dimensions: { width: 400, height: 300 },
      expansionBehavior: 'overlay',
      openDirection: 'up',
      description: 'Panel principal pour la lecture audio avec contrôles avancés'
    },
    {
      id: 'panel-text-info',
      name: 'Panel Texte Informatif',
      type: 'TEXT',
      containerTypes: ['INFO', 'EDITORIAL'],
      dimensions: { width: 350, height: 250 },
      expansionBehavior: 'push',
      openDirection: 'right',
      description: 'Panel pour affichage de contenu textuel et éditorial'
    },
    {
      id: 'panel-image-nft',
      name: 'Panel Image NFT',
      type: 'IMAGE',
      containerTypes: ['NFT'],
      dimensions: { width: 500, height: 400 },
      expansionBehavior: 'overlay',
      openDirection: 'center',
      description: 'Panel pour visualisation détaillée des NFT'
    },
    {
      id: 'panel-mixed-adopt',
      name: 'Panel Mixte ADOPT',
      type: 'MIXED',
      containerTypes: ['ADOPT'],
      dimensions: { width: 450, height: 350 },
      expansionBehavior: 'slide',
      openDirection: 'down',
      description: 'Panel multimédia pour les containers ADOPT'
    }
  ]);

  const [currentPanelModel, setCurrentPanelModel] = useState<PanelModel>(savedPanelModels[0]);
  const [selectedPanelModelId, setSelectedPanelModelId] = useState<string>('panel-audio-music');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  // États pour les templates et assignations
  const [panelTemplates, setPanelTemplates] = useState<PanelTemplate[]>([
    {
      id: 'template-audio-standard',
      name: 'Audio Standard',
      category: 'content',
      enabled: true,
      priority: 1,
      description: 'Template standard pour panels audio avec contrôles de base',
      panelConfig: {
        type: 'AUDIO',
        expansionBehavior: 'overlay',
        openDirection: 'up',
        dimensions: { width: 400, height: 300 },
        containerTypes: ['MUSIC']
      }
    },
    {
      id: 'template-text-editorial',
      name: 'Texte Éditorial',
      category: 'content',
      enabled: true,
      priority: 2,
      description: 'Template pour affichage de contenu éditorial enrichi',
      panelConfig: {
        type: 'TEXT',
        expansionBehavior: 'push',
        openDirection: 'right',
        dimensions: { width: 350, height: 250 },
        containerTypes: ['EDITORIAL', 'INFO']
      }
    },
    {
      id: 'template-image-nft-gallery',
      name: 'Galerie NFT',
      category: 'content',
      enabled: true,
      priority: 3,
      description: 'Template pour visualisation de galeries NFT avec zoom',
      panelConfig: {
        type: 'IMAGE',
        expansionBehavior: 'overlay',
        openDirection: 'center',
        dimensions: { width: 500, height: 400 },
        containerTypes: ['NFT']
      }
    },
    {
      id: 'template-interaction-hover',
      name: 'Interaction Hover',
      category: 'interaction',
      enabled: false,
      priority: 4,
      description: 'Template pour panels déclenchés au survol',
      panelConfig: {
        type: 'MIXED',
        expansionBehavior: 'slide',
        openDirection: 'up',
        dimensions: { width: 300, height: 200 },
        containerTypes: ['INFO', 'NFT']
      }
    }
  ]);

  const [panelAssignments, setPanelAssignments] = useState<PanelAssignment[]>([
    {
      id: 'assign-audio-1',
      panelModelId: 'panel-audio-music',
      containerModelId: 'container-music-standard',
      triggerType: 'click',
      enabled: true
    },
    {
      id: 'assign-text-1',
      panelModelId: 'panel-text-info',
      containerModelId: 'container-info-standard',
      triggerType: 'click',
      enabled: true
    }
  ]);

  const [templatesModified, setTemplatesModified] = useState(false);
  const [assignmentsModified, setAssignmentsModified] = useState(false);

  // Gestion des tiroirs
  const toggleTemplateExpansion = (templateId: string) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  // Calcul automatique des dimensions selon le type de panel
  const calculatePanelDimensions = (type: string, expansionBehavior: string) => {
    const baseDimensions = {
      'AUDIO': { width: 400, height: 300 },
      'TEXT': { width: 350, height: 250 },
      'IMAGE': { width: 500, height: 400 },
      'VIDEO': { width: 600, height: 450 },
      'MIXED': { width: 450, height: 350 }
    };
    
    let dims = baseDimensions[type as keyof typeof baseDimensions] || { width: 400, height: 300 };
    
    // Ajustement selon le comportement d'expansion
    if (expansionBehavior === 'slide') {
      dims.height += 50; // Plus de hauteur pour l'animation de slide
    }
    
    return dims;
  };

  // Mise à jour automatique des dimensions
  useEffect(() => {
    const newDimensions = calculatePanelDimensions(currentPanelModel.type, currentPanelModel.expansionBehavior);
    if (newDimensions.width !== currentPanelModel.dimensions.width || 
        newDimensions.height !== currentPanelModel.dimensions.height) {
      setCurrentPanelModel(prev => ({
        ...prev,
        dimensions: newDimensions,
        modified: true
      }));
    }
  }, [currentPanelModel.type, currentPanelModel.expansionBehavior]);

  // Sauvegarde des templates
  const saveTemplates = () => {
    console.log('Sauvegarde templates panels:', panelTemplates);
    setTemplatesModified(false);
  };

  // Sauvegarde des assignations
  const saveAssignments = () => {
    console.log('Sauvegarde assignations panels:', panelAssignments);
    setAssignmentsModified(false);
  };

  // Icône selon le type de panel
  const getPanelIcon = (type: string) => {
    switch (type) {
      case 'AUDIO': return <Music className="w-4 h-4" />;
      case 'TEXT': return <FileText className="w-4 h-4" />;
      case 'IMAGE': return <Image className="w-4 h-4" />;
      case 'VIDEO': return <Play className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
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
            <h1 className="text-2xl font-bold">Administration des Panels</h1>
            <p className="text-gray-600">Gestion des modèles, templates et assignations de panels</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">Admin Panels</span>
        </div>
      </div>

      {/* BLOC 1: MODÈLES DE PANELS */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Modèles de Panels</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GAUCHE: Configuration du modèle */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Configuration du Modèle</h3>
            
            {/* Sélecteur de modèle */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Modèle de Panel</label>
              <select 
                value={selectedPanelModelId}
                onChange={(e) => {
                  setSelectedPanelModelId(e.target.value);
                  const model = savedPanelModels.find(m => m.id === e.target.value);
                  if (model) setCurrentPanelModel(model);
                }}
                className="w-full border rounded-lg px-3 py-2"
              >
                {savedPanelModels.map((model) => (
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
                  value={currentPanelModel.name}
                  onChange={(e) => setCurrentPanelModel({...currentPanelModel, name: e.target.value, modified: true})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type de Panel</label>
                  <select 
                    value={currentPanelModel.type}
                    onChange={(e) => setCurrentPanelModel({...currentPanelModel, type: e.target.value as any, modified: true})}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="AUDIO">AUDIO</option>
                    <option value="TEXT">TEXT</option>
                    <option value="IMAGE">IMAGE</option>
                    <option value="VIDEO">VIDEO</option>
                    <option value="MIXED">MIXED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Comportement</label>
                  <select 
                    value={currentPanelModel.expansionBehavior}
                    onChange={(e) => setCurrentPanelModel({...currentPanelModel, expansionBehavior: e.target.value as any, modified: true})}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="overlay">Overlay (superposition)</option>
                    <option value="push">Push (décalage)</option>
                    <option value="slide">Slide (glissement)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Direction d'ouverture</label>
                <select 
                  value={currentPanelModel.openDirection}
                  onChange={(e) => setCurrentPanelModel({...currentPanelModel, openDirection: e.target.value as any, modified: true})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="up">Vers le haut</option>
                  <option value="down">Vers le bas</option>
                  <option value="left">Vers la gauche</option>
                  <option value="right">Vers la droite</option>
                  <option value="center">Centre (modal)</option>
                </select>
              </div>

              {/* Types de containers compatibles */}
              <div>
                <label className="block text-sm font-medium mb-2">Types de Containers Compatibles</label>
                <div className="grid grid-cols-2 gap-2">
                  {['NFT', 'INFO', 'EDITORIAL', 'MUSIC', 'ADOPT'].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={currentPanelModel.containerTypes.includes(type as any)}
                        onChange={(e) => {
                          const newTypes = e.target.checked 
                            ? [...currentPanelModel.containerTypes, type as any]
                            : currentPanelModel.containerTypes.filter(t => t !== type);
                          setCurrentPanelModel({...currentPanelModel, containerTypes: newTypes, modified: true});
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dimensions auto-calculées */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Dimensions (Auto-calculées)</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium mb-1">Largeur (px)</label>
                    <div className="bg-white p-2 rounded border font-mono">{currentPanelModel.dimensions.width}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Hauteur (px)</label>
                    <div className="bg-white p-2 rounded border font-mono">{currentPanelModel.dimensions.height}</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  <div><strong>Type:</strong> {currentPanelModel.type} avec comportement {currentPanelModel.expansionBehavior}</div>
                  <div><strong>Ouverture:</strong> {currentPanelModel.openDirection}</div>
                  <div><strong>Containers:</strong> {currentPanelModel.containerTypes.join(', ')}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  value={currentPanelModel.description || ''}
                  onChange={(e) => setCurrentPanelModel({...currentPanelModel, description: e.target.value, modified: true})}
                  className="w-full border rounded px-3 py-2 h-20"
                  placeholder="Description du modèle de panel..."
                />
              </div>
            </div>

            {/* Bouton sauvegarde modèle */}
            <div className="mt-6 pt-4 border-t">
              <button 
                onClick={() => {
                  console.log('Sauvegarde modèle panel:', currentPanelModel);
                  setCurrentPanelModel({...currentPanelModel, modified: false});
                }}
                disabled={!currentPanelModel.modified}
                className={`w-full px-4 py-2 rounded flex items-center justify-center space-x-2 ${
                  currentPanelModel.modified 
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
            
            <div className="bg-gray-100 p-6 rounded-lg min-h-64 flex items-center justify-center relative">
              {/* Container de base */}
              <div className="bg-gray-300 border-2 border-gray-400 rounded w-16 h-16 flex items-center justify-center text-xs font-bold">
                CTR
              </div>
              
              {/* Panel selon direction */}
              <div 
                className={`absolute bg-white border-2 border-purple-300 rounded shadow-lg flex items-center justify-center text-xs font-mono ${
                  currentPanelModel.openDirection === 'up' ? 'bottom-20' :
                  currentPanelModel.openDirection === 'down' ? 'top-20' :
                  currentPanelModel.openDirection === 'left' ? 'right-20' :
                  currentPanelModel.openDirection === 'right' ? 'left-20' :
                  'z-10'
                }`}
                style={{
                  width: `${Math.min(currentPanelModel.dimensions.width / 4, 100)}px`,
                  height: `${Math.min(currentPanelModel.dimensions.height / 4, 80)}px`
                }}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    {getPanelIcon(currentPanelModel.type)}
                  </div>
                  <div className="font-bold">{currentPanelModel.type}</div>
                  <div className="text-gray-500">{currentPanelModel.dimensions.width}×{currentPanelModel.dimensions.height}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <div><strong>Aperçu:</strong> Panel {currentPanelModel.type}</div>
              <div><strong>Comportement:</strong> {currentPanelModel.expansionBehavior}</div>
              <div><strong>Direction:</strong> {currentPanelModel.openDirection}</div>
              <div><strong>Dimensions réelles:</strong> {currentPanelModel.dimensions.width}×{currentPanelModel.dimensions.height}px</div>
              <div><strong>Compatible avec:</strong> {currentPanelModel.containerTypes.join(', ')}</div>
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
            <h3 className="text-lg font-semibold mb-4">Templates de Panels</h3>
            
            {panelTemplates.map((template) => (
              <div key={template.id} className="border rounded-lg">
                {/* En-tête de template */}
                <div 
                  onClick={() => toggleTemplateExpansion(template.id)}
                  className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {getPanelIcon(template.panelConfig.type)}
                      <h4 className="font-medium">{template.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        template.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {template.enabled ? 'Actif' : 'Inactif'}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
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
                              setPanelTemplates(prev => prev.map(t => 
                                t.id === template.id ? {...t, category: e.target.value as any, modified: true} : t
                              ));
                              setTemplatesModified(true);
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          >
                            <option value="content">Contenu</option>
                            <option value="interaction">Interaction</option>
                            <option value="system">Système</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Priorité</label>
                          <input 
                            type="number" 
                            value={template.priority}
                            onChange={(e) => {
                              setPanelTemplates(prev => prev.map(t => 
                                t.id === template.id ? {...t, priority: parseInt(e.target.value) || 1, modified: true} : t
                              ));
                              setTemplatesModified(true);
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Configuration Panel</label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2 rounded border">
                            <strong>Type:</strong> {template.panelConfig.type}
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <strong>Comportement:</strong> {template.panelConfig.expansionBehavior}
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <strong>Dimensions:</strong> {template.panelConfig.dimensions.width}×{template.panelConfig.dimensions.height}
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <strong>Direction:</strong> {template.panelConfig.openDirection}
                          </div>
                        </div>
                        <div className="mt-2 bg-white p-2 rounded border text-xs">
                          <strong>Containers:</strong> {template.panelConfig.containerTypes.join(', ')}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={template.enabled}
                            onChange={(e) => {
                              setPanelTemplates(prev => prev.map(t => 
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
                            setPanelTemplates(prev => prev.map(t => 
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

          {/* DROITE: Assignations et déclencheurs */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Assignations et Déclencheurs</h3>
            
            <div className="space-y-4">
              {/* Liste des assignations */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Assignations actives</h4>
                <div className="space-y-2">
                  {panelAssignments.map((assignment) => (
                    <div key={assignment.id} className="p-3 bg-gray-50 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">
                          Panel {assignment.panelModelId} → Container {assignment.containerModelId}
                        </div>
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={assignment.enabled}
                            onChange={(e) => {
                              setPanelAssignments(prev => prev.map(a => 
                                a.id === assignment.id ? {...a, enabled: e.target.checked} : a
                              ));
                              setAssignmentsModified(true);
                            }}
                            className="rounded"
                          />
                          <span className="text-xs">Actif</span>
                        </label>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                          Déclencheur: {assignment.triggerType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuration des déclencheurs */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Types de Déclencheurs</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-blue-50 p-2 rounded border">
                    <strong>Click:</strong> Ouverture au clic
                  </div>
                  <div className="bg-green-50 p-2 rounded border">
                    <strong>Hover:</strong> Ouverture au survol
                  </div>
                  <div className="bg-purple-50 p-2 rounded border">
                    <strong>Proximity:</strong> Ouverture par proximité
                  </div>
                  <div className="bg-orange-50 p-2 rounded border">
                    <strong>Auto:</strong> Ouverture automatique
                  </div>
                </div>
              </div>

              {/* Test des panels */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Test et Simulation</h4>
                <div className="bg-gray-100 p-4 rounded min-h-24 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Play className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm">Tester les panels en simulation</div>
                  </div>
                </div>
                <button className="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center justify-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Tester Panels</span>
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
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
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