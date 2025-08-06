import React from 'react';
import { FileUploader } from '@/components/admin/FileUploader';
import { EditableComponent } from '../PanelBuilderV2';

interface SimpleImageUploaderProps {
  component: EditableComponent;
  onUpdate: (updatedComponent: EditableComponent) => void;
  onCancel: () => void;
  onHasChanges?: () => void;
}

export function SimpleImageUploader({ component, onUpdate, onCancel, onHasChanges }: SimpleImageUploaderProps) {
  console.log("🖼️ SimpleImageUploader chargé !", component);
  
  const handleFileUploaded = (filePath: string) => {
    console.log("📸 Image uploadée, chemin:", filePath);
    const updatedComponent = {
      ...component,
      content: {
        ...component.content,
        imageUrl: filePath,
        altText: component.content?.altText || 'Image uploadée'
      }
    };
    console.log("🔄 Composant mis à jour:", updatedComponent);
    onUpdate(updatedComponent);
    
    // Déclencher la détection des changements
    if (onHasChanges) {
      onHasChanges();
      console.log("✅ Signal de changement envoyé au parent");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upload d'image pour le panel</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">URL de l'image</label>
              <input
                type="text"
                value={component.content?.imageUrl || ''}
                onChange={(e) => {
                  const updatedComponent = {
                    ...component,
                    content: { ...component.content, imageUrl: e.target.value }
                  };
                  onUpdate(updatedComponent);
                }}
                className="w-full p-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="URL de l'image..."
              />
              
              <div className="mt-2">
                <FileUploader 
                  onFileUploaded={handleFileUploaded}
                  targetFolder="Yhom_Doublures"
                  label="Ou uploader une image"
                />
              </div>
              
              {/* Prévisualisation */}
              {component.config.imageUrl && (
                <div className="mt-4">
                  <label className="block text-sm text-gray-700 mb-1">Prévisualisation</label>
                  <div className="border border-gray-200 p-2 bg-gray-50 h-32 flex items-center justify-center">
                    <img 
                      src={component.config.imageUrl} 
                      alt="Prévisualisation" 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={onCancel}
              disabled={!component.config.imageUrl?.trim()}
              className={`px-4 py-2 rounded ${
                component.config.imageUrl?.trim() 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Valider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}