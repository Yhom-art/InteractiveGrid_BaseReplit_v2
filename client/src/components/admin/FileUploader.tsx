import React, { useState, useRef } from 'react';

interface FileUploaderProps {
  onFileUploaded: (filePath: string) => void;
  acceptedTypes?: string;
  targetFolder?: string;
  label?: string;
}

/**
 * Composant d'upload de fichiers
 * Permet de télécharger des fichiers sur le serveur et retourne le chemin
 */
export function FileUploader({
  onFileUploaded,
  acceptedTypes = "image/jpeg,image/png,image/gif",
  targetFolder = "Yhom_Doublures",
  label = "Choisir un fichier"
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Réinitialiser les états
    setError(null);
    setSuccessMessage(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Créer un FormData pour l'envoi du fichier
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetFolder', targetFolder);

      // Simuler une progression d'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      // Envoyer le fichier au serveur
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'upload");
      }

      // Récupérer le chemin du fichier uploadé
      const data = await response.json();
      setUploadProgress(100);
      
      // Notifier le parent du chemin du fichier
      onFileUploaded(data.filePath);
      setSuccessMessage(`Fichier ${file.name} téléchargé avec succès`);
      
      // Réinitialiser le champ d'upload
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'upload");
      console.error("Erreur d'upload:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="mb-2 font-mono text-xs text-gray-700">
        {label}
      </div>
      
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={acceptedTypes}
            disabled={isUploading}
            className="w-full text-xs font-mono bg-white border border-gray-300 p-2"
          />
        </div>
        
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <div className="text-xs font-mono mt-1 text-gray-600">
              Upload en cours... {uploadProgress}%
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-red-600 text-xs font-mono bg-red-50 p-2 border border-red-200">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="text-green-600 text-xs font-mono bg-green-50 p-2 border border-green-200">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}