import { useState } from 'react';
import { Link } from 'wouter';
import { Settings, Code, Play, Save, Plus, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { AdminPageWrapper } from '../../components/admin/AdminPageWrapper';
// Interface pour les sources de contenu centralisées
interface ContentSource {
  id: string;
  name: string;
  category: 'NFT' | 'INFO' | 'MUSIC' | 'EDITORIAL';
  description: string;
  enabled: boolean;
  count?: number;
  familyTags: string[];
  rarityTags: string[];
}

// Sources de contenu synchronisées avec GridMapDistributionPage
const CONTENT_SOURCES: ContentSource[] = [
  {
    id: 'nft-castings',
    name: 'Castings de Chimères',
    category: 'NFT',
    description: 'Collection principale actuelle',
    enabled: true,
    count: 150,
    familyTags: ['FREE', 'ADOPT', 'ADOPTED', 'RESERVED'],
    rarityTags: ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common']
  },
  {
    id: 'nft-thugshots',
    name: 'ThugShots',
    category: 'NFT',
    description: 'Collection à venir',
    enabled: false,
    count: 0,
    familyTags: ['FREE', 'ADOPT', 'ADOPTED'],
    rarityTags: ['Premium', 'Standard']
  },
  {
    id: 'nft-ozmoz',
    name: 'Ozmoz',
    category: 'NFT',
    description: 'Collection à venir',
    enabled: false,
    count: 0,
    familyTags: ['FREE', 'ADOPT'],
    rarityTags: ['Genesis', 'Evolution']
  },
  {
    id: 'nft-regeneration',
    name: 'Régénération',
    category: 'NFT',
    description: 'Collection à venir',
    enabled: false,
    count: 0,
    familyTags: ['FREE', 'ADOPT'],
    rarityTags: ['Alpha', 'Beta', 'Final']
  },
  {
    id: 'info-containers',
    name: 'Containers INFO',
    category: 'INFO',
    description: 'Informations et descriptions',
    enabled: true,
    count: 25,
    familyTags: ['Descriptions', 'Tutorials', 'News', 'Help'],
    rarityTags: []
  },
  {
    id: 'music-containers',
    name: 'Containers MUSIC',
    category: 'MUSIC',
    description: 'Modules audio spatialisés',
    enabled: true,
    count: 10,
    familyTags: ['Ambient', 'Interactive', 'Proximity', 'Background'],
    rarityTags: []
  },
  {
    id: 'editorial-content',
    name: 'Contenu Éditorial',
    category: 'EDITORIAL',
    description: 'Articles et contenu éditorial',
    enabled: true,
    count: 15,
    familyTags: ['Articles', 'Interviews', 'Reviews', 'News'],
    rarityTags: []
  }
];

interface SpiralConfig {
  centerX: number;
  centerY: number;
  direction: 'clockwise' | 'counterclockwise';
  startDirection: 'right' | 'down' | 'left' | 'up';
  skipOccupied: boolean;
}

interface ZoneConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  fillPattern: 'sequential' | 'random' | 'priority';
}

interface DeploymentRule {
  id: string;
  name: string;
  type: 'spiral' | 'zone' | 'random' | 'sequential';
  contentTypes: string[];
  priority: number;
  enabled: boolean;
  description: string;
  spiralConfig?: SpiralConfig;
  zoneConfig?: ZoneConfig;
  maxItems?: number;
  rarityOrder?: string[];
  modified?: boolean;
}

export function DeploymentModelsPage() {
  // Sources de contenu centralisées
  const [contentSources, setContentSources] = useState<ContentSource[]>(CONTENT_SOURCES);

  // Règles individuelles à éditer (synchronisées avec GridMapDistributionPage)
  const [distributionRules, setDistributionRules] = useState<DeploymentRule[]>([
    {
      id: 'SpiralGrid_Castings',
      name: 'SpiralGrid Castings',
      type: 'spiral',
      contentTypes: ['NFT'],
      priority: 1,
      enabled: true,
      description: 'Distribution en spirale des Castings de Chimères depuis le centre',
      spiralConfig: { centerX: 16, centerY: 16, direction: 'clockwise', startDirection: 'right', skipOccupied: true },
      maxItems: 150
    },
    {
      id: 'Container_Info',
      name: 'Container INFO',
      type: 'sequential',
      contentTypes: ['INFO'],
      priority: 2,
      enabled: true,
      description: '1 container INFO tous les 4 NFT dans la spirale',
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
  
  const [selectedRule, setSelectedRule] = useState<DeploymentRule | null>(distributionRules[0]);
  const [rulesModified, setRulesModified] = useState(false);
  
  // État pour gérer les sélections de tags
  const [selectedTags, setSelectedTags] = useState<{[sourceId: string]: {family: string[], rarity: string[]}}>({});

  // Fonctions pour gérer les sélections de tags
  const toggleTag = (sourceId: string, tagType: 'family' | 'rarity', tag: string) => {
    setSelectedTags(prev => {
      const current = prev[sourceId] || { family: [], rarity: [] };
      const currentTags = current[tagType];
      const newTags = currentTags.includes(tag) 
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag];
      
      return {
        ...prev,
        [sourceId]: {
          ...current,
          [tagType]: newTags
        }
      };
    });
  };

  const selectAllTags = (sourceId: string, tagType: 'family' | 'rarity') => {
    const source = contentSources.find(s => s.id === sourceId);
    if (!source) return;
    
    const allTags = tagType === 'family' ? source.familyTags : source.rarityTags;
    setSelectedTags(prev => ({
      ...prev,
      [sourceId]: {
        ...prev[sourceId] || { family: [], rarity: [] },
        [tagType]: [...allTags]
      }
    }));
  };

  const clearAllTags = (sourceId: string, tagType: 'family' | 'rarity') => {
    setSelectedTags(prev => ({
      ...prev,
      [sourceId]: {
        ...prev[sourceId] || { family: [], rarity: [] },
        [tagType]: []
      }
    }));
  };

  const isTagSelected = (sourceId: string, tagType: 'family' | 'rarity', tag: string) => {
    return selectedTags[sourceId]?.[tagType]?.includes(tag) || false;
  };

  const updateRule = (ruleId: string, updates: Partial<DeploymentRule>) => {
    setDistributionRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, ...updates, modified: true }
        : rule
    ));
    setRulesModified(true);
  };

  const getContentTypeColor = (type: string) => {
    const colors = {
      'NFT': 'bg-blue-100 text-blue-800',
      'INFO': 'bg-green-100 text-green-800',
      'MUSIC': 'bg-purple-100 text-purple-800',
      'EDITORIAL': 'bg-amber-100 text-amber-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderRuleEditor = () => {
    if (!selectedRule) return null;

    return (
      <div className="space-y-6">
        {/* Informations de base */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la règle</label>
            <input
              type="text"
              value={selectedRule.name}
              onChange={(e) => updateRule(selectedRule.id, { name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de distribution</label>
            <select
              value={selectedRule.type}
              onChange={(e) => updateRule(selectedRule.id, { type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="spiral">Spirale</option>
              <option value="zone">Zone</option>
              <option value="random">Aléatoire</option>
              <option value="sequential">Séquentiel</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={selectedRule.description}
            onChange={(e) => updateRule(selectedRule.id, { description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Configuration spécifique selon le type */}
        {selectedRule.type === 'spiral' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Centre X</label>
              <input
                type="number"
                value={selectedRule.spiralConfig?.centerX || 16}
                onChange={(e) => updateRule(selectedRule.id, {
                  spiralConfig: { ...selectedRule.spiralConfig!, centerX: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Centre Y</label>
              <input
                type="number"
                value={selectedRule.spiralConfig?.centerY || 16}
                onChange={(e) => updateRule(selectedRule.id, {
                  spiralConfig: { ...selectedRule.spiralConfig!, centerY: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {selectedRule.type === 'zone' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position X</label>
              <input
                type="number"
                value={selectedRule.zoneConfig?.x || 0}
                onChange={(e) => updateRule(selectedRule.id, {
                  zoneConfig: { ...selectedRule.zoneConfig!, x: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Largeur</label>
              <input
                type="number"
                value={selectedRule.zoneConfig?.width || 1}
                onChange={(e) => updateRule(selectedRule.id, {
                  zoneConfig: { ...selectedRule.zoneConfig!, width: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre maximum d'éléments</label>
          <input
            type="number"
            value={selectedRule.maxItems || ''}
            onChange={(e) => updateRule(selectedRule.id, { maxItems: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="Illimité"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Aperçu du code généré */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Code généré</h4>
            <Code className="w-4 h-4 text-gray-500" />
          </div>
          <pre className="text-sm text-gray-700 overflow-x-auto">
            <code>{generateRuleCode(selectedRule)}</code>
          </pre>
        </div>
      </div>
    );
  };

  const generateRuleCode = (rule: DeploymentRule) => {
    const lines: string[] = [];
    lines.push(`// Règle: ${rule.name}`);
    lines.push(`const ${rule.id.replace(/[^a-zA-Z0-9]/g, '')}Config = {`);
    lines.push(`  id: '${rule.id}',`);
    lines.push(`  type: '${rule.type}',`);
    lines.push(`  priority: ${rule.priority},`);
    lines.push(`  enabled: ${rule.enabled},`);
    
    if (rule.maxItems) {
      lines.push(`  maxItems: ${rule.maxItems},`);
    }
    
    if (rule.spiralConfig) {
      lines.push(`  spiralConfig: {`);
      lines.push(`    centerX: ${rule.spiralConfig.centerX},`);
      lines.push(`    centerY: ${rule.spiralConfig.centerY},`);
      lines.push(`    direction: '${rule.spiralConfig.direction}',`);
      lines.push(`    startDirection: '${rule.spiralConfig.startDirection}',`);
      lines.push(`    skipOccupied: ${rule.spiralConfig.skipOccupied}`);
      lines.push(`  },`);
    }
    
    if (rule.zoneConfig) {
      lines.push(`  zoneConfig: {`);
      lines.push(`    x: ${rule.zoneConfig.x}, y: ${rule.zoneConfig.y},`);
      lines.push(`    width: ${rule.zoneConfig.width}, height: ${rule.zoneConfig.height},`);
      lines.push(`    fillPattern: '${rule.zoneConfig.fillPattern}'`);
      lines.push(`  },`);
    }
    
    lines.push('};');
    
    return lines.join('\n');
  };

  return (
    <AdminPageWrapper 
      title="Modèles de Déploiement"
      subtitle="Édition et paramétrage des règles de distribution pour la Grille Chimérique"
      backLink="/admin/grid/distribution"
      backLabel="← Retour"
    >
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Colonne de gauche - Sources de contenu */}
        <div className="col-span-4 bg-white rounded-lg shadow p-4 overflow-y-auto">
          {/* Sélecteur de règle compact */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Règle à éditer</label>
            <select
              value={selectedRule?.id || ''}
              onChange={(e) => {
                const rule = distributionRules.find(r => r.id === e.target.value);
                setSelectedRule(rule || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {distributionRules.map(rule => (
                <option key={rule.id} value={rule.id}>
                  {rule.name} {rule.modified ? '●' : ''} (P{rule.priority})
                </option>
              ))}
            </select>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sources de Contenu</h3>
          
          {/* Liste arborescente des sources */}
          <div className="space-y-2">
            {contentSources.map(source => (
              <div key={source.id} className="border border-gray-200 rounded-lg">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRule?.contentTypes.includes(source.category) || false}
                        onChange={(e) => {
                          if (!selectedRule) return;
                          const newTypes = e.target.checked
                            ? [...selectedRule.contentTypes, source.category]
                            : selectedRule.contentTypes.filter(t => t !== source.category);
                          updateRule(selectedRule.id, { contentTypes: newTypes });
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span className="font-medium text-sm">{source.name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContentTypeColor(source.category)}`}>
                      {source.category}
                    </span>
                  </div>
                  
                  {/* Tags Familles compacts */}
                  <div className="ml-6 space-y-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">Familles:</span>
                        <button 
                          onClick={() => selectAllTags(source.id, 'family')}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Tout
                        </button>
                        <button 
                          onClick={() => clearAllTags(source.id, 'family')}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Rien
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {source.familyTags.map(tag => (
                          <label key={tag} className="flex items-center gap-1 text-xs cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-3 h-3 rounded"
                              checked={isTagSelected(source.id, 'family', tag)}
                              onChange={() => toggleTag(source.id, 'family', tag)}
                            />
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              source.category === 'NFT' && ['FREE', 'ADOPT', 'ADOPTED', 'RESERVED'].includes(tag)
                                ? tag === 'FREE' ? 'bg-green-100 text-green-700' :
                                  tag === 'ADOPT' ? 'bg-blue-100 text-blue-700' :
                                  tag === 'ADOPTED' ? 'bg-purple-100 text-purple-700' :
                                  tag === 'RESERVED' ? 'bg-orange-100 text-orange-700' :
                                  'bg-gray-100 text-gray-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {tag}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Tags Rareté compacts */}
                    {source.rarityTags.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">Rareté:</span>
                          <button 
                            onClick={() => selectAllTags(source.id, 'rarity')}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Tout
                          </button>
                          <button 
                            onClick={() => clearAllTags(source.id, 'rarity')}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Rien
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {source.rarityTags.map(tag => (
                            <label key={tag} className="flex items-center gap-1 text-xs cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="w-3 h-3 rounded"
                                checked={isTagSelected(source.id, 'rarity', tag)}
                                onChange={() => toggleTag(source.id, 'rarity', tag)}
                              />
                              <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                {tag}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Bouton pour ajouter une nouvelle source */}
          <button
            onClick={() => {
              const newSource: ContentSource = {
                id: `source-${Date.now()}`,
                name: 'Nouvelle Source',
                category: 'NFT',
                description: 'Nouvelle source de contenu',
                enabled: false,
                count: 0,
                familyTags: ['FREE'],
                rarityTags: []
              };
              setContentSources(prev => [...prev, newSource]);
            }}
            className="w-full mt-4 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 text-sm"
          >
            + Ajouter une source
          </button>
        </div>

        {/* Colonne de droite - Éditeur de règle */}
        <div className="col-span-8 bg-white rounded-lg shadow p-6 overflow-y-auto">
          {selectedRule && (
            <>
              {/* Bouton Enregistrer en haut */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Édition de la Règle</h3>
                <button
                  onClick={() => {
                    setRulesModified(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  Enregistrer
                </button>
              </div>

              {renderRuleEditor()}
            </>
          )}
        </div>
      </div>
    </AdminPageWrapper>
  );
}