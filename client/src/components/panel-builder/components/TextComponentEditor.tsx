import React, { useState, useEffect } from 'react';
import { EditableComponent } from '../PanelBuilderV2';

interface TextComponentEditorProps {
  component: EditableComponent;
  onUpdate: (updatedComponent: EditableComponent) => void;
  onCancel: () => void;
}

/**
 * Éditeur avancé pour le composant texte
 * Permet d'éditer le contenu HTML avec formatage
 */
export function TextComponentEditor({ component, onUpdate, onCancel }: TextComponentEditorProps) {
  // État local pour le contenu du texte
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(true);
  
  // Initialisation des états à partir du composant
  useEffect(() => {
    setContent(component.config.content || '<p>Entrez votre texte ici</p>');
    setTitle(component.title || '');
    setDescription(component.description || '');
    setIsVisible(component.isVisible !== undefined ? component.isVisible : true);
  }, [component]);
  
  // Gestionnaire pour la mise à jour du contenu
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };
  
  // Gestionnaire pour la sauvegarde des modifications
  const handleSave = () => {
    const updatedComponent: EditableComponent = {
      ...component,
      title,
      description,
      isVisible,
      config: {
        ...component.config,
        content
      }
    };
    
    onUpdate(updatedComponent);
  };
  
  // Insérer un élément HTML
  const insertHtmlElement = (tag: string, attributes: Record<string, string> = {}) => {
    // Créer la balise ouvrante avec les attributs
    let openTag = `<${tag}`;
    for (const [key, value] of Object.entries(attributes)) {
      openTag += ` ${key}="${value}"`;
    }
    openTag += '>';
    
    // Balise fermante
    const closeTag = `</${tag}>`;
    
    // Insérer le tag dans le contenu actuel
    setContent(prevContent => {
      return prevContent + `\n${openTag}Votre texte ici${closeTag}\n`;
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Éditer le composant texte</h3>
      
      {/* Paramètres de base */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre du composant</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Titre du composant (optionnel)"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Description courte (optionnel)"
          />
        </div>
      </div>
      
      <div className="mb-2 flex items-center">
        <input
          type="checkbox"
          id="isVisible"
          checked={isVisible}
          onChange={(e) => setIsVisible(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isVisible" className="ml-2 block text-sm text-gray-900">
          Afficher ce composant
        </label>
      </div>
      
      {/* Barre d'outils pour l'éditeur */}
      <div className="mb-2 flex flex-wrap gap-2 p-2 bg-gray-100 rounded">
        <button 
          type="button"
          onClick={() => insertHtmlElement('h1')}
          className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
          title="Titre principal"
        >
          H1
        </button>
        <button 
          type="button"
          onClick={() => insertHtmlElement('h2')}
          className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
          title="Sous-titre"
        >
          H2
        </button>
        <button 
          type="button"
          onClick={() => insertHtmlElement('p')}
          className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
          title="Paragraphe"
        >
          P
        </button>
        <button 
          type="button"
          onClick={() => insertHtmlElement('strong')}
          className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm font-bold"
          title="Texte en gras"
        >
          B
        </button>
        <button 
          type="button"
          onClick={() => insertHtmlElement('em')}
          className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm italic"
          title="Texte en italique"
        >
          I
        </button>
        <button 
          type="button"
          onClick={() => insertHtmlElement('ul')}
          className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
          title="Liste à puces"
        >
          UL
        </button>
        <button 
          type="button"
          onClick={() => insertHtmlElement('ol')}
          className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
          title="Liste numérotée"
        >
          OL
        </button>
        <button 
          type="button"
          onClick={() => insertHtmlElement('li')}
          className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
          title="Élément de liste"
        >
          LI
        </button>
        <button 
          type="button"
          onClick={() => insertHtmlElement('a', { href: '#' })}
          className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm text-blue-600 underline"
          title="Lien"
        >
          Lien
        </button>
        <button 
          type="button" 
          onClick={() => insertHtmlElement('blockquote')}
          className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
          title="Citation"
        >
          Citation
        </button>
      </div>
      
      {/* Éditeur de texte */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Contenu HTML</label>
        <textarea
          value={content}
          onChange={handleContentChange}
          className="w-full p-2 border rounded h-64 font-mono text-sm focus:ring-2 focus:ring-blue-500"
          placeholder="Entrez le contenu HTML ici..."
        />
      </div>
      
      {/* Aperçu */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Aperçu</h4>
        <div 
          className="border p-4 rounded bg-white min-h-32 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
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
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}