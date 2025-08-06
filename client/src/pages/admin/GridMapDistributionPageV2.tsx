import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Save, ChevronDown, ChevronRight, Plus, Play, RotateCcw, Settings, Target, Eye, EyeOff, Trash2, Code } from 'lucide-react';

import { generateSpiralPositions } from '../../utils/spiralAlgorithm';

// Interface pour les règles de déploiement complètes
interface DeploymentRule {
  id: string;
  name: string;
  type: 'spiral' | 'random' | 'zone' | 'sequential';
  contentTypes: string[];
  priority: number;
  enabled: boolean;
  description: string;
  modified?: boolean;
  maxItems?: number;
  spiralConfig?: {
    centerX: number;
    centerY: number;
    direction: 'clockwise' | 'counterclockwise';
    startDirection: 'right' | 'down' | 'left' | 'up';
    skipOccupied: boolean;
  };
  zoneConfig?: {
    x: number;
    y: number;
    width: number;
    height: number;
    fillPattern: 'sequential' | 'random';
  };
}

interface ContentSource {
  id: string;
  name: string;
  type: 'NFT' | 'INFO' | 'MUSIC' | 'EDITORIAL';
  description: string;
  enabled: boolean;
  count?: number;
  familyTags: string[];
  rarityTags: string[];
}

interface GridModel {
  id: string;
  name: string;
  rows: number;
  cols: number;
  description: string;
}

interface PreviewCell {
  id: number;
  type: 'nft' | 'info' | 'empty' | 'adopt' | 'music';
  color: string;
  source?: string;
  rarity?: string;
}

export function GridMapDistributionPageV2() {
  // États principaux selon la logique QUI → OÙ → COMMENT (QUOI intégré dans les règles)
  const [selectedPage, setSelectedPage] = useState<string>('market-castings');
  const [selectedGridModel, setSelectedGridModel] = useState<string>('main-32x32');
  const [selectedDeploymentRules, setSelectedDeploymentRules] = useState<string[]>(['SpiralGrid_Castings']);
  
  // États pour la gestion des règles
  const [selectedRule, setSelectedRule] = useState<DeploymentRule | null>(null);
  const [rulesModified, setRulesModified] = useState(false);
  const [expandedSources, setExpandedSources] = useState<string[]>([]);
  
  // État pour gérer les sélections de tags
  const [selectedTags, setSelectedTags] = useState<{[sourceId: string]: {family: string[], rarity: string[]}}>({});

  // Pages disponibles (QUI)
  const [availablePages] = useState([
    { id: 'market-castings', name: 'Accueil Market Castings', description: 'Page principale des Castings de Chimères' },
    { id: 'thugshots', name: 'Accueil Thugshots', description: 'Page dédiée à la collection Thugshots' },
    { id: 'ozmoz', name: 'Accueil Os.moz', description: 'Page dédiée à la collection Os.moz' },
    { id: 'regeneration', name: 'Accueil Régénération', description: 'Page dédiée à la collection Régénération' }
  ]);

  // Sources de contenu centralisées
  const [contentSources] = useState<ContentSource[]>([
    { 
      id: 'nft-castings', 
      name: 'Castings de Chimères', 
      type: 'NFT', 
      description: 'Collection principale actuelle', 
      enabled: true, 
      count: 150,
      familyTags: ['FREE', 'ADOPT', 'ADOPTED', 'RESERVED'],
      rarityTags: ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common']
    },
    { 
      id: 'nft-thugshots', 
      name: 'ThugShots', 
      type: 'NFT', 
      description: 'Collection à venir', 
      enabled: false, 
      count: 0,
      familyTags: ['FREE', 'ADOPT', 'ADOPTED'],
      rarityTags: ['Premium', 'Standard']
    },
    { 
      id: 'info-containers', 
      name: 'Containers INFO', 
      type: 'INFO', 
      description: 'Informations et descriptions', 
      enabled: true, 
      count: 25,
      familyTags: ['Descriptions', 'Tutorials', 'News', 'Help'],
      rarityTags: []
    },
    { 
      id: 'music-containers', 
      name: 'Containers MUSIC', 
      type: 'MUSIC', 
      description: 'Modules audio spatialisés', 
      enabled: true, 
      count: 10,
      familyTags: ['Ambient', 'Interactive', 'Proximity', 'Background'],
      rarityTags: []
    }
  ]);

  // Modèles de grille (OÙ)
  const [gridModels] = useState<GridModel[]>([
    { id: 'main-32x32', name: 'Grille Principale 32x32', rows: 32, cols: 32, description: 'Grille principale pour HomePage' },
    { id: 'gallery-16x16', name: 'Galerie 16x16', rows: 16, cols: 16, description: 'Grille pour galeries' },
    { id: 'compact-8x8', name: 'Compacte 8x8', rows: 8, cols: 8, description: 'Grille pour aperçus' }
  ]);

  // Règles de déploiement complètes (reprises de DeploymentModelsPage)
  const [deploymentRules, setDeploymentRules] = useState<DeploymentRule[]>([
    {
      id: 'SpiralGrid_Castings',
      name: 'SpiralGrid_Castings',
      type: 'spiral',
      contentTypes: ['NFT'],
      priority: 1,
      enabled: true,
      description: 'Distribution en spirale des NFT Castings de Chimères depuis le centre',
      spiralConfig: { centerX: 16, centerY: 16, direction: 'clockwise', startDirection: 'right', skipOccupied: true },
      maxItems: 150
    },
    {
      id: 'Container_Info',
      name: 'Container_Info',
      type: 'sequential',
      contentTypes: ['INFO'],
      priority: 2,
      enabled: true,
      description: 'Distribution séquentielle des containers INFO intégrés dans la spirale',
      maxItems: 25
    },
    {
      id: 'Container_Music',
      name: 'Container MUSIC',
      type: 'random',
      contentTypes: ['MUSIC'],
      priority: 3,
      enabled: true,
      description: 'Distribution spatiale intelligente des containers musicaux',
      maxItems: 10
    },
    {
      id: 'SpiralGrid_All',
      name: 'SpiralGrid All',
      type: 'spiral',
      contentTypes: ['NFT', 'INFO', 'MUSIC'],
      priority: 4,
      enabled: false,
      description: 'Spirale intégrant tous types de contenus avec ratios définis',
      spiralConfig: { centerX: 16, centerY: 16, direction: 'counterclockwise', startDirection: 'up', skipOccupied: true },
      maxItems: 200
    },
    {
      id: 'adopt-borders',
      name: 'ADOPT Bordures',
      type: 'zone',
      contentTypes: ['NFT'],
      priority: 5,
      enabled: false,
      description: 'Containers ADOPT placés sur les bordures de la grille',
      zoneConfig: { x: 0, y: 0, width: 32, height: 32, fillPattern: 'sequential' }
    },
    {
      id: 'info-clusters',
      name: 'Clusters INFO',
      type: 'zone',
      contentTypes: ['INFO'],
      priority: 6,
      enabled: false,
      description: 'Regroupe les containers INFO par thématiques',
      zoneConfig: { x: 8, y: 8, width: 16, height: 16, fillPattern: 'random' }
    },
    {
      id: 'music-proximity',
      name: 'MUSIC Proximité',
      type: 'sequential',
      contentTypes: ['MUSIC'],
      priority: 7,
      enabled: false,
      description: 'Distribue MUSIC selon la proximité avec NFT compatibles',
      maxItems: 15
    }
  ]);

  // Génération de la grille de prévisualisation
  const [previewGrid, setPreviewGrid] = useState<PreviewCell[]>([]);

  const generatePreviewGrid = () => {
    const activeRules = deploymentRules.filter(rule => rule.enabled && selectedDeploymentRules.includes(rule.id));
    const grid: PreviewCell[] = [];
    
    // Initialiser grille vide 9x9 pour la prévisualisation
    for (let i = 0; i < 81; i++) {
      grid.push({
        id: i,
        type: 'empty',
        color: '#f3f4f6'
      });
    }

    // Appliquer les règles actives
    activeRules.forEach(rule => {
      if (rule.type === 'spiral' && rule.spiralConfig) {
        // Logique spirale simplifiée pour prévisualisation 9x9
        const centerX = 4, centerY = 4;
        let positions = 0;
        
        for (let r = 0; r < 4; r++) {
          for (let angle = 0; angle < 360; angle += 45) {
            if (positions >= 30) break;
            
            const rad = (angle * Math.PI) / 180;
            const x = Math.round(centerX + r * Math.cos(rad));
            const y = Math.round(centerY + r * Math.sin(rad));
            
            if (x >= 0 && x < 9 && y >= 0 && y < 9) {
              const index = y * 9 + x;
              if (grid[index].type === 'empty') {
                grid[index] = {
                  id: index,
                  type: 'nft',
                  color: '#10b981',
                  source: rule.contentSources[0],
                  rarity: rule.rarityTags[0] || 'Common'
                };
                positions++;
              }
            }
          }
        }
      } else if (rule.type === 'container') {
        // Placement aléatoire pour les containers
        const positions = rule.contentSources.includes('info-containers') ? 3 : 2;
        for (let i = 0; i < positions; i++) {
          const randomIndex = Math.floor(Math.random() * 81);
          if (grid[randomIndex].type === 'empty') {
            grid[randomIndex] = {
              id: randomIndex,
              type: rule.contentSources.includes('info-containers') ? 'info' : 'music',
              color: rule.contentSources.includes('info-containers') ? '#3b82f6' : '#8b5cf6',
              source: rule.contentSources[0]
            };
          }
        }
      }
    });

    setPreviewGrid(grid);
  };

  useEffect(() => {
    generatePreviewGrid();
  }, [selectedDeploymentRules, deploymentRules]);

  const toggleRuleSelection = (ruleId: string) => {
    if (selectedDeploymentRules.includes(ruleId)) {
      setSelectedDeploymentRules(selectedDeploymentRules.filter(id => id !== ruleId));
    } else {
      setSelectedDeploymentRules([...selectedDeploymentRules, ruleId]);
    }
  };

  const startEditRule = (rule: DeploymentRule) => {
    setEditingRule({ ...rule });
    setShowRuleEditor(true);
  };

  const saveRule = () => {
    if (editingRule) {
      setDeploymentRules(rules => 
        rules.map(rule => rule.id === editingRule.id ? editingRule : rule)
      );
      setEditingRule(null);
      setShowRuleEditor(false);
    }
  };

  const addNewRule = () => {
    const newRule: DeploymentRule = {
      id: `rule-${Date.now()}`,
      name: 'Nouvelle Règle',
      type: 'spiral',
      enabled: false,
      contentSources: [],
      familyTags: [],
      rarityTags: []
    };
    setDeploymentRules([...deploymentRules, newRule]);
    startEditRule(newRule);
  };

  return (
    <div 
      className="bg-gray-50"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
        zIndex: 1000
      }}
    >
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/" className="p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Distribution NFT Unifiée</h1>
            <p className="text-gray-600">Configuration QUI → OÙ → COMMENT (Sources intégrées aux règles)</p>
          </div>
        </div>

        {/* Prévisualisation en haut */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
            <span>Distribution Live</span>
            <span className="text-sm text-gray-500">Grille 9×9 - Aperçu temps réel</span>
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Grille de prévisualisation */}
            <div className="flex flex-col">
              <div className="flex justify-center mb-4">
                <div 
                  className="grid gap-1 bg-gray-200 p-4 rounded-lg shadow-inner"
                  style={{ 
                    gridTemplateColumns: 'repeat(9, 28px)',
                    gridTemplateRows: 'repeat(9, 28px)'
                  }}
                >
                  {previewGrid.map((cell) => (
                    <div
                      key={cell.id}
                      className="rounded border border-gray-400 flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: cell.color }}
                      title={`${cell.type.toUpperCase()} - Position ${cell.id}${cell.source ? ` (${cell.source})` : ''}${cell.rarity ? ` - ${cell.rarity}` : ''}`}
                    >
                      {cell.type !== 'empty' && (
                        <div className="text-white text-xs font-bold drop-shadow-sm">
                          {cell.type === 'nft' ? '●' : 
                           cell.type === 'info' ? 'i' : 
                           cell.type === 'music' ? '♪' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={generatePreviewGrid}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Régénérer</span>
              </button>
            </div>

            {/* Statistiques */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">Configuration Actuelle</h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Page: </span>
                  <span className="font-medium text-blue-700">
                    {availablePages.find(p => p.id === selectedPage)?.name || 'Aucune'}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-600">Grille: </span>
                  <span className="font-medium text-blue-700">
                    {gridModels.find(g => g.id === selectedGridModel)?.name || 'Aucune'}
                  </span>
                </div>

                <div>
                  <span className="text-gray-600">Règles: </span>
                  <span className="font-medium text-blue-700">
                    {selectedDeploymentRules.length} appliquée(s)
                  </span>
                </div>

                <div className="pt-2 border-t border-blue-200">
                  <span className="text-gray-600">Occupation: </span>
                  <span className="font-bold text-blue-700">
                    {Math.round(((81 - previewGrid.filter(c => c.type === 'empty').length) / 81) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration restructurée : 2 colonnes pour QUI+OÙ + 3 colonnes pour COMMENT */}
        <div className="grid grid-cols-5 gap-6">
          {/* Colonnes 1-2 : QUI + OÙ fusionnées */}
          <div className="col-span-2 space-y-6">
            {/* QUI - Pages */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center text-blue-700">
                <span className="bg-blue-100 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2">1</span>
                QUI - Pages
              </h3>
              <div className="space-y-2">
                {availablePages.map((page) => (
                  <label key={page.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={selectedPage === page.id}
                      onChange={() => setSelectedPage(page.id)}
                      className="text-blue-600"
                    />
                    <div className="text-sm">
                      <div className="font-medium">{page.name}</div>
                      <div className="text-xs text-gray-500">{page.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* OÙ - Grilles */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center text-yellow-700">
                <span className="bg-yellow-100 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2">2</span>
                OÙ - Grilles
              </h3>
              <div className="space-y-2">
                {gridModels.map((model) => (
                  <label key={model.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={selectedGridModel === model.id}
                      onChange={() => setSelectedGridModel(model.id)}
                      className="text-yellow-600"
                    />
                    <div className="text-sm">
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Colonnes 3-5 : Gestionnaire de règles complet */}
          <div className="col-span-3 bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center text-purple-700">
                <span className="bg-purple-100 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2">3</span>
                COMMENT - Règles de Déploiement
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={addNewRule}
                  className="flex items-center space-x-1 bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                >
                  <Plus className="w-3 h-3" />
                  <span>Nouvelle règle</span>
                </button>
                {showRuleEditor && (
                  <button
                    onClick={saveRule}
                    className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    <Save className="w-3 h-3" />
                    <span>Sauvegarder</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {deploymentRules.map((rule) => (
                <div key={rule.id} className={`border rounded-lg p-3 ${rule.enabled ? 'border-purple-300 bg-purple-50' : 'border-gray-300'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedDeploymentRules.includes(rule.id)}
                        onChange={() => toggleRuleSelection(rule.id)}
                        className="text-purple-600"
                      />
                      <div>
                        <div className="font-medium text-sm">{rule.name}</div>
                        <div className="text-xs text-gray-500">
                          Type: {rule.type} | Sources: {rule.contentSources.length} | Tags: {rule.familyTags.length + rule.rarityTags.length}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEditRule(rule)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeploymentRules(rules => rules.filter(r => r.id !== rule.id))}
                        className="p-1 hover:bg-gray-200 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Affichage des sources et tags */}
                  <div className="mt-2 text-xs">
                    {rule.contentSources.length > 0 && (
                      <div className="mb-1">
                        <span className="text-gray-600">Sources: </span>
                        {rule.contentSources.map(sourceId => {
                          const source = contentSources.find(s => s.id === sourceId);
                          return (
                            <span key={sourceId} className="inline-block bg-green-100 text-green-700 px-1.5 py-0.5 rounded mr-1">
                              {source?.name || sourceId}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    
                    {rule.familyTags.length > 0 && (
                      <div className="mb-1">
                        <span className="text-gray-600">Familles: </span>
                        {rule.familyTags.map(tag => (
                          <span key={tag} className="inline-block bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded mr-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {rule.rarityTags.length > 0 && (
                      <div>
                        <span className="text-gray-600">Raretés: </span>
                        {rule.rarityTags.map(tag => (
                          <span key={tag} className="inline-block bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded mr-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Éditeur de règle en modal */}
      {showRuleEditor && editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Édition de règle : {editingRule.name}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom de la règle</label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({...editingRule, name: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={editingRule.type}
                  onChange={(e) => setEditingRule({...editingRule, type: e.target.value as any})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="spiral">Spirale</option>
                  <option value="container">Container</option>
                  <option value="zone">Zone</option>
                  <option value="random">Aléatoire</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sources de contenu</label>
                <div className="space-y-2">
                  {contentSources.map(source => (
                    <label key={source.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingRule.contentSources.includes(source.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditingRule({
                              ...editingRule,
                              contentSources: [...editingRule.contentSources, source.id]
                            });
                          } else {
                            setEditingRule({
                              ...editingRule,
                              contentSources: editingRule.contentSources.filter(id => id !== source.id)
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{source.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRuleEditor(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={saveRule}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}