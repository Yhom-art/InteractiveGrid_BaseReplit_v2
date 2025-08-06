import React, { useState } from 'react';
import { Layers, Eye, Target, Settings, Plus, Square, Grid, Palette, Zap, Upload } from 'lucide-react';

import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { useToast } from '@/hooks/use-toast';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { ContainerExpansionType } from '@/components/FluidGrid/types';

// Types exhaustifs pour l'administration
type ContainerNFTType = 'FREE' | 'ADOPT' | 'ADOPTED' | 'EDITORIAL' | 'AUDIO' | 'INFO' | 'VIDEO';
type ContainerState = 'closed' | 'open' | 'panel';

// Layer visuel d'un container
type VisualLayer = {
  id: string;
  name: string;
  zIndex: number;
  enabled: boolean;
  visibleInState: ContainerState[];
  description: string;
  cssClass?: string;
  backgroundColor?: string;
  opacity?: number;
  animation?: string;
  textContent?: string;
  imageUrl?: string;
};

// Zone d'interaction
type InteractionZone = {
  id: string;
  name: string;
  type: 'click' | 'hover' | 'proximity';
  action: 'open' | 'close' | 'panel' | 'cursor' | 'play' | 'pause';
  size: { width: number; height: number };
  position: { x: number; y: number };
  enabled: boolean;
  cursorType?: string;
  activeInStates: ContainerState[];
  description: string;
  animation?: string;
  effect?: string;
};

// Configuration complète d'un type de container
type ContainerTypeConfig = {
  id: string;
  name: string;
  containerType: ContainerNFTType;
  expansionType: ContainerExpansionType;
  dimensions: {
    closed: { width: number; height: number };
    open: { width: number; height: number };
    panel: { width: number; height: number };
  };
  yOffset: number;
  visualLayers: VisualLayer[];
  interactionZones: InteractionZone[];
  enabled: boolean;
  animations?: {
    opening: string;
    closing: string;
    hover: string;
  };
};

