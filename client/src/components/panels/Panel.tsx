import React, { useState } from 'react';
import { ChimereData, PanelTab, PanelConfig } from '@/types/chimereTypes';
import { InfoPanel } from '@/components/panels/InfoPanel';
import { NFTPanel } from '@/components/panels/NFTPanel';
import { AudioPanel } from '@/components/panels/AudioPanel';
import { MapPanel } from '@/components/panels/MapPanel';
import { StatsPanel } from '@/components/panels/StatsPanel';
import { X } from 'lucide-react';

interface PanelProps {
  config: PanelConfig;
  chimereData: ChimereData;
  onClose: (columnIndex: number) => void;
  onChangeTab?: (tab: PanelTab) => void;
}

export function Panel({ config, chimereData, onClose, onChangeTab }: PanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>(config.activeTab || PanelTab.INFO);

  const handleTabChange = (tab: PanelTab) => {
    setActiveTab(tab);
    if (onChangeTab) {
      onChangeTab(tab);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(config.columnIndex);
  };

  // Style pour le panel modulaire
  const panelStyles: React.CSSProperties = {
    width: '384px', // 3 containers (128px chacun) de large
    height: '100%', // Hauteur complète
    left: `${config.position.left}px`,
    top: '0',
    backgroundColor: '#2c2c2c', // Fond sombre pour contraste
    transition: 'transform 0.3s ease, left 0.3s ease',
    zIndex: 50,
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  // Rendu du contenu selon l'onglet actif
  const renderPanelContent = () => {
    switch (activeTab) {
      case PanelTab.INFO:
        return <InfoPanel chimereData={chimereData} />;
      case PanelTab.NFT:
        return <NFTPanel nftData={chimereData.nftData} />;
      case PanelTab.AUDIO:
        return <AudioPanel audioContent={chimereData.audioContent || []} />;
      case PanelTab.MAP:
        return <MapPanel location={chimereData.location} />;
      case PanelTab.STATS:
        return <StatsPanel indicators={chimereData.indicators} />;
      default:
        return <InfoPanel chimereData={chimereData} />;
    }
  };

  return (
    <div
      className="absolute z-[100] transition-all duration-300 ease-in-out"
      style={panelStyles}
    >
      {/* En-tête du panel avec titre et bouton de fermeture */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
        <h2 className="text-xl font-bold text-white font-['Roboto_Mono']">
          {chimereData.name}
          <span className="text-sm ml-2 text-gray-400">{chimereData.reference}</span>
        </h2>
        <button 
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation par onglets */}
      <div className="flex border-b border-gray-700 bg-gray-900">
        <TabButton 
          active={activeTab === PanelTab.INFO} 
          onClick={() => handleTabChange(PanelTab.INFO)}
        >
          Info
        </TabButton>
        <TabButton 
          active={activeTab === PanelTab.NFT} 
          onClick={() => handleTabChange(PanelTab.NFT)}
        >
          NFT
        </TabButton>
        <TabButton 
          active={activeTab === PanelTab.AUDIO} 
          onClick={() => handleTabChange(PanelTab.AUDIO)}
        >
          Audio
        </TabButton>
        <TabButton 
          active={activeTab === PanelTab.MAP} 
          onClick={() => handleTabChange(PanelTab.MAP)}
        >
          Map
        </TabButton>
        <TabButton 
          active={activeTab === PanelTab.STATS} 
          onClick={() => handleTabChange(PanelTab.STATS)}
        >
          Stats
        </TabButton>
      </div>

      {/* Contenu principal du panel */}
      <div className="flex-1 overflow-y-auto bg-gray-800 p-4">
        {renderPanelContent()}
      </div>
    </div>
  );
}

// Composant bouton d'onglet réutilisable
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      className={`px-4 py-2 font-medium font-['Roboto_Mono'] text-sm transition-colors ${
        active 
          ? 'text-white bg-gray-800 border-b-2 border-white' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}