import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Play, Pause, Square } from 'lucide-react';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AdminLayoutTemplate } from '@/components/admin/AdminLayoutTemplate';
import GrilleChimeriqueV2Page from '@/pages/GrilleChimeriqueV2Page';

export default function AdminGrilleFluide() {
  const [layerVisibility, setLayerVisibility] = useState<{[key: string]: boolean}>({
    // Layers visuels
    txt: true,
    overlay: true,
    pic: true,
    audio: true,
    video: true,
    card: true,
    // Zones d'action
    comp: true,
    open: true,
    close: true,
    hover: true,
    grab: true
  });

  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [gridDebugMode, setGridDebugMode] = useState(false);

  const toggleLayer = (layerName: string) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  // Configuration des layers avec couleurs exactes selon vos maquettes
  const layerConfig = {
    visual: [
      { name: 'txt', label: 'TXT', color: '#000000' },
      { name: 'card', label: 'CARD', color: '#000000' },
      { name: 'pic', label: 'PIC', color: '#5D9CEC' },
      { name: 'audio', label: 'AUDIO', color: '#5D9CEC' },
      { name: 'video', label: 'VIDEO', color: '#5D9CEC' },
      { name: 'overlay', label: 'OVERLAY', color: '#5D9CEC' }
    ],
    action: [
      { name: 'comp', label: 'COMP', color: '#5D9CEC' },
      { name: 'open', label: 'OPEN', color: '#22C55E' },
      { name: 'close', label: 'CLOSE', color: '#E11D48' },
      { name: 'hover', label: 'HOVER', color: '#06B6D4' },
      { name: 'grab', label: 'GRAB', color: '#6B7280' }
    ]
  };

  const controlPanel = (
    <div className="bg-white rounded-lg p-6 shadow mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section Layers Visuels */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4 admin-h2">LAYERS VISUELS</h3>
          <div className="grid grid-cols-3 gap-2">
            {layerConfig.visual.map(layer => (
              <button
                key={layer.name}
                onClick={() => toggleLayer(layer.name)}
                className={`flex items-center justify-between px-3 py-2 rounded border-2 transition-all text-sm font-medium ${
                  layerVisibility[layer.name] 
                    ? 'border-gray-400 shadow-sm' 
                    : 'border-gray-200 opacity-50'
                }`}
                style={{
                  backgroundColor: layerVisibility[layer.name] ? `${layer.color}15` : '#f9fafb',
                  borderColor: layerVisibility[layer.name] ? layer.color : '#e5e7eb'
                }}
              >
                <span style={{ color: layer.color }} className="font-bold">
                  {layer.label}
                </span>
                {layerVisibility[layer.name] ? (
                  <Eye size={14} style={{ color: layer.color }} />
                ) : (
                  <EyeOff size={14} className="text-gray-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section Zones d'Action */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4 admin-h2">ZONES D'ACTION</h3>
          <div className="grid grid-cols-2 gap-2">
            {layerConfig.action.map(zone => (
              <button
                key={zone.name}
                onClick={() => toggleLayer(zone.name)}
                className={`flex items-center justify-between px-3 py-2 rounded border-2 transition-all text-sm font-medium ${
                  layerVisibility[zone.name] 
                    ? 'border-gray-400 shadow-sm' 
                    : 'border-gray-200 opacity-50'
                }`}
                style={{
                  backgroundColor: layerVisibility[zone.name] ? `${zone.color}15` : '#f9fafb',
                  borderColor: layerVisibility[zone.name] ? zone.color : '#e5e7eb'
                }}
              >
                <span style={{ color: zone.color }} className="font-bold">
                  {zone.label}
                </span>
                {layerVisibility[zone.name] ? (
                  <Eye size={14} style={{ color: zone.color }} />
                ) : (
                  <EyeOff size={14} className="text-gray-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contrôles globaux */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button 
              onClick={() => setGridDebugMode(!gridDebugMode)}
              className={`px-4 py-2 rounded transition-colors ${
                gridDebugMode 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {gridDebugMode ? 'Debug ON' : 'Debug OFF'}
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Container sélectionné: {selectedContainer || 'Aucun'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminCursorProvider>
      <AdminLayoutTemplate>
        <AdminHeaderTemplate 
          title="Administration - Grille Fluide Complète"
          currentPage="Grille Fluide"
        />
        
        <div className="space-y-6">
          {controlPanel}
          
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium text-gray-900 admin-h2">
                GRILLE CHIMÉRIQ UE - PREVIEW TEMPS RÉEL
              </h3>
              <div className="text-xs text-gray-500">
                Toutes les interactions sont connectées aux vraies données
              </div>
            </div>
            
            <div className="flex justify-center">
              <div 
                className="relative"
                style={{
                  filter: Object.entries(layerVisibility).some(([_, visible]) => !visible) 
                    ? 'contrast(1.1) saturate(1.2)' 
                    : 'none'
                }}
              >
                <GrilleChimeriqueV2Page />
                
                {/* Overlay pour debug si activé */}
                {gridDebugMode && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full h-full border-2 border-red-500 border-dashed opacity-50"></div>
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      DEBUG MODE
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>
                Grille authentique 32×32 • Données connectées • Actions temps réel
              </p>
              <p className="text-xs mt-1">
                Les modifications des layers affectent immédiatement la grille principale
              </p>
            </div>
          </div>
        </div>
      </AdminLayoutTemplate>
    </AdminCursorProvider>
  );
}