import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Settings, ChevronDown, ChevronUp, GripVertical, Save, X } from 'lucide-react';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AdminLayoutTemplate } from '@/components/admin/AdminLayoutTemplate';
import { GridPreview5x5 } from '@/components/admin/GridPreview5x5';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAdminCursor } from '@/hooks/useCursorBlocking';

type ContainerState = 'closed' | 'open' | 'panel';

interface ContainerType {
  id: number;
  name: string;
  description: string;
  layerConfig: {
    visual: Array<{ name: string; active: boolean; effects?: any[] }>;
    actions: Array<{ name: string; active: boolean; zones?: any[] }>;
  };
  isActive: boolean;
}

export default function ContainerLayersV3Page() {
  const [selectedState, setSelectedState] = useState<ContainerState>('closed');
  const [selectedContainerType, setSelectedContainerType] = useState<ContainerType | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Activer le curseur admin centralisé
  useAdminCursor(true);

  // Requête pour récupérer les types de containers
  const containerTypesQuery = useQuery({
    queryKey: ['/api/container-layer-configurations'],
    queryFn: () => fetch('/api/container-layer-configurations').then(res => res.json())
  });

  // Mutation pour sauvegarder la configuration
  const saveConfigMutation = useMutation({
    mutationFn: async (configData: any) => {
      const response = await fetch('/api/container-layer-configurations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });
      if (!response.ok) throw new Error('Erreur de sauvegarde');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuration sauvegardée",
        description: "Les couches et zones d'interaction ont été sauvegardées en BDD"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/container-layer-configurations'] });
    },
    onError: () => {
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    }
  });

  // Mutation pour sauvegarder les zones granulaires
  const saveZonesMutation = useMutation({
    mutationFn: async ({ configId, actionName, containerState, zones }: any) => {
      const response = await fetch(`/api/container-layer-configurations/${configId}/interaction-zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionName, containerState, zones })
      });
      if (!response.ok) throw new Error('Erreur de sauvegarde des zones');
      return response.json();
    }
  });

  // Conversion des zones sélectionnées en format BDD
  const convertSelectedZonesToDatabase = (selectedZones: boolean[], gridSize: number) => {
    const zones = [];
    const cols = 8;
    const rows = gridSize / 8;
    
    for (let i = 0; i < selectedZones.length; i++) {
      if (selectedZones[i]) {
        const x = i % cols;
        const y = Math.floor(i / cols);
        zones.push({
          id: `zone-${i}`,
          x,
          y,
          width: 1,
          height: 1,
          gridSize
        });
      }
    }
    return zones;
  };

  // Conversion pour la preview en temps réel
  const convertSelectedZonesToInteractionZones = (selectedZones: boolean[], containerState: ContainerState) => {
    if (!selectedZones) return [];
    
    const zones = [];
    const cols = 8;
    const gridSize = containerState === 'closed' ? 64 : containerState === 'open' ? 128 : 96;
    
    for (let i = 0; i < selectedZones.length; i++) {
      if (selectedZones[i]) {
        const x = i % cols;
        const y = Math.floor(i / cols);
        zones.push({
          id: `zone-${i}`,
          x,
          y,
          width: 1,
          height: 1
        });
      }
    }
    return zones;
  };

  // Fonction de sauvegarde complète
  const handleSaveConfiguration = async () => {
    try {
      // 1. Sauvegarder la configuration principale
      const layerConfig = {
        visual: visualLayers.map(layer => ({
          name: layer.name,
          active: layer.active,
          effects: layer.effects
        })),
        actions: actionZones.map(zone => ({
          name: zone.name,
          active: zone.active,
          zones: []
        }))
      };

      const configData = {
        name: `Configuration Container V3 - ${new Date().toISOString()}`,
        description: `Configuration générée depuis ContainerLayersV3Page`,
        layerConfig
      };

      const savedConfig = await saveConfigMutation.mutateAsync(configData);

      // 2. Sauvegarder toutes les zones granulaires pour chaque action/état
      for (const zone of actionZones) {
        if (zone.active) {
          for (const state of ['closed', 'open', 'panel'] as ContainerState[]) {
            const zones = selectedZones[zone.name]?.[state];
            if (zones && zones.some(z => z)) {
              const gridSize = state === 'closed' ? 64 : state === 'open' ? 128 : 96;
              const convertedZones = convertSelectedZonesToDatabase(zones, gridSize);
              
              await saveZonesMutation.mutateAsync({
                configId: savedConfig.id,
                actionName: zone.name,
                containerState: state,
                zones: convertedZones
              });
            }
          }
        }
      }

      toast({
        title: "Sauvegarde complète",
        description: `Configuration sauvegardée avec ID: ${savedConfig.id}`
      });

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };
  
  // Configuration layers selon vos maquettes avec couleurs exactes
  const [visualLayers, setVisualLayers] = useState([
    { name: 'txt', label: 'TXT', color: '#000000', zIndex: 6, active: true, expanded: false, effects: [] as any[] },
    { name: 'overlay', label: 'OVERLAY', color: '#5D9CEC', zIndex: 5, active: true, expanded: false, effects: [] as any[] },
    { name: 'pic', label: 'PIC', color: '#5D9CEC', zIndex: 4, active: true, expanded: false, effects: [] as any[] },
    { name: 'audio', label: 'AUDIO', color: '#5D9CEC', zIndex: 3, active: true, expanded: false, effects: [] as any[] },
    { name: 'video', label: 'VIDEO', color: '#5D9CEC', zIndex: 2, active: true, expanded: false, effects: [] as any[] },
    { name: 'card', label: 'CARD', color: '#000000', zIndex: 1, active: true, expanded: false, effects: [] as any[] }
  ]);

  const [actionZones, setActionZones] = useState([
    { name: 'comp', label: 'COMP', color: '#5D9CEC', active: true, expanded: false },
    { name: 'open', label: 'OPEN', color: '#22C55E', active: true, expanded: false },
    { name: 'close', label: 'CLOSE', color: '#E11D48', active: true, expanded: false },
    { name: 'hover', label: 'HOVER', color: '#06B6D4', active: true, expanded: false },
    { name: 'grab', label: 'GRAB', color: '#6B7280', active: true, expanded: false }
  ]);

  const [selectedZones, setSelectedZones] = useState<{[key: string]: {[key: string]: boolean[]}}>({
    comp: {
      closed: new Array(64).fill(false),  // 8x8 = 64 zones (ONE)
      open: new Array(128).fill(false),   // 8x16 = 128 zones (ONEONE)  
      panel: new Array(96).fill(false)    // 8x12 = 96 zones (ONEHALF)
    },
    open: {
      closed: new Array(64).fill(false),
      open: new Array(128).fill(false),
      panel: new Array(96).fill(false)
    },
    close: {
      closed: new Array(64).fill(false),
      open: new Array(128).fill(false),
      panel: new Array(96).fill(false)
    },
    hover: {
      closed: new Array(64).fill(false),
      open: new Array(128).fill(false),
      panel: new Array(96).fill(false)
    },
    grab: {
      closed: new Array(64).fill(false),
      open: new Array(128).fill(false),
      panel: new Array(96).fill(false)
    }
  });

  const toggleLayer = (type: 'visual' | 'action', index: number) => {
    if (type === 'visual') {
      setVisualLayers(prev => prev.map((layer, i) => 
        i === index ? { ...layer, active: !layer.active } : layer
      ));
    } else {
      setActionZones(prev => prev.map((zone, i) => 
        i === index ? { ...zone, active: !zone.active } : zone
      ));
    }
  };

  const toggleExpanded = (type: 'visual' | 'action', index: number) => {
    if (type === 'visual') {
      setVisualLayers(prev => prev.map((layer, i) => 
        i === index ? { ...layer, expanded: !layer.expanded } : layer
      ));
    } else {
      setActionZones(prev => prev.map((zone, i) => 
        i === index ? { ...zone, expanded: !zone.expanded } : zone
      ));
    }
  };

  // Ajout d'un effet à un layer
  const addEffect = (layerIndex: number) => {
    const newLayers = [...visualLayers] as any[];
    const newEffect = {
      id: Date.now(),
      type: 'none',
      actionZone: 'hover',
      params: {}
    };
    newLayers[layerIndex].effects.push(newEffect);
    setVisualLayers(newLayers);
  };

  // Suppression d'un effet
  const removeEffect = (layerIndex: number, effectIndex: number) => {
    const newLayers = [...visualLayers] as any[];
    newLayers[layerIndex].effects.splice(effectIndex, 1);
    setVisualLayers(newLayers);
  };

  // Mise à jour d'un effet
  const updateEffect = (layerIndex: number, effectIndex: number, updates: any) => {
    const newLayers = [...visualLayers] as any[];
    newLayers[layerIndex].effects[effectIndex] = {
      ...newLayers[layerIndex].effects[effectIndex],
      ...updates
    };
    setVisualLayers(newLayers);
  };

  // Configuration des effets disponibles par layer
  const getAvailableEffects = (layerName: string) => {
    const baseEffects = [
      { value: 'none', label: 'Aucun effet' },
      { value: 'fade', label: 'Effet Fade' },
      { value: 'slide', label: 'Effet Slide' }
    ];
    
    if (layerName === 'pic') {
      return [
        ...baseEffects,
        { value: 'zoomHover', label: 'ZoomHover (v1)' },
        { value: 'imageFilter', label: 'Traitement Image' }
      ];
    }
    
    if (layerName === 'audio') {
      return [
        ...baseEffects,
        { value: 'volumeFade', label: 'Volume Fade' },
        { value: 'autoPlay', label: 'Auto Play' }
      ];
    }
    
    return baseEffects;
  };

  // Rendu des paramètres selon le type d'effet
  const renderEffectParams = (effect: any, layerIndex: number, effectIndex: number) => {
    switch (effect.type) {
      case 'zoomHover':
        return (
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <label className="block text-xs admin-programmatic mb-1">Scale</label>
              <input 
                type="number" 
                step="0.1" 
                min="1" 
                max="5"
                value={effect.params.scale || 3.0}
                onChange={(e) => updateEffect(layerIndex, effectIndex, {
                  params: { ...effect.params, scale: parseFloat(e.target.value) }
                })}
                className="w-full p-1 border rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs admin-programmatic mb-1">Durée (s)</label>
              <input 
                type="number" 
                step="0.1" 
                min="0.5" 
                max="3"
                value={effect.params.duration || 1.5}
                onChange={(e) => updateEffect(layerIndex, effectIndex, {
                  params: { ...effect.params, duration: parseFloat(e.target.value) }
                })}
                className="w-full p-1 border rounded text-xs"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs admin-programmatic mb-1">Point d'origine</label>
              <input 
                type="text" 
                placeholder="24% 50%"
                value={effect.params.origin || '24% 50%'}
                onChange={(e) => updateEffect(layerIndex, effectIndex, {
                  params: { ...effect.params, origin: e.target.value }
                })}
                className="w-full p-1 border rounded text-xs"
              />
            </div>
          </div>
        );
      
      case 'imageFilter':
        return (
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <label className="block text-xs admin-programmatic mb-1">Luminosité</label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1"
                value={effect.params.brightness || 1}
                onChange={(e) => updateEffect(layerIndex, effectIndex, {
                  params: { ...effect.params, brightness: parseFloat(e.target.value) }
                })}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{effect.params.brightness || 1}</span>
            </div>
            <div>
              <label className="block text-xs admin-programmatic mb-1">Contraste</label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1"
                value={effect.params.contrast || 1}
                onChange={(e) => updateEffect(layerIndex, effectIndex, {
                  params: { ...effect.params, contrast: parseFloat(e.target.value) }
                })}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{effect.params.contrast || 1}</span>
            </div>
          </div>
        );
      
      case 'fade':
        return (
          <div className="mt-2">
            <label className="block text-xs admin-programmatic mb-1">Durée (ms)</label>
            <input 
              type="number" 
              min="100" 
              max="2000"
              value={effect.params.duration || 300}
              onChange={(e) => updateEffect(layerIndex, effectIndex, {
                params: { ...effect.params, duration: parseInt(e.target.value) }
              })}
              className="w-full p-1 border rounded text-xs"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  // Composant grille granulaire conditionnée par mode
  const GridSelector = ({ zoneName, zones, onChange }: {
    zoneName: string;
    zones: boolean[];
    onChange: (zones: boolean[]) => void;
  }) => {
    const toggleZone = (index: number) => {
      const newZones = [...zones];
      newZones[index] = !newZones[index];
      onChange(newZones);
    };

    // Configuration grille selon l'état sélectionné
    const getGridConfig = () => {
      switch(selectedState) {
        case 'closed':
          return { cols: 8, rows: 8, cellSize: 16, width: 128, height: 128, label: 'ONE (8x8)' };
        case 'open':
          return { cols: 8, rows: 16, cellSize: 16, width: 128, height: 256, label: 'ONEONE (8x16)' };
        case 'panel':
          return { cols: 8, rows: 12, cellSize: 16, width: 128, height: 192, label: 'ONEHALF (8x12)' };
        default:
          return { cols: 8, rows: 8, cellSize: 16, width: 128, height: 128, label: 'ONE (8x8)' };
      }
    };

    const config = getGridConfig();

    const selectAll = () => {
      const newZones = new Array(zones.length).fill(true);
      onChange(newZones);
    };

    const selectNone = () => {
      const newZones = new Array(zones.length).fill(false);
      onChange(newZones);
    };

    return (
      <div className="flex flex-col items-center">
        <div className="text-xs admin-programmatic mb-2">
          Grille {config.label} - État: {selectedState.toUpperCase()}
        </div>
        
        {/* Boutons de sélection */}
        <div className="flex space-x-2 mb-3">
          <button
            onClick={selectAll}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Tout sélectionner
          </button>
          <button
            onClick={selectNone}
            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Tout désélectionner
          </button>
        </div>
        
        <div 
          className="grid gap-px p-3 bg-gray-200 rounded border"
          style={{
            gridTemplateColumns: `repeat(${config.cols}, ${config.cellSize}px)`,
            width: `${config.width + 24}px`, // +24 pour padding
            height: `${config.height + 24}px`,
            minWidth: `${config.width + 24}px`,
            minHeight: `${config.height + 24}px`,
            maxWidth: `${config.width + 24}px`,
            maxHeight: `${config.height + 24}px`
          }}
        >
          {zones.map((active, index) => (
            <button
              key={index}
              onClick={() => toggleZone(index)}
              className={`border transition-all ${
                active 
                  ? 'bg-blue-500 border-blue-600' 
                  : 'bg-white border-gray-300 hover:bg-gray-100'
              }`}
              style={{
                width: `${config.cellSize}px`,
                height: `${config.cellSize}px`,
                fontSize: '8px'
              }}
              title={`Zone ${index} (${Math.floor(index / config.cols)}, ${index % config.cols})`}
            >
              {active ? '●' : ''}
            </button>
          ))}
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          {zones.filter(z => z).length} zones sélectionnées sur {zones.length}
        </div>
      </div>
    );
  };

  // Section layers visuels avec tiroirs
  const visualLayersSection = (
    <div className="bg-white rounded-lg p-6 shadow border">
      <h3 className="admin-h2 mb-4">LAYERS VISUELS, TXT & COMP (Z)</h3>
      
      <div className="space-y-2">
        {visualLayers.map((layer, index) => (
          <div key={layer.name} className="border rounded-lg overflow-hidden">
            {/* Header du layer */}
            <div className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
              <GripVertical className="w-4 h-4 text-gray-400 mr-2" />
              
              <div 
                className="w-4 h-4 rounded mr-3 border"
                style={{ backgroundColor: layer.active ? layer.color : '#e5e7eb' }}
              />
              
              <span className="admin-rule-name flex-1" style={{ color: layer.color }}>
                {layer.label}
              </span>
              
              <span className="programmatic-tag mr-2">Z{layer.zIndex}</span>
              
              <button
                onClick={() => toggleLayer('visual', index)}
                className="mr-2 p-1 hover:bg-gray-200 rounded"
              >
                {layer.active ? (
                  <Eye className="w-4 h-4" style={{ color: layer.color }} />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              <button
                onClick={() => toggleExpanded('visual', index)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            {/* Tiroir expandable */}
            {layer.expanded && (
              <div className="p-4 bg-white border-t">
                <div className="text-sm admin-programmatic mb-3">
                  Configuration {layer.label}
                </div>
                
                {/* Liste des effets */}
                <div className="space-y-3">
                  {layer.effects.map((effect: any, effectIndex: number) => (
                    <div key={effect.id} className="border rounded p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold admin-programmatic">
                          Effet #{effectIndex + 1}
                        </span>
                        <button
                          onClick={() => removeEffect(index, effectIndex)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕ Supprimer
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {/* Sélection du type d'effet */}
                        <div>
                          <label className="block text-xs admin-programmatic mb-1">Type d'effet</label>
                          <select 
                            value={effect.type}
                            onChange={(e) => updateEffect(index, effectIndex, { type: e.target.value })}
                            className="w-full p-1 border rounded admin-select text-xs"
                          >
                            {getAvailableEffects(layer.name).map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Sélection de l'action zone */}
                        <div>
                          <label className="block text-xs admin-programmatic mb-1">Action Zone</label>
                          <select 
                            value={effect.actionZone}
                            onChange={(e) => updateEffect(index, effectIndex, { actionZone: e.target.value })}
                            className="w-full p-1 border rounded admin-select text-xs"
                          >
                            {actionZones.map(zone => (
                              <option key={zone.name} value={zone.name}>{zone.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {/* Paramètres contextuels */}
                      {effect.type !== 'none' && renderEffectParams(effect, index, effectIndex)}
                    </div>
                  ))}
                  
                  {/* Bouton d'ajout d'effet */}
                  <button
                    onClick={() => addEffect(index)}
                    className="w-full p-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm admin-programmatic"
                  >
                    + Ajouter un effet
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Section action zones avec tiroirs et grille 8x16
  const actionZonesSection = (
    <div className="bg-white rounded-lg p-6 shadow border">
      <h3 className="admin-h2 mb-4">ACTION ZONES (Z)</h3>
      
      <div className="space-y-2">
        {actionZones.map((zone, index) => (
          <div key={zone.name} className="border rounded-lg overflow-hidden">
            {/* Header de la zone */}
            <div className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div 
                className="w-4 h-4 rounded mr-3 border"
                style={{ backgroundColor: zone.active ? zone.color : '#e5e7eb' }}
              />
              
              <span className="admin-rule-name flex-1" style={{ color: zone.color }}>
                {zone.label}
              </span>
              
              <button
                onClick={() => toggleLayer('action', index)}
                className="mr-2 p-1 hover:bg-gray-200 rounded"
              >
                {zone.active ? (
                  <Eye className="w-4 h-4" style={{ color: zone.color }} />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              <button
                onClick={() => toggleExpanded('action', index)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {zone.expanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
            
            {/* Tiroir avec grille de sélection 8x16 */}
            {zone.expanded && (
              <div className="p-4 bg-white border-t">
                <div className="text-sm admin-programmatic mb-3">
                  Sélection zones {zone.label} - Mode: {selectedState.toUpperCase()}
                </div>
                <GridSelector
                  zoneName={zone.name}
                  zones={selectedZones[zone.name][selectedState]}
                  onChange={(zones) => setSelectedZones(prev => ({
                    ...prev,
                    [zone.name]: {
                      ...prev[zone.name],
                      [selectedState]: zones
                    }
                  }))}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Onglets d'état
  const stateTabsSection = (
    <div className="bg-white rounded-lg p-6 shadow border mb-6">
      <div className="flex space-x-1 mb-4">
        {(['closed', 'open', 'panel'] as ContainerState[]).map((state) => (
          <button
            key={state}
            onClick={() => setSelectedState(state)}
            className={`px-4 py-2 rounded transition-colors ${
              selectedState === state
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {state === 'closed' ? 'FERMÉ' : state === 'open' ? 'OUVERT' : 'PANEL'}
          </button>
        ))}
      </div>
      
      <div className="text-sm admin-programmatic">
        Configuration pour l'état : <span className="font-semibold">{selectedState.toUpperCase()}</span>
      </div>
    </div>
  );

  // Preview avec grille 5x5 utilisant le modèle admin-preview-5x5
  const previewSection = (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="admin-h2 mb-4">PREVIEW - Grille 5x5 (Modèle admin-preview-5x5)</h3>
      
      <GridPreview5x5 
        selectedState={selectedState}
        selectedZones={selectedZones}
        layerConfig={{
          visual: visualLayers.map(layer => ({
            name: layer.name,
            active: layer.active,
            color: layer.color,
            expanded: layer.expanded,
            effects: layer.effects
          })),
          actions: actionZones.map(zone => ({
            name: zone.name,
            active: zone.active,
            color: zone.color,
            expanded: zone.expanded,
            zones: selectedZones[zone.name] ? 
              convertSelectedZonesToInteractionZones(selectedZones[zone.name][selectedState], selectedState) : 
              []
          }))
        }}
      />
      
      <div className="mt-4 space-y-3">
        <div className="flex justify-center">
          <button
            onClick={handleSaveConfiguration}
            disabled={saveConfigMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saveConfigMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder en BDD'}
          </button>
        </div>
        
        <div className="text-center">
          <div className="text-sm admin-programmatic">
            Zones granulaires converties en interactions codées
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Preview temps réel • État: {selectedState.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );

  const leftColumn = (
    <div className="space-y-6">
      {stateTabsSection}
      {visualLayersSection}
      {actionZonesSection}
    </div>
  );

  // Fenêtre contextuelle de sélection des types de containers
  const containerTypeSelector = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Sélectionner un Type de Container</h3>
          <button
            onClick={() => setShowTypeSelector(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Choisissez le modèle de container à administrer pour configurer ses couches et zones d'interaction.
        </p>
        
        {containerTypesQuery.isLoading ? (
          <div className="text-center py-4">Chargement des types de containers...</div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {Array.isArray(containerTypesQuery.data) && containerTypesQuery.data.map((type: ContainerType) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedContainerType(type);
                  setShowTypeSelector(false);
                }}
                className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">{type.name}</div>
                <div className="text-sm text-gray-500">{type.description}</div>
                <div className="text-xs text-blue-600 mt-1">
                  {type.layerConfig?.visual?.length || 0} couches visuelles • {type.layerConfig?.actions?.length || 0} actions
                </div>
              </button>
            ))}
          </div>
        )}
        
        {containerTypesQuery.data?.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            Aucun type de container disponible. Créez-en un dans la section Types de Container.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AdminCursorProvider>
      {showTypeSelector && containerTypeSelector}
      <AdminLayoutTemplate leftColumn={leftColumn}>
        <AdminHeaderTemplate 
          title={selectedContainerType 
            ? `Configuration Layers - ${selectedContainerType.name}` 
            : "Container Layers V3 - Configuration Avancée"
          } 
        />
        {selectedContainerType ? (
          <div>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">
                Modèle actif: {selectedContainerType.name}
              </div>
              <div className="text-xs text-blue-700">
                {selectedContainerType.description}
              </div>
              <button
                onClick={() => setShowTypeSelector(true)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
              >
                Changer de modèle
              </button>
            </div>
            {previewSection}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Sélectionnez un type de container pour commencer la configuration.
          </div>
        )}
      </AdminLayoutTemplate>
    </AdminCursorProvider>
  );
}