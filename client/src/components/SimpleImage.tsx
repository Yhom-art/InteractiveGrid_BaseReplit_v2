import React, { useState } from 'react';

interface SimpleImageProps {
  name: string;
  reference: string;
  imageUrl?: string;
  className?: string;
}

/**
 * Un composant d'image qui utilise l'URL de l'image réelle si disponible,
 * ou affiche une prévisualisation stylisée si non disponible
 */
export const SimpleImage: React.FC<SimpleImageProps> = ({
  name,
  reference,
  imageUrl,
  className = "max-h-48 object-contain"
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Fonction pour traiter l'URL de l'image
  const processImageUrl = (url: string): string => {
    if (!url) return '';
    
    // Si l'URL est une URL complète (commence par http:// ou https://), la retourner telle quelle
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Nettoyer le chemin (enlever le slash initial si présent)
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    
    // Retourner le chemin corrigé
    return `/${cleanPath}`;
  };
  
  // Afficher une interface stylisée si pas d'image ou erreur de chargement
  if (!imageUrl || imageError) {
    return (
      <div className="rounded overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900">
        <div className="p-4 h-full flex flex-col justify-between" style={{minHeight: "150px"}}>
          <div className="flex justify-between items-start">
            <div className="bg-white/10 px-2 py-1 rounded text-xs text-white/90">
              {reference}
            </div>
            <div className="bg-purple-500/20 w-10 h-10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div className="mt-auto">
            <h3 className="text-white font-medium truncate">{name}</h3>
            <div className="mt-1 bg-white/20 h-1 w-3/4 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher l'image réelle si disponible
  return (
    <div className="rounded overflow-hidden">
      <div className="relative">
        <img 
          src={imageUrl ? processImageUrl(imageUrl) : ''}
          alt={`Image de ${name}`}
          className={className}
          onError={() => setImageError(true)}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-2 px-3">
          <p className="text-white text-sm font-medium truncate">{name}</p>
          <p className="text-white/80 text-xs">Ref: {reference}</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleImage;