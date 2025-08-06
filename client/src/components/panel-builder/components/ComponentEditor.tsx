import React from 'react';
import { EditableComponent } from '../PanelBuilderV2';
import { PanelComponentType } from '@shared/types/PanelComponents';
import { TextComponentEditor } from './TextComponentEditor';
import { WalletComponentEditor } from './WalletComponentEditor';
import { SimpleImageUploader } from './SimpleImageUploader';
import { AudioComponentEditor } from './AudioComponentEditor';

interface ComponentEditorProps {
  component: EditableComponent;
  onUpdate: (updatedComponent: EditableComponent) => void;
  onCancel: () => void;
  onHasChanges?: () => void;
}

/**
 * Éditeur de composant générique qui charge l'éditeur approprié
 * en fonction du type de composant
 */
export function ComponentEditor({ component, onUpdate, onCancel, onHasChanges }: ComponentEditorProps) {
  // Afficher l'éditeur correspondant au type de composant
  switch (component.type) {
    case PanelComponentType.TEXT:
      return (
        <TextComponentEditor 
          component={component} 
          onUpdate={onUpdate} 
          onCancel={onCancel} 
        />
      );
    
    case PanelComponentType.WALLET:
      return (
        <WalletComponentEditor 
          component={component} 
          onUpdate={onUpdate} 
          onCancel={onCancel} 
        />
      );
    
    case PanelComponentType.IMAGE:
      return (
        <SimpleImageUploader 
          component={component} 
          onUpdate={onUpdate} 
          onCancel={onCancel} 
          onHasChanges={onHasChanges}
        />
      );
    
    case PanelComponentType.AUDIO:
      return (
        <AudioComponentEditor
          component={component}
          onUpdate={onUpdate}
          onCancel={onCancel}
        />
      );
    
    // Ajouter d'autres éditeurs spécifiques ici
    
    default:
      // Éditeur générique pour les types sans éditeur spécifique
      return (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">
            Éditer le composant {component.type}
          </h3>
          
          <p className="mb-4 text-amber-600">
            Éditeur spécifique non disponible pour ce type de composant.
            Un éditeur plus sophistiqué sera implémenté dans une prochaine version.
          </p>
          
          {/* Paramètres de base */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre du composant</label>
              <input
                type="text"
                value={component.title || ''}
                onChange={(e) => onUpdate({...component, title: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Titre du composant"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={component.description || ''}
                onChange={(e) => onUpdate({...component, description: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Description courte"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isVisible"
                checked={component.isVisible}
                onChange={(e) => onUpdate({...component, isVisible: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isVisible" className="ml-2 block text-sm text-gray-900">
                Afficher ce composant
              </label>
            </div>
          </div>
          
          {/* Boutons d'action */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => onUpdate(component)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </div>
      );
  }
}