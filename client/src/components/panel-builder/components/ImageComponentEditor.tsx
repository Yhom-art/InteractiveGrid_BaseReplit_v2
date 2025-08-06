import React, { useState } from 'react';
import { EditableComponent } from '../PanelBuilderV2';
import { formatImagePathForDisplay } from '@/utils/imageUtils';
import { FileUploader } from '@/components/admin/FileUploader';

interface ImageComponentEditorProps {
  component: EditableComponent;
  onUpdate: (updatedComponent: EditableComponent) => void;
  onCancel: () => void;
}

export function ImageComponentEditor({ component, onUpdate, onCancel }: ImageComponentEditorProps) {
  // Gestion de l'upload d'image via le composant FileUploader
  const handleFileUploaded = (filePath: string) => {
    const updatedComponent = {
      ...component,
      config: {
        ...component.config,
        imageUrl: filePath,
        altText: component.config.altText || 'Image uploadée'
      }
    };
    onUpdate(updatedComponent);
  };

  // Gestion de la mise à jour des propriétés
  const handlePropertyUpdate = (property: string, value: string) => {
    const updatedComponent = {
      ...component,
      content: {
        ...component.content,
        [property]: value
      }
    };
    onUpdate(updatedComponent);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-6">Éditer le composant Image</h3>
          
          {/* Configuration générale */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du composant
              </label>
              <input
                type="text"
                value={component.title || ''}
                onChange={(e) => onUpdate({ ...component, title: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Titre de l'image"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={component.description || ''}
                onChange={(e) => onUpdate({ ...component, description: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Description du composant"
              />
            </div>
          </div>

          {/* Upload et prévisualisation d'image */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload d'image
              </label>
              
              {/* Composant d'upload réutilisable */}
              <FileUploader
                onFileUploaded={handleFileUploaded}
                acceptedTypes="image/jpeg,image/png,image/gif,image/webp"
                targetFolder="Yhom_Doublures"
                label="Choisir une image pour le panel"
              />
            </div>
            
            {/* Prévisualisation de l'image actuelle */}
            <div>
              {component.content?.imageUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Aperçu :</p>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <img 
                      src={formatImagePathForDisplay(component.content.imageUrl)} 
                      alt={component.content.altText || 'Aperçu'} 
                      className="max-w-full max-h-48 object-contain mx-auto rounded"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* URL manuelle (alternative à l'upload) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ou URL d'image
              </label>
              <input
                type="url"
                value={component.content?.imageUrl === 'https://via.placeholder.com/600x400' ? '' : (component.content?.imageUrl || '')}
                onChange={(e) => handlePropertyUpdate('imageUrl', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="https://exemple.com/image.jpg ou /attached_assets/..."
              />
            </div>

            {/* Propriétés de l'image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texte alternatif
              </label>
              <input
                type="text"
                value={component.config.altText || ''}
                onChange={(e) => handlePropertyUpdate('altText', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Description de l'image"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Légende
              </label>
              <input
                type="text"
                value={component.config.caption || ''}
                onChange={(e) => handlePropertyUpdate('caption', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Légende sous l'image"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 mt-8">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Valider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}