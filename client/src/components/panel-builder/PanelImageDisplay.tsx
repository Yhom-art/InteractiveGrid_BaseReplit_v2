import React, { useState, useEffect } from 'react';

interface PanelImageDisplayProps {
  imageUrl: string;
  altText: string;
  caption?: string;
  className?: string;
}

/**
 * Composant spécialisé pour l'affichage des images dans les panels
 * Gère les différents cas d'erreur et de chargement
 */
export const PanelImageDisplay: React.FC<PanelImageDisplayProps> = ({
  imageUrl,
  altText,
  caption,
  className = "max-w-full object-contain"
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageAttempts, setImageAttempts] = useState(0);
  
  // État pour suivre l'URL d'image réellement utilisée
  const [displayUrl, setDisplayUrl] = useState(imageUrl);
  
  // Réinitialiser les états quand l'URL change
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setImageAttempts(0);
    setDisplayUrl(imageUrl);
  }, [imageUrl]);
  
  // Gestion des erreurs d'IPFS et autres URL
  useEffect(() => {
    if (imageError && imageAttempts < 3) {
      console.log(`Tentative ${imageAttempts + 1} pour charger l'image:`, imageUrl);
      
      // Analyse l'URL pour détecter les cas particuliers
      if (imageUrl.includes('ipfs://')) {
        // Conversion des URLs IPFS en gateway HTTP
        const ipfsGateways = [
          'https://ipfs.io/ipfs/',
          'https://gateway.pinata.cloud/ipfs/',
          'https://cloudflare-ipfs.com/ipfs/'
        ];
        
        // Choisir une gateway alternative à chaque tentative
        const gatewayIndex = imageAttempts % ipfsGateways.length;
        const ipfsPath = imageUrl.replace('ipfs://', '');
        const newUrl = `${ipfsGateways[gatewayIndex]}${ipfsPath}`;
        console.log(`Conversion IPFS: ${imageUrl} -> ${newUrl}`);
        setDisplayUrl(newUrl);
      } 
      else if (imageUrl.startsWith('ar://')) {
        // Conversion des URLs Arweave
        const arweaveUrl = imageUrl.replace('ar://', 'https://arweave.net/');
        console.log(`Conversion Arweave: ${imageUrl} -> ${arweaveUrl}`);
        setDisplayUrl(arweaveUrl);
      }
      
      setImageAttempts(prev => prev + 1);
      setImageError(false);
    }
  }, [imageError, imageAttempts, imageUrl]);
  
  const handleImageError = () => {
    console.log(`Erreur de chargement d'image:`, displayUrl);
    setImageError(true);
  };
  
  const handleImageLoad = () => {
    console.log(`Image chargée avec succès:`, displayUrl);
    setImageLoaded(true);
    setImageError(false);
  };
  
  if (imageError && imageAttempts >= 3) {
    // Après plusieurs tentatives, afficher un placeholder avec message
    return (
      <div className="p-4 border border-gray-200 rounded-lg text-center bg-gray-50">
        <div className="py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-gray-600">Impossible d'afficher cette image</p>
          <p className="mt-1 text-sm text-gray-500 break-all">{imageUrl}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative rounded-lg overflow-hidden">
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}
      
      <img
        src={displayUrl}
        alt={altText}
        className={`${className} ${!imageLoaded ? 'invisible' : 'visible'}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
      
      {caption && imageLoaded && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2">
          <p className="text-white text-center text-sm">{caption}</p>
        </div>
      )}
    </div>
  );
};

export default PanelImageDisplay;