// Configuration exhaustive de tous les types
const defaultContainerConfigs: ContainerTypeConfig[] = [
  {
    id: 'nft-free-oneone-up',
    name: 'NFT FREE (Extension Haute)',
    containerType: 'FREE',
    expansionType: ContainerExpansionType.ONEONE_UP,
    dimensions: {
      closed: { width: 128, height: 128 },
      open: { width: 128, height: 260 },
      panel: { width: 400, height: 600 }
    },
    yOffset: -132,
    visualLayers: [
      {
        id: 'layer-pic-nft-free',
        name: 'Layer-PIC',
        zIndex: 10,
        enabled: true,
        visibleInState: ['closed', 'open'],
        description: 'Image NFT de base',
        cssClass: 'w-full h-full object-cover',
        imageUrl: '/placeholder-nft.jpg'
      },
      {
        id: 'layer-overlay-nft-free',
        name: 'Layer-OVERLAY',
        zIndex: 20,
        enabled: true,
        visibleInState: ['closed'],
        description: 'Overlay rose FREE',
        backgroundColor: '#FF26BE',
        opacity: 0.8,
        cssClass: 'absolute inset-0'
      },
      {
        id: 'layer-txt-nft-free',
        name: 'Layer-TXT',
        zIndex: 40,
        enabled: true,
        visibleInState: ['closed', 'open'],
        description: 'Texte FREE / nom chimère',
        cssClass: 'absolute bottom-2 left-2 text-white font-bold text-sm',
        textContent: 'FREE'
      }
    ],
    interactionZones: [
      {
        id: 'nft-free-center-click',
        name: 'Zone Centrale Ouverture',
        type: 'click',
        action: 'open',
        size: { width: 64, height: 64 },
        position: { x: 32, y: 32 },
        enabled: true,
        cursorType: 'meet',
        activeInStates: ['closed'],
        description: 'Zone centrale pour ouvrir container NFT FREE'
      },
      {
        id: 'nft-free-hover-zoom',
        name: 'Zone Hover Zoom',
        type: 'hover',
        action: 'cursor',
        size: { width: 128, height: 128 },
        position: { x: 0, y: 0 },
        enabled: true,
        cursorType: 'meet',
        activeInStates: ['closed'],
        description: 'Zone hover complète pour animation zoom'
      }
    ],
    enabled: true
  },
  {
    id: 'nft-adopt-onehalf-dwn',
    name: 'NFT ADOPT (Extension Mi-Basse)',
    containerType: 'ADOPT',
    expansionType: ContainerExpansionType.ONEHALF_DWN,
    dimensions: {
      closed: { width: 128, height: 128 },
      open: { width: 128, height: 192 },
      panel: { width: 350, height: 500 }
    },
    yOffset: 0,
    visualLayers: [
      {
        id: 'layer-pic-nft-adopt',
        name: 'Layer-PIC',
        zIndex: 10,
        enabled: true,
        visibleInState: ['closed', 'open'],
        description: 'Image NFT floutée',
        cssClass: 'w-full h-full object-cover blur-sm grayscale',
        imageUrl: '/placeholder-nft.jpg'
      },
      {
        id: 'layer-overlay-nft-adopt',
        name: 'Layer-OVERLAY',
        zIndex: 20,
        enabled: true,
        visibleInState: ['closed'],
        description: 'Overlay beige ADOPT',
        backgroundColor: '#E5D1D3',
        opacity: 0.8,
        cssClass: 'absolute inset-0'
      },
      {
        id: 'layer-txt-nft-adopt',
        name: 'Layer-TXT',
        zIndex: 40,
        enabled: true,
        visibleInState: ['closed', 'open'],
        description: 'Texte WHERE IS / ID',
        cssClass: 'absolute inset-0 flex items-center justify-center text-black font-mono text-xs',
        textContent: 'WHERE IS #ID'
      }
    ],
    interactionZones: [
      {
        id: 'nft-adopt-center-click',
        name: 'Zone Centrale Ouverture',
        type: 'click',
        action: 'open',
        size: { width: 80, height: 80 },
        position: { x: 24, y: 24 },
        enabled: true,
        cursorType: 'adopt',
        activeInStates: ['closed'],
        description: 'Zone centrale pour ouvrir container NFT ADOPT'
      }
    ],
    enabled: true
  },
  {
    id: 'nft-adopted-oneone-dwn',
    name: 'NFT ADOPTED (Extension Basse)',
    containerType: 'ADOPTED',
    expansionType: ContainerExpansionType.ONEONE_DWN,
    dimensions: {
      closed: { width: 128, height: 128 },
      open: { width: 128, height: 260 },
      panel: { width: 450, height: 700 }
    },
    yOffset: 0,
    visualLayers: [
      {
        id: 'layer-pic-nft-adopted',
        name: 'Layer-PIC',
        zIndex: 10,
        enabled: true,
        visibleInState: ['closed', 'open'],
        description: 'Image NFT adoptée',
        cssClass: 'w-full h-full object-cover',
        imageUrl: '/placeholder-nft.jpg'
      },
      {
        id: 'layer-txt-nft-adopted',
        name: 'Layer-TXT',
        zIndex: 40,
        enabled: true,
        visibleInState: ['closed'],
        description: 'Nom chimère au survol',
        cssClass: 'absolute bottom-2 left-2 text-white font-bold text-sm opacity-0 hover:opacity-100 transition-opacity',
        textContent: 'CHIMERE NAME'
      },
      {
        id: 'layer-card-nft-adopted',
        name: 'Layer-CARD',
        zIndex: 30,
        enabled: true,
        visibleInState: ['open'],
        description: 'Carte complète adoptée',
        cssClass: 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500/30 to-transparent h-32'
      }
    ],
    interactionZones: [
      {
        id: 'nft-adopted-center-click',
        name: 'Zone Centrale Ouverture',
        type: 'click',
        action: 'open',
        size: { width: 96, height: 96 },
        position: { x: 16, y: 16 },
        enabled: true,
        cursorType: 'meet',
        activeInStates: ['closed'],
        description: 'Zone centrale pour ouvrir container NFT ADOPTED'
      },
      {
        id: 'nft-adopted-hover-name',
        name: 'Zone Hover Nom',
        type: 'hover',
        action: 'cursor',
        size: { width: 128, height: 64 },
        position: { x: 0, y: 64 },
        enabled: true,
        cursorType: 'meet',
        activeInStates: ['closed'],
        description: 'Zone hover pour afficher nom chimère'
      },
      {
        id: 'nft-adopted-close',
        name: 'Zone Fermeture',
        type: 'click',
        action: 'close',
        size: { width: 32, height: 32 },
        position: { x: 96, y: 0 },
        enabled: true,
        cursorType: 'close',
        activeInStates: ['open'],
        description: 'Zone fermeture coin haut-droit'
      }
    ],
    enabled: true
  },
  {
    id: 'audio-container',
    name: 'AUDIO Container',
    containerType: 'AUDIO',
    expansionType: ContainerExpansionType.NONE,
    dimensions: {
      closed: { width: 128, height: 128 },
      open: { width: 128, height: 128 },
      panel: { width: 350, height: 500 }
    },
    yOffset: 0,
    visualLayers: [
      {
        id: 'layer-bg-audio',
        name: 'Layer-BG',
        zIndex: 5,
        enabled: true,
        visibleInState: ['closed', 'open'],
        description: 'Background audio container',
        backgroundColor: '#1f2937',
        cssClass: 'absolute inset-0 rounded-lg'
      },
      {
        id: 'layer-waveform-audio',
        name: 'Layer-WAVEFORM',
        zIndex: 10,
        enabled: true,
        visibleInState: ['closed', 'open'],
        description: 'Waveform visualization',
        cssClass: 'absolute inset-4 flex items-center justify-center'
      },
      {
        id: 'layer-title-audio',
        name: 'Layer-TITLE',
        zIndex: 40,
        enabled: true,
        visibleInState: ['closed', 'open'],
        description: 'Titre audio',
        cssClass: 'absolute top-2 left-2 text-white text-xs font-medium',
        textContent: 'AUDIO TITLE'
      }
    ],
    interactionZones: [
      {
        id: 'audio-play-pause',
        name: 'Zone Play/Pause',
        type: 'click',
        action: 'play',
        size: { width: 80, height: 80 },
        position: { x: 24, y: 24 },
        enabled: true,
        cursorType: 'info',
        activeInStates: ['closed'],
        description: 'Zone centrale pour play/pause audio'
      }
    ],
    enabled: true
  },
  {
    id: 'info-container',
    name: 'INFO Container',
    containerType: 'INFO',
    expansionType: ContainerExpansionType.NONE,
    dimensions: {
      closed: { width: 128, height: 128 },
      open: { width: 128, height: 128 },
      panel: { width: 400, height: 600 }
    },
    yOffset: 0,
    visualLayers: [
      {
        id: 'layer-bg-info',
        name: 'Layer-BG',
        zIndex: 5,
        enabled: true,
        visibleInState: ['closed', 'open'],
        description: 'Background info container',
        backgroundColor: '#3b82f6',
        cssClass: 'absolute inset-0 rounded-lg'
      },
      {
        id: 'layer-icon-info',
        name: 'Layer-ICON',
        zIndex: 20,
        enabled: true,
        visibleInState: ['closed', 'open'],
        description: 'Icône information',
        cssClass: 'absolute inset-0 flex items-center justify-center text-white text-4xl'
      }
    ],
    interactionZones: [
      {
        id: 'info-click',
        name: 'Zone Click Info',
        type: 'click',
        action: 'panel',
        size: { width: 128, height: 128 },
        position: { x: 0, y: 0 },
        enabled: true,
        cursorType: 'info',
        activeInStates: ['closed'],
        description: 'Zone complète pour ouvrir panel info'
      }
    ],
    enabled: true
  },
  {
    id: 'video-container',
    name: 'VIDEO Container',
    containerType: 'VIDEO',
    expansionType: ContainerExpansionType.NONE,
    dimensions: {
      closed: { width: 128, height: 128 },
      open: { width: 128, height: 128 },
      panel: { width: 500, height: 400 }
    },
    yOffset: 0,
    visualLayers: [
      {
        id: 'layer-thumbnail-video',
        name: 'Layer-THUMBNAIL',
        zIndex: 10,
        enabled: true,
        visibleInState: ['closed', 'open'],
        description: 'Thumbnail vidéo',
        cssClass: 'w-full h-full object-cover',
        imageUrl: '/placeholder-video.jpg'
      },
      {
        id: 'layer-overlay-video',
        name: 'Layer-OVERLAY',
        zIndex: 20,
        enabled: true,
        visibleInState: ['closed'],
        description: 'Overlay sombre avec play button',
        backgroundColor: '#000000',
        opacity: 0.4,
        cssClass: 'absolute inset-0'
      },
      {
        id: 'layer-play-video',
        name: 'Layer-PLAY',
        zIndex: 30,
        enabled: true,
        visibleInState: ['closed'],
        description: 'Bouton play central',
        cssClass: 'absolute inset-0 flex items-center justify-center text-white text-3xl'
      }
    ],
    interactionZones: [
      {
        id: 'video-play',
        name: 'Zone Play Vidéo',
        type: 'click',
        action: 'panel',
        size: { width: 128, height: 128 },
        position: { x: 0, y: 0 },
        enabled: true,
        cursorType: 'info',
        activeInStates: ['closed'],
        description: 'Zone complète pour ouvrir panel vidéo'
      }
    ],
    enabled: true
  }
];

export default function ContainerLayersAdminPage() {
  const { toast } = useToast();
  const [containerConfigs, setContainerConfigs] = useState<ContainerTypeConfig[]>(defaultContainerConfigs);
  const [selectedConfig, setSelectedConfig] = useState<ContainerTypeConfig | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<VisualLayer | null>(null);
  const [selectedState, setSelectedState] = useState<ContainerState>('closed');
  const [activeTab, setActiveTab] = useState<'zones' | 'interactions' | 'panels'>('zones');
  const [debugMode, setDebugMode] = useState(true);
  const [testNFTImage, setTestNFTImage] = useState<string | null>(null);
  const [containerState, setContainerState] = useState<ContainerState>('closed'); // État interactif du container central

  // Configuration grille 6x6 pour voir les panels hauts
  const CONTAINER_SIZE = 128;
  const CONTAINER_GAP = 4;
  const GRID_SIZE = 6;

  // Génération d'une grille de test 6x6
  const generateTestGrid = () => {
    const grid = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const id = row * GRID_SIZE + col;
        const isCenter = row === 2 && col === 2; // Position centrale pour test (2,2 dans grille 6x6)
        grid.push({
          id,
          row,
          col,
          isCenter,
          containerType: isCenter ? selectedConfig?.containerType || 'FREE' : 
            Math.random() > 0.7 ? 'EMPTY' :
            ['FREE', 'ADOPT', 'ADOPTED', 'EDITORIAL', 'AUDIO', 'INFO', 'VIDEO'][Math.floor(Math.random() * 7)]
        });
      }
    }
    return grid;
  };

  const [testGrid] = useState(generateTestGrid());

  // Fonction pour gérer les clics sur les zones d'interaction
  const handleZoneClick = (zone: InteractionZone) => {
    if (!zone.enabled) return;
    
    switch (zone.action) {
      case 'open':
        setContainerState('open');
        toast({ 
          title: "Container ouvert", 
          description: `Zone ${zone.name} activée - Extension ${selectedConfig?.expansionType}` 
        });
        break;
      case 'close':
        setContainerState('closed');
        toast({ 
          title: "Container fermé", 
          description: `Zone ${zone.name} activée` 
        });
        break;
      case 'panel':
        setContainerState('panel');
        toast({ 
          title: "Panel ouvert", 
          description: `Zone ${zone.name} activée - Panel ${selectedConfig?.dimensions.panel.width}×${selectedConfig?.dimensions.panel.height}px` 
        });
        break;
      case 'play':
        toast({ 
          title: "Audio Play", 
          description: `Zone ${zone.name} activée - Lecture audio` 
        });
        break;
      default:
        toast({ 
          title: `Action ${zone.action}`, 
          description: `Zone ${zone.name} activée` 
        });
    }
  };

  const configSections = (
    <>
      {/* Sélection des modèles */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center text-sm admin-h2">
          <Layers className="w-4 h-4 mr-2" />
          Types de Containers
        </h3>
        <div className="space-y-2">
          {containerConfigs.map((config) => (
            <button
              key={config.id}
              onClick={() => setSelectedConfig(config)}
              className={`w-full text-left p-2 rounded text-sm transition-colors ${
                selectedConfig?.id === config.id
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="font-medium admin-programmatic">{config.name}</div>
              <div className="text-xs text-gray-500 admin-dynamic-data">
                {config.containerType} • {config.expansionType}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* État du container */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center text-sm admin-h2">
          <Square className="w-4 h-4 mr-2" />
          État
        </h3>
        <select 
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value as ContainerState)}
          className="w-full p-2 border border-gray-300 rounded admin-dynamic-data"
        >
          <option value="closed">FERMÉ</option>
          <option value="open">OUVERT</option>
          <option value="panel">PANEL</option>
        </select>
      </div>

      {/* Mode d'affichage */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center text-sm admin-h2">
          <Target className="w-4 h-4 mr-2" />
          Mode d'Administration
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('zones')}
            className={`w-full p-2 rounded text-sm transition-colors flex items-center ${
              activeTab === 'zones'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Grid className="w-4 h-4 mr-2" />
            Affichage Zones
          </button>
          <button
            onClick={() => setActiveTab('interactions')}
            className={`w-full p-2 rounded text-sm transition-colors flex items-center ${
              activeTab === 'interactions'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Zap className="w-4 h-4 mr-2" />
            Interactions Dynamiques
          </button>
          <button
            onClick={() => setActiveTab('panels')}
            className={`w-full p-2 rounded text-sm transition-colors flex items-center ${
              activeTab === 'panels'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Palette className="w-4 h-4 mr-2" />
            Administration Panels
          </button>
        </div>
      </div>

      {/* Configuration debug */}
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={debugMode}
            onChange={(e) => setDebugMode(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-900">Mode Debug</label>
        </div>
      </div>

      {/* Upload NFT Test */}
      <div className="bg-white rounded-lg p-4 shadow">
        <button
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => setTestNFTImage(e.target?.result as string);
                reader.readAsDataURL(file);
                toast({ title: "NFT Test uploadé", description: "Image appliquée aux containers de test" });
              }
            };
            input.click();
          }}
          className="w-full p-3 bg-transparent border-2 border-dashed border-green-400 rounded text-sm text-green-600 hover:border-green-500 hover:text-green-700 transition-colors flex items-center justify-center"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload NFT Test
        </button>
        {testNFTImage && (
          <div className="mt-2 text-xs text-green-600 text-center">
            Image chargée ✓
          </div>
        )}
      </div>
    </>
  );

  return (
    <AdminCursorProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4">
          <AdminHeaderTemplate title="CONFIGURATEUR CONTAINERS NFT" />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Colonne gauche - Contrôles */}
            <div className="lg:col-span-1 space-y-4">
              {configSections}
            </div>
            
            {/* Colonne double de droite - Preview */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Grille 4x4 Preview */}
              <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Grid className="w-5 h-5 mr-2" />
                  Grille Test 4×4 • {selectedState.toUpperCase()}
                </h2>
                
                <div className="flex justify-center">
                  <div className="relative p-8 bg-gray-100 rounded-lg">
                    {/* Grille 4x4 simple */}
                    <div 
                      className="grid gap-1"
                      style={{
                        gridTemplateColumns: `repeat(${GRID_SIZE}, ${CONTAINER_SIZE}px)`,
                        gridTemplateRows: `repeat(${GRID_SIZE}, ${CONTAINER_SIZE}px)`,
                        gap: `${CONTAINER_GAP}px`
                      }}
                    >
                      {testGrid.map((cell) => (
                        <div
                          key={cell.id}
                          className={`relative transition-all ${
                            cell.isCenter 
                              ? 'ring-4 ring-blue-500 ring-opacity-50' 
                              : ''
                          }`}
                          style={{
                            width: `${CONTAINER_SIZE}px`,
                            height: cell.isCenter && selectedConfig && containerState !== 'closed'
                              ? `${selectedConfig.dimensions[containerState].height}px`
                              : `${CONTAINER_SIZE}px`,
                            transform: cell.isCenter && selectedConfig && selectedConfig.expansionType === ContainerExpansionType.ONEONE_UP && containerState === 'open'
                              ? `translateY(${selectedConfig.yOffset}px)`
                              : 'none',
                            zIndex: cell.isCenter ? 10 : 1
                          }}
                        >
                          {/* Rendu du container central sélectionné */}
                          {cell.isCenter && selectedConfig ? (
                            <div 
                              className="relative w-full h-full border-2 border-gray-400 bg-white overflow-hidden"
                              data-cursor-type={
                                selectedConfig.containerType === 'FREE' ? 'meet' :
                                selectedConfig.containerType === 'ADOPT' ? 'adopt' :
                                selectedConfig.containerType === 'ADOPTED' ? 'meet' :
                                'info'
                              }
                            >
                              {/* Layers visuels du container sélectionné */}
                              {selectedConfig.visualLayers
                                .filter(layer => layer.visibleInState.includes(containerState))
                                .sort((a, b) => a.zIndex - b.zIndex)
                                .map((layer) => (
                                  <div
                                    key={layer.id}
                                    className={`${layer.cssClass || ''} ${debugMode ? 'border border-dashed' : ''}`}
                                    style={{
                                      zIndex: layer.zIndex,
                                      backgroundColor: layer.backgroundColor || 'transparent',
                                      opacity: layer.opacity || 1,
                                      borderColor: debugMode ? (
                                        layer.name.includes('PIC') || layer.name.includes('THUMBNAIL') ? '#10B981' :
                                        layer.name.includes('OVERLAY') ? '#F59E0B' :
                                        layer.name.includes('TXT') || layer.name.includes('TITLE') ? '#8B5CF6' :
                                        layer.name.includes('BG') ? '#6B7280' :
                                        '#EF4444'
                                      ) : 'transparent'
                                    }}
                                  >
                                    {debugMode && (
                                      <div className="absolute -top-6 left-0 text-xs font-mono bg-black text-white px-1 rounded whitespace-nowrap z-50">
                                        {layer.name} (z:{layer.zIndex})
                                      </div>
                                    )}
                                    
                                    {/* Contenu du layer */}
                                    {layer.textContent && (
                                      <span className="pointer-events-none">
                                        {layer.textContent}
                                      </span>
                                    )}
                                    
                                    {layer.imageUrl && testNFTImage && (
                                      <img 
                                        src={testNFTImage} 
                                        alt="Test NFT" 
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                    
                                    {/* Contenu spécifique par type */}
                                    {selectedConfig.containerType === 'AUDIO' && layer.name === 'Layer-WAVEFORM' && (
                                      <div className="w-full h-8 bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 rounded opacity-60"></div>
                                    )}
                                    {selectedConfig.containerType === 'INFO' && layer.name === 'Layer-ICON' && (
                                      <div className="text-white text-2xl font-bold">i</div>
                                    )}
                                    {selectedConfig.containerType === 'VIDEO' && layer.name === 'Layer-PLAY' && (
                                      <div className="w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                                    )}
                                  </div>
                                ))}
                              
                              {/* Zones d'interaction visibles en mode zones */}
                              {activeTab === 'zones' && selectedConfig.interactionZones
                                .filter(zone => zone.activeInStates.includes(containerState))
                                .map((zone) => (
                                  <div
                                    key={zone.id}
                                    className="absolute border-2 border-dashed rounded opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={() => handleZoneClick(zone)}
                                    style={{
                                      width: `${zone.size.width}px`,
                                      height: `${zone.size.height}px`,
                                      left: `${zone.position.x}px`,
                                      top: `${zone.position.y}px`,
                                      borderColor: 
                                        zone.type === 'click' ? '#EF4444' :
                                        zone.type === 'hover' ? '#F59E0B' :
                                        '#8B5CF6',
                                      backgroundColor: 
                                        zone.type === 'click' ? 'rgba(239, 68, 68, 0.1)' :
                                        zone.type === 'hover' ? 'rgba(245, 158, 11, 0.1)' :
                                        'rgba(139, 92, 246, 0.1)'
                                    }}
                                  >
                                    {debugMode && (
                                      <div className="absolute -top-4 left-0 text-xs font-mono bg-black text-white px-1 rounded whitespace-nowrap z-50">
                                        {zone.name}
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          ) : (
                            /* Containers environnants */
                            <div 
                              className="w-full h-full border border-gray-300 bg-gray-200 flex items-center justify-center text-xs text-gray-500"
                              style={{
                                backgroundColor: 
                                  cell.containerType === 'EMPTY' ? '#f3f4f6' :
                                  cell.containerType === 'FREE' ? '#fdf2f8' :
                                  cell.containerType === 'ADOPT' ? '#fef7ed' :
                                  cell.containerType === 'ADOPTED' ? '#f0fdf4' :
                                  cell.containerType === 'EDITORIAL' ? '#f8fafc' :
                                  cell.containerType === 'AUDIO' ? '#1f2937' :
                                  cell.containerType === 'INFO' ? '#dbeafe' :
                                  cell.containerType === 'VIDEO' ? '#fafafa' :
                                  '#f3f4f6'
                              }}
                            >
                              {cell.containerType !== 'EMPTY' && (
                                <span className={
                                  cell.containerType === 'AUDIO' ? 'text-white' : 'text-gray-600'
                                }>
                                  {cell.containerType}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 text-center text-sm text-gray-600">
                      <div>Grille Native 6×6 • Containers 128×128px • Espacement 4px</div>
                      {selectedConfig && (
                        <div className="mt-1">
                          <strong>{selectedConfig.name}</strong> • {selectedConfig.expansionType} • <span className="font-bold text-blue-600">État: {containerState}</span>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        Cliquez sur les zones colorées pour tester les interactions
                      </div>
                      <div className="mt-2">
                        <button
                          onClick={() => setContainerState('closed')}
                          className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                        >
                          Reset Container
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Administration détaillée */}
              {selectedConfig && (
                <div className="bg-white rounded-lg p-6 shadow">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Administration: {selectedConfig.name} • {activeTab.toUpperCase()}
                  </h2>
                  
                  {activeTab === 'zones' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Layers visuels */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3 admin-h2">Layers Visuels</h3>
                        <div className="space-y-3">
                          {selectedConfig.visualLayers
                            .filter(layer => layer.visibleInState.includes(selectedState))
                            .sort((a, b) => b.zIndex - a.zIndex)
                            .map((layer) => (
                              <div 
                                key={layer.id} 
                                className={`p-3 rounded border cursor-pointer transition-colors ${
                                  selectedLayer?.id === layer.id 
                                    ? 'bg-blue-50 border-blue-300' 
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                                onClick={() => setSelectedLayer(layer)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm admin-rule-name">{layer.name}</span>
                                  <span className="text-xs font-mono text-blue-600">z:{layer.zIndex}</span>
                                </div>
                                <div className="text-xs text-gray-600">{layer.description}</div>
                                {layer.backgroundColor && (
                                  <div className="flex items-center mt-2 space-x-2">
                                    <div 
                                      className="w-4 h-4 rounded border"
                                      style={{ backgroundColor: layer.backgroundColor }}
                                    />
                                    <span className="text-xs font-mono">{layer.backgroundColor}</span>
                                  </div>
                                )}
                                {layer.cssClass && (
                                  <div className="mt-2 text-xs font-mono text-purple-600 truncate">
                                    {layer.cssClass}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Zones d'interaction */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3 admin-h2">Zones d'Interaction</h3>
                        <div className="space-y-3">
                          {selectedConfig.interactionZones
                            .filter(zone => zone.activeInStates.includes(selectedState))
                            .map((zone) => (
                              <div key={zone.id} className="p-3 bg-gray-50 rounded border">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm admin-rule-name">{zone.name}</span>
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    zone.type === 'click' ? 'bg-red-100 text-red-800' :
                                    zone.type === 'hover' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {zone.type}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 mb-2">{zone.description}</div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>Taille: {zone.size.width}×{zone.size.height}px</div>
                                  <div>Position: {zone.position.x},{zone.position.y}</div>
                                  <div>Action: {zone.action}</div>
                                  <div>Curseur: {zone.cursorType}</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'interactions' && (
                    <div className="space-y-6">
                      <div className="text-center text-gray-600">
                        Administration des effets dynamiques, animations et transitions
                      </div>
                    </div>
                  )}

                  {activeTab === 'panels' && (
                    <div className="space-y-6">
                      <div className="text-center text-gray-600">
                        Administration des panels associés aux containers
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </AdminCursorProvider>
  );
}