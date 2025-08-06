import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Save, Eye, Grid3X3, Target, Play, Square } from 'lucide-react';

import { generateSpiralPositions } from '../../utils/spiralAlgorithm';

interface DeploymentRule {
  id: string;
  name: string;
  type: 'spiral' | 'random' | 'zone' | 'sequential';
  contentTypes: string[];
  priority: number;
  enabled: boolean;
  description: string;
  maxItems?: number;
  spiralConfig?: {
    centerX: number;
    centerY: number;
    direction: 'clockwise' | 'counterclockwise';
    startDirection: 'right' | 'down' | 'left' | 'up';
    skipOccupied: boolean;
  };
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
    realContainer?: any; // Connexion au container réel du BO
  } | null;
}

export function GridMapDistribution32Native() {
  const [selectedDeploymentRules, setSelectedDeploymentRules] = useState<string[]>(['SpiralGrid_Castings', 'Container_Audio']);
  const [nativeGrid32, setNativeGrid32] = useState<NativeGridCell[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Règles de déploiement simulées
  const deploymentRules: DeploymentRule[] = [
    {
      id: 'SpiralGrid_Castings',
      name: 'Spirale NFT Castings',
      type: 'spiral',
      contentTypes: ['NFT'],
      priority: 1,
      enabled: true,
      description: 'Déploiement en spirale depuis le centre',
      maxItems: 12,
      spiralConfig: {
        centerX: 16,
        centerY: 16,
        direction: 'clockwise',
        startDirection: 'right',
        skipOccupied: true
      }
    },
    {
      id: 'InfoIntercalation',
      name: 'Intercalation INFO',
      type: 'random',
      contentTypes: ['INFO'],
      priority: 2,
      enabled: true,
      description: 'Intercalation aléatoire dans la grille active',
      maxItems: 3
    },
    {
      id: 'Container_Audio',
      name: 'Containers Audio',
      type: 'random',
      contentTypes: ['AUDIO'],
      priority: 3,
      enabled: true,
      description: 'Placement audio dans zones inactives',
      maxItems: 5
    }
  ];

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'NFT': return '#10B981'; // Vert
      case 'INFO': return '#3B82F6'; // Bleu
      case 'AUDIO': return '#F59E0B'; // Orange
      default: return '#F3F4F6'; // Gris
    }
  };

  const generate32x32Preview = () => {
    setIsGenerating(true);
    
    // Initialiser grille 32x32 vide (1024 cellules)
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
    const infoRules = enabledRules.filter(rule => rule.contentTypes.includes('INFO'));
    const audioRules = enabledRules.filter(rule => rule.contentTypes.includes('AUDIO'));
    
    const activeGridPositions = new Set<number>();

    console.log('🎯 Génération grille 32x32 native avec algorithme 2 phases');

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
                  marketOrder: index + 1,
                  realContainer: null // TODO: Connecter aux vrais containers du BO
                }
              };
              activeGridPositions.add(gridIndex);
              console.log(`✅ NFT ${index + 1} placé en (${pos.x}, ${pos.y})`);
            }
          }
        });
      }
    });

    // PHASE 2: Intercaler les INFO dans la Grille Active
    infoRules.forEach(rule => {
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
              
              // Déplacer le NFT
              grid32[pushPosition] = { ...grid32[targetPosition] };
              activeGridPositions.add(pushPosition);
              
              // Placer l'INFO
              grid32[targetPosition] = {
                id: targetPosition,
                type: 'info',
                position: { x: targetX, y: targetY },
                containerId: `info-${rule.id}-${i}`,
                containerData: {
                  title: `INFO ${i + 1}`,
                  source: rule.name,
                  marketOrder: i + 1,
                  realContainer: null // TODO: Connecter aux vrais containers du BO
                }
              };
              
              console.log(`📘 INFO ${i + 1} intercalé, NFT poussé de ${targetPosition} vers ${pushPosition}`);
            }
          }
        }
      }
    });

    // PHASE 3: Placer les AUDIO dans la Grille Inactive
    audioRules.forEach(rule => {
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
            marketOrder: i + 1,
            realContainer: null // TODO: Connecter aux vrais containers du BO
          }
        };
        console.log(`🎵 AUDIO ${i + 1} placé en position ${gridIndex}`);
      }
    });

    setNativeGrid32(grid32);
    setIsGenerating(false);
  };

  const toggleRuleSelection = (ruleId: string) => {
    setSelectedDeploymentRules(prev => 
      prev.includes(ruleId) 
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  // Générer grille initiale
  useEffect(() => {
    generate32x32Preview();
  }, [selectedDeploymentRules]);

  // Statistiques de la grille
  const nftCount = nativeGrid32.filter(cell => cell.type === 'nft').length;
  const infoCount = nativeGrid32.filter(cell => cell.type === 'info').length;
  const audioCount = nativeGrid32.filter(cell => cell.type === 'audio').length;
  const emptyCount = nativeGrid32.filter(cell => cell.type === 'empty').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="flex items-center text-blue-600 hover:text-blue-700 mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour Admin
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Grille 32x32 Native - Distribution Containers
            </h1>
            <p className="text-gray-600 mt-1">
              Grille native 32x32 avec connexion aux containers réels du Back-Office
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={generate32x32Preview}
              disabled={isGenerating}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
            >
              {isGenerating ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isGenerating ? 'Génération...' : 'Régénérer'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Panneau gauche: Règles */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Règles Actives
              </h3>
              <div className="space-y-2">
                {deploymentRules.map(rule => (
                  <label key={rule.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDeploymentRules.includes(rule.id)}
                      onChange={() => toggleRuleSelection(rule.id)}
                      className="rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                      <div className="text-xs text-gray-500">{rule.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-900 mb-3">Statistiques</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">NFT:</span>
                  <span className="font-medium">{nftCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">INFO:</span>
                  <span className="font-medium">{infoCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-600">AUDIO:</span>
                  <span className="font-medium">{audioCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vides:</span>
                  <span className="font-medium">{emptyCount}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>1024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grille 32x32 Native */}
          <div className="col-span-2 bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Grid3X3 className="w-4 h-4 mr-2" />
                Grille 32x32 Native
              </h3>
              <div className="text-xs text-gray-500">
                Cellules 8x8px • Connexion containers réels
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden bg-gray-50 p-2">
              <div 
                className="grid gap-px bg-gray-200"
                style={{ 
                  gridTemplateColumns: 'repeat(32, 1fr)',
                  width: '512px',
                  height: '512px'
                }}
              >
                {nativeGrid32.map((cell) => (
                  <div
                    key={cell.id}
                    className="relative group"
                    style={{
                      backgroundColor: cell.type === 'empty' ? '#F3F4F6' : getContentTypeColor(
                        cell.type === 'nft' ? 'NFT' : 
                        cell.type === 'info' ? 'INFO' : 'AUDIO'
                      ),
                      width: '15px',
                      height: '15px',
                      fontSize: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cell.type === 'empty' ? 'transparent' : 'white',
                      fontWeight: 'bold'
                    }}
                    title={cell.containerData ? 
                      `${cell.containerData.title} • Position: ${cell.position.x},${cell.position.y} • Source: ${cell.containerData.source}` :
                      `Position: ${cell.position.x},${cell.position.y}`
                    }
                  >
                    {cell.containerData?.marketOrder || ''}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panneau droite: Détails containers */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Containers Actifs
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {nativeGrid32
                  .filter(cell => cell.type !== 'empty')
                  .sort((a, b) => (a.containerData?.marketOrder || 0) - (b.containerData?.marketOrder || 0))
                  .map((cell) => (
                    <div 
                      key={cell.id} 
                      className="p-2 border rounded text-xs"
                      style={{ borderColor: getContentTypeColor(
                        cell.type === 'nft' ? 'NFT' : 
                        cell.type === 'info' ? 'INFO' : 'AUDIO'
                      )}}
                    >
                      <div className="font-medium">{cell.containerData?.title}</div>
                      <div className="text-gray-500">
                        Position: {cell.position.x},{cell.position.y}
                      </div>
                      <div className="text-gray-500">
                        ID: {cell.containerId}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Connexion BO</h4>
              <p className="text-sm text-blue-700">
                Chaque container peut être connecté aux données réelles du Back-Office pour une preview comportementale authentique.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}