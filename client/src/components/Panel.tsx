import React, { useState, useEffect } from 'react';
import { ContainerType } from '@/types/common';
import { images } from '@/assets/images';
import { getContainerData } from '@/data/containerMapping';

interface PanelProps {
  containerId: number;
  columnIndex?: number; // Maintenu pour compatibilité
  position: {
    left: number;
    top: number;
  };
  onClose: (containerId: number) => void;
}

export function Panel({ containerId, columnIndex, position, onClose }: PanelProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Récupérer les données de base du conteneur à partir de la carte de correspondance
  const containerData = getContainerData(containerId);
  
  // Enrichir les données avec des informations supplémentaires pour le panneau
  const nftData = {
    id: containerId,
    name: containerData.name,
    reference: containerData.reference,
    description: containerData.description,
    imageUrl: containerData.imageUrl,
    containerType: containerData.containerType,
    price: containerData.price,
    collection: containerData.collection,
    tokenId: containerData.containerType === ContainerType.ADOPTED ? '6428' : 
             containerData.containerType === ContainerType.ADOPT ? '1024' : '-',
    owner: containerData.containerType === ContainerType.ADOPTED ? '0x731F...686E1' : '-',
    creationDate: '2024-03-15',
    rarity: containerData.containerType === ContainerType.ADOPTED ? 65 : 
            containerData.containerType === ContainerType.ADOPT ? 78 : 
            containerId % 2 === 0 ? 76 : 59,
    popularity: containerData.containerType === ContainerType.ADOPTED ? 92 : 
               containerData.containerType === ContainerType.ADOPT ? 68 : 
               containerId % 2 === 0 ? 88 : 72,
    activity: containerData.containerType === ContainerType.ADOPTED ? 72 : 
              containerData.containerType === ContainerType.ADOPT ? 43 : 
              containerId % 2 === 0 ? 54 : 67,
    energy: containerData.containerType === ContainerType.ADOPTED ? 83 : 
            containerData.containerType === ContainerType.ADOPT ? 91 : 
            containerId % 2 === 0 ? 65 : 78,
    location: {
      name: containerData.containerType === ContainerType.ADOPTED ? 'Lyon, France' : 
            containerData.containerType === ContainerType.ADOPT ? 'Bordeaux, France' : 'Paris, France',
      latitude: containerData.containerType === ContainerType.ADOPTED ? 45.7640 : 
               containerData.containerType === ContainerType.ADOPT ? 44.8378 : 48.8566,
      longitude: containerData.containerType === ContainerType.ADOPTED ? 4.8357 : 
                containerData.containerType === ContainerType.ADOPT ? -0.5792 : 2.3522,
      description: containerData.containerType === ContainerType.ADOPTED ? 
                  'Exposition permanente au Musée d\'Art Contemporain de Lyon.' : 
                  containerData.containerType === ContainerType.ADOPT ? 
                  'En attente d\'adoption pour révéler sa localisation exacte.' : 
                  'Visible dans la collection publique de la Ville Lumière.'
    }
  };
  
  // Création d'un identifiant unique pour la chimère au format [NAME]_[REF]
  const chimereIdentifier = `${nftData.name}_${nftData.reference}`;
  
  // Récupérer le type de conteneur pour un affichage cohérent
  const containerType = nftData.containerType;
  
  // Convertir le type de conteneur pour l'affichage
  const displayType = containerType === ContainerType.FREE ? 'FREE' :
                    containerType === ContainerType.ADOPT ? 'ADOPT' :
                    containerType === ContainerType.ADOPTED ? 'ADOPTED' : 'EDITORIAL';
  
  // Récupérer les informations pour le panel
  const colIndex = columnIndex || 0;
  
  // Système simplifié de positionnement - positions fixes pour éviter tout problème
  // Utiliser des positions fixes par rapport à l'écran plutôt que relatives
  const panelStyle: React.CSSProperties = {
    width: '392px',
    backgroundColor: '#ffffff', // Blanc pur
    height: 'auto', // Hauteur automatique en fonction du contenu
    position: 'fixed', // Position FIXE par rapport à la fenêtre
    left: `${200 + (colIndex * 500)}px`, // Positionnement simple avec grand décalage
    top: '100px', // Position fixe en haut de la fenêtre
    zIndex: 2000 + colIndex, // Z-index qui augmente avec la colonne
    boxSizing: 'border-box',
    display: isLoaded ? 'block' : 'none',
    pointerEvents: 'auto',
    border: '1px solid #e5e5e5',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxHeight: 'calc(100vh - 200px)',
    overflowY: 'auto',
  };
  
  // Effet pour simuler un chargement
  useEffect(() => {
    // IMPORTANT: Utiliser un délai très court pour éviter les problèmes d'affichage
    const timer = setTimeout(() => setIsLoaded(true), 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleClosePanel = () => {
    onClose(containerId);
  };

  // Style pour les barres d'indicateurs
  const getBarStyle = (value: number) => ({
    width: `${Math.min(100, Math.max(0, value))}%`,
    height: '100%',
    backgroundColor: 'black',
  });

  return (
    <div 
      className="bg-white overflow-y-auto shadow-md"
      style={panelStyle}
    >
      {/* Bouton de fermeture */}
      <button 
        className="absolute top-4 right-4 z-50 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
        onClick={handleClosePanel}
      >
        <span className="text-sm font-bold">×</span>
      </button>
      
      {/* Image en haut du panneau */}
      <div className="w-full h-64 bg-white relative">
        <img 
          src={nftData.imageUrl} 
          alt={`${nftData.name} chimère`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black text-white px-2 py-1 text-xs uppercase">
          {displayType}
        </div>
      </div>
      
      {/* En-tête avec le nom et les informations de base */}
      <div className="p-5 bg-white">
        <div className="text-xl font-bold">{chimereIdentifier}</div>
        <div className="mt-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Collection:</span>
            <span>{nftData.collection}</span>
          </div>
          <div className="flex justify-between">
            <span>TAG Cat:</span>
            <span>{displayType}</span>
          </div>
          <div className="flex justify-between">
            <span>NFT Prix:</span>
            <span>{nftData.price}</span>
          </div>
        </div>
        <div className="mt-5 border-t border-gray-300"></div>
      </div>

      {/* Description */}
      <div className="px-10 py-5 bg-white">
        <p className="text-sm leading-relaxed">
          {nftData.description}
        </p>
        <div className="mt-5 border-t border-gray-300"></div>
      </div>
      
      {/* Indicateurs */}
      <div className="px-10 py-5 bg-white">
        <h3 className="text-sm uppercase mb-2 font-['Roboto_Mono']">PERFORMANCE</h3>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1 font-['Roboto_Mono']">
              <span>Rareté</span>
              <span>{nftData.rarity}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200">
              <div style={getBarStyle(nftData.rarity)}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1 font-['Roboto_Mono']">
              <span>Popularité</span>
              <span>{nftData.popularity}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200">
              <div style={getBarStyle(nftData.popularity)}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1 font-['Roboto_Mono']">
              <span>Activité</span>
              <span>{nftData.activity}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200">
              <div style={getBarStyle(nftData.activity)}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1 font-['Roboto_Mono']">
              <span>Énergie</span>
              <span>{nftData.energy}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200">
              <div style={getBarStyle(nftData.energy)}></div>
            </div>
          </div>
        </div>
        <div className="mt-5 border-t border-gray-300"></div>
      </div>
      
      {/* Blockchain info */}
      <div className="px-10 py-5 bg-white">
        <h3 className="text-sm uppercase mb-2 font-['Roboto_Mono']">Blockchain</h3>
        <div className="text-xs space-y-1 font-['Roboto_Mono']">
          <div className="flex justify-between">
            <span>Token ID</span>
            <span>{nftData.tokenId}</span>
          </div>
          <div className="flex justify-between">
            <span>Propriétaire</span>
            <span>{typeof nftData.owner === 'string' && nftData.owner.length > 12 
              ? `${nftData.owner.substring(0, 6)}...${nftData.owner.substring(nftData.owner.length - 4)}`
              : nftData.owner}</span>
          </div>
          <div className="flex justify-between">
            <span>Créé le</span>
            <span>{nftData.creationDate}</span>
          </div>
        </div>
        <div className="mt-5 border-t border-gray-300"></div>
      </div>
      
      {/* Géolocalisation */}
      <div className="px-10 py-5 bg-white">
        <h3 className="text-sm uppercase mb-2 font-['Roboto_Mono']">Géolocalisation</h3>
        <div className="text-xs font-['Roboto_Mono']">
          <p className="mb-1">{nftData.location.name}</p>
          <p className="mb-2 font-mono">{nftData.location.latitude.toFixed(4)}, {nftData.location.longitude.toFixed(4)}</p>
          <p className="text-xs leading-snug">{nftData.location.description}</p>
          
          {/* Emplacement pour intégrer une carte dans le futur */}
          <div className="w-full h-24 bg-gray-100 mt-2 flex items-center justify-center">
            <span className="text-xs">Carte en cours de développement</span>
          </div>
        </div>
        <div className="mt-5 border-t border-gray-300"></div>
      </div>
      
      {/* Bouton d'action selon le type */}
      <div className="px-10 py-5 bg-white">
        <h3 className="text-sm uppercase mb-2 font-['Roboto_Mono']">Acquisition</h3>
        <div className="space-y-2">
          {containerType === ContainerType.ADOPT ? (
            <button 
              className="bg-black text-white px-4 py-2 rounded-md w-full font-['Roboto_Mono']"
              onClick={(e) => {
                e.stopPropagation();
                alert('Fonction en développement');
              }}
            >
              ADOPTER CETTE CHIMÈRE
            </button>
          ) : containerType === ContainerType.FREE ? (
            <button 
              className="bg-gray-200 text-black px-4 py-2 rounded-md w-full font-['Roboto_Mono']"
              onClick={(e) => {
                e.stopPropagation();
                alert('Cette chimère est libre');
              }}
            >
              CHIMÈRE LIBRE
            </button>
          ) : (
            <button 
              className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md w-full font-['Roboto_Mono'] cursor-not-allowed"
              disabled
            >
              DÉJÀ ADOPTÉE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}