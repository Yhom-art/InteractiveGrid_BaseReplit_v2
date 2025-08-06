import React, { useState, useCallback } from 'react';
import { ChimereData, PanelConfig } from '@/types/chimereTypes';
import { X, Volume2, MapPin, BarChart4, Tag } from 'lucide-react';

interface OnePagePanelProps {
  config: PanelConfig;
  chimereData: ChimereData;
  onClose: (columnIndex: number) => void;
}

export function OnePagePanel({ config, chimereData, onClose }: OnePagePanelProps) {
  const [imageExpanded, setImageExpanded] = useState<boolean>(false);
  
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Si l'image est agrandie, on la referme d'abord
    if (imageExpanded) {
      setImageExpanded(false);
      return;
    }
    
    onClose(config.columnIndex);
  };

  // Style pour le panel modulaire en mode One Page
  const panelStyles: React.CSSProperties = {
    width: '384px', // 3 containers (128px chacun) de large
    minHeight: '384px', // Hauteur minimum (carré)
    maxHeight: 'auto', // Hauteur adaptée au contenu
    left: `${config.position.left}px`,
    top: `${config.position.top}px`,
    backgroundColor: '#FFFFFF', // Fond blanc selon la nouvelle demande
    color: '#000000', // Texte noir
    transition: 'transform 0.3s ease, left 0.3s ease, top 0.3s ease',
    zIndex: 50,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  // Données pour l'affichage
  const { 
    name, 
    reference, 
    description, 
    imageUrl, 
    type, 
    nftData, 
    audioContent,
    location,
    indicators,
    administratedContent
  } = chimereData;

  // Formatage des adresses pour l'affichage NFT
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Récupérer les indicateurs principaux
  const mainIndicators = [
    { name: 'Rareté', value: indicators.rarity, color: 'bg-purple-500' },
    { name: 'Popularité', value: indicators.popularity, color: 'bg-blue-500' },
    { name: 'Activité', value: indicators.activity, color: 'bg-green-500' },
    { name: 'Énergie', value: indicators.energy, color: 'bg-red-500' }
  ];

  return (
    <div
      className="absolute z-[100] transition-all duration-300 ease-in-out"
      style={panelStyles}
    >
      {/* En-tête du panel avec titre et bouton de fermeture */}
      <div className="sticky top-0 z-50 p-4 border-b border-gray-200 flex justify-between items-center bg-white">
        <h2 className="text-xl font-bold text-gray-800 font-['Roboto_Mono']">
          {name}
          <span className="text-sm ml-2 text-gray-500">{reference}</span>
        </h2>
        <button 
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Contenu principal en mode One Page avec défilement */}
      <div className="flex-1 overflow-y-auto">
        {/* Section Hero avec image cliquable pour agrandissement */}
        <div className="relative aspect-square w-full">
          <button 
            className="absolute inset-0 w-full h-full z-10 cursor-none focus:outline-none"
            data-cursor-type="adoptPill"
            onClick={() => setImageExpanded(!imageExpanded)}
          >
            <span className="sr-only">Agrandir l'image</span>
          </button>
          <img 
            src={imageUrl} 
            alt={name} 
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageExpanded 
              ? 'fixed inset-0 z-50 w-auto max-w-[550px] h-auto max-h-[80vh] m-auto object-contain bg-black/90' 
              : ''
            }`}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white p-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className={`inline-block px-2 py-1 rounded text-xs uppercase font-bold ${
                type === 'adopt' ? 'text-blue-600 bg-blue-50' : 
                type === 'adopted' ? 'text-green-600 bg-green-50' : 'text-purple-600 bg-purple-50'
              }`}>
                {type}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="m15 3 6 6m0 0-6 6m6-6H3"></path>
                </svg>
                Cliquez pour agrandir
              </span>
            </div>
          </div>
        </div>
        
        {/* Overlay pour fermer l'image agrandie */}
        {imageExpanded && (
          <div 
            className="fixed inset-0 z-40 bg-black/70 cursor-none flex items-center justify-center"
            data-cursor-type="close"
            onClick={() => setImageExpanded(false)}
          >
            <button 
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full"
              onClick={() => setImageExpanded(false)}
            >
              <X size={24} className="text-white" />
            </button>
          </div>
        )}

        {/* Sections du contenu */}
        <div className="divide-y divide-gray-200">
          {/* Section Description */}
          <section className="p-4 text-gray-800">
            <p className="text-gray-700 leading-relaxed">{description}</p>
            
            {/* Contenu administré si disponible */}
            {administratedContent && (
              <div className="bg-gray-50 p-4 rounded-lg mt-4 border border-gray-200">
                {administratedContent.title && (
                  <h4 className="text-lg font-semibold mb-2 text-gray-800">{administratedContent.title}</h4>
                )}
                {administratedContent.body && (
                  <div className="prose prose-sm">
                    <p>{administratedContent.body}</p>
                  </div>
                )}
                {administratedContent.tags && administratedContent.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {administratedContent.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Section Indicateurs/Stats */}
          <section className="p-4 text-gray-800">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart4 size={20} className="text-purple-600" />
              <h3 className="text-lg font-semibold">Indicateurs</h3>
            </div>
            
            <div className="space-y-3 mb-4">
              {mainIndicators.map((indicator) => (
                <div key={indicator.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{indicator.name}</span>
                    <span className="font-bold">{indicator.value}/100</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${
                      indicator.color === 'bg-purple-500' ? 'bg-purple-500' : 
                      indicator.color === 'bg-blue-500' ? 'bg-blue-500' : 
                      indicator.color === 'bg-green-500' ? 'bg-green-500' : 
                      'bg-red-500'
                    }`} style={{ width: `${indicator.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section NFT si disponible */}
          {nftData && (
            <section className="p-4 text-gray-800">
              <div className="flex items-center space-x-2 mb-4">
                <Tag size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold">NFT #{nftData.tokenId}</h3>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Propriétaire</p>
                    <p className="font-mono text-sm truncate text-gray-800">{formatAddress(nftData.owner)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Contrat</p>
                    <p className="font-mono text-sm truncate text-gray-800">{formatAddress(nftData.contractAddress)}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs text-gray-500">Date de création</p>
                    <p className="text-sm text-gray-800">{nftData.creationDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-3">
                <a href={`https://etherscan.io/token/${nftData.contractAddress}?a=${nftData.tokenId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 px-3 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
                >
                  Etherscan
                </a>
                <a href={`https://opensea.io/assets/${nftData.contractAddress}/${nftData.tokenId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 px-3 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-md transition-colors"
                >
                  OpenSea
                </a>
              </div>
            </section>
          )}

          {/* Section Audio si disponible */}
          {audioContent && audioContent.length > 0 && (
            <section className="p-4 text-gray-800">
              <div className="flex items-center space-x-2 mb-4">
                <Volume2 size={20} className="text-green-600" />
                <h3 className="text-lg font-semibold">Audio</h3>
              </div>
              
              <div className="space-y-3">
                {audioContent.map((track) => (
                  <div key={track.id} className="bg-gray-50 p-3 rounded-lg flex items-center space-x-3 border border-gray-200">
                    {/* Bouton play avec curseur personnalisé */}
                    <button 
                      className="rounded-full bg-green-500 p-2 flex-shrink-0 cursor-none text-white" 
                      data-cursor-type="meetPill"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Lecture de ${track.title}`);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="10 8 16 12 10 16 10 8"></polygon>
                      </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate text-gray-800">{track.title}</h4>
                      {track.artist && <p className="text-xs text-gray-500 truncate">{track.artist}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-gray-500">
                        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                      </div>
                      {/* Bouton d'action avec curseur personnalisé */}
                      <button 
                        className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center cursor-none text-blue-600" 
                        data-cursor-type="adoptPill"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Ajouter ${track.title} aux favoris`);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section Localisation si disponible */}
          {location && (
            <section className="p-4 text-gray-800">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin size={20} className="text-red-600" />
                <h3 className="text-lg font-semibold">{location.name || "Localisation"}</h3>
              </div>
              
              <div className="mb-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Latitude</p>
                    <p className="font-mono text-sm text-gray-800">{location.latitude.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Longitude</p>
                    <p className="font-mono text-sm text-gray-800">{location.longitude.toFixed(4)}</p>
                  </div>
                </div>
                {location.description && (
                  <p className="text-sm text-gray-700 mt-2">{location.description}</p>
                )}
              </div>
              
              {/* Exemple de zone de clic déportée avec data-cursor-type */}
              <div className="flex space-x-3">
                <a
                  href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center py-2 px-4 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                >
                  <MapPin size={16} className="mr-2" />
                  Google Maps
                </a>
                
                {/* Zone de clic déportée avec curseur spécifique */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Action spécifique à exécuter (par exemple, ouvrir un autre panel)
                    alert(`Action spéciale pour la chimère ${chimereData.name}`);
                  }}
                  className="w-12 h-10 bg-purple-500 hover:bg-purple-600 rounded-md flex items-center justify-center cursor-none"
                  data-cursor-type="knok"
                >
                  <span className="sr-only">Action spéciale</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}