import React, { useState, useEffect } from 'react';

interface ImageLoaderProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  height?: string | number;
  width?: string | number;
}

/**
 * Composant pour charger et afficher une image avec gestion des erreurs
 * et support pour différents formats (JPG, PNG, SVG, etc.)
 */
export const ImageLoader: React.FC<ImageLoaderProps> = ({
  src,
  alt,
  fallbackSrc = '/attached_assets/image_1747417032562.png', // Image de remplacement par défaut
  className = 'max-h-48 object-contain',
  height,
  width
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // Réinitialiser l'état quand la source change
  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
    setError(false);
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    // Tentative de conversion de chemin relatif en absolu si c'est une raison possible de l'échec
    if (!imgSrc.startsWith('/') && !imgSrc.startsWith('http')) {
      setImgSrc('/' + imgSrc);
      return;
    }
    
    // Si la première tentative échoue, on utilise l'image de secours
    if (imgSrc !== fallbackSrc) {
      console.warn(`Image non chargée: ${imgSrc}, utilisation de l'image de secours`);
      setImgSrc(fallbackSrc);
    } else {
      // Si même l'image de secours échoue
      setError(true);
      console.error(`Échec de chargement de l'image de secours: ${fallbackSrc}`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="relative" style={{ height, width }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded animate-pulse">
          <span className="text-gray-500">Chargement...</span>
        </div>
      )}
      
      {error ? (
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded p-4 text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-gray-400 mb-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <span className="text-gray-500 text-sm">Image non disponible</span>
          <span className="text-gray-400 text-xs mt-1 truncate max-w-full">{src}</span>
        </div>
      ) : (
        <img
          src={imgSrc}
          alt={alt}
          className={className}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ 
            display: isLoading ? 'none' : 'block',
            height, 
            width 
          }}
        />
      )}
    </div>
  );
};

export default ImageLoader;