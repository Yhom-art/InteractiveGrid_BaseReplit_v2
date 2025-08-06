import React, { useState, useEffect } from 'react';
import { EditableComponent } from '../PanelBuilderV2';

interface AudioComponentEditorProps {
  component: EditableComponent;
  onUpdate: (component: EditableComponent) => void;
  onCancel: () => void;
}

export function AudioComponentEditor({ component, onUpdate, onCancel }: AudioComponentEditorProps) {
  const [title, setTitle] = useState(component.title || '');
  const [audioUrl, setAudioUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    // Récupérer l'URL audio depuis le contenu existant
    const content = (component as any).content || (component as any).config;
    if (typeof content === 'object' && content && 'audioUrl' in content) {
      setAudioUrl(content.audioUrl as string);
    }
  }, [component]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier que c'est un fichier audio
    if (!file.type.startsWith('audio/')) {
      alert('Veuillez sélectionner un fichier audio (MP3, WAV, etc.)');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const result = await response.json();
      setAudioUrl(result.url);
      setUploadProgress(100);
      
      // Mettre à jour automatiquement le composant avec la nouvelle URL
      handleSave(result.url);
      
    } catch (error) {
      console.error('Erreur upload audio:', error);
      alert('Erreur lors de l\'upload du fichier audio');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleSave = (urlToSave = audioUrl) => {
    if (!urlToSave || urlToSave.trim() === '') {
      alert('Veuillez ajouter une URL audio ou télécharger un fichier.');
      return;
    }

    console.log("💾 AUDIO: Sauvegarde du composant audio avec URL:", urlToSave);
    
    const updatedComponent = {
      ...component,
      title: title || 'Composant Audio',
      content: {
        audioUrl: urlToSave,
        autoplay: false,
        controls: true,
        loop: false
      }
    };

    console.log("💾 AUDIO: Composant mis à jour:", updatedComponent);
    onUpdate(updatedComponent);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioUrl(e.target.value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Éditeur Audio</h3>
      
      {/* Titre */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre du composant
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Ma piste audio"
        />
      </div>

      {/* Upload de fichier */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fichier audio
        </label>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id="audio-upload"
          />
          
          <label 
            htmlFor="audio-upload" 
            className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              isUploading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Upload en cours...' : 'Choisir un fichier MP3'}
          </label>
          
          <p className="text-xs text-gray-500 mt-2">
            Formats supportés: MP3, WAV, OGG (max 10MB)
          </p>
          
          {/* Barre de progression */}
          {isUploading && uploadProgress > 0 && (
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* URL manuelle (alternative) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ou URL audio directe
        </label>
        <input
          type="url"
          value={audioUrl}
          onChange={handleUrlChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/audio.mp3"
        />
      </div>

      {/* Prévisualisation */}
      {audioUrl && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prévisualisation
          </label>
          <audio 
            controls 
            className="w-full"
            src={audioUrl}
          >
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Annuler
        </button>
        <button
          onClick={() => handleSave()}
          disabled={!audioUrl}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            audioUrl
              ? 'text-white bg-blue-600 hover:bg-blue-700'
              : 'text-gray-500 bg-gray-300 cursor-not-allowed'
          }`}
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
}