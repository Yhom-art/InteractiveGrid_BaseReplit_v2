import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Save, ChevronDown, ChevronRight, Plus, Play, RotateCcw, Settings, Target, Eye } from 'lucide-react';
import { generateSpiralPositions } from '../../utils/spiralAlgorithm';


interface DistributionRule {
  id: string;
  name: string;
  type: 'spiral' | 'zone' | 'random' | 'sequential';
  contentTypes: string[];
  priority: number;
  enabled: boolean;
  description: string;
  modified?: boolean;
  spiralConfig?: {
    centerX: number;
    centerY: number;
    direction: 'clockwise' | 'counterclockwise';
    startDirection: 'right' | 'down' | 'left' | 'up';
    skipOccupied: boolean;
  };
}

interface DeploymentRule {
  id: string;
  name: string;
  type: 'spiral' | 'container' | 'zone' | 'random';
  enabled: boolean;
  contentSources: string[];
  familyTags: string[];
  rarityTags: string[];
  gridConfig?: {
    rows: number;
    cols: number;
  };
  spiralConfig?: {
    centerX: number;
    centerY: number;
    direction: 'clockwise' | 'counterclockwise';
    startDirection: 'right' | 'down' | 'left' | 'up';
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

export function GridMapDistributionPage() {
  // États principaux selon la logique QUI → OÙ → COMMENT (QUOI intégré dans les règles)
  const [selectedPage, setSelectedPage] = useState<string>('market-castings');
  const [selectedGridModel, setSelectedGridModel] = useState<string>('main-32x32');
  const [selectedDeploymentRules, setSelectedDeploymentRules] = useState<string[]>(['spiralgrid-castings']);
  
  // États pour la gestion des règles
  const [editingRule, setEditingRule] = useState<DeploymentRule | null>(null);
  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [expandedSources, setExpandedSources] = useState<string[]>([]);

  // Pages disponibles (QUI)
  const [availablePages] = useState([
    { id: 'market-castings', name: 'Accueil Market Castings', description: 'Page principale des Castings de Chimères' },
    { id: 'thugshots', name: 'Accueil Thugshots', description: 'Page dédiée à la collection Thugshots' },
    { id: 'ozmoz', name: 'Accueil Os.moz', description: 'Page dédiée à la collection Os.moz' },
    { id: 'regeneration', name: 'Accueil Régénération', description: 'Page dédiée à la collection Régénération' }
  ]);

  // Sources de contenu (QUOI) - Synchronisées avec DeploymentModelsPage
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
      id: 'nft-ozmoz', 
      name: 'Ozmoz', 
      type: 'NFT', 
      description: 'Collection à venir', 
      enabled: false, 
      count: 0,
      familyTags: ['FREE', 'ADOPT'],
      rarityTags: ['Genesis', 'Evolution']
    },
    { 
      id: 'nft-regeneration', 
      name: 'Régénération', 
      type: 'NFT', 
      description: 'Collection à venir', 
      enabled: false, 
      count: 0,
      familyTags: ['FREE', 'ADOPT'],
      rarityTags: ['Alpha', 'Beta', 'Final']
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
    },
    { 
      id: 'editorial-content', 
      name: 'Contenu Éditorial', 
      type: 'EDITORIAL', 
      description: 'Articles et contenu éditorial', 
      enabled: true, 
      count: 15,
      familyTags: ['Articles', 'Interviews', 'Reviews', 'News'],
      rarityTags: []
    }
  ]);

  // Modèles de grille (OÙ)
  const [gridModels] = useState<GridModel[]>([
    { id: 'main-32x32', name: 'Grille Principale 32x32', rows: 32, cols: 32, description: 'Grille principale pour HomePage' },
    { id: 'gallery-16x16', name: 'Galerie 16x16', rows: 16, cols: 16, description: 'Grille pour galeries' },
    { id: 'compact-8x8', name: 'Compacte 8x8', rows: 8, cols: 8, description: 'Grille pour aperçus' }
  ]);

  // Règles de déploiement unifiées (COMMENT avec QUOI intégré)
  const [deploymentRules, setDeploymentRules] = useState<DeploymentRule[]>([
    {
      id: 'nft-spiral',
      name: 'Spirale NFT Principale',
      type: 'spiral',
      contentTypes: ['NFT'],
      priority: 1,
      enabled: true,
      description: 'Distribution en spirale depuis le centre pour les NFT principaux',
      spiralConfig: { centerX: 4, centerY: 4, direction: 'clockwise', startDirection: 'right', skipOccupied: true }
    },
    {
      id: 'info-integration',
      name: 'Intégration INFO',
      type: 'sequential',
      contentTypes: ['INFO'],
      priority: 2,
      enabled: true,
      description: '1 container INFO tous les 4 NFT dans la spirale'
    },
    {
      id: 'music-spatial',
      name: 'MUSIC Spatiale',
      type: 'random',
      contentTypes: ['MUSIC'],
      priority: 3,
      enabled: true,
      description: 'Distribution spatiale intelligente des containers musicaux avec espacement optimal'
    },
    {
      id: 'adopt-borders',
      name: 'ADOPT Bordures',
      type: 'zone',
      contentTypes: ['ADOPT'],
      priority: 4,
      enabled: false,
      description: 'Containers ADOPT placés sur les bordures de la grille'
    },
    {
      id: 'nft-density',
      name: 'Densité NFT Adaptative',
      type: 'sequential',
      contentTypes: ['NFT'],
      priority: 5,
      enabled: false,
      description: 'Ajuste automatiquement la densité NFT selon la taille de collection'
    },
    {
      id: 'info-clusters',
      name: 'Clusters INFO',
      type: 'zone',
      contentTypes: ['INFO'],
      priority: 6,
      enabled: false,
      description: 'Regroupe les containers INFO par thématiques'
    },
    {
      id: 'music-proximity',
      name: 'MUSIC Proximité',
      type: 'sequential',
      contentTypes: ['MUSIC'],
      priority: 7,
      enabled: false,
      description: 'Distribue MUSIC selon la proximité avec NFT compatibles'
    },
    {
      id: 'mixed-spiral',
      name: 'Spirale Mixte',
      type: 'spiral',
      contentTypes: ['NFT', 'INFO', 'MUSIC'],
      priority: 8,
      enabled: false,
      description: 'Spirale intégrant tous types de contenus avec ratios définis',
      spiralConfig: { centerX: 4, centerY: 4, direction: 'counterclockwise', startDirection: 'up', skipOccupied: true }
    }
  ]);

  const [previewGrid, setPreviewGrid] = useState<PreviewCell[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [rulesModified, setRulesModified] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const adminPanelRef = useRef<HTMLDivElement>(null);

  // Génération de la grille de prévisualisation 9x9
  const generatePreview = () => {
    const gridSize = 9;
    const grid: PreviewCell[] = Array.from({ length: gridSize * gridSize }, (_, index) => ({
      id: index,
      type: 'empty',
      color: '#f3f4f6'
    }));

    // Utiliser la nouvelle logique sophistiquée avec rareté et directions
    const positions = generateContainerPositions();
    
    positions.forEach(container => {
      if (container.position < grid.length) {
        grid[container.position] = {
          id: container.position,
          type: container.type,
          color: container.color,
          source: container.type.toUpperCase(),
          rarity: container.rarity
        };
      }
    });

    return grid;
  };

  const generateContainerPositions = () => {
    const gridSize = 9;
    const allPositions: Array<{position: number, type: 'nft' | 'info' | 'music' | 'adopt', color: string, rarity?: string}> = [];
    const occupiedPositions = new Set<string>();

    const activeRules = distributionRules
      .filter(rule => selectedRules.includes(rule.id) && rule.enabled)
      .sort((a, b) => a.priority - b.priority);

    const activeSources = contentSources.filter(source => selectedSources.includes(source.id));

    // Collecte toutes les positions de containers selon les règles
    activeRules.forEach(rule => {
      if (rule.type === 'spiral' && rule.spiralConfig) {
        // Utilise la nouvelle configuration spirale
        const spiralConfig = {
          direction: rule.spiralConfig.direction,
          startDirection: rule.spiralConfig.startDirection,
          skipOccupied: rule.spiralConfig.skipOccupied
        };

        const positions = generateSpiralPositions(
          rule.spiralConfig.centerX,
          rule.spiralConfig.centerY,
          30, // Générer plus de positions pour couvrir la grille
          spiralConfig,
          occupiedPositions
        );

        // Définir l'ordre de priorité des NFT selon leur rareté
        const nftPriorityOrder = ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];
        let nftIndex = 0;
        let infoCounter = 0;

        positions.forEach((pos, index) => {
          if (pos.x >= 0 && pos.x < gridSize && pos.y >= 0 && pos.y < gridSize) {
            const gridIndex = pos.y * gridSize + pos.x;
            const posKey = `${pos.x},${pos.y}`;

            // Éviter les doublons
            if (occupiedPositions.has(posKey)) return;
            
            if (rule.contentTypes.includes('NFT')) {
              const hasInfoSource = activeSources.some(s => s.type === 'INFO');
              const hasInfoRule = activeRules.some(r => r.contentTypes.includes('INFO'));
              
              // Intégrer INFO tous les 4 NFT si configuré
              if (hasInfoSource && hasInfoRule && (nftIndex + 1) % 4 === 0 && infoCounter < 5) {
                allPositions.push({ 
                  position: gridIndex, 
                  type: 'info', 
                  color: '#3b82f6' 
                });
                infoCounter++;
              } else {
                // Placer NFT selon l'ordre de rareté
                const rarityIndex = nftIndex % nftPriorityOrder.length;
                const rarity = nftPriorityOrder[rarityIndex];
                
                // Couleurs selon la rareté
                const rarityColors: Record<string, string> = {
                  'Legendary': '#ffd700', // Or
                  'Epic': '#9333ea',      // Violet
                  'Rare': '#3b82f6',      // Bleu
                  'Uncommon': '#10b981',  // Vert
                  'Common': '#6b7280'     // Gris
                };

                allPositions.push({ 
                  position: gridIndex, 
                  type: 'nft', 
                  color: rarityColors[rarity] || '#10b981',
                  rarity 
                });
                nftIndex++;
              }
              
              occupiedPositions.add(posKey);
            }
          }
        });
      }

      if (rule.type === 'random' && rule.contentTypes.includes('MUSIC')) {
        const hasMusicSource = activeSources.some(s => s.type === 'MUSIC');
        if (hasMusicSource) {
          // Positions MUSIC aléatoires en évitant les positions occupées
          let attempts = 0;
          let placedMusic = 0;
          
          while (placedMusic < 3 && attempts < 50) {
            const randomPos = Math.floor(Math.random() * (gridSize * gridSize));
            const x = randomPos % gridSize;
            const y = Math.floor(randomPos / gridSize);
            const posKey = `${x},${y}`;
            
            if (!occupiedPositions.has(posKey)) {
              allPositions.push({ 
                position: randomPos, 
                type: 'music', 
                color: '#8b5cf6' 
              });
              occupiedPositions.add(posKey);
              placedMusic++;
            }
            attempts++;
          }
        }
      }
    });

    return allPositions;
  };

  const simulateDistribution = () => {
    setIsSimulating(true);
    const finalGrid = generatePreview();
    setPreviewGrid(finalGrid);
    setTimeout(() => setIsSimulating(false), 1000);
  };

  const playAnimation = () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setAnimationStep(0);
    
    const positions = generateContainerPositions();
    const gridSize = 9;
    
    // Grille vide
    let currentGrid: PreviewCell[] = Array.from({ length: gridSize * gridSize }, (_, index) => ({
      id: index,
      type: 'empty',
      color: '#f3f4f6'
    }));
    
    setPreviewGrid([...currentGrid]);
    
    // Animation container par container
    positions.forEach((container, index) => {
      setTimeout(() => {
        const newGrid = [...currentGrid];
        newGrid[container.position] = {
          id: container.position,
          type: container.type,
          color: container.color,
          source: container.type.toUpperCase()
        };
        currentGrid = newGrid;
        setPreviewGrid([...newGrid]);
        setAnimationStep(index + 1);
        
        if (index === positions.length - 1) {
          setTimeout(() => setIsPlaying(false), 500);
        }
      }, index * 200); // 200ms entre chaque container
    });
  };

  // Auto-simulation quand la configuration change
  useEffect(() => {
    simulateDistribution();
  }, [selectedPage, selectedSources, selectedGridModel, selectedRules]);

  // Filtrage intelligent des règles selon les sources sélectionnées
  const getRelevantRules = () => {
    const activeSourceTypes = contentSources
      .filter(source => selectedSources.includes(source.id))
      .map(source => source.type);

    return distributionRules.filter(rule => 
      rule.contentTypes.some(type => activeSourceTypes.includes(type as any))
    );
  };

  const updateRule = (ruleId: string, updates: Partial<DistributionRule>) => {
    setDistributionRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, ...updates, modified: true }
        : rule
    ));
    setRulesModified(true);
  };

  const handleRuleAdmin = (ruleId: string) => {
    setExpandedRule(expandedRule === ruleId ? null : ruleId);
    if (expandedRule !== ruleId) {
      // Scroll vers le panneau d'admin avec ancre visuelle
      setTimeout(() => {
        adminPanelRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
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
            <h1 className="text-2xl font-bold">Distribution NFT</h1>
            <p className="text-gray-600">Configuration QUI → QUOI → OÙ → COMMENT</p>
          </div>
        </div>

        {/* Prévisualisation en haut */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
            <span>Distribution Live</span>
            <span className="text-sm text-gray-500">Grille 9×9 - Aperçu temps réel</span>
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Partie gauche : Grille + bouton */}
            <div className="flex flex-col">
              {/* Grille de prévisualisation 9x9 */}
              <div className="flex justify-center mb-4">
                <div 
                  className="grid gap-1 bg-gray-200 p-4 rounded-lg shadow-inner"
                  style={{ 
                    gridTemplateColumns: 'repeat(9, 28px)',
                    gridTemplateRows: 'repeat(9, 28px)'
                  }}
                >
                  {previewGrid.length > 0 ? previewGrid.map((cell) => (
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
                           cell.type === 'music' ? '♪' : 
                           cell.type === 'adopt' ? '◆' : ''}
                        </div>
                      )}
                    </div>
                  )) : Array.from({ length: 9 * 9 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 rounded border border-gray-300"
                    />
                  ))}
                </div>
              </div>

              {/* Contrôles de simulation */}
              <div className="flex justify-center space-x-3">
                <button 
                  onClick={playAnimation}
                  disabled={isPlaying}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {isPlaying ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Animation...' : 'Play Animation'}</span>
                </button>
                
                {isPlaying && (
                  <div className="flex items-center space-x-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Container {animationStep}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Partie droite : Légendes + résumé */}
            <div className="space-y-4">
              {/* Légende */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Légende</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded border border-gray-300"></div>
                      <span className="text-sm text-gray-600">NFT</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{previewGrid.filter(c => c.type === 'nft').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded border border-gray-300"></div>
                      <span className="text-sm text-gray-600">INFO</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{previewGrid.filter(c => c.type === 'info').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-purple-500 rounded border border-gray-300"></div>
                      <span className="text-sm text-gray-600">MUSIC</span>
                    </div>
                    <span className="text-sm font-bold text-purple-600">{previewGrid.filter(c => c.type === 'music').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-200 rounded border border-gray-300"></div>
                      <span className="text-sm text-gray-600">Vide</span>
                    </div>
                    <span className="text-sm font-bold text-gray-600">{previewGrid.filter(c => c.type === 'empty').length}</span>
                  </div>
                </div>
              </div>

              {/* Panel résumé */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-700 mb-3">Configuration Actuelle</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Page: </span>
                    <span className="font-medium text-blue-700">
                      {availablePages.find(p => p.id === selectedPage)?.name || 'Aucune'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Sources: </span>
                    <span className="font-medium text-blue-700">
                      {selectedSources.length > 0 ? 
                        contentSources
                          .filter(s => selectedSources.includes(s.id))
                          .map(s => s.type)
                          .join(' + ') 
                        : 'Aucune'
                      }
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
                      {selectedRules.length} appliquée(s)
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
        </div>

        {/* Configuration compacte 4 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. QUI - Pages */}
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
            <button className="w-full mt-3 border-2 border-dashed border-blue-300 rounded-lg p-2 text-blue-600 hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center space-x-1 text-sm">
              <Plus className="w-3 h-3" />
              <span>Ajouter une page</span>
            </button>
          </div>

          {/* 2. QUOI - Sources */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center text-green-700">
              <span className="bg-green-100 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2">2</span>
              QUOI - Sources
            </h3>
            <div className="space-y-2">
              {contentSources.map((source) => (
                <label key={source.id} className={`flex items-center space-x-2 cursor-pointer ${!source.enabled ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source.id)}
                    disabled={!source.enabled}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSources([...selectedSources, source.id]);
                      } else {
                        setSelectedSources(selectedSources.filter(id => id !== source.id));
                      }
                    }}
                    className="text-green-600"
                  />
                  <div className="text-sm flex-1">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{source.name}</span>
                      <span className={`px-1 py-0.5 text-xs rounded ${
                        source.type === 'NFT' ? 'bg-green-100 text-green-700' :
                        source.type === 'INFO' ? 'bg-blue-100 text-blue-700' :
                        source.type === 'MUSIC' ? 'bg-purple-100 text-purple-700' :
                        source.type === 'EDITORIAL' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {source.type}
                      </span>
                    </div>
                    {source.count !== undefined && (
                      <div className="text-xs text-gray-500">({source.count} items)</div>
                    )}
                    
                    {/* Tags famille et rareté du système centralisé */}
                    {source.familyTags.length > 0 && (
                      <div className="mt-1">
                        <div className="text-xs text-gray-400 mb-1">Familles:</div>
                        <div className="flex flex-wrap gap-1">
                          {source.familyTags.map((tag: string) => (
                            <span key={tag} className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {source.rarityTags.length > 0 && (
                      <div className="mt-1">
                        <div className="text-xs text-gray-400 mb-1">Raretés:</div>
                        <div className="flex flex-wrap gap-1">
                          {source.rarityTags.map((tag: string) => (
                            <span key={tag} className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <button className="w-full mt-3 border-2 border-dashed border-green-300 rounded-lg p-2 text-green-600 hover:border-green-400 hover:bg-green-50 flex items-center justify-center space-x-1 text-sm">
              <Plus className="w-3 h-3" />
              <span>Ajouter une source</span>
            </button>
          </div>

          {/* 3. OÙ - Grilles */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center text-yellow-700">
              <span className="bg-yellow-100 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2">3</span>
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
                    <div className="text-xs text-gray-500">{model.rows}×{model.cols}</div>
                  </div>
                </label>
              ))}
            </div>
            <button className="w-full mt-3 border-2 border-dashed border-yellow-300 rounded-lg p-2 text-yellow-600 hover:border-yellow-400 hover:bg-yellow-50 flex items-center justify-center space-x-1 text-sm">
              <Plus className="w-3 h-3" />
              <span>Créer un modèle</span>
            </button>
          </div>

          {/* 4. COMMENT - Règles */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center text-purple-700">
              <span className="bg-purple-100 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2">4</span>
              COMMENT - Règles
            </h3>
            <div className="space-y-2">
              {getRelevantRules().map((rule) => (
                <div key={rule.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedRules.includes(rule.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRules([...selectedRules, rule.id]);
                      } else {
                        setSelectedRules(selectedRules.filter(id => id !== rule.id));
                      }
                    }}
                    className="text-purple-600"
                  />
                  <div className="text-sm flex-1 cursor-pointer" onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.tagName !== 'INPUT') {
                      setSelectedRules(prev => 
                        prev.includes(rule.id) 
                          ? prev.filter(id => id !== rule.id)
                          : [...prev, rule.id]
                      );
                    }
                  }}>
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-xs text-gray-500">
                      {rule.type.toUpperCase()} • {rule.contentTypes.join(', ')}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {rule.enabled ? '✓ Activée' : '○ Désactivée'}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <Link href="/admin/deployment-models" className="w-full border-2 border-dashed border-purple-300 rounded-lg p-2 text-purple-600 hover:border-purple-400 hover:bg-purple-50 flex items-center justify-center space-x-1 text-sm">
                <Settings className="w-3 h-3" />
                <span>Gérer les Modèles</span>
              </Link>
              <button className="w-full border-2 border-dashed border-purple-300 rounded-lg p-2 text-purple-600 hover:border-purple-400 hover:bg-purple-50 flex items-center justify-center space-x-1 text-sm">
                <Plus className="w-3 h-3" />
                <span>Créer une règle</span>
              </button>
            </div>
          </div>
        </div>



        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 hidden">
          {/* Ancien contenu masqué */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
              <span>Distribution Live</span>
              <span className="text-sm text-gray-500">Grille 9×9</span>
            </h2>
            
            {/* Résumé configuration active */}
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium text-blue-700">Page:</span>
                  <span className="text-blue-600">{availablePages.find(p => p.id === selectedPage)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-green-700">Sources actives:</span>
                  <span className="text-green-600">
                    {contentSources.filter(s => selectedSources.includes(s.id)).map(s => s.type).join(' + ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-yellow-700">Grille:</span>
                  <span className="text-yellow-600">{gridModels.find(g => g.id === selectedGridModel)?.rows}×{gridModels.find(g => g.id === selectedGridModel)?.cols}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-purple-700">Règles:</span>
                  <span className="text-purple-600">{selectedRules.length} appliquée(s)</span>
                </div>
              </div>
            </div>

            {/* Grille de prévisualisation 9x9 */}
            <div className="flex justify-center mb-4">
              <div 
                className="grid gap-1 bg-gray-200 p-3 rounded-lg shadow-inner"
                style={{ 
                  gridTemplateColumns: 'repeat(9, 24px)',
                  gridTemplateRows: 'repeat(9, 24px)'
                }}
              >
                {previewGrid.length > 0 ? previewGrid.map((cell) => (
                  <div
                    key={cell.id}
                    className="rounded border border-gray-400 flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: cell.color }}
                    title={`${cell.type.toUpperCase()} - Position ${cell.id}${cell.source ? ` (${cell.source})` : ''}`}
                  >
                    {cell.type !== 'empty' && (
                      <div className="text-white text-xs font-bold drop-shadow-sm">
                        {cell.type === 'nft' ? '●' : 
                         cell.type === 'info' ? 'i' : 
                         cell.type === 'music' ? '♪' : 
                         cell.type === 'adopt' ? '◆' : ''}
                      </div>
                    )}
                  </div>
                )) : Array.from({ length: 9 * 9 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 rounded border border-gray-300"
                  />
                ))}
              </div>
            </div>

            {/* Légende compacte */}
            <div className="grid grid-cols-4 gap-2 text-xs mb-4">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded"></div>
                <span>NFT</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded"></div>
                <span>INFO</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                <span>ADOPT</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded"></div>
                <span>MUSIC</span>
              </div>
            </div>

            {/* Statistiques live */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600 mb-2 font-medium">Distribution actuelle:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>NFT:</span>
                  <span className="font-bold text-green-600">{previewGrid.filter(c => c.type === 'nft').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>INFO:</span>
                  <span className="font-bold text-blue-600">{previewGrid.filter(c => c.type === 'info').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>MUSIC:</span>
                  <span className="font-bold text-purple-600">{previewGrid.filter(c => c.type === 'music').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Libres:</span>
                  <span className="font-bold text-gray-600">{previewGrid.filter(c => c.type === 'empty').length}</span>
                </div>
              </div>
              
              {/* Densité */}
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Taux occupation:</span>
                  <span className="font-bold">
                    {Math.round(((81 - previewGrid.filter(c => c.type === 'empty').length) / 81) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Impact en temps réel */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-700 font-medium mb-1">Impact des modifications:</div>
              <div className="text-xs text-blue-600">
                {selectedSources.includes('music-containers') && selectedRules.includes('music-spatial') ? 
                  '🎵 Mode musical activé - Distribution spatiale audio' :
                  selectedSources.includes('info-general') && selectedRules.includes('info-integration') ?
                  'ℹ️ Intégration INFO tous les 4 NFT dans la spirale' :
                  '📦 Distribution NFT standard en spirale'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde global */}
        <div className="mt-8 pt-6 border-t text-center">
          <button 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
            onClick={() => {
              console.log('Configuration sauvegardée:', {
                page: selectedPage,
                sources: selectedSources,
                gridModel: selectedGridModel,
                rules: selectedRules
              });
            }}
          >
            <Save className="w-5 h-5" />
            <span>Enregistrer Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
}