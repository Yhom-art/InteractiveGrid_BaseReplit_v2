import React, { useState } from 'react';
import { Eye, EyeOff, Settings, ChevronDown, ChevronUp } from 'lucide-react';

import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AdminLayoutTemplate } from '@/components/admin/AdminLayoutTemplate';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';

type ContainerState = 'closed' | 'open' | 'panel';

export default function ContainerLayersNewPage() {
  const [selectedState, setSelectedState] = useState<ContainerState>('closed');
  const [layerVisibility, setLayerVisibility] = useState<{[key: string]: boolean}>({
    txt: true,
    overlay: true,
    pic: true,
    audio: false,
    video: false,
    card: true,
    comp: true,
    open: true,
    close: true,
    hover: true,
    grab: false
  });

  const toggleLayerVisibility = (layerId: string) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  const configSections = (
    <div className="bg-white rounded-lg p-4 shadow">
      {/* Bouton Enregistrer */}
      <div className="mb-4">
        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 transition-colors">
          Enregistrer
        </button>
      </div>

      {/* Onglets FERMÉ / OUVERT / PANEL */}
      <div className="mb-4">
        <div className="flex border-b border-gray-200">
          {(['closed', 'open', 'panel'] as ContainerState[]).map((state) => (
            <button
              key={state}
              onClick={() => setSelectedState(state)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                selectedState === state
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {state === 'closed' ? 'FERMÉ' : 
               state === 'open' ? 'OUVERT' : 'PANEL'}
            </button>
          ))}
        </div>
      </div>

      {/* LAYERS VISUELS, TXT & COMP (Z) */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-2 admin-h2">
          LAYERS VISUELS, TXT & COMP (Z)
        </h3>
        <p className="text-xs text-gray-600 mb-3 admin-h3">
          COMME UNE GESTION DE CALQUES SUR PHOTOSHOP
        </p>
        
        <div className="space-y-2">
          {/* Layer TXT */}
          <div className="border rounded">
            <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-4 rounded text-white text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#000000' }}
                >
                  TXT
                </div>
                <span className="text-sm admin-rule-name">
                  TITRE + EFFETS CSS À DÉCLENCHEMENT
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs">≡</button>
                <button className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs">↑</button>
                <button 
                  onClick={() => toggleLayerVisibility('txt')}
                  className={`w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs ${
                    layerVisibility.txt ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {layerVisibility.txt ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs">▼</button>
              </div>
            </div>
          </div>

          {/* Layer OVERLAY */}
          <div className="border rounded">
            <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-4 rounded text-white text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#5D9CEC' }}
                >
                  OVERLAY
                </div>
                <span className="text-sm admin-rule-name">E5D1D3 - 90%</span>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => toggleLayerVisibility('overlay')}
                  className={`w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs ${
                    layerVisibility.overlay ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {layerVisibility.overlay ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs">▼</button>
              </div>
            </div>
          </div>

          {/* Layer PIC */}
          <div className="border rounded">
            <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-4 rounded text-white text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#5D9CEC' }}
                >
                  PIC
                </div>
                <span className="text-sm admin-rule-name">128x128 / 512x512</span>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => toggleLayerVisibility('pic')}
                  className={`w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs ${
                    layerVisibility.pic ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {layerVisibility.pic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs">▼</button>
              </div>
            </div>
          </div>

          {/* Layer AUDIO - désactivé */}
          <div className="border rounded opacity-60">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-4 rounded text-white text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#5D9CEC' }}
                >
                  AUDIO
                </div>
                <span className="text-sm text-gray-500">128x128 / 512x512</span>
              </div>
              <div className="flex items-center space-x-1">
                <button className="w-5 h-5 flex items-center justify-center text-xs text-gray-400">
                  <EyeOff className="w-3 h-3" />
                </button>
                <button className="w-5 h-5 flex items-center justify-center text-xs">▼</button>
              </div>
            </div>
          </div>

          {/* Layer VIDEO - désactivé */}
          <div className="border rounded opacity-60">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-4 rounded text-white text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#5D9CEC' }}
                >
                  VIDEO
                </div>
                <span className="text-sm text-gray-500">128x128 / 512x512</span>
              </div>
              <div className="flex items-center space-x-1">
                <button className="w-5 h-5 flex items-center justify-center text-xs text-gray-400">
                  <EyeOff className="w-3 h-3" />
                </button>
                <button className="w-5 h-5 flex items-center justify-center text-xs">▼</button>
              </div>
            </div>
          </div>

          {/* Layer CARD */}
          <div className="border rounded">
            <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-4 rounded text-white text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#000000' }}
                >
                  CARD
                </div>
                <span className="text-sm admin-rule-name">128x128 margin 12px</span>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => toggleLayerVisibility('card')}
                  className={`w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs ${
                    layerVisibility.card ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {layerVisibility.card ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs">▼</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION ZONES (Z) */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-2 admin-h2">
          ACTION ZONES (Z)
        </h3>
        
        <div className="space-y-2">
          {/* COMP */}
          <div className="border rounded">
            <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-4 rounded text-white text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#0000FF' }}
                >
                  COMP
                </div>
                <span className="text-sm admin-rule-name text-xs">
                  Commandes Players ou zones spéciales Panel
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => toggleLayerVisibility('comp')}
                  className={`w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs ${
                    layerVisibility.comp ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {layerVisibility.comp ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs">▼</button>
              </div>
            </div>
          </div>

          {/* OPEN */}
          <div className="border rounded">
            <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-4 rounded text-white text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#00FF00' }}
                >
                  OPEN
                </div>
                <span className="text-sm admin-rule-name">Action Clic générique</span>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => toggleLayerVisibility('open')}
                  className={`w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs ${
                    layerVisibility.open ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {layerVisibility.open ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs">▼</button>
              </div>
            </div>
          </div>

          {/* CLOSE */}
          <div className="border rounded">
            <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-4 rounded text-white text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#FF00FF' }}
                >
                  CLOSE
                </div>
                <span className="text-sm admin-rule-name">Action Clic générique</span>
              </div>
              <div className="flex items-center space-x-1">
                <button className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs">≡</button>
                <button className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs">↑</button>
                <button 
                  onClick={() => toggleLayerVisibility('close')}
                  className={`w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs ${
                    layerVisibility.close ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {layerVisibility.close ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs">▼</button>
              </div>
            </div>
          </div>

          {/* HOVER */}
          <div className="border rounded">
            <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-4 rounded text-white text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#00FFFF' }}
                >
                  HOVER
                </div>
                <span className="text-sm admin-rule-name">Zones de Trigger</span>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => toggleLayerVisibility('hover')}
                  className={`w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs ${
                    layerVisibility.hover ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {layerVisibility.hover ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs">▼</button>
              </div>
            </div>
          </div>

          {/* GRAB - désactivé */}
          <div className="border rounded opacity-60">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-4 rounded text-gray-600 text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#CCCCCC' }}
                >
                  GRAB
                </div>
                <span className="text-sm text-gray-500">
                  Pris en charge par la grille
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button className="w-5 h-5 flex items-center justify-center text-xs text-gray-400">
                  <EyeOff className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const previewSection = (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="font-medium text-gray-900 mb-4 admin-h2">Preview Container NFT FREE</h3>
      
      <div className="flex justify-center">
        <FluidGrid
          width={6}
          height={6}
          containerSize={128}
          gap={4}
          onContainerClick={() => {}}
          onContainerHover={() => {}}
          className="border-2 border-gray-300 rounded"
        >
          <Container
            key="preview-container"
            position={{ left: 2 * (128 + 4), top: 2 * (128 + 4) }}
            containerType="free"
            size={128}
            gap={4}
            imageUrl="https://via.placeholder.com/128x128/6366f1/ffffff?text=NFT"
            containerState={selectedState === 'closed' ? 'closed' : selectedState === 'open' ? 'free' : 'panel'}
            expansionType="oneone_up"
            nftId="preview-nft"
            marketOrder={1}
            onClick={() => {}}
            onHover={() => {}}
          />
        </FluidGrid>
      </div>
      
      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>Grille FluidGrid 6×6 • Container central position (2,2) • État: {selectedState.toUpperCase()}</p>
        <p className="text-xs mt-1">Preview en temps réel avec la vraie FluidGrid de l'application</p>
      </div>
    </div>
  );

  return (
    <AdminCursorProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto p-4">
          <AdminHeaderTemplate title="Configuration Container - NFT FREE" />
          
          <AdminLayoutTemplate layout="1-3" leftColumn={configSections}>
            {previewSection}
          </AdminLayoutTemplate>
        </div>
      </div>
    </AdminCursorProvider>
  );
}