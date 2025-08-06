import React, { useState } from 'react';

interface ChimeraImageProps {
  name: string;
  reference: string;
  imgUrl?: string;
  className?: string;
}

/**
 * Composant intelligent pour afficher l'image d'une chimère
 * Tente différentes stratégies de chargement et gère les erreurs
 */
export const ChimeraImage: React.FC<ChimeraImageProps> = ({
  name, 
  reference,
  imgUrl,
  className = "max-h-48 object-contain"
}) => {
  const [error, setError] = useState(false);
  const [loadingFailed, setLoadingFailed] = useState(false);
  
  // Si l'URL existe, l'utiliser, sinon utiliser une URL de secours basée sur le nom/référence
  const imageSrc = imgUrl || 
    `https://picsum.photos/seed/${name}_${reference}/300/300`;

  const handleError = () => {
    if (!loadingFailed) {
      console.warn(`Impossible de charger l'image: ${imageSrc}`);
      setError(true);
      setLoadingFailed(true);
    }
  };

  return (
    <div className="relative">
      {error ? (
        <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center" style={{ minHeight: '150px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-gray-500">{reference}</p>
          </div>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={`Image de ${name}`}
          className={className}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default ChimeraImage;