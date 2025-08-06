import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Save, ChevronDown, Eye, EyeOff, Code, Grid, Target, Plus, RefreshCw, Users, Layout, Info, BarChart3 } from 'lucide-react';

import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { generateSpiralPositions } from '../../utils/spiralAlgorithm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { TAG_CONFIGS, generateTagStyle } from '@shared/tags-system';
import { GlobalStyle, TagConfiguration } from '@shared/schema';

interface DeploymentRule {
  id: string;
  name: string;
  type: 'spiral' | 'random-active' | 'random-inactive';
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
  randomActiveConfig?: {
    randomType: 'uniform' | 'weighted' | 'clustered' | 'maximal-dispersion';
    minDistanceFromBorder: number;
    maxDistanceFromBorder: number;
    replacementRatio: number;
    minSpacing: number;
    preferredZone: 'center' | 'all' | 'ring';
  };
  randomInactiveConfig?: {
    minDistanceFromActive: number;
    maxDistanceFromActive: number;
    dispersion: 'low' | 'medium' | 'high';
    avoidanceZones: 'none' | 'corners' | 'borders';
    placementPriority: 'proximity' | 'distance' | 'balanced';
  };
}

interface NativeGridCell {
  id: number;
  type: 'empty' | 'nft' | 'info' | 'audio' | 'video';
  position: { x: number; y: number };
  containerId: string | null;
  containerData: {
    title: string;
    source: string;
    marketOrder: number;
    realContainer?: any;
  } | null;
}

// Fonction pour obtenir les règles par défaut
const getInitialRules = (): DeploymentRule[] => [
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
    type: 'random-active',
    contentTypes: ['INFO'],
    priority: 2,
    enabled: true,
    description: 'Remplacement NFT avec push suivant la logique spiralée',
    maxItems: 10,
    randomActiveConfig: {
      randomType: 'uniform',
      minDistanceFromBorder: 0,
      maxDistanceFromBorder: 32,
      replacementRatio: 1,
      minSpacing: 1,
      preferredZone: 'all'
    }
  },
  {
    id: 'Container_Video',
    name: 'Container VIDEO',
    type: 'random-active',
    contentTypes: ['VIDEO'],
    priority: 3,
    enabled: true,
    description: 'Remplacement NFT avec push suivant la logique spiralée',
    maxItems: 5,
    randomActiveConfig: {
      randomType: 'uniform',
      minDistanceFromBorder: 0,
      maxDistanceFromBorder: 32,
      replacementRatio: 1,
      minSpacing: 1,
      preferredZone: 'all'
    }
  },
  {
    id: 'Container_Audio',
    name: 'Container AUDIO',
    type: 'random-inactive',
    contentTypes: ['AUDIO'],
    priority: 4,
    enabled: true,
    description: 'Distribution aléatoire dans les zones inactives (hors grille active)',
    maxItems: 10,
    randomInactiveConfig: {
      minDistanceFromActive: 2,
      maxDistanceFromActive: 10,
      dispersion: 'medium',
      avoidanceZones: 'corners',
      placementPriority: 'proximity'
    }
  }
];

export function GridMapDistributionV3() {
  const queryClient = useQueryClient();

  // États principaux
  const [selectedPage, setSelectedPage] = useState('market-castings');
  const [selectedGridModel, setSelectedGridModel] = useState('grid-32x32-128pix');
  const [selectedRule, setSelectedRule] = useState<DeploymentRule | null>(null);
  const [selectedDeploymentRules, setSelectedDeploymentRules] = useState<string[]>(['SpiralGrid_Castings', 'Container_Info', 'Container_Video', 'Container_Audio']);
  const [nativeGrid32, setNativeGrid32] = useState<NativeGridCell[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSubCategories, setSelectedSubCategories] = useState<{[ruleId: string]: {[category: string]: string[]}}>({});
  const [autoCollectionMode, setAutoCollectionMode] = useState<{[ruleId: string]: boolean}>({});
  const [autoAudioMode, setAutoAudioMode] = useState<{[ruleId: string]: boolean}>({});
  const [deploymentRules, setDeploymentRules] = useState<DeploymentRule[]>(getInitialRules());

  // Récupération des configurations de tags sauvegardées
  const tagConfigsQuery = useQuery({
    queryKey: ['/api/tag-configurations'],
    staleTime: 5000,
    refetchInterval: 10000
  });

  // Récupération du style de tag unifié (8px)
  const stylesQuery = useQuery({
    queryKey: ['/api/styles-global'],
    staleTime: 30000
  });

  const tagStyle8px = React.useMemo(() => {
    if (!stylesQuery.data || !Array.isArray(stylesQuery.data)) return null;
    return (stylesQuery.data as GlobalStyle[]).find((s: GlobalStyle) => 
      s.category === 'typography' && 
      s.name === 'Tag Font Size Small' &&
      s.isActive
    );
  }, [stylesQuery.data]);

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

  // Fonction de rendu des tags unifié (utilise les configurations sauvegardées)
  const renderUnifiedTag = (tagId: string, displayText?: string) => {
    const tagConfig = mergedTagConfigs[tagId];
    if (!tagConfig) return null;

    const tagStyles = {
      ...generateTagStyle(tagId),
      backgroundColor: tagConfig.color
    };

    return (
      <span 
        className="inline-block text-white font-mono font-medium uppercase tracking-wide"
        style={tagStyles}
      >
        {displayText || tagConfig.name}
      </span>
    );
  };
  
  // États pour l'animation des étapes
  const [currentAnimationStep, setCurrentAnimationStep] = useState<string>('');
  const [showStepIndicator, setShowStepIndicator] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Mode debug avec raccourci 'd'
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        setDebugMode(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Charger la configuration depuis la base de données
  const { data: configData, isLoading: isLoadingConfig } = useQuery({
    queryKey: [`/api/grid-v3-config/${selectedPage}`],
    enabled: !!selectedPage,
  });

  // Mutation pour sauvegarder la configuration
  const saveConfigMutation = useMutation({
    mutationFn: async (configData: any) => {
      const response = await fetch('/api/grid-v3-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      console.log('✅ Configuration sauvegardée pour la page:', selectedPage);
      queryClient.invalidateQueries({ queryKey: [`/api/grid-v3-config/${selectedPage}`] });
    },
    onError: (error) => {
      console.error('❌ Erreur lors de la sauvegarde:', error);
    }
  });

  // Fonction pour sauvegarder la configuration
  const saveConfiguration = () => {
    console.log('🔄 Bouton Enregistrer cliqué');
    console.log('🔄 Page sélectionnée:', selectedPage);
    console.log('🔄 Modèle de grille:', selectedGridModel);
    console.log('🔄 Règles de déploiement:', deploymentRules);
    
    const config = {
      pageName: selectedPage,
      gridModel: selectedGridModel,
      deploymentRules,
      selectedDeploymentRules,
      selectedSubCategories,
      autoCollectionMode,
      autoAudioMode
    };
    
    console.log('🔄 Configuration à sauvegarder:', config);
    saveConfigMutation.mutate(config);
  };

  // Charger la configuration quand les données arrivent
  useEffect(() => {
    if (configData && !isLoadingConfig && typeof configData === 'object') {
      setSelectedGridModel((configData as any).gridModel || 'grid-32x32-128pix');
      setDeploymentRules((configData as any).deploymentRules || getInitialRules());
      setSelectedDeploymentRules((configData as any).selectedDeploymentRules || ['SpiralGrid_Castings', 'Container_Info', 'Container_Video', 'Container_Audio']);
      setSelectedSubCategories((configData as any).selectedSubCategories || {});
      setAutoCollectionMode((configData as any).autoCollectionMode || {});
      setAutoAudioMode((configData as any).autoAudioMode || {});
      console.log('✅ Configuration chargée pour la page:', selectedPage);
    }
  }, [configData, isLoadingConfig]);

  // Recharger la configuration quand la page change
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: [`/api/grid-v3-config/${selectedPage}`] });
  }, [selectedPage, queryClient]);

  // Données de base
  const availablePages = [
    { id: 'market-castings', name: 'Accueil Market Castings', description: 'Page principale NFT' },
    { id: 'thugshots', name: 'Accueil Thugshots', description: 'Collection Thugshots' },
    { id: 'osmoz', name: 'Accueil Os.moz', description: 'Collection Os.moz' },
    { id: 'regeneration', name: 'Accueil Régénération', description: 'Projet Régénération' }
  ];

  const gridModels = [
    { id: 'grid-32x32-128pix', name: 'Grille 32x32 128pix', rows: 32, cols: 32, description: '32x32 cellules de 128px' },
    { id: 'grid-16x16-128pix', name: 'Grille 16x16 128pix', rows: 16, cols: 16, description: '16x16 cellules de 128px' },
    { id: 'grid-16x16-256pix', name: 'Grille 16x16 256pix', rows: 16, cols: 16, description: '16x16 cellules de 256px' }
  ];

  // Fonctions utilitaires
  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'NFT': return '#10B981'; // Vert pour NFT (avec numéros)
      case 'INFO': return '#000000'; // Noir pour INFO
      case 'AUDIO': return '#EC4899'; // Rose pour AUDIO
      case 'VIDEO': return '#3B82F6'; // Bleu RVB pour VIDEO
      default: return '#F3F4F6';
    }
  };

  // Fonction pour obtenir le symbole du type de contenu
  const getContentTypeSymbol = (type: string) => {
    switch (type) {
      case 'NFT': return ''; // Pas de symbole, juste le numéro
      case 'INFO': return 'i'; // i italique
      case 'AUDIO': return '♪'; // Note musicale
      case 'VIDEO': return '▶'; // Flèche play
      default: return '';
    }
  };

  // Fonctions pour gérer les sous-catégories
  const initializeSubCategories = (ruleId: string, contentType: string) => {
    const defaultSelections = {
      NFT: {
        collections: ['Castings de Chimères', 'Chimères', 'Os.moz', 'Thugshots', 'Régénération'],
        tags: []
      },
      AUDIO: {
        types: ['Music', 'Podcast'],
        tags: []
      },
      INFO: {},
      VIDEO: {}
    };

    setSelectedSubCategories(prev => ({
      ...prev,
      [ruleId]: defaultSelections[contentType as keyof typeof defaultSelections] || {}
    }));

    // Mode auto par défaut pour NFT et AUDIO
    if (contentType === 'NFT') {
      setAutoCollectionMode(prev => ({
        ...prev,
        [ruleId]: true
      }));
    } else if (contentType === 'AUDIO') {
      setAutoAudioMode(prev => ({
        ...prev,
        [ruleId]: true
      }));
    }
  };

  const toggleSubCategory = (ruleId: string, category: string, item: string) => {
    // Si on décoche une collection NFT en mode auto, basculer en mode manuel
    if (category === 'collections' && autoCollectionMode[ruleId]) {
      setAutoCollectionMode(prev => ({
        ...prev,
        [ruleId]: false
      }));
    }
    
    // Si on décoche un type AUDIO en mode auto, basculer en mode manuel
    if (category === 'types' && autoAudioMode[ruleId]) {
      setAutoAudioMode(prev => ({
        ...prev,
        [ruleId]: false
      }));
    }

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

  // Calcul automatique du centre depuis la grille sélectionnée
  const getAutoCenter = () => {
    const currentGrid = gridModels.find(g => g.id === selectedGridModel);
    if (!currentGrid) return { x: 16, y: 16 };
    
    return {
      x: Math.floor(currentGrid.cols / 2),
      y: Math.floor(currentGrid.rows / 2)
    };
  };

  const moveRuleUp = (ruleId: string) => {
    setDeploymentRules(prev => {
      const rules = [...prev];
      const index = rules.findIndex(r => r.id === ruleId);
      if (index > 0) {
        const currentRule = rules[index];
        const previousRule = rules[index - 1];
        
        // Échanger les positions
        [rules[index - 1], rules[index]] = [rules[index], rules[index - 1]];
        // Recalculer toutes les priorités pour éviter les conflits
        rules.forEach((rule, i) => {
          rule.priority = i + 1;
        });
        
        // Plus de régénération automatique - l'utilisateur régénère manuellement
      }
      return rules;
    });
  };

  const moveRuleDown = (ruleId: string) => {
    setDeploymentRules(prev => {
      const rules = [...prev];
      const index = rules.findIndex(r => r.id === ruleId);
      if (index < rules.length - 1) {
        const currentRule = rules[index];
        const nextRule = rules[index + 1];
        
        // Échanger les positions
        [rules[index], rules[index + 1]] = [rules[index + 1], rules[index]];
        // Recalculer toutes les priorités pour éviter les conflits
        rules.forEach((rule, i) => {
          rule.priority = i + 1;
        });
        
        // Plus de régénération automatique - l'utilisateur régénère manuellement
      }
      return rules;
    });
  };

  const updateRule = (ruleId: string, updates: Partial<DeploymentRule>) => {
    setDeploymentRules(prev => {
      const newRules = prev.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      );
      
      // Mettre à jour aussi selectedRule si c'est la règle en cours d'édition
      if (selectedRule && selectedRule.id === ruleId) {
        setSelectedRule({ ...selectedRule, ...updates });
      }
      
      return newRules;
    });
    // Plus de régénération automatique sur updateRule - seulement manuel
  };

  const toggleRuleSelection = (ruleId: string) => {
    setSelectedDeploymentRules(prev => {
      const newSelection = prev.includes(ruleId) 
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId];
      
      // Plus de régénération automatique - seulement manuel
      return newSelection;
    });
  };

  // Variables pour l'algorithme 3 passes (toutes actives par défaut)
  const activePasses = [1, 2, 3];

  // Algorithme de distribution 3 passes avec animation
  const generate32x32Preview = async () => {
    const refreshNumber = Date.now();
    console.log(`🔄 DÉBUT GÉNÉRATION - Refresh #${refreshNumber}`);
    console.log('🔧 RÈGLES SÉLECTIONNÉES:', selectedDeploymentRules);
    console.log('🔧 RÈGLES DISPONIBLES:', deploymentRules.map(r => ({ 
      id: r.id, 
      name: r.name, 
      type: r.type, 
      maxItems: r.maxItems,
      enabled: selectedDeploymentRules.includes(r.id),
      spiralConfig: r.spiralConfig
    })));
    
    setIsGenerating(true);
    setShowStepIndicator(true);
    
    // ÉTAPE 1: Grille vide
    setCurrentAnimationStep('Étape 1: Grille vide');
    const grid32: NativeGridCell[] = [];
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const uniqueId = y * 32 + x;
        grid32.push({
          id: uniqueId,
          type: 'empty',
          position: { x, y },
          containerId: null,
          containerData: null
        });
      }
    }
    console.log('✅ GRILLE INITIALISÉE - 1024 cellules vides');
    setNativeGrid32([...grid32]);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Si aucune passe active, s'arrêter ici
    if (activePasses.length === 0) {
      setIsGenerating(false);
      setShowStepIndicator(false);
      return;
    }

    const enabledRules = deploymentRules
      .filter(rule => selectedDeploymentRules.includes(rule.id))
      .sort((a, b) => a.priority - b.priority);

    console.log('🔍 RÈGLES FILTRÉES:', {
      enabledRules: enabledRules.map(r => ({ id: r.id, name: r.name, type: r.type, maxItems: r.maxItems })),
      selectedIds: selectedDeploymentRules
    });

    // Classification par TYPE d'algorithme, pas par contentTypes
    const nftRules = enabledRules.filter(rule => rule.type === 'spiral');
    const gridActiveRules = enabledRules.filter(rule => rule.type === 'random-active');
    const gridInactiveRules = enabledRules.filter(rule => rule.type === 'random-inactive');
    
    console.log('📊 CLASSIFICATION:', {
      nftRules: nftRules.length,
      gridActiveRules: gridActiveRules.length,
      gridInactiveRules: gridInactiveRules.length
    });
    
    const activeGridPositions = new Set<number>();


    // PASSE 1: Distribution NFT (définit la Grille Active)
    if (activePasses.includes(1)) {
      setCurrentAnimationStep('Étape 2: NFT en spirale');
      
      nftRules.forEach(rule => {
        const maxItems = rule.maxItems || 50;
        console.log(`🌀 PASSE 1 - Règle NFT: ${rule.name}`, {
          id: rule.id,
          maxItems: maxItems,
          spiralConfig: rule.spiralConfig
        });
        
        if (rule.type === 'spiral' && rule.spiralConfig) {
          const positions = generateSpiralPositions(
            rule.spiralConfig.centerX,
            rule.spiralConfig.centerY,
            rule.spiralConfig.direction,
            rule.spiralConfig.startDirection,
            maxItems
          );
          
          console.log(`🎯 POSITIONS GÉNÉRÉES: ${positions.length} positions`);
          let placedCount = 0;
          
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
                console.log(`NFT placé: position ${pos.x},${pos.y} = gridIndex ${gridIndex}`);
                activeGridPositions.add(gridIndex);
                placedCount++;
              }
            }
          });
          
          console.log(`✅ PASSE 1 TERMINÉE - ${placedCount} NFT placés`);
        }
      });
      
      setNativeGrid32([...grid32]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // PASSE 2: Distribution Grid Active (INFO + VIDEO fusionnées avec push unifié)
    if (activePasses.includes(2) && activeGridPositions.size > 0) {
      setCurrentAnimationStep('Étape 3: Intercalation INFO/VIDEO');
      console.log(`🔄 PASSE 2 - Grille Active avec ${activeGridPositions.size} positions NFT`);
      console.log('🔄 RÈGLES GRID ACTIVE:', gridActiveRules.map(r => ({ 
        id: r.id, 
        name: r.name, 
        maxItems: r.maxItems,
        contentTypes: r.contentTypes 
      })));
      
      const spiralRule = nftRules.find(r => r.type === 'spiral' && r.spiralConfig);
      
      if (spiralRule && spiralRule.spiralConfig) {
        // Créer une liste unifiée de tous les containers Grid Active
        const gridActiveContainers: Array<{
          type: 'info' | 'video' | 'audio';
          rule: any;
          count: number;
        }> = [];

        gridActiveRules.forEach(rule => {
          const maxItems = Math.min(rule.maxItems || 10, 10);
          
          // Déterminer le type de contenu basé sur contentTypes
          let containerType: 'info' | 'video' | 'audio' = 'info';
          if (rule.contentTypes.includes('INFO')) {
            containerType = 'info';
          } else if (rule.contentTypes.includes('VIDEO')) {
            containerType = 'video';
          } else if (rule.contentTypes.includes('AUDIO')) {
            containerType = 'audio';
          }
          
          for (let i = 0; i < maxItems; i++) {
            gridActiveContainers.push({
              type: containerType,
              rule,
              count: i + 1
            });
          }
        });

        // Sélection des positions NFT selon le mode aléatoire choisi
        const nftPositionsList = Array.from(activeGridPositions);
        let shuffledNftPositions: number[] = [];
        
        // Vérifier si le mode "Dispersion maximale" est activé pour une règle
        const isMaximalDispersionMode = gridActiveRules.some(rule => 
          rule.randomActiveConfig?.randomType === 'maximal-dispersion'
        );
        
        if (isMaximalDispersionMode) {
          console.log('🎯 MODE DISPERSION MAXIMALE ACTIVÉ');
          
          // Calculer le centre de la grille active
          const centerX = spiralRule.spiralConfig!.centerX;
          const centerY = spiralRule.spiralConfig!.centerY;
          
          // Diviser les positions NFT par secteurs (8 directions cardinales)
          const sectorPositions: { [key: string]: number[] } = {
            'N': [],   // Nord
            'NE': [],  // Nord-Est
            'E': [],   // Est
            'SE': [],  // Sud-Est
            'S': [],   // Sud
            'SW': [],  // Sud-Ouest
            'W': [],   // Ouest
            'NW': []   // Nord-Ouest
          };
          
          nftPositionsList.forEach(pos => {
            const x = pos % 32;
            const y = Math.floor(pos / 32);
            const dx = x - centerX;
            const dy = y - centerY;
            
            // Déterminer le secteur basé sur l'angle
            const angle = Math.atan2(dy, dx);
            const degrees = (angle * 180 / Math.PI + 360) % 360;
            
            if (degrees >= 337.5 || degrees < 22.5) sectorPositions['E'].push(pos);
            else if (degrees >= 22.5 && degrees < 67.5) sectorPositions['SE'].push(pos);
            else if (degrees >= 67.5 && degrees < 112.5) sectorPositions['S'].push(pos);
            else if (degrees >= 112.5 && degrees < 157.5) sectorPositions['SW'].push(pos);
            else if (degrees >= 157.5 && degrees < 202.5) sectorPositions['W'].push(pos);
            else if (degrees >= 202.5 && degrees < 247.5) sectorPositions['NW'].push(pos);
            else if (degrees >= 247.5 && degrees < 292.5) sectorPositions['N'].push(pos);
            else if (degrees >= 292.5 && degrees < 337.5) sectorPositions['NE'].push(pos);
          });
          
          // Trier chaque secteur par distance au centre (plus loin d'abord pour maximiser la dispersion)
          Object.keys(sectorPositions).forEach(sector => {
            sectorPositions[sector].sort((a, b) => {
              const xa = a % 32, ya = Math.floor(a / 32);
              const xb = b % 32, yb = Math.floor(b / 32);
              const distA = Math.sqrt((xa - centerX) ** 2 + (ya - centerY) ** 2);
              const distB = Math.sqrt((xb - centerX) ** 2 + (yb - centerY) ** 2);
              return distB - distA; // Plus loin d'abord
            });
          });
          
          // Sélectionner les positions en alternant entre les secteurs pour maximiser la dispersion
          const sectorNames = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
          let sectorIndex = 0;
          
          while (shuffledNftPositions.length < gridActiveContainers.length && shuffledNftPositions.length < nftPositionsList.length) {
            const currentSector = sectorNames[sectorIndex];
            if (sectorPositions[currentSector].length > 0) {
              const selectedPos = sectorPositions[currentSector].shift()!;
              shuffledNftPositions.push(selectedPos);
            }
            sectorIndex = (sectorIndex + 1) % sectorNames.length;
            
            // Éviter les boucles infinies si tous les secteurs sont vides
            if (Object.values(sectorPositions).every(positions => positions.length === 0)) {
              break;
            }
          }
          
          console.log(`🎯 DISPERSION MAXIMALE: ${shuffledNftPositions.length} positions sélectionnées sur ${sectorNames.length} secteurs`);
          console.log('📊 RÉPARTITION PAR SECTEUR:', Object.fromEntries(
            Object.entries(sectorPositions).map(([sector, positions]) => 
              [sector, `${positions.length} positions restantes`]
            )
          ));
        } else {
          // Mode aléatoire classique (déterministe basé sur hash)
          shuffledNftPositions = [...nftPositionsList].sort((a, b) => {
            const hashA = (a * 1103515245 + 12345) % 2147483647;
            const hashB = (b * 1103515245 + 12345) % 2147483647;
            return hashA - hashB;
          });
          console.log('🔀 MODE ALÉATOIRE CLASSIQUE: tri déterministe basé sur hash');
        }
        
        // Générer la spirale pour connaître les directions de push
        const fullSpiral = generateSpiralPositions(
          spiralRule.spiralConfig!.centerX,
          spiralRule.spiralConfig!.centerY,
          spiralRule.spiralConfig!.direction,
          spiralRule.spiralConfig!.startDirection,
          200
        );
        
        // Créer un mapping des positions vers leur index dans la spirale
        const positionToSpiralIndex = new Map();
        fullSpiral.forEach((pos, index) => {
          if (pos.x >= 0 && pos.x < 32 && pos.y >= 0 && pos.y < 32) {
            const key = pos.y * 32 + pos.x;
            positionToSpiralIndex.set(key, index);
          }
        });
        
        // Placer chaque container en remplaçant un NFT aléatoire
        gridActiveContainers.forEach((container, containerIndex) => {
          if (containerIndex < shuffledNftPositions.length) {
            const targetPosition = shuffledNftPositions[containerIndex];
            const targetX = targetPosition % 32;
            const targetY = Math.floor(targetPosition / 32);
            
            // Trouver la prochaine position dans le sens spiralé
            const currentSpiralIndex = positionToSpiralIndex.get(targetPosition);
            if (currentSpiralIndex !== undefined) {
              // Chercher la prochaine position libre dans la spirale
              let pushFound = false;
              let pushPosition = targetPosition;
              
              for (let i = currentSpiralIndex + 1; i < fullSpiral.length; i++) {
                const nextPos = fullSpiral[i];
                if (nextPos.x >= 0 && nextPos.x < 32 && nextPos.y >= 0 && nextPos.y < 32) {
                  const nextGridPos = nextPos.y * 32 + nextPos.x;
                  if (grid32[nextGridPos].type === 'empty') {
                    pushPosition = nextGridPos;
                    pushFound = true;
                    break;
                  }
                }
              }
              
              if (pushFound) {
                // Pousser le NFT à la prochaine position libre dans la spirale
                const pushX = Math.floor(pushPosition % 32);
                const pushY = Math.floor(pushPosition / 32);
                grid32[pushPosition] = { 
                  ...grid32[targetPosition],
                  id: pushPosition,
                  position: { x: pushX, y: pushY }
                };
                activeGridPositions.add(pushPosition);
                activeGridPositions.delete(targetPosition);
                console.log(`NFT poussé: ${targetPosition} → ${pushPosition} (${pushX},${pushY})`);
              }
              
              // Placer le container à la position du NFT déplacé
              grid32[targetPosition] = {
                id: targetPosition,
                type: container.type,
                position: { x: targetX, y: targetY },
                containerId: `${container.type}-${container.rule.id}-${container.count}`,
                containerData: {
                  title: `${container.type.toUpperCase()} ${container.count}`,
                  source: container.rule.name,
                  marketOrder: container.count
                }
              };
              console.log(`${container.type.toUpperCase()} placé à ${targetX},${targetY} (index ${targetPosition})`);
              
              // La position reste dans la grille active
              activeGridPositions.add(targetPosition);
            }
          }
        });
        
        setNativeGrid32([...grid32]);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // PASSE 3: Distribution Grid Inactive (AUDIO uniquement, sans impact sur Active)
    if (activePasses.includes(3)) {
      setCurrentAnimationStep('Étape 4: Distribution AUDIO');
      console.log(`🔄 PASSE 3 - Grille Inactive`);
      console.log('🔄 RÈGLES GRID INACTIVE:', gridInactiveRules.map(r => ({ 
        id: r.id, 
        name: r.name, 
        maxItems: r.maxItems,
        contentTypes: r.contentTypes 
      })));
      
      gridInactiveRules.forEach(rule => {
        const maxItems = Math.min(rule.maxItems || 10, 10);
        const validInactivePositions: number[] = [];
        
        // Trouver toutes les positions vides NON dans la grille active
        for (let i = 0; i < 1024; i++) {
          if (grid32[i].type === 'empty') {
            const x = i % 32;
            const y = Math.floor(i / 32);
            
            // Vérifier distance avec grille active selon config
            const minDistance = rule.randomInactiveConfig?.minDistanceFromActive || 1;
            const maxDistance = rule.randomInactiveConfig?.maxDistanceFromActive || 3;
            
            let nearestActiveDistance = Infinity;
            activeGridPositions.forEach(activePos => {
              const activeX = activePos % 32;
              const activeY = Math.floor(activePos / 32);
              const distance = Math.sqrt(Math.pow(x - activeX, 2) + Math.pow(y - activeY, 2));
              nearestActiveDistance = Math.min(nearestActiveDistance, distance);
            });
            
            if (nearestActiveDistance >= minDistance && nearestActiveDistance <= maxDistance) {
              validInactivePositions.push(i);
            }
          }
        }
        
        const shuffledInactivePositions = [...validInactivePositions].sort(() => Math.random() - 0.5);
        const itemsToPlace = Math.min(maxItems, shuffledInactivePositions.length);
        
        for (let i = 0; i < itemsToPlace; i++) {
          const gridIndex = shuffledInactivePositions[i];
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
      
      setNativeGrid32([...grid32]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setCurrentAnimationStep('Génération terminée');
    console.log(`🏁 GÉNÉRATION TERMINÉE - Refresh #${refreshNumber}`);
    console.log('📊 RÉSUMÉ FINAL:', {
      totalCells: grid32.length,
      nftCells: grid32.filter(c => c.type === 'nft').length,
      infoCells: grid32.filter(c => c.type === 'info').length,
      videoCells: grid32.filter(c => c.type === 'video').length,
      audioCells: grid32.filter(c => c.type === 'audio').length,
      emptyCells: grid32.filter(c => c.type === 'empty').length
    });
    
    setNativeGrid32([...grid32]);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsGenerating(false);
    setShowStepIndicator(false);
    setCurrentAnimationStep('');
  };

  // Générer le code HTML
  const generateHTMLCode = () => {
    const enabledRulesData = deploymentRules.filter(rule => selectedDeploymentRules.includes(rule.id));
    return `<!-- Configuration Grille Chimérique V2 -->
<div class="grille-chimerique-32x32" data-page="${selectedPage}" data-model="${selectedGridModel}">
  <!-- Règles actives: ${enabledRulesData.map(r => r.name).join(', ')} -->
  ${enabledRulesData.map(rule => `
  <rule id="${rule.id}" type="${rule.type}" priority="${rule.priority}">
    ${rule.type === 'spiral' ? `
    <spiral centerX="${rule.spiralConfig?.centerX}" centerY="${rule.spiralConfig?.centerY}" 
            direction="${rule.spiralConfig?.direction}" start="${rule.spiralConfig?.startDirection}" 
            maxItems="${rule.maxItems}" />` : ''}
    ${rule.type === 'random-active' ? `
    <randomActive maxItems="${rule.maxItems}" contentTypes="${rule.contentTypes.join(',')}" 
      randomType="${rule.randomActiveConfig?.randomType}" 
      replacementRatio="${rule.randomActiveConfig?.replacementRatio}" />` : ''}
    ${rule.type === 'random-inactive' ? `
    <randomInactive maxItems="${rule.maxItems}" contentTypes="${rule.contentTypes.join(',')}" 
      minDistance="${rule.randomInactiveConfig?.minDistanceFromActive}" 
      maxDistance="${rule.randomInactiveConfig?.maxDistanceFromActive}" />` : ''}
  </rule>`).join('')}
</div>

<!-- Containers générés -->
${nativeGrid32.filter(cell => cell.type !== 'empty').map(cell => `
<container id="${cell.containerId}" type="${cell.type}" 
          x="${cell.position.x}" y="${cell.position.y}"
          title="${cell.containerData?.title}" 
          source="${cell.containerData?.source}" 
          order="${cell.containerData?.marketOrder}" />`).join('')}`;
  };

  // Initialisation des sous-catégories par défaut
  useEffect(() => {
    deploymentRules.forEach(rule => {
      if (rule.contentTypes.length > 0) {
        initializeSubCategories(rule.id, rule.contentTypes[0]);
      }
    });
  }, []);

  // Plus d'auto-génération - seulement manuel avec les boutons Refresh/Valider

  // Statistiques
  const nftCount = nativeGrid32.filter(cell => cell.type === 'nft').length;
  const infoCount = nativeGrid32.filter(cell => cell.type === 'info').length;
  const videoCount = nativeGrid32.filter(cell => cell.type === 'video').length;
  const audioCount = nativeGrid32.filter(cell => cell.type === 'audio').length;
  const emptyCount = nativeGrid32.filter(cell => cell.type === 'empty').length;

  // Classes de debug pour visualiser les zones
  const debugClasses = debugMode ? {
    container: 'border-4 border-red-500 bg-red-50',
    maxWidth: 'border-4 border-blue-500 bg-blue-50',
    padding: 'border-4 border-green-500 bg-green-50',
    layout: 'border-4 border-purple-500 bg-purple-50',
    cards: 'border-2 border-indigo-400 bg-indigo-50'
  } : {
    container: '',
    maxWidth: '',
    padding: '',
    layout: '',
    cards: ''
  };

  const headerConfig = {
    title: "grid distribution rules",
    description: "Configuration des règles de déploiement en 3 passes",
    buttons: [
      {
        label: isGenerating ? 'Génération...' : 'Générer Aperçu',
        onClick: generate32x32Preview,
        variant: 'primary' as const,
        icon: RefreshCw,
        disabled: isGenerating
      },
      {
        label: saveConfigMutation.isPending ? 'Sauvegarde...' : 'Enregistrer',
        onClick: saveConfiguration,
        variant: 'success' as const,
        icon: Save,
        disabled: saveConfigMutation.isPending
      }
    ]
  };

  return (
    <AdminCursorProvider>
      <div className={`min-h-screen bg-gray-100 ${debugClasses.container}`}>
      {debugMode && (
        <div className="fixed top-4 right-4 z-50 bg-black text-white p-2 rounded text-xs">
          Mode Debug: Press 'D' to toggle
          <div className="mt-1 space-y-1">
            <div><span className="inline-block w-3 h-3 bg-red-500 mr-1"></span>Container Principal</div>
            <div><span className="inline-block w-3 h-3 bg-blue-500 mr-1"></span>max-w-7xl mx-auto</div>
            <div><span className="inline-block w-3 h-3 bg-green-500 mr-1"></span>padding p-4</div>
            <div><span className="inline-block w-3 h-3 bg-purple-500 mr-1"></span>Layout Section</div>
            <div><span className="inline-block w-3 h-3 bg-indigo-400 mr-1"></span>Cards</div>
          </div>
        </div>
      )}

      <div className="flex">
        <div className={`flex-1 ${debugClasses.container}`}>
          <div className={`max-w-7xl mx-auto p-4 ${debugClasses.maxWidth} ${debugClasses.padding}`}>
            {/* Module 1: Header */}
            <AdminHeaderTemplate {...headerConfig} filePath="client/src/pages/admin/GridMapDistributionV3.tsx" />
            
            {/* Module 2: Layout */}
            <div className={`${debugClasses.layout}`}>

        {/* SECTION HAUTE */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {/* 1/4 gauche: 1• QUI, 2• OÙ, 3• Règles */}
          <div className="space-y-3">
            {/* 1• QUI */}
            <div className="bg-white rounded-lg p-3 shadow">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center text-sm admin-h2">
                <Users className="w-4 h-4 mr-2" />
                PAGE CIBLE
              </h3>
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 admin-select"
              >
                {availablePages.map(page => (
                  <option key={page.id} value={page.id}>{page.name}</option>
                ))}
              </select>
            </div>

            {/* 2• OÙ */}
            <div className="bg-white rounded-lg p-3 shadow">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center text-sm admin-h2">
                <Layout className="w-4 h-4 mr-2" />
                MODÈLE DE GRILLE
              </h3>
              <select
                value={selectedGridModel}
                onChange={(e) => setSelectedGridModel(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 admin-select"
              >
                {gridModels.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>

            {/* 3• Règles actives avec priorités */}
            <div className="bg-white rounded-lg p-3 shadow">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center text-sm admin-h2">
                <Target className="w-4 h-4 mr-2" />
                DISTRIBUTION ALGORITHMIQUE
              </h3>
              
              {/* Règles actives organisées par étapes */}
              <div className="space-y-2 mb-4">
                <h4 className="text-gray-600 admin-h3">RÈGLES ACTIVES</h4>
                {deploymentRules
                  .filter(rule => selectedDeploymentRules.includes(rule.id))
                  .sort((a, b) => a.priority - b.priority)
                  .map(rule => (
                  <div 
                    key={rule.id} 
                    className={`p-2 rounded border cursor-pointer transition-all ${
                      selectedRule?.id === rule.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-green-200 bg-green-50 hover:border-green-300 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedRule(rule)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-1">
                          {rule.type === 'spiral' && renderUnifiedTag('priority-1-grid-nativ')}
                          {rule.type === 'random-active' && renderUnifiedTag('priority-2-grid-activ')}
                          {rule.type === 'random-inactive' && renderUnifiedTag('priority-3-grid-inactiv')}
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm font-semibold text-gray-900 admin-rule-name">{rule.name}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5 admin-programmatic">
                          {rule.contentTypes.join(', ')} • {rule.maxItems} items max
                        </div>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRuleSelection(rule.id);
                          }}
                          className="w-6 h-6 flex items-center justify-center text-green-600 hover:bg-green-100 rounded group relative"
                          title="Règle active"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            ON
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Règles inactives */}
              <div className="space-y-2 mb-4">
                <h4 className="text-gray-600 admin-h3">RÈGLES INACTIVES</h4>
                {deploymentRules
                  .filter(rule => !selectedDeploymentRules.includes(rule.id))
                  .map(rule => (
                  <div 
                    key={rule.id} 
                    className={`p-2 rounded border cursor-pointer transition-all ${
                      selectedRule?.id === rule.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedRule(rule)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-1">
                          {rule.type === 'spiral' && renderUnifiedTag('priority-1-grid-nativ')}
                          {rule.type === 'random-active' && renderUnifiedTag('priority-2-grid-activ')}
                          {rule.type === 'random-inactive' && renderUnifiedTag('priority-3-grid-inactiv')}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700 admin-rule-name">{rule.name}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 admin-programmatic">
                          {rule.contentTypes.join(', ')} • {rule.maxItems} items max
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRuleSelection(rule.id);
                        }}
                        className="w-6 h-6 flex items-center justify-center text-blue-600 hover:bg-blue-100 rounded group relative"
                        title="Désactiver cette règle"
                      >
                        <EyeOff className="w-4 h-4" />
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          OFF
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Créer nouvelle règle */}
              <button
                onClick={() => {
                  const newRule: DeploymentRule = {
                    id: `rule_${Date.now()}`,
                    name: 'Nouvelle règle',
                    type: 'spiral',
                    contentTypes: ['NFT'],
                    priority: Math.max(...deploymentRules.map(r => r.priority)) + 1,
                    enabled: true,
                    description: 'Nouvelle règle de distribution',
                    spiralConfig: { centerX: 16, centerY: 16, direction: 'clockwise', startDirection: 'right', skipOccupied: true },
                    maxItems: 50
                  };
                  setDeploymentRules(prev => [...prev, newRule]);
                  setSelectedRule(newRule);
                }}
                className="w-full p-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Créer une nouvelle règle</span>
              </button>
            </div>
          </div>

          {/* 2/4 centre: Grille + Admin unifié */}
          <div className="col-span-2 bg-white rounded-lg p-4 shadow space-y-6">
            {/* Grille de prévisualisation - déplacée après les infos de base */}

            {/* Module de contrôle des passes (désactivé temporairement)
            <div className="border-t pt-6">
              <details className="text-xs text-gray-400">
                <summary className="cursor-pointer">Debug passes (expérimental)</summary>
                <div className="grid grid-cols-3 gap-4 mt-2" style={{ width: '512px' }}>
                  // Module temporairement mis de côté
                </div>
              </details>
            </div>
            */}

            {/* 1. En-tête Administration */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Grid className="w-6 h-6 text-blue-600" />
                  <h2 className="text-gray-900 admin-h2">RÈGLES DE DISTRIBUTION</h2>
                </div>
                <button
                  onClick={saveConfiguration}
                  disabled={saveConfigMutation.isPending}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveConfigMutation.isPending ? 'Sauvegarde...' : 'Enregistrer'}</span>
                </button>
              </div>
              
              {selectedRule ? (
                <div className="space-y-6">
                  {/* 2. Informations de base - en haut */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="admin-h3 mb-3">informations générales</h4>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
                        <input
                          type="text"
                          value={selectedRule.name}
                          onChange={(e) => updateRule(selectedRule.id, { name: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 admin-programmatic"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Type de destination</label>
                        <select
                          value={selectedRule.type}
                          onChange={(e) => {
                            const newType = e.target.value as 'spiral' | 'random-active' | 'random-inactive';
                            let newPriority = selectedRule.priority;
                            
                            // Ajuster automatiquement la priorité selon le type
                            if (newType === 'spiral') newPriority = 1;
                            else if (newType === 'random-active') newPriority = 2;
                            else if (newType === 'random-inactive') newPriority = 3;
                            
                            updateRule(selectedRule.id, { type: newType, priority: newPriority });
                          }}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 admin-programmatic"
                          style={{
                            backgroundColor: selectedRule.type === 'spiral' ? '#059669' :
                                            selectedRule.type === 'random-active' ? '#2563eb' : '#db2777',
                            color: 'white',
                            fontWeight: '500'
                          }}
                        >
                          <option value="spiral" style={{backgroundColor: '#059669', color: 'white'}}>#1 Grid Nativ</option>
                          <option value="random-active" style={{backgroundColor: '#2563eb', color: 'white'}}>#2 Grid Activ</option>
                          <option value="random-inactive" style={{backgroundColor: '#db2777', color: 'white'}}>#3 Grid Inactiv</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={selectedRule.description}
                        onChange={(e) => updateRule(selectedRule.id, { description: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 admin-programmatic"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* 3. Grille de prévisualisation avec bouton Refresh en bas à droite */}
                  <div className="bg-white border rounded-lg p-4 relative">
                    <div className="border rounded overflow-hidden bg-gray-50 p-2">
                      <div 
                        className="grid gap-px bg-gray-200 mx-auto"
                        style={{ 
                          gridTemplateColumns: 'repeat(32, 1fr)',
                          width: '512px',
                          height: '512px'
                        }}
                      >
                        {nativeGrid32.map((cell, index) => {
                          const cellType = cell.type === 'nft' ? 'NFT' : 
                                         cell.type === 'info' ? 'INFO' : 
                                         cell.type === 'audio' ? 'AUDIO' : 
                                         cell.type === 'video' ? 'VIDEO' : 'EMPTY';
                          const symbol = getContentTypeSymbol(cellType);
                          const isNFT = cell.type === 'nft';
                          
                          return (
                            <div
                              key={`grid-cell-${cell.position.y}-${cell.position.x}`}
                              className="relative group"
                              style={{
                                backgroundColor: cell.type === 'empty' ? '#F3F4F6' : getContentTypeColor(cellType),
                                width: '15px',
                                height: '15px',
                                fontSize: isNFT ? '7px' : '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: cell.type === 'empty' ? 'transparent' : 
                                      cell.type === 'info' ? 'white' : 
                                      cell.type === 'audio' ? 'white' :
                                      cell.type === 'video' ? 'white' :
                                      cell.type === 'nft' ? 'white' : 'transparent',
                                fontWeight: isNFT ? 'bold' : 'normal',
                                fontStyle: cell.type === 'info' ? 'italic' : 'normal'
                              }}
                              title={cell.containerData ? 
                                `${cell.containerData.title} • Position: ${cell.position.x},${cell.position.y} • Source: ${cell.containerData.source}` :
                                `Position: ${cell.position.x},${cell.position.y}`
                              }
                            >
                              {isNFT ? (cell.containerData?.marketOrder || '') : symbol}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => generate32x32Preview()}
                      className="absolute bottom-2 right-2 z-10 w-8 h-8 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors flex items-center justify-center shadow-lg"
                      title="Actualiser la prévisualisation"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Configuration spirale */}
                  {selectedRule.type === 'spiral' && selectedRule.spiralConfig && (
                    <div className="bg-blue-50 p-3 rounded">
                      <h4 className="font-medium text-blue-800 mb-2 text-sm">Configuration Spirale</h4>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <label className="text-xs font-medium text-gray-700">X</label>
                          <input
                            type="number"
                            value={selectedRule.spiralConfig.centerX}
                            onChange={(e) => updateRule(selectedRule.id, { 
                              spiralConfig: { 
                                ...selectedRule.spiralConfig!, 
                                centerX: parseInt(e.target.value) 
                              }
                            })}
                            className="w-12 px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                            min="0"
                            max="31"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="text-xs font-medium text-gray-700">Y</label>
                          <input
                            type="number"
                            value={selectedRule.spiralConfig.centerY}
                            onChange={(e) => updateRule(selectedRule.id, { 
                              spiralConfig: { 
                                ...selectedRule.spiralConfig!, 
                                centerY: parseInt(e.target.value) 
                              }
                            })}
                            className="w-12 px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                            min="0"
                            max="31"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="text-xs font-medium text-gray-700">Direction</label>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => updateRule(selectedRule.id, { 
                                spiralConfig: { 
                                  ...selectedRule.spiralConfig!, 
                                  direction: 'clockwise' 
                                }
                              })}
                              className={`w-6 h-6 text-xs rounded flex items-center justify-center ${
                                selectedRule.spiralConfig.direction === 'clockwise' 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              ↻
                            </button>
                            <button
                              onClick={() => updateRule(selectedRule.id, { 
                                spiralConfig: { 
                                  ...selectedRule.spiralConfig!, 
                                  direction: 'counterclockwise' 
                                }
                              })}
                              className={`w-6 h-6 text-xs rounded flex items-center justify-center ${
                                selectedRule.spiralConfig.direction === 'counterclockwise' 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              ↺
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="text-xs font-medium text-gray-700">Départ</label>
                          <div className="flex space-x-1">
                            {[
                              { value: 'right', icon: '→' },
                              { value: 'down', icon: '↓' },
                              { value: 'left', icon: '←' },
                              { value: 'up', icon: '↑' }
                            ].map(({ value, icon }) => (
                              <button
                                key={value}
                                onClick={() => updateRule(selectedRule.id, { 
                                  spiralConfig: { 
                                    ...selectedRule.spiralConfig!, 
                                    startDirection: value as any 
                                  }
                                })}
                                className={`w-6 h-6 text-xs rounded flex items-center justify-center ${
                                  selectedRule.spiralConfig && selectedRule.spiralConfig.startDirection === value 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Type de contenu et Max items sur la même ligne */}
                  <div className="flex space-x-4 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Type de contenu</label>
                      <div className="flex space-x-2">
                        {['NFT', 'AUDIO', 'INFO', 'VIDEO'].map(type => (
                          <div 
                            key={type} 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Clic sur type:', type, 'Règle actuelle:', selectedRule.contentTypes);
                              updateRule(selectedRule.id, { 
                                contentTypes: [type] 
                              });
                              initializeSubCategories(selectedRule.id, type);
                              console.log('Après update, type devrait être:', type);
                            }}
                            className={`px-2.5 py-1.5 border rounded cursor-pointer transition-all duration-200 select-none admin-programmatic ${
                              selectedRule.contentTypes.includes(type) 
                                ? 'bg-blue-100 border-blue-400 text-blue-800 font-medium shadow-sm' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <span className="text-xs font-medium pointer-events-none">{type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Max items</label>
                      <input
                        type="number"
                        value={selectedRule.maxItems}
                        onChange={(e) => updateRule(selectedRule.id, { maxItems: parseInt(e.target.value) })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      />
                    </div>
                  </div>



                  {/* Configuration Aléatoire Grid Active */}
                  {selectedRule.type === 'random-active' && (
                    <div className="bg-green-50 p-3 rounded">
                      <h4 className="font-medium text-green-800 mb-2 text-sm">Configuration Aléatoire Grid Active</h4>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-0.5">Type aléatoire</label>
                          <select 
                            value={selectedRule.randomActiveConfig?.randomType || 'uniform'}
                            onChange={(e) => updateRule(selectedRule.id, { 
                              randomActiveConfig: { 
                                ...selectedRule.randomActiveConfig!, 
                                randomType: e.target.value as any 
                              }
                            })}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500">
                            <option value="uniform">Uniforme</option>
                            <option value="weighted">Pondéré</option>
                            <option value="clustered">Clustérisé</option>
                            <option value="maximal-dispersion">Dispersion maximale</option>
                          </select>
                        </div>
                        
                        {/* Paramètres masqués pour le mode Dispersion maximale */}
                        {selectedRule.randomActiveConfig?.randomType !== 'maximal-dispersion' && (
                          <>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-xs text-gray-600 mb-0.5">Distance min bord</label>
                                <input
                                  type="number"
                                  value={selectedRule.randomActiveConfig?.minDistanceFromBorder || 2}
                                  onChange={(e) => updateRule(selectedRule.id, { 
                                    randomActiveConfig: { 
                                      ...selectedRule.randomActiveConfig!, 
                                      minDistanceFromBorder: parseInt(e.target.value) 
                                    }
                                  })}
                                  className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                  min="0"
                                  max="16"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-0.5">Distance max bord</label>
                                <input
                                  type="number"
                                  value={selectedRule.randomActiveConfig?.maxDistanceFromBorder || 10}
                                  onChange={(e) => updateRule(selectedRule.id, { 
                                    randomActiveConfig: { 
                                      ...selectedRule.randomActiveConfig!, 
                                      maxDistanceFromBorder: parseInt(e.target.value) 
                                    }
                                  })}
                                  className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                  min="0"
                                  max="16"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-0.5">Ratio remplacement</label>
                                <select 
                                  value={selectedRule.randomActiveConfig?.replacementRatio || 4}
                                  onChange={(e) => updateRule(selectedRule.id, { 
                                    randomActiveConfig: { 
                                      ...selectedRule.randomActiveConfig!, 
                                      replacementRatio: parseInt(e.target.value) 
                                    }
                                  })}
                                  className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500">
                                  <option value="3">1 INFO / 3 NFT</option>
                                  <option value="4">1 INFO / 4 NFT</option>
                                  <option value="5">1 INFO / 5 NFT</option>
                                  <option value="6">1 INFO / 6 NFT</option>
                                </select>
                              </div>
                            </div>
                          </>
                        )}
                        
                        {/* Message informatif pour la dispersion maximale */}
                        {selectedRule.randomActiveConfig?.randomType === 'maximal-dispersion' && (
                          <div className="p-2 bg-blue-50 rounded border text-xs text-blue-700">
                            Mode Dispersion Maximale : placement intelligent sur 8 axes cardinaux pour éviter les regroupements.
                          </div>
                        )}

                      </div>
                    </div>
                  )}

                  {/* Configuration Aléatoire Grid Inactive */}
                  {selectedRule.type === 'random-inactive' && (
                    <div className="bg-orange-50 p-3 rounded">
                      <h4 className="font-medium text-orange-800 mb-2 text-sm">Configuration Aléatoire Grid Inactive</h4>
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-0.5">Distance min active</label>
                            <input
                              type="number"
                              value={selectedRule.randomInactiveConfig?.minDistanceFromActive || 1}
                              onChange={(e) => updateRule(selectedRule.id, { 
                                randomInactiveConfig: { 
                                  ...selectedRule.randomInactiveConfig!, 
                                  minDistanceFromActive: parseInt(e.target.value) 
                                }
                              })}
                              className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                              min="1"
                              max="5"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-0.5">Distance max active</label>
                            <input
                              type="number"
                              value={selectedRule.randomInactiveConfig?.maxDistanceFromActive || 3}
                              onChange={(e) => updateRule(selectedRule.id, { 
                                randomInactiveConfig: { 
                                  ...selectedRule.randomInactiveConfig!, 
                                  maxDistanceFromActive: parseInt(e.target.value) 
                                }
                              })}
                              className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                              min="1"
                              max="8"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-0.5">Dispersion</label>
                            <select 
                              value={selectedRule.randomInactiveConfig?.dispersion || 'medium'}
                              onChange={(e) => updateRule(selectedRule.id, { 
                                randomInactiveConfig: { 
                                  ...selectedRule.randomInactiveConfig!, 
                                  dispersion: e.target.value as any 
                                }
                              })}
                              className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500">
                              <option value="low">Faible</option>
                              <option value="medium">Moyenne</option>
                              <option value="high">Élevée</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-0.5">Évitement zones</label>
                            <select 
                              value={selectedRule.randomInactiveConfig?.avoidanceZones || 'corners'}
                              onChange={(e) => updateRule(selectedRule.id, { 
                                randomInactiveConfig: { 
                                  ...selectedRule.randomInactiveConfig!, 
                                  avoidanceZones: e.target.value as any 
                                }
                              })}
                              className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500">
                              <option value="none">Aucun</option>
                              <option value="corners">Coins</option>
                              <option value="borders">Bordures</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-0.5">Priorité placement</label>
                            <select 
                              value={selectedRule.randomInactiveConfig?.placementPriority || 'proximity'}
                              onChange={(e) => updateRule(selectedRule.id, { 
                                randomInactiveConfig: { 
                                  ...selectedRule.randomInactiveConfig!, 
                                  placementPriority: e.target.value as any 
                                }
                              })}
                              className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500">
                              <option value="proximity">Proximité</option>
                              <option value="distance">Distance</option>
                              <option value="balanced">Équilibré</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}



                  {/* Gestion des sous-catégories */}
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="admin-h3 mb-2">sélection de contenu</h4>
                    
                    {selectedRule.contentTypes.includes('NFT') && (
                      <div className="space-y-2 mb-3">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-medium text-gray-700">Collections NFT</label>
                            <span className={`text-xs px-1.5 py-0.5 rounded programmatic-tag ${
                              autoCollectionMode[selectedRule.id] ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {autoCollectionMode[selectedRule.id] ? 'Auto' : 'Manuel'}
                            </span>
                          </div>
                          
                          {autoCollectionMode[selectedRule.id] ? (
                            <div className="p-2 bg-green-50 rounded border">
                              <p className="text-xs text-green-700 mb-1">
                                Toutes les collections NFT sont automatiquement sélectionnées
                              </p>
                              <p className="text-xs text-green-600">
                                Décocher une collection pour passer en mode sélection individuelle
                              </p>
                            </div>
                          ) : null}
                          
                          <div className="grid grid-cols-2 gap-1.5">
                            {['Castings de Chimères', 'Chimères', 'Os.moz', 'Thugshots', 'Régénération'].map(collection => (
                              <label key={collection} className="flex items-center space-x-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={autoCollectionMode[selectedRule.id] || isSubCategorySelected(selectedRule.id, 'collections', collection)}
                                  onChange={() => toggleSubCategory(selectedRule.id, 'collections', collection)}
                                  className="w-3 h-3 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-xs text-gray-700 admin-programmatic">{collection}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">Tags filtrants NFT</label>
                          <div className="flex space-x-3">
                            {['Libres', 'Achetés', 'Revente'].map(tag => (
                              <label key={tag} className="flex items-center space-x-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSubCategorySelected(selectedRule.id, 'tags', tag)}
                                  onChange={() => toggleSubCategory(selectedRule.id, 'tags', tag)}
                                  className="w-3 h-3 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-xs text-gray-700 admin-programmatic">{tag}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">Modèles d'expansion</label>
                          <div className="grid grid-cols-2 gap-2">
                            {['OneOne_up', 'OneOne_dwn', 'OneHalf_dwn', 'One'].map(expansion => (
                              <label key={expansion} className="flex items-center space-x-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSubCategorySelected(selectedRule.id, 'expansion', expansion)}
                                  onChange={() => toggleSubCategory(selectedRule.id, 'expansion', expansion)}
                                  className="w-3 h-3 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-xs text-gray-700 admin-programmatic">{expansion}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedRule.contentTypes.includes('AUDIO') && (
                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-medium text-gray-700">Types AUDIO</label>
                            <span className={`text-xs px-1.5 py-0.5 rounded programmatic-tag ${
                              autoAudioMode[selectedRule.id] ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {autoAudioMode[selectedRule.id] ? 'Auto' : 'Manuel'}
                            </span>
                          </div>
                          
                          {autoAudioMode[selectedRule.id] ? (
                            <div className="p-2 bg-green-50 rounded border">
                              <p className="text-xs text-green-700 mb-1">
                                Tous les types AUDIO sont automatiquement sélectionnés
                              </p>
                              <p className="text-xs text-green-600">
                                Décocher un type pour passer en mode sélection individuelle
                              </p>
                            </div>
                          ) : null}
                          
                          <div className="flex space-x-3">
                            {['Music', 'Podcast'].map(type => (
                              <label key={type} className="flex items-center space-x-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={autoAudioMode[selectedRule.id] || isSubCategorySelected(selectedRule.id, 'types', type)}
                                  onChange={() => toggleSubCategory(selectedRule.id, 'types', type)}
                                  className="w-3 h-3 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <span className="text-xs text-gray-700 admin-programmatic">{type}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">Tags filtrants</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {['Ambient', 'Interactive', 'Proximity', 'Background'].map(tag => (
                              <label key={tag} className="flex items-center space-x-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSubCategorySelected(selectedRule.id, 'tags', tag)}
                                  onChange={() => toggleSubCategory(selectedRule.id, 'tags', tag)}
                                  className="w-3 h-3 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <span className="text-xs text-gray-700">{tag}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedRule.contentTypes.includes('INFO') && (
                      <div className="mb-3 p-2 bg-blue-50 rounded">
                        <p className="text-xs text-blue-700 italic">
                          INFO : Pas de sous-catégories (liens uniquement)
                        </p>
                      </div>
                    )}

                    {selectedRule.contentTypes.includes('VIDEO') && (
                      <div className="mb-3 p-2 bg-purple-50 rounded">
                        <p className="text-xs text-purple-700 italic admin-programmatic">
                          VIDEO : Pas de sous-catégories pour le moment
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-sm">Sélectionnez une règle pour la modifier</div>
                </div>
              )}
            </div>
          </div>

          {/* 1/4 droite: Légende + Stats */}
          <div className="space-y-4">
            {/* Légende */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="text-gray-900 mb-3 flex items-center admin-h2">
                <Info className="w-4 h-4 mr-2" />
                légende
              </h3>
              <div className="space-y-2 text-xs">
                {/* NFT - seulement si présent */}
                {nftCount > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded flex items-center justify-center text-white text-xs font-bold admin-programmatic" style={{ backgroundColor: getContentTypeColor('NFT') }}>1</div>
                      <span className="admin-programmatic">NFT - Numérotées (Grille Active)</span>
                    </div>
                    <span className="text-[10px] text-gray-500 admin-programmatic">{nftCount}</span>
                  </div>
                )}
                
                {/* INFO - seulement si présent */}
                {infoCount > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded flex items-center justify-center text-white text-xs italic admin-programmatic" style={{ backgroundColor: getContentTypeColor('INFO') }}>i</div>
                      <span className="admin-programmatic">INFO - Noir (Intercalation)</span>
                    </div>
                    <span className="text-[10px] text-gray-500 admin-programmatic">{infoCount}</span>
                  </div>
                )}
                
                {/* AUDIO - seulement si présent */}
                {audioCount > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded flex items-center justify-center text-white text-xs admin-programmatic" style={{ backgroundColor: getContentTypeColor('AUDIO') }}>♪</div>
                      <span className="admin-programmatic">AUDIO - Rose (Zones inactives)</span>
                    </div>
                    <span className="text-[10px] text-gray-500 admin-programmatic">{audioCount}</span>
                  </div>
                )}
                
                {/* VIDEO - seulement si présent */}
                {videoCount > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded flex items-center justify-center text-white text-xs admin-programmatic" style={{ backgroundColor: getContentTypeColor('VIDEO') }}>▶</div>
                      <span className="admin-programmatic">VIDEO - Bleu (Intercalation)</span>
                    </div>
                    <span className="text-[10px] text-gray-500 admin-programmatic">{videoCount}</span>
                  </div>
                )}
                
                {/* Vide - toujours affiché */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded bg-gray-200"></div>
                    <span className="admin-programmatic">Vide</span>
                  </div>
                  <span className="text-[10px] text-gray-500 admin-programmatic">{emptyCount}</span>
                </div>
                
                {/* Séparateur si des éléments sont présents */}
                {(nftCount > 0 || infoCount > 0 || audioCount > 0 || videoCount > 0) && (
                  <div className="border-t pt-2 mt-2">
                    <div className="text-xs text-gray-500">
                      Légende dynamique • {[nftCount > 0 && 'NFT', infoCount > 0 && 'INFO', audioCount > 0 && 'AUDIO', videoCount > 0 && 'VIDEO'].filter(Boolean).join(' + ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques unifiées */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="text-gray-900 mb-3 flex items-center admin-h2">
                <BarChart3 className="w-4 h-4 mr-2" />
                statistiques
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600 font-bold admin-programmatic">NFT:</span>
                  <span className="font-medium dynamic-value">{nftCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black font-bold admin-programmatic">INFO:</span>
                  <span className="font-medium dynamic-value">{infoCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pink-600 font-bold admin-programmatic">AUDIO:</span>
                  <span className="font-medium dynamic-value">{audioCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600 font-bold admin-programmatic">VIDEO:</span>
                  <span className="font-medium dynamic-value">{videoCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold admin-programmatic">Vides:</span>
                  <span className="font-medium dynamic-value">{emptyCount}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="admin-programmatic">Total:</span>
                    <span className="dynamic-value">1024</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Taux de remplissage: <span className="dynamic-value">{((1024 - emptyCount) / 1024 * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Code HTML Export */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="text-gray-900 mb-2 flex items-center admin-h2">
                <Code className="w-4 h-4 mr-2" />
                code
              </h3>
              
              {/* Infos clés */}
              <div className="mb-3 text-xs text-gray-600 space-y-1">
                <div>Lignes: {generateHTMLCode().split('\n').length} • Taille: {new Blob([generateHTMLCode()]).size}b • Cellules: {nativeGrid32.filter(c => c.type !== 'empty').length}/1024</div>
                <div>Règles actives: {selectedDeploymentRules.length} • Auto-généré depuis paramètres admin</div>
              </div>
              
              {/* Preview code */}
              <div className="bg-black p-3 rounded text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
                <pre className="text-white whitespace-pre-wrap">
                  <code>{generateHTMLCode()}</code>
                </pre>
              </div>
              
              <div className="mt-2 text-right">
                <button
                  onClick={() => navigator.clipboard.writeText(generateHTMLCode())}
                  className="px-2 py-1 text-blue-600 hover:text-blue-700 text-xs"
                >
                  Copier
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
          </div>
        </div>
      </div>
      </div>
    </AdminCursorProvider>
  );
}