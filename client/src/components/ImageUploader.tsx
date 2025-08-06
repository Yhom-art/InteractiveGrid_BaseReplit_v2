import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageSelect: (imageUrl: string, file?: File) => void;
  label?: string;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl,
  onImageSelect,
  label = "Image",
  className = "",
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fonction pour traiter l'URL de l'image selon son format
  const processImageUrl = (url: string): string => {
    // Si l'URL est une URL complète (commence par http:// ou https://), la retourner telle quelle
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Pour les fichiers dans attached_assets, formater correctement l'URL
    if (url.includes('attached_assets')) {
      // Enlever le premier '/' s'il existe pour créer un chemin relatif correct
      const cleanPath = url.startsWith('/') ? url.substring(1) : url;
      return `/${cleanPath}`;
    }
    
    // Fallback pour d'autres types d'URLs
    return url;
  };

  // Gérer la sélection d'un fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    // Pour l'instant, simplement afficher une prévisualisation et notifier le parent
    // Plus tard, on pourrait implémenter un upload réel vers le serveur
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewUrl(result);
      setIsUploading(false);
      onImageSelect(result, file);
    };
    reader.onerror = () => {
      setError("Erreur lors de la lecture du fichier");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Gérer la saisie manuelle d'une URL
  const handleUrlInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPreviewUrl(url);
    onImageSelect(url);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {/* Zone de prévisualisation */}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <div className="mb-4 relative">
            <img 
              src={previewUrl.startsWith('data:') ? previewUrl : processImageUrl(previewUrl)}
              alt="Prévisualisation" 
              className="max-w-full max-h-48 rounded object-contain" 
              onError={(e) => {
                setError("Impossible de charger l'image");
                console.error(`Erreur de chargement de l'image: ${previewUrl}`);
                e.currentTarget.style.display = 'none';
              }}
            />
            {error && (
              <div className="bg-red-100 text-red-700 p-2 text-xs mt-2 rounded">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-1 text-sm text-gray-500">
              Cliquez pour sélectionner une image ou glissez-déposez un fichier ici
            </p>
          </div>
        )}
      </div>

      {/* Input pour télécharger un fichier (caché) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Input pour saisir une URL manuellement */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Ou entrez une URL d'image
        </label>
        <input
          type="text"
          value={previewUrl || ''}
          onChange={handleUrlInput}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="https://exemple.com/image.jpg"
        />
      </div>

      {/* Message d'aide */}
      <p className="text-xs text-gray-500 mt-1">
        Pour les images locales, utilisez le format: /attached_assets/dossier/nom_image.jpg
      </p>
    </div>
  );
};

export default ImageUploader;