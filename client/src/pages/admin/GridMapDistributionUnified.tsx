import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Save, ChevronDown, ChevronRight, ChevronLeft, Plus, Play, RotateCcw, Settings, Target, Eye, EyeOff, Trash2, Code, Square } from 'lucide-react';

import { generateSpiralPositions } from '../../utils/spiralAlgorithm';

// Interface complète pour les règles de déploiement
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
  category: 'NFT' | 'INFO' | 'AUDIO' | 'EDITORIAL';
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
  type: 'nft' | 'info' | 'audio' | 'empty';
  color: string;
  source: string | undefined;
  rarity: string | undefined;
  marketOrder?: number;
}

interface NativeGridCell {
  id: number;
  type: 'empty' | 'nft' | 'info' | 'audio';
  position: { x: number; y: number };
  containerId: string | null;
  containerData: {
    title: string;
    source: string;
    marketOrder: number;
  } | null;
}

export function GridMapDistributionUnified() {
  // États principaux
  const [selectedPage, setSelectedPage] = useState('market-castings');
  const [selectedGridModel, setSelectedGridModel] = useState('standard-32x32');
  const [selectedRule, setSelectedRule] = useState<DeploymentRule | null>(null);
  const [selectedDeploymentRules, setSelectedDeploymentRules] = useState<string[]>(['SpiralGrid_Castings', 'Container_Audio']);
  const [previewGrid, setPreviewGrid] = useState<PreviewCell[]>([]);
  const [nativeGrid32, setNativeGrid32] = useState<NativeGridCell[]>([]);
  const [viewMode, setViewMode] = useState<'preview' | 'native'>('preview');
  const [testMode, setTestMode] = useState(false);
  const [testStep, setTestStep] = useState(0);
  const [maxTestSteps, setMaxTestSteps] = useState(0);
  const [testGrid, setTestGrid] = useState<PreviewCell[]>([]);
  const [testSequence, setTestSequence] = useState<Array<{
    position: number;
    rule: DeploymentRule;
    content: PreviewCell;
  }>>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSubCategories, setSelectedSubCategories] = useState<{[ruleId: string]: {[category: string]: string[]}}>({});

  // Initialisation des sous-catégories par défaut
  useEffect(() => {
    deploymentRules.forEach(rule => {
      if (rule.contentTypes.length > 0) {
        initializeSubCategories(rule.id, rule.contentTypes[0]);
      }
    });
  }, []);

  // Données de base
  const availablePages = [
    { id: 'market-castings', name: 'Accueil Market Castings', description: 'Page principale NFT' },
    { id: 'thugshots', name: 'Accueil Thugshots', description: 'Collection Thugshots' },
    { id: 'osmoz', name: 'Accueil Os.moz', description: 'Collection Os.moz' },
    { id: 'regeneration', name: 'Accueil Régénération', description: 'Projet Régénération' }
  ];

  const gridModels: GridModel[] = [
    { id: 'standard-32x32', name: 'Grille Standard', rows: 32, cols: 32, description: '32x32 - Configuration par défaut' },
    { id: 'compact-16x16', name: 'Grille Compacte', rows: 16, cols: 16, description: '16x16 - Vue réduite' },
    { id: 'extended-64x64', name: 'Grille Étendue', rows: 64, cols: 64, description: '64x64 - Vue élargie' }
  ];

  // Sources de contenu récupérées depuis DeploymentModelsPage
  const [contentSources] = useState<ContentSource[]>([
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
      id: 'audio-containers',
      name: 'Containers AUDIO',
      category: 'AUDIO',
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
  ]);

  const [deploymentRules, setDeploymentRules] = useState<DeploymentRule[]>([
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
      type: 'random',
      contentTypes: ['INFO'],
      priority: 2,
      enabled: true,
      description: 'Distribution aléatoire des containers INFO',
      maxItems: 25
    },
    {
      id: 'Container_Audio',
      name: 'Container AUDIO',
      type: 'random',
      contentTypes: ['AUDIO'],
      priority: 3,
      enabled: true,
      description: 'Distribution spatiale intelligente des containers audio',
      maxItems: 30
    }
  ]);

  // Fonctions pour gérer les sous-catégories
  const initializeSubCategories = (ruleId: string, contentType: string) => {
    const defaultSelections = {
      NFT: {
        collections: ['Castings de Chimères', 'Chimères', 'Os.moz', 'Thugshots', 'Régénération'],
        famille: ['Libres', 'Achetés', 'Revente']
      },
      AUDIO: {
        types: ['Music', 'Podcast']
      },
      INFO: {
        types: ['Liens', 'Agenda']
      },
      VIDEO: {
        types: []
      }
    };

    setSelectedSubCategories(prev => ({
      ...prev,
      [ruleId]: defaultSelections[contentType as keyof typeof defaultSelections] || {}
    }));
  };

  const toggleSubCategory = (ruleId: string, category: string, item: string) => {
    setSelectedSubCategories(prev => {
      const current = prev[ruleId]?.[category] || [];
      const newSelection = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      
      return {
        ...prev,
        [ruleId]: {
          ...prev[ruleId],
          [category]: newSelection
        }
      };
    });
  };

  const isSubCategorySelected = (ruleId: string, category: string, item: string) => {
    return selectedSubCategories[ruleId]?.[category]?.includes(item) || false;
  };

  // Reconnecter la génération de preview aux changements
  React.useEffect(() => {
    generatePreview();
  }, [deploymentRules]);

  React.useEffect(() => {
    generatePreview();
  }, [testMode]);

  // Regénérer quand la sélection des règles change
  React.useEffect(() => {
    if (deploymentRules.length > 0) {
      generatePreview();
    }
  }, [selectedDeploymentRules]);

  // Générer la preview initiale
  React.useEffect(() => {
    generatePreview();
  }, []);

  // Initialiser les sélections par défaut pour toutes les règles
  React.useEffect(() => {
    const defaultSelections: { [key: string]: any } = {};
    
    deploymentRules.forEach(rule => {
      if (rule.contentTypes[0] === 'NFT') {
        defaultSelections[rule.id] = {
          Collections: ['Castings de Chimères', 'Chimères', 'Os.moz', 'Thugshots', 'Régénération'],
          Famille: ['Libres', 'Achetés', 'Revente']
        };
      } else if (rule.contentTypes[0] === 'AUDIO') {
        defaultSelections[rule.id] = {
          Types: ['Music', 'Podcast']
        };
      } else if (rule.contentTypes[0] === 'INFO') {
        defaultSelections[rule.id] = {
          Types: ['Liens', 'Agenda']
        };
      }
    });
    
    setSelectedSubCategories(prev => ({
      ...prev,
      ...defaultSelections
    }));

    // Mettre à jour les centres des règles spirales avec les valeurs par défaut
    const defaultCenter = getGridCenter('standard'); // 32x32 par défaut
    setDeploymentRules(prev => prev.map(rule => {
      if (rule.type === 'spiral' && rule.spiralConfig) {
        return {
          ...rule,
          spiralConfig: {
            ...rule.spiralConfig,
            centerX: rule.spiralConfig.centerX || defaultCenter.centerX,
            centerY: rule.spiralConfig.centerY || defaultCenter.centerY
          }
        };
      }
      return rule;
    }));
  }, []);

  // Fonction pour calculer le centre selon le modèle de grille
  const getGridCenter = (gridModel: string) => {
    switch (gridModel) {
      case 'standard': // 32x32
        return { centerX: 16, centerY: 16 };
      case 'compact': // 16x16
        return { centerX: 8, centerY: 8 };
      case 'extended': // 64x64
        return { centerX: 32, centerY: 32 };
      default:
        return { centerX: 16, centerY: 16 }; // Par défaut 32x32
    }
  };

  // Fonction pour convertir coordonnées 32x32 vers 12x12 preview
  const convertToPreviewCoords = (x32: number, y32: number) => {
    // Centre de la grille 32x32 : (16, 16) -> Centre grille 12x12 : (5.5, 5.5) arrondi à (6, 6)
    const centerOffset32 = { x: x32 - 16, y: y32 - 16 };
    const scaleFactor = 11 / 31; // Ratio pour convertir de 32x32 à 12x12
    
    const previewX = Math.round(5.5 + centerOffset32.x * scaleFactor);
    const previewY = Math.round(5.5 + centerOffset32.y * scaleFactor);
    
    return { x: previewX, y: previewY };
  };

  // Fonctions pour réorganiser les priorités
  const moveRuleUp = (ruleId: string) => {
    setDeploymentRules(prev => {
      const currentRule = prev.find(r => r.id === ruleId);
      if (!currentRule || currentRule.priority === 1) return prev;

      return prev.map(rule => {
        if (rule.id === ruleId) {
          return { ...rule, priority: rule.priority - 1 };
        } else if (rule.priority === currentRule.priority - 1) {
          return { ...rule, priority: rule.priority + 1 };
        }
        return rule;
      });
    });
  };

  const moveRuleDown = (ruleId: string) => {
    setDeploymentRules(prev => {
      const currentRule = prev.find(r => r.id === ruleId);
      const maxPriority = Math.max(...prev.map(r => r.priority));
      if (!currentRule || currentRule.priority === maxPriority) return prev;

      return prev.map(rule => {
        if (rule.id === ruleId) {
          return { ...rule, priority: rule.priority + 1 };
        } else if (rule.priority === currentRule.priority + 1) {
          return { ...rule, priority: rule.priority - 1 };
        }
        return rule;
      });
    });
  };

  // Fonctions utilitaires
  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'NFT':
        return '#10B981'; // Vert uniforme pour tous les NFT
      case 'INFO': 
        return '#F59E0B';
      case 'MUSIC':
      case 'AUDIO': 
        return '#8B5CF6';
      case 'VIDEO': 
        return '#EF4444';
      case 'EDITORIAL': 
        return '#F59E0B';
      default: 
        return '#9CA3AF';
    }
  };

  const generateTestSequence = () => {
    const grid: PreviewCell[] = Array.from({ length: 144 }, (_, i) => ({
      id: i,
      type: 'empty' as const,
      color: '#F3F4F6',
      source: undefined,
      rarity: undefined
    }));

    const enabledRules = deploymentRules
      .filter(rule => rule.enabled && selectedDeploymentRules.includes(rule.id))
      .sort((a, b) => a.priority - b.priority);

    const sequence: Array<{
      position: number;
      rule: DeploymentRule;
      content: PreviewCell;
    }> = [];

    enabledRules.forEach(rule => {
      const maxItems = Math.min(rule.maxItems || 10, 20);
      
      if (rule.type === 'spiral' && rule.spiralConfig) {
        // Conversion proportionnelle 32x32 -> 12x12 (indices 0-11, centre = 6)
        const scaledCenterX = Math.round((rule.spiralConfig.centerX / 32) * 11);
        const scaledCenterY = Math.round((rule.spiralConfig.centerY / 32) * 11);
        
        const positions = generateSpiralPositions(
          scaledCenterX,
          scaledCenterY,
          rule.spiralConfig.direction,
          rule.spiralConfig.startDirection,
          maxItems
        );
        
        positions.forEach((pos, index) => {
          if (index < maxItems && pos.x >= 0 && pos.x < 12 && pos.y >= 0 && pos.y < 12) {
            const gridIndex = pos.y * 12 + pos.x;
            if (grid[gridIndex] && grid[gridIndex].type === 'empty') {
              const rarity = index < 3 ? 'legendary' : index < 8 ? 'rare' : 'common';
              const contentType = rule.contentTypes[0].toLowerCase();
              const mappedType = contentType === 'audio' ? 'audio' : contentType === 'music' ? 'audio' : contentType as 'nft' | 'info' | 'audio';
              const content: PreviewCell = {
                id: gridIndex,
                type: mappedType,
                color: getContentTypeColor(rule.contentTypes[0]),
                source: rule.name,
                rarity: rarity,
                marketOrder: index + 1  // Ordre de mise sur le marché
              };
              grid[gridIndex] = content;
              sequence.push({ position: gridIndex, rule, content });
            }
          }
        });
      } else if (rule.type === 'random') {
        const availablePositions = grid
          .map((cell, index) => ({ cell, index }))
          .filter(({ cell }) => cell.type === 'empty')
          .map(({ index }) => index);
        
        const shuffled = [...availablePositions].sort(() => Math.random() - 0.5);
        const itemsToPlace = Math.min(maxItems, shuffled.length);
        
        for (let i = 0; i < itemsToPlace; i++) {
          const gridIndex = shuffled[i];
          const contentType = rule.contentTypes[0].toLowerCase();
          const mappedType = contentType === 'audio' ? 'audio' : contentType === 'music' ? 'audio' : contentType as 'nft' | 'info' | 'audio';
          const content: PreviewCell = {
            id: gridIndex,
            type: mappedType,
            color: getContentTypeColor(rule.contentTypes[0]),
            source: rule.name,
            rarity: 'common'
          };
          grid[gridIndex] = content;
          sequence.push({ position: gridIndex, rule, content });
        }
      } else if (rule.type === 'sequential') {
        const availablePositions = grid
          .map((cell, index) => ({ cell, index }))
          .filter(({ cell }) => cell.type === 'empty')
          .map(({ index }) => index)
          .slice(0, maxItems);
        
        availablePositions.forEach((gridIndex, i) => {
          const contentType = rule.contentTypes[0].toLowerCase();
          const mappedType = contentType === 'audio' ? 'audio' : contentType === 'music' ? 'audio' : contentType as 'nft' | 'info' | 'audio';
          const content: PreviewCell = {
            id: gridIndex,
            type: mappedType,
            color: getContentTypeColor(rule.contentTypes[0]),
            source: rule.name,
            rarity: 'common'
          };
          grid[gridIndex] = content;
          sequence.push({ position: gridIndex, rule, content });
        });
      }
    });

    setTestSequence(sequence);
    setMaxTestSteps(sequence.length);
    setTestStep(0);
    
    // Initialiser la grille de test vide
    const emptyGrid: PreviewCell[] = Array.from({ length: 144 }, (_, i) => ({
      id: i,
      type: 'empty' as const,
      color: '#F3F4F6',
      source: undefined,
      rarity: undefined
    }));
    setTestGrid(emptyGrid);
    setPreviewGrid(grid); // Grille complète pour référence
  };

  const generatePreview = () => {
    if (testMode) {
      generateTestSequence();
      return;
    }

    // Mode preview normal - Grille 12x12 (144 cellules)
    const grid: PreviewCell[] = Array.from({ length: 144 }, (_, i) => ({
      id: i,
      type: 'empty' as const,
      color: '#F3F4F6',
      source: undefined,
      rarity: undefined
    }));

    const enabledRules = deploymentRules
      .filter(rule => selectedDeploymentRules.includes(rule.id))
      .sort((a, b) => a.priority - b.priority);

    console.log('🎯 Nouvelle génération avec algorithme 2 phases:', enabledRules.map(r => `${r.name} (${r.type})`));

    // Séparer les règles par type de contenu
    const nftRules = enabledRules.filter(rule => rule.contentTypes.includes('NFT'));
    const infoRulesList = enabledRules.filter(rule => rule.contentTypes.includes('INFO'));
    const audioRulesList = enabledRules.filter(rule => rule.contentTypes.includes('AUDIO'));
    
    const activeGridPositions = new Set<number>(); // Grille Active (NFT)
    
    // PHASE 1: Placer les NFT (définit la Grille Active)
    console.log('🟢 PHASE 1: Placement des NFT (définition Grille Active)');

    nftRules.forEach(rule => {
      const maxItems = Math.min(rule.maxItems || 10, 15);
      
      if (rule.type === 'spiral' && rule.spiralConfig) {
        const previewCenter = convertToPreviewCoords(rule.spiralConfig.centerX, rule.spiralConfig.centerY);
        
        console.log(`🌀 Spirale ${rule.name}: centre (${previewCenter.x}, ${previewCenter.y})`);
        
        const positions = generateSpiralPositions(
          previewCenter.x,
          previewCenter.y,
          rule.spiralConfig.direction,
          rule.spiralConfig.startDirection,
          maxItems
        );
        
        positions.forEach((pos, index) => {
          if (index < maxItems && 
              pos.x >= 0 && pos.x < 12 && 
              pos.y >= 0 && pos.y < 12) {
            const gridIndex = pos.y * 12 + pos.x;
            
            if (gridIndex >= 0 && gridIndex < 144 && 
                grid[gridIndex] && 
                grid[gridIndex].type === 'empty') {
              
              grid[gridIndex] = {
                id: gridIndex,
                type: 'nft',
                color: getContentTypeColor('NFT'),
                source: rule.name,
                rarity: undefined,
                marketOrder: index + 1
              };
              activeGridPositions.add(gridIndex);
              console.log(`✅ NFT ${index + 1} placé en (${pos.x}, ${pos.y})`);
            }
          }
        });
      }
    });

    // PHASE 2: Intercaler les INFO dans la Grille Active
    console.log('🔵 PHASE 2: Intercalation des INFO dans la Grille Active');
    
    infoRulesList.forEach(rule => {
      const maxItems = Math.min(rule.maxItems || 4, 4);
      const spiralRule = nftRules.find(r => r.type === 'spiral' && r.spiralConfig);
      
      if (spiralRule && spiralRule.spiralConfig && activeGridPositions.size > 0) {
        const previewCenter = convertToPreviewCoords(spiralRule.spiralConfig.centerX, spiralRule.spiralConfig.centerY);
        
        // Convertir Set en Array pour sélection aléatoire
        const nftPositionsList = Array.from(activeGridPositions);
        const shuffledNftPositions = [...nftPositionsList].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < Math.min(maxItems, shuffledNftPositions.length); i++) {
          const targetPosition = shuffledNftPositions[i];
          
          // Calculer direction radiale depuis le centre
          const targetX = targetPosition % 12;
          const targetY = Math.floor(targetPosition / 12);
          
          const deltaX = targetX - previewCenter.x;
          const deltaY = targetY - previewCenter.y;
          
          // Normaliser la direction
          const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          if (length > 0) {
            const dirX = Math.round(deltaX / length);
            const dirY = Math.round(deltaY / length);
            
            // Position de poussée
            const pushX = targetX + dirX;
            const pushY = targetY + dirY;
            const pushPosition = pushY * 12 + pushX;
            
            // Vérifier que la position de poussée est valide et libre
            if (pushX >= 0 && pushX < 12 && pushY >= 0 && pushY < 12 &&
                pushPosition >= 0 && pushPosition < 144 &&
                grid[pushPosition].type === 'empty') {
              
              // Déplacer le NFT vers la position de poussée
              grid[pushPosition] = { ...grid[targetPosition] };
              activeGridPositions.add(pushPosition);
              
              // Placer l'INFO à la position originale
              grid[targetPosition] = {
                id: targetPosition,
                type: 'info',
                color: getContentTypeColor('INFO'),
                source: rule.name,
                rarity: undefined,
                marketOrder: i + 1
              };
              
              console.log(`📘 INFO ${i + 1} intercalé, NFT poussé de ${targetPosition} vers ${pushPosition}`);
            }
          }
        }
      }
    });

    // PHASE 3: Placer les AUDIO dans la Grille Inactive (distance max 3)
    console.log('🟡 PHASE 3: Placement des AUDIO dans la Grille Inactive');
    
    audioRulesList.forEach(rule => {
      const maxItems = Math.min(rule.maxItems || 5, 10);
      
      // Calculer les positions valides pour AUDIO
      const validAudioPositions: number[] = [];
      
      for (let i = 0; i < 144; i++) {
        if (grid[i].type === 'empty') {
          const x = i % 12;
          const y = Math.floor(i / 12);
          
          // Calculer distance minimale à la Grille Active
          let minDistance = Infinity;
          activeGridPositions.forEach(activePos => {
            const activeX = activePos % 12;
            const activeY = Math.floor(activePos / 12);
            const distance = Math.max(Math.abs(x - activeX), Math.abs(y - activeY));
            minDistance = Math.min(minDistance, distance);
          });
          
          // Position valide si distance entre 1 et 3
          if (minDistance >= 1 && minDistance <= 3) {
            validAudioPositions.push(i);
          }
        }
      }
      
      // Placement aléatoire des AUDIO
      const shuffledAudioPositions = [...validAudioPositions].sort(() => Math.random() - 0.5);
      const itemsToPlace = Math.min(maxItems, shuffledAudioPositions.length);
      
      for (let i = 0; i < itemsToPlace; i++) {
        const gridIndex = shuffledAudioPositions[i];
        grid[gridIndex] = {
          id: gridIndex,
          type: 'audio',
          color: getContentTypeColor('AUDIO'),
          source: rule.name,
          rarity: undefined,
          marketOrder: i + 1
        };
        console.log(`🎵 AUDIO ${i + 1} placé en position ${gridIndex}`);
      }
    });

    setPreviewGrid([...grid]);
  };

  // Grille 32x32 Native avec containers réels
  const generate32x32Preview = () => {
    const grid32: NativeGridCell[] = Array.from({ length: 1024 }, (_, i) => ({
      id: i,
      type: 'empty',
      position: { x: i % 32, y: Math.floor(i / 32) },
      containerId: null,
      containerData: null
    }));

    const enabledRules = deploymentRules
      .filter(rule => selectedDeploymentRules.includes(rule.id))
      .sort((a, b) => a.priority - b.priority);

    const nftRules = enabledRules.filter(rule => rule.contentTypes.includes('NFT'));
    const infoRulesList = enabledRules.filter(rule => rule.contentTypes.includes('INFO'));
    const audioRulesList = enabledRules.filter(rule => rule.contentTypes.includes('AUDIO'));
    
    const activeGridPositions = new Set<number>();

    // PHASE 1: Placer les NFT (définit la Grille Active)
    nftRules.forEach(rule => {
      const maxItems = Math.min(rule.maxItems || 10, 15);
      
      if (rule.type === 'spiral' && rule.spiralConfig) {
        const positions = generateSpiralPositions(
          rule.spiralConfig.centerX,
          rule.spiralConfig.centerY,
          rule.spiralConfig.direction,
          rule.spiralConfig.startDirection,
          maxItems
        );
        
        positions.forEach((pos, index) => {
          if (index < maxItems && 
              pos.x >= 0 && pos.x < 32 && 
              pos.y >= 0 && pos.y < 32) {
            const gridIndex = pos.y * 32 + pos.x;
            
            if (gridIndex >= 0 && gridIndex < 1024 && 
                grid32[gridIndex] && 
                grid32[gridIndex].type === 'empty') {
              
              grid32[gridIndex] = {
                id: gridIndex,
                type: 'nft',
                position: { x: pos.x, y: pos.y },
                containerId: `nft-${rule.id}-${index}`,
                containerData: {
                  title: `NFT ${index + 1}`,
                  source: rule.name,
                  marketOrder: index + 1
                }
              };
              activeGridPositions.add(gridIndex);
            }
          }
        });
      }
    });

    // PHASE 2: Intercaler les INFO
    infoRulesList.forEach(rule => {
      const maxItems = Math.min(rule.maxItems || 4, 4);
      const spiralRule = nftRules.find(r => r.type === 'spiral' && r.spiralConfig);
      
      if (spiralRule && spiralRule.spiralConfig && activeGridPositions.size > 0) {
        const nftPositionsList = Array.from(activeGridPositions);
        const shuffledNftPositions = [...nftPositionsList].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < Math.min(maxItems, shuffledNftPositions.length); i++) {
          const targetPosition = shuffledNftPositions[i];
          const targetX = targetPosition % 32;
          const targetY = Math.floor(targetPosition / 32);
          
          const deltaX = targetX - spiralRule.spiralConfig.centerX;
          const deltaY = targetY - spiralRule.spiralConfig.centerY;
          
          const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          if (length > 0) {
            const dirX = Math.round(deltaX / length);
            const dirY = Math.round(deltaY / length);
            
            const pushX = targetX + dirX;
            const pushY = targetY + dirY;
            const pushPosition = pushY * 32 + pushX;
            
            if (pushX >= 0 && pushX < 32 && pushY >= 0 && pushY < 32 &&
                pushPosition >= 0 && pushPosition < 1024 &&
                grid32[pushPosition].type === 'empty') {
              
              grid32[pushPosition] = { ...grid32[targetPosition] };
              activeGridPositions.add(pushPosition);
              
              grid32[targetPosition] = {
                id: targetPosition,
                type: 'info',
                position: { x: targetX, y: targetY },
                containerId: `info-${rule.id}-${i}`,
                containerData: {
                  title: `INFO ${i + 1}`,
                  source: rule.name,
                  marketOrder: i + 1
                }
              };
            }
          }
        }
      }
    });

    // PHASE 3: Placer les AUDIO dans la Grille Inactive
    audioRulesList.forEach(rule => {
      const maxItems = Math.min(rule.maxItems || 5, 10);
      const validAudioPositions: number[] = [];
      
      for (let i = 0; i < 1024; i++) {
        if (grid32[i].type === 'empty') {
          const x = i % 32;
          const y = Math.floor(i / 32);
          
          let minDistance = Infinity;
          activeGridPositions.forEach(activePos => {
            const activeX = activePos % 32;
            const activeY = Math.floor(activePos / 32);
            const distance = Math.max(Math.abs(x - activeX), Math.abs(y - activeY));
            minDistance = Math.min(minDistance, distance);
          });
          
          if (minDistance >= 1 && minDistance <= 3) {
            validAudioPositions.push(i);
          }
        }
      }
      
      const shuffledAudioPositions = [...validAudioPositions].sort(() => Math.random() - 0.5);
      const itemsToPlace = Math.min(maxItems, shuffledAudioPositions.length);
      
      for (let i = 0; i < itemsToPlace; i++) {
        const gridIndex = shuffledAudioPositions[i];
        const x = gridIndex % 32;
        const y = Math.floor(gridIndex / 32);
        
        grid32[gridIndex] = {
          id: gridIndex,
          type: 'audio',
          position: { x, y },
          containerId: `audio-${rule.id}-${i}`,
          containerData: {
            title: `AUDIO ${i + 1}`,
            source: rule.name,
            marketOrder: i + 1
          }
        };
      }
    });

    setNativeGrid32(grid32);
  };

  const toggleRuleSelection = (ruleId: string) => {
    setSelectedDeploymentRules(prev => 
      prev.includes(ruleId) 
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  // Auto-rafraîchissement quand les sélections changent
  useEffect(() => {
    generatePreview();
  }, [selectedDeploymentRules]);

  const addNewRule = () => {
    const newRule: DeploymentRule = {
      id: `rule-${Date.now()}`,
      name: 'Nouvelle Règle',
      type: 'spiral',
      contentTypes: ['NFT'],
      priority: deploymentRules.length + 1,
      enabled: true,
      description: 'Description de la nouvelle règle',
      maxItems: 10,
      spiralConfig: {
        centerX: 16,
        centerY: 16,
        direction: 'clockwise',
        startDirection: 'right',
        skipOccupied: true
      }
    };
    setDeploymentRules([...deploymentRules, newRule]);
    setSelectedRule(newRule);
  };

  const updateRule = (ruleId: string, updates: Partial<DeploymentRule>) => {
    setDeploymentRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, ...updates, modified: true }
          : rule
      )
    );
    if (selectedRule?.id === ruleId) {
      setSelectedRule(prev => prev ? { ...prev, ...updates, modified: true } : null);
    }
  };

  const [showGeneratedCode, setShowGeneratedCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const generateRuleCode = (rule: DeploymentRule): string => {
    const lines: string[] = [];
    lines.push(`// Règle: ${rule.name}`);
    lines.push(`const ${rule.id.replace(/[^a-zA-Z0-9]/g, '')}Config = {`);
    lines.push(`  id: '${rule.id}',`);
    lines.push(`  name: '${rule.name}',`);
    lines.push(`  type: '${rule.type}',`);
    lines.push(`  priority: ${rule.priority},`);
    lines.push(`  enabled: ${rule.enabled},`);
    
    if (rule.contentTypes && rule.contentTypes.length > 0) {
      lines.push(`  contentTypes: [${rule.contentTypes.map(t => `'${t}'`).join(', ')}],`);
    }
    
    if (rule.maxItems) {
      lines.push(`  maxItems: ${rule.maxItems},`);
    }
    
    if (rule.spiralConfig) {
      lines.push(`  spiralConfig: {`);
      lines.push(`    centerX: ${rule.spiralConfig.centerX},`);
      lines.push(`    centerY: ${rule.spiralConfig.centerY},`);
      lines.push(`    direction: '${rule.spiralConfig.direction}',`);
      lines.push(`    startDirection: '${rule.spiralConfig.startDirection}'`);
      lines.push(`  },`);
    }
    
    if (rule.zoneConfig) {
      lines.push(`  zoneConfig: {`);
      lines.push(`    x: ${rule.zoneConfig.x}, y: ${rule.zoneConfig.y},`);
      lines.push(`    width: ${rule.zoneConfig.width}, height: ${rule.zoneConfig.height},`);
      lines.push(`    fillPattern: '${rule.zoneConfig.fillPattern}'`);
      lines.push(`  },`);
    }
    
    lines.push(`  description: '${rule.description}'`);
    lines.push('};');
    
    return lines.join('\n');
  };

  // Initialisation avec les règles sélectionnées par défaut
  useEffect(() => {
    setSelectedDeploymentRules(['SpiralGrid_Castings', 'Container_Info', 'Container_Audio']);
    console.log('🔧 Initialisation règles sélectionnées par défaut');
  }, []);

  // Mise à jour automatique de la prévisualisation
  useEffect(() => {
    generatePreview();
  }, [selectedDeploymentRules, deploymentRules, testMode]);

  // Mise à jour de la grille de test quand testStep change
  useEffect(() => {
    if (testMode) {
      updateTestGrid(testStep);
    }
  }, [testStep, testMode]);

  // Appliquer les curseurs personnalisés tout en préservant le scroll
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      console.log('🎯 ADMIN: Ajout classe admin-with-cursors');
      root.classList.add('admin-with-cursors');
    }
    return () => {
      if (root) {
        console.log('🎯 ADMIN: Suppression classe admin-with-cursors');
        root.classList.remove('admin-with-cursors');
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="flex items-center text-blue-600 hover:text-blue-700 mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'administration
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Distribution & Déploiement Unifié</h1>
            <p className="text-gray-600">Interface unifiée pour la configuration des règles de distribution</p>
          </div>
          
          <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            <Save className="w-4 h-4" />
            <span>Sauvegarder</span>
          </button>
        </div>

        {/* Zone principale réorganisée */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {/* Colonne 1/4 : QUI + OÙ */}
          <div className="space-y-4">
            {/* QUI - Pages avec menu déroulant */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center text-blue-700">
                <span className="bg-blue-100 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2">1</span>
                QUI - Pages
              </h3>
              <select 
                value={selectedPage} 
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                {availablePages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name} - {page.description}
                  </option>
                ))}
              </select>
            </div>

            {/* OÙ - Grilles */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center text-yellow-700">
                <span className="bg-yellow-100 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2">2</span>
                OÙ - Grilles
              </h3>
              <div className="space-y-2">
                {gridModels.map((grid) => (
                  <label key={grid.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={selectedGridModel === grid.id}
                      onChange={() => setSelectedGridModel(grid.id)}
                      className="text-yellow-600"
                    />
                    <div className="text-sm">
                      <div className="font-medium">{grid.name}</div>
                      <div className="text-xs text-gray-500">{grid.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Colonnes 2/4 + 3/4 : Grille 12x12 */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Prévisualisation de la grille</h2>
            </div>
            
            <div className="flex justify-center mb-4">
              {/* Grille 12x12 carrée */}
              <div className="grid grid-cols-12 gap-1 p-4 bg-gray-100 rounded-lg w-96 h-96">
                {(testMode ? testGrid : previewGrid).map((cell, index) => {
                  return (
                    <div
                      key={cell.id}
                      className="aspect-square rounded border border-white flex items-center justify-center text-xs font-bold transition-all duration-200"
                      style={{ 
                        backgroundColor: cell.color
                      }}
                      title={cell.source ? `${cell.source} (${cell.rarity})` : 'Vide'}
                    >
                      {cell.type === 'nft' && (
                        <span className="text-white text-[8px] font-bold">{cell.marketOrder || '?'}</span>
                      )}
                      {cell.type === 'info' && (
                        <span className="text-white text-[6px] font-bold">i</span>
                      )}
                      {cell.type === 'audio' && (
                        <span className="text-white text-[6px] font-bold">♪</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Légendes sur une ligne */}
            <div className="flex justify-center items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-purple-400" />
                <span className="text-gray-600">NFT</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-blue-400" />
                <span className="text-gray-600">INFO</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-green-400" />
                <span className="text-gray-600">AUDIO</span>
              </div>
            </div>
          </div>

          {/* Colonne 4/4 : Stats + Player + Bouton Sauvegarder */}
          <div className="bg-white rounded-lg shadow-sm border p-4 flex flex-col">
            <h3 className="text-sm font-semibold mb-3">Statistiques</h3>
            
            {/* Player animation */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-gray-700 mb-2">Animation</div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <button
                  onClick={() => {
                    if (!testMode) setTestMode(true);
                    playTestSequence();
                  }}
                  disabled={isPlaying}
                  className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  title="Lancer l'animation"
                >
                  <Play className="w-4 h-4" />
                </button>
                
                <button
                  onClick={stopTestSequence}
                  className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded hover:bg-red-600"
                  title="Arrêter l'animation"
                >
                  <Square className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => {
                    resetTestSequence();
                    setTestMode(false);
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-gray-500 text-white rounded hover:bg-gray-600"
                  title="Reset et retour à la vue normale"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              
              {testMode && (
                <div className="text-center text-sm text-gray-600">
                  {testStep + 1} / {maxTestSteps}
                </div>
              )}
            </div>
            
            {/* Stats */}
            <div className="space-y-2 text-sm flex-1">
              {(() => {
                const nftCount = previewGrid.filter(c => c.type === 'nft').length;
                const infoCount = previewGrid.filter(c => c.type === 'info').length;
                const audioCount = previewGrid.filter(c => c.type === 'audio').length;
                const totalContent = nftCount + infoCount + audioCount;
                
                return (
                  <>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded bg-purple-400" />
                        <span className="text-gray-600">NFT:</span>
                      </div>
                      <span className="font-medium">{nftCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded bg-blue-400" />
                        <span className="text-gray-600">INFO:</span>
                      </div>
                      <span className="font-medium">{infoCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded bg-green-400" />
                        <span className="text-gray-600">AUDIO:</span>
                      </div>
                      <span className="font-medium">{audioCount}</span>
                    </div>
                    <div className="pt-2 border-t border-blue-200">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total placé:</span>
                        <span className="font-bold text-blue-700">{totalContent}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            
            {/* Bouton Sauvegarder en bas */}
            <button 
              onClick={() => console.log('Sauvegarde...')}
              className="mt-4 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Sauvegarder</span>
            </button>
          </div>
        </div>

        {/* Zone du bas réorganisée */}
        <div className="grid grid-cols-4 gap-6">
          {/* Colonne 1/4 : 3•COMMENT - Règles de déploiement */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center text-green-700">
              <span className="bg-green-100 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2">3</span>
              COMMENT - Règles
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-blue-800 font-medium">
                📋 L'ordre d'affichage ci-dessous détermine la priorité d'exécution des règles
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Utilisez les flèches ▲▼ pour réorganiser l'ordre d'application
              </p>
            </div>
            <div className="space-y-3">
              {deploymentRules
                .sort((a, b) => a.priority - b.priority) // Trier par priorité
                .map((rule) => (
                <div 
                  key={rule.id} 
                  onClick={() => setSelectedRule(rule)}
                  className={`border rounded p-3 cursor-pointer transition-all duration-200 ${
                    selectedRule?.id === rule.id 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDeploymentRules.includes(rule.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (e.target.checked) {
                            setSelectedDeploymentRules([...selectedDeploymentRules, rule.id]);
                          } else {
                            setSelectedDeploymentRules(selectedDeploymentRules.filter(id => id !== rule.id));
                          }
                        }}
                        className="text-green-600"
                      />
                      <span className="text-sm font-medium">{rule.name}</span>
                    </label>
                    <div className="flex items-center space-x-1">
                      <div className="flex flex-col">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveRuleUp(rule.id);
                          }}
                          disabled={rule.priority === 1}
                          className={`w-4 h-4 flex items-center justify-center text-xs ${
                            rule.priority === 1 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded'
                          }`}
                          title="Monter la priorité"
                        >
                          ▲
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveRuleDown(rule.id);
                          }}
                          disabled={rule.priority === Math.max(...deploymentRules.map(r => r.priority))}
                          className={`w-4 h-4 flex items-center justify-center text-xs ${
                            rule.priority === Math.max(...deploymentRules.map(r => r.priority))
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded'
                          }`}
                          title="Descendre la priorité"
                        >
                          ▼
                        </button>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{rule.description}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Priorité: {rule.priority} | Type: {rule.type}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Colonnes 2/4 + 3/4 : Admin de la règle */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
              <span>Administration de la règle</span>
              {selectedRule && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => selectedRule && updateRule(selectedRule.id, { enabled: !selectedRule.enabled })}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm ${
                      selectedRule.enabled 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {selectedRule.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{selectedRule.enabled ? 'Activé' : 'Désactivé'}</span>
                  </button>
                </div>
              )}
            </h3>

            {selectedRule ? (
              <div className="space-y-6">
                {/* Configuration de base */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={selectedRule.name}
                      onChange={(e) => updateRule(selectedRule.id, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordre de priorité</label>
                    <div className="flex items-center justify-center h-10 bg-gray-50 border border-gray-300 rounded-lg">
                      <span className="text-lg font-semibold text-gray-700">{selectedRule.priority}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Modifiez l'ordre avec les flèches dans la colonne 3•COMMENT</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={selectedRule.description}
                    onChange={(e) => updateRule(selectedRule.id, { description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de déploiement</label>
                    <select
                      value={selectedRule.type}
                      onChange={(e) => updateRule(selectedRule.id, { type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="spiral">Spirale</option>
                      <option value="random">Aléatoire</option>
                      <option value="zone">Zone</option>
                      <option value="sequential">Séquentiel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre max d'éléments</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={selectedRule.maxItems || 10}
                        onChange={(e) => updateRule(selectedRule.id, { maxItems: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Fill the grid (max 1003 NFT)"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-xs text-gray-400">Fill the grid (max 1003 NFT)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuration spirale */}
                {selectedRule.type === 'spiral' && selectedRule.spiralConfig && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-3">Configuration Spirale</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Centre X</label>
                        <input
                          type="number"
                          value={selectedRule.spiralConfig.centerX}
                          onChange={(e) => updateRule(selectedRule.id, { 
                            spiralConfig: { ...selectedRule.spiralConfig!, centerX: parseInt(e.target.value) }
                          })}
                          placeholder="16"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Centre Y</label>
                        <input
                          type="number"
                          value={selectedRule.spiralConfig.centerY}
                          onChange={(e) => updateRule(selectedRule.id, { 
                            spiralConfig: { ...selectedRule.spiralConfig!, centerY: parseInt(e.target.value) }
                          })}
                          placeholder="16"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                        <select
                          value={selectedRule.spiralConfig.direction}
                          onChange={(e) => updateRule(selectedRule.id, { 
                            spiralConfig: { ...selectedRule.spiralConfig!, direction: e.target.value as any }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="clockwise">Horaire</option>
                          <option value="counterclockwise">Anti-horaire</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Départ</label>
                        <select
                          value={selectedRule.spiralConfig.startDirection}
                          onChange={(e) => updateRule(selectedRule.id, { 
                            spiralConfig: { ...selectedRule.spiralConfig!, startDirection: e.target.value as any }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="right">Droite</option>
                          <option value="down">Bas</option>
                          <option value="left">Gauche</option>
                          <option value="up">Haut</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sélection du type de contenu (exclusif) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Type de contenu
                    <span className="text-xs text-gray-500 block mt-1">Une seule sélection par règle</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['NFT', 'AUDIO', 'INFO', 'VIDEO'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          updateRule(selectedRule.id, { contentTypes: [type] });
                          // Cocher automatiquement TOUS les types détaillés par défaut
                          if (type === 'NFT') {
                            const allCollections = ['Castings de Chimères', 'Chimères', 'Os.moz', 'Thugshots', 'Régénération'];
                            const allFamilies = ['Libres', 'Achetés', 'Revente'];
                            
                            setSelectedSubCategories(prev => ({
                              ...prev,
                              [selectedRule.id]: {
                                Collections: allCollections,
                                Famille: allFamilies
                              }
                            }));
                          } else if (type === 'AUDIO') {
                            setSelectedSubCategories(prev => ({
                              ...prev,
                              [selectedRule.id]: {
                                Types: ['Music', 'Podcast']
                              }
                            }));
                          } else if (type === 'INFO') {
                            setSelectedSubCategories(prev => ({
                              ...prev,
                              [selectedRule.id]: {
                                Types: ['Liens', 'Agenda']
                              }
                            }));
                          } else if (type === 'VIDEO') {
                            setSelectedSubCategories(prev => ({
                              ...prev,
                              [selectedRule.id]: {
                                Types: []
                              }
                            }));
                          }
                        }}
                        className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center space-x-2 ${
                          selectedRule.contentTypes[0] === type
                            ? 'border-blue-500 shadow-lg transform scale-105'
                            : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                        }`}
                        style={{
                          backgroundColor: selectedRule.contentTypes[0] === type 
                            ? getContentTypeColor(type) + '20'
                            : 'white',
                          borderColor: selectedRule.contentTypes[0] === type 
                            ? getContentTypeColor(type)
                            : undefined
                        }}
                      >
                        <div 
                          className="w-3 h-3 rounded" 
                          style={{ backgroundColor: getContentTypeColor(type) }}
                        />
                        <span className={`text-sm font-medium ${
                          selectedRule.contentTypes[0] === type ? 'text-gray-800' : 'text-gray-600'
                        }`}>
                          {type}
                        </span>
                      </button>
                    ))}
                    <button
                      disabled
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed flex items-center justify-center"
                      title="Fonctionnalité à venir"
                    >
                      <span className="text-lg">+</span>
                    </button>
                  </div>
                </div>

                {/* Types détaillés pour NFT */}
                {selectedRule.contentTypes[0] === 'NFT' && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Types détaillés pour NFT</h4>
                    
                    {/* Collections */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Collections</label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSubCategorySelected(selectedRule.id, 'Collections', 'Castings de Chimères')}
                            onChange={() => toggleSubCategory(selectedRule.id, 'Collections', 'Castings de Chimères')}
                            className="text-blue-600"
                          />
                          <span className="text-sm">Castings de Chimères</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSubCategorySelected(selectedRule.id, 'Collections', 'Chimères')}
                            onChange={() => toggleSubCategory(selectedRule.id, 'Collections', 'Chimères')}
                            className="text-blue-600"
                          />
                          <span className="text-sm">Chimères</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSubCategorySelected(selectedRule.id, 'Collections', 'Os.moz')}
                            onChange={() => toggleSubCategory(selectedRule.id, 'Collections', 'Os.moz')}
                            className="text-blue-600"
                          />
                          <span className="text-sm">Os.moz</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSubCategorySelected(selectedRule.id, 'Collections', 'Thugshots')}
                            onChange={() => toggleSubCategory(selectedRule.id, 'Collections', 'Thugshots')}
                            className="text-blue-600"
                          />
                          <span className="text-sm">Thugshots</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSubCategorySelected(selectedRule.id, 'Collections', 'Régénération')}
                            onChange={() => toggleSubCategory(selectedRule.id, 'Collections', 'Régénération')}
                            className="text-blue-600"
                          />
                          <span className="text-sm">Régénération</span>
                        </label>
                        <div className="text-sm text-gray-400 italic">Autres...</div>
                      </div>
                    </div>

                    {/* Famille (statut commercial) */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Famille (statut commercial)
                        <span className="text-xs text-gray-500 block">Géré par méta-données NFT</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleSubCategory(selectedRule.id, 'Famille', 'Libres')}
                          className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                            isSubCategorySelected(selectedRule.id, 'Famille', 'Libres')
                              ? 'bg-green-200 text-green-800 border-2 border-green-400'
                              : 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-150'
                          }`}
                        >
                          <div className="font-medium">Libres</div>
                          <div className="text-xs">Jamais achetés</div>
                        </button>
                        <button
                          onClick={() => toggleSubCategory(selectedRule.id, 'Famille', 'Achetés')}
                          className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                            isSubCategorySelected(selectedRule.id, 'Famille', 'Achetés')
                              ? 'bg-blue-200 text-blue-800 border-2 border-blue-400'
                              : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-150'
                          }`}
                        >
                          <div className="font-medium">Achetés</div>
                          <div className="text-xs">Déjà vendus</div>
                        </button>
                        <button
                          onClick={() => toggleSubCategory(selectedRule.id, 'Famille', 'Revente')}
                          className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                            isSubCategorySelected(selectedRule.id, 'Famille', 'Revente')
                              ? 'bg-purple-200 text-purple-800 border-2 border-purple-400'
                              : 'bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-150'
                          }`}
                        >
                          <div className="font-medium">Revente</div>
                          <div className="text-xs">Marché secondaire</div>
                        </button>
                      </div>
                    </div>

                    {/* Autres tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Autres tags</label>
                      <input
                        type="text"
                        placeholder="Section à renseigner plus tard selon les besoins"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm italic"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Sélectionnez une règle pour la configurer</p>
              </div>
            )}
          </div>

          {/* Colonne 4/4 : Code HTML généré */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-sm font-semibold mb-3">Code généré</h3>
            {selectedRule ? (
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Règle: {selectedRule.name}</h4>
                  <div className="text-xs text-blue-600">
                    Type: {selectedRule.type} | Priorité: {selectedRule.priority}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Code JavaScript</span>
                  <button
                    onClick={() => {
                      const code = generateRuleCode(selectedRule);
                      navigator.clipboard.writeText(code);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    title="Copier le code"
                  >
                    <span>📋</span>
                    <span>Copier</span>
                  </button>
                </div>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-96 border font-mono">
                  <code>{generateRuleCode(selectedRule)}</code>
                </pre>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Code className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-xs">Sélectionnez une règle pour voir son code</p>
              </div>
            )}
          </div>
        </div>

        {/* Section code généré (utilisée avec showGeneratedCode) */}
        {showGeneratedCode && (
          <div id="generated-code-section" className="mt-6 bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Code de règle généré</h3>
              <button
                onClick={() => setShowGeneratedCode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              <code>{generatedCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
