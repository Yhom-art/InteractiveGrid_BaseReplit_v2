import React from 'react';
import { chimeresData } from '@/data/chimeresData';
import { ContainerType } from '@/types/common';

interface IntegratedPanelProps {
  containerId: number;
  isVisible: boolean;
  type: ContainerType;
  onClose: () => void;
}

export function IntegratedPanel({ 
  containerId, 
  isVisible, 
  type, 
  onClose 
}: IntegratedPanelProps) {
  
  // Style conditionnel basé sur la visibilité
  const panelStyles: React.CSSProperties = {
    width: '392px',
    height: 'auto',
    maxHeight: '80vh',
    position: 'absolute',
    left: '100%', // Toujours positionné juste à droite du container parent
    top: '-4px', // Aligné avec le haut du container parent
    zIndex: isVisible ? 50 : -10, // Mettre en premier plan si visible, sinon en arrière-plan
    opacity: isVisible ? 1 : 0, // Visible ou invisible
    pointerEvents: isVisible ? 'auto' : 'none', // Activé ou désactivé
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    transform: isVisible ? 'translateX(0)' : 'translateX(-20px)', // Animation d'entrée/sortie
    backgroundColor: 'white',
    overflow: 'hidden',
    fontFamily: 'Roboto Mono, monospace',
    boxShadow: isVisible ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
  };

  const handleClick = (e: React.MouseEvent) => {
    // Événement de fermeture uniquement sur le bouton X
    if ((e.target as HTMLElement).closest('.close-button')) {
      e.stopPropagation();
      onClose();
    }
  };

  // Déterminer quel type de contenu afficher en fonction du container ID et du type
  const chimereType = type === ContainerType.ADOPT ? 'adopt' : 
                     type === ContainerType.ADOPTED ? 'adopted' : 'free';
  
  // Trouver les données de la chimère correspondante
  const chimereData = chimeresData.find(c => c.type === chimereType) || chimeresData[0];

  // Calcul pour les barres d'indicateurs
  const formatIndicator = (value: number) => {
    return Math.min(100, Math.max(0, value)); // S'assurer que la valeur est entre 0 et 100
  };

  // Si pas visible, ne pas rendre tout le contenu pour économiser des ressources
  if (!isVisible) {
    return <div style={panelStyles} aria-hidden="true"></div>;
  }

  return (
    <div
      className="panel-integrated"
      style={panelStyles}
      onClick={handleClick}
    >
      {/* Image Header - prend toute la largeur */}
      <div className="relative w-full aspect-square overflow-hidden">
        <img 
          src={chimereData.imageUrl} 
          alt={chimereData.name}
          className="w-full h-full object-cover"
        />
        
        {/* Bouton de fermeture */}
        <div className="absolute top-4 right-4 close-button p-1 cursor-pointer rounded-full bg-white/40 hover:bg-white/60">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        {/* Type badge */}
        <div className="absolute bottom-4 left-4 px-2 py-1 text-xs uppercase tracking-wider bg-black/50 text-white">
          {chimereType}
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="p-4">
        {/* En-tête */}
        <div className="mb-4">
          <h2 className="text-xl font-bold">{chimereData.name}</h2>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs opacity-70">Ref: {chimereData.reference}</span>
            <span className="text-xs opacity-70">ID: {containerId}</span>
          </div>
        </div>
        
        {/* Description */}
        <div className="mb-6">
          <p className="text-sm leading-relaxed">{chimereData.description}</p>
        </div>
        
        {/* Indicateurs */}
        <div className="mb-6">
          <h3 className="text-sm uppercase mb-2 opacity-70">Indicateurs</h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Rareté</span>
                <span>{formatIndicator(chimereData.indicators.rarity)}%</span>
              </div>
              <div className="h-1 bg-gray-200 w-full">
                <div 
                  className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${formatIndicator(chimereData.indicators.rarity)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Popularité</span>
                <span>{formatIndicator(chimereData.indicators.popularity)}%</span>
              </div>
              <div className="h-1 bg-gray-200 w-full">
                <div 
                  className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400"
                  style={{ width: `${formatIndicator(chimereData.indicators.popularity)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Activité</span>
                <span>{formatIndicator(chimereData.indicators.activity)}%</span>
              </div>
              <div className="h-1 bg-gray-200 w-full">
                <div 
                  className="h-1 bg-gradient-to-r from-green-500 to-emerald-400"
                  style={{ width: `${formatIndicator(chimereData.indicators.activity)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Énergie</span>
                <span>{formatIndicator(chimereData.indicators.energy)}%</span>
              </div>
              <div className="h-1 bg-gray-200 w-full">
                <div 
                  className="h-1 bg-gradient-to-r from-orange-500 to-amber-400"
                  style={{ width: `${formatIndicator(chimereData.indicators.energy)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenu administré si disponible */}
        {chimereData.administratedContent && (
          <div className="mb-6 p-3 bg-gray-50 border border-gray-100 rounded">
            <h3 className="text-sm font-medium mb-1">{chimereData.administratedContent.title || 'Note'}</h3>
            <p className="text-xs leading-relaxed">{chimereData.administratedContent.body}</p>
            {chimereData.administratedContent.tags && (
              <div className="mt-3 flex flex-wrap gap-1">
                {chimereData.administratedContent.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 bg-gray-200 rounded">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Informations NFT si disponibles */}
        {chimereData.nftData && (
          <div className="mb-6">
            <h3 className="text-sm uppercase mb-2 opacity-70">NFT</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="opacity-70">Token ID</span>
                <span className="font-mono">{chimereData.nftData.tokenId}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Propriétaire</span>
                <span className="font-mono">{chimereData.nftData.owner.substring(0, 6)}...{chimereData.nftData.owner.substring(chimereData.nftData.owner.length - 4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Créé le</span>
                <span>{chimereData.nftData.creationDate}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Localisation si disponible */}
        {chimereData.location && (
          <div className="mb-6">
            <h3 className="text-sm uppercase mb-2 opacity-70">Localisation</h3>
            <div className="text-xs">
              {chimereData.location.name && (
                <p className="font-medium mb-1">{chimereData.location.name}</p>
              )}
              <p className="opacity-70 mb-2">{chimereData.location.latitude.toFixed(4)}, {chimereData.location.longitude.toFixed(4)}</p>
              {chimereData.location.description && (
                <p className="text-xs leading-relaxed">{chimereData.location.description}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}