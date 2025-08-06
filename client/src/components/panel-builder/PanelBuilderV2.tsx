import React, { useState, useEffect } from 'react';
import { PanelComponentType } from '@shared/types/PanelComponents';
import { ComponentEditor } from './components/ComponentEditor';
import { SimpleImageUploader } from './components/SimpleImageUploader';
import { formatImagePathForDisplay } from '@/utils/imageUtils';

// Types pour l'éditeur de panel
interface PanelBuilderProps {
  panelId?: number;
  chimeraId?: number; 
  editorialId?: number;
  onSave: (panelData: any) => void;
  onCancel: () => void;
}

// Type pour un composant en cours d'édition
export interface EditableComponent {
  id: string;
  type: PanelComponentType;
  order: number;
  title?: string;
  description?: string;
  isVisible: boolean;
  // Contenu spécifique au type
  config?: Record<string, any>;
  content?: Record<string, any>;
}

/**
 * Renvoie l'icône Material correspondant au type de composant
 */
const getIconForComponentType = (type: PanelComponentType): string => {
  switch (type) {
    case PanelComponentType.TEXT:
      return 'text_fields';
    case PanelComponentType.IMAGE:
      return 'image';
    case PanelComponentType.DIVIDER:
      return 'horizontal_rule';
    case PanelComponentType.BUTTON:
      return 'smart_button';
    case PanelComponentType.MAP:
      return 'map';
    case PanelComponentType.PODCAST:
      return 'podcasts';
    case PanelComponentType.WALLET:
      return 'account_balance_wallet';
    case PanelComponentType.GALLERY:
      return 'collections';
    case PanelComponentType.VIDEO:
      return 'videocam';
    case PanelComponentType.AUDIO:
      return 'audiotrack';
    case PanelComponentType.FORM:
      return 'dynamic_form';
    case PanelComponentType.SOCIAL:
      return 'share';
    case PanelComponentType.LINK:
      return 'link';
    default:
      return 'widgets';
  }
};

/**
 * Constructeur de panel modulaire amélioré
 * Permet de créer et éditer un panel avec différents types de composants
 * Inclut une interface utilisateur améliorée pour l'édition des composants
 */
export function PanelBuilderV2({ panelId, chimeraId, editorialId, onSave, onCancel }: PanelBuilderProps) {
  // État pour le titre du panel
  const [panelTitle, setPanelTitle] = useState('Nouveau panel');
  
  // État pour la liste des composants
  const [components, setComponents] = useState<EditableComponent[]>([]);
  
  // État pour le composant actuellement sélectionné pour édition
  const [selectedComponent, setSelectedComponent] = useState<EditableComponent | null>(null);
  
  // État pour le thème du panel
  const [theme, setTheme] = useState<'light' | 'dark' | 'custom'>('light');
  
  // État pour le thème personnalisé
  const [customTheme, setCustomTheme] = useState({
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  });
  
  // État de publication du panel
  const [isPublished, setIsPublished] = useState(false);
  
  // Chargement des données existantes si modification
  useEffect(() => {
    const loadData = async () => {
      // Si c'est un panel existant, on le charge
      if (panelId) {
        try {
          const response = await fetch(`/api/panels/${panelId}`);
          if (response.ok) {
            const panelData = await response.json();
            
            // Initialiser les états avec les données du panel
            setPanelTitle(panelData.title);
            
            // Convertir les composants du format BD au format éditable
            if (panelData.components && Array.isArray(panelData.components)) {
              const editableComponents = panelData.components.map((component: any) => ({
                id: component.id || `component-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                type: component.type,
                order: component.order,
                title: component.title || '',
                description: component.description || '',
                isVisible: component.isVisible !== undefined ? component.isVisible : true,
                config: component.content || {} // Contenu spécifique au composant
              }));
              
              setComponents(editableComponents);
            }
            
            setTheme(panelData.theme || 'light');
            
            if (panelData.customTheme) {
              setCustomTheme({
                primaryColor: panelData.customTheme.primaryColor || '#3b82f6',
                backgroundColor: panelData.customTheme.backgroundColor || '#ffffff',
                textColor: panelData.customTheme.textColor || '#1f2937'
              });
            }
            
            setIsPublished(panelData.isPublished);
          }
        } catch (error) {
          console.error('Erreur lors du chargement du panel:', error);
        }
      } 
      // Si c'est un nouveau panel et qu'on a une chimère associée, on récupère ses infos
      else if (chimeraId) {
        try {
          const response = await fetch(`/api/chimeras/${chimeraId}`);
          if (response.ok) {
            const chimeraData = await response.json();
            // On utilise le nom de la chimère pour le titre du panel
            setPanelTitle(`Panel de ${chimeraData.name} (${chimeraData.reference})`);
            
            // Ajout automatique d'un composant texte avec les infos de la chimère
            const newComponent: EditableComponent = {
              id: `text-${Date.now()}`,
              type: PanelComponentType.TEXT,
              order: 0,
              title: "Informations principales",
              description: "Détails de la chimère",
              isVisible: true,
              config: { 
                content: `
                  <h2>${chimeraData.name}</h2>
                  <p><strong>Référence:</strong> ${chimeraData.reference}</p>
                  <p><strong>Type:</strong> ${chimeraData.type}</p>
                  <p><strong>Collection:</strong> ${chimeraData.collection || 'Non spécifiée'}</p>
                  <p><strong>Rareté:</strong> ${chimeraData.rarity || 'Non spécifiée'}</p>
                  ${chimeraData.description ? `<p>${chimeraData.description}</p>` : ''}
                `
              }
            };
            
            // Ajout automatique d'un composant image avec l'image de la chimère si disponible
            if (chimeraData.imageUrl) {
              console.log("Image NFT détectée:", chimeraData.imageUrl);
              
              // Création du composant image avec l'URL directe
              const imageComponent: EditableComponent = {
                id: `image-${Date.now()}`,
                type: PanelComponentType.IMAGE,
                order: 1,
                title: "Image de la chimère",
                isVisible: true,
                config: { 
                  imageUrl: chimeraData.imageUrl,
                  altText: `Image de ${chimeraData.name}`,
                  caption: chimeraData.name
                }
              };
              setComponents([newComponent, imageComponent]);
            } else {
              setComponents([newComponent]);
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données de la chimère:', error);
        }
      }
    };
    
    loadData();
  }, [panelId, chimeraId]);
  
  // Ajouter un nouveau composant
  const handleAddComponent = (type: PanelComponentType) => {
    const newComponent: EditableComponent = {
      id: `temp-${Date.now()}`,
      type,
      order: components.length,
      title: `Nouveau ${type}`,
      isVisible: true,
      config: getDefaultConfigForType(type)
    };
    
    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent);
  };
  
  // Obtenir la configuration par défaut pour un type de composant
  const getDefaultConfigForType = (type: PanelComponentType) => {
    switch (type) {
      case PanelComponentType.TEXT:
        return { content: '<p>Entrez votre texte ici</p>' };
      case PanelComponentType.IMAGE:
        return { imageUrl: '', altText: '', caption: '' };
      case PanelComponentType.MAP:
        return { 
          coordinates: { lat: 48.8566, lng: 2.3522 },
          zoom: 10,
          markers: []
        };
      case PanelComponentType.PODCAST:
        return {
          audioUrl: '',
          coverImageUrl: '',
          author: '',
          duration: 0,
          chapters: []
        };
      case PanelComponentType.WALLET:
        return {
          address: '',
          network: 'ethereum',
          displayBalance: true,
          actions: [
            { type: 'send', enabled: true },
            { type: 'receive', enabled: true },
            { type: 'swap', enabled: false }
          ]
        };
      default:
        return {};
    }
  };
  
  // Mettre à jour un composant
  const handleUpdateComponent = (updatedComponent: EditableComponent) => {
    console.log("Mise à jour du composant:", updatedComponent);
    setComponents(components.map(comp => 
      comp.id === updatedComponent.id ? updatedComponent : comp
    ));
  };
  
  // Supprimer un composant
  const handleDeleteComponent = (componentId: string) => {
    setComponents(components.filter(comp => comp.id !== componentId));
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
  };
  
  // Réordonner les composants
  const handleReorderComponents = (dragIndex: number, hoverIndex: number) => {
    const reorderedComponents = [...components];
    const draggedComponent = reorderedComponents[dragIndex];
    
    // Retirer le composant de son ancienne position
    reorderedComponents.splice(dragIndex, 1);
    
    // Insérer le composant dans sa nouvelle position
    reorderedComponents.splice(hoverIndex, 0, draggedComponent);
    
    // Mettre à jour les ordres
    reorderedComponents.forEach((comp, index) => {
      comp.order = index;
    });
    
    setComponents(reorderedComponents);
  };
  
  // Sauvegarder le panel
  const handleSave = async () => {
    console.log("Préparation des données pour sauvegarde du panel...");
    
    // Préparer les composants pour l'envoi à l'API
    const formattedComponents = components.map(comp => {
      console.log(`Préparation du composant type=${comp.type}, id=${comp.id}`);
      
      // Vérifier et nettoyer le contenu du composant
      let cleanContent = {};
      
      try {
        // Priorité au content si il existe, sinon utiliser config
        const sourceContent = (comp as any).content || (comp as any).config;
        
        // S'assurer que le contenu est un objet valide
        if (sourceContent && typeof sourceContent === 'object') {
          cleanContent = sourceContent;
        } else if (typeof sourceContent === 'string') {
          // Tenter de parser si c'est une chaîne JSON
          cleanContent = JSON.parse(sourceContent);
        }
      } catch (error) {
        console.error("Erreur lors du traitement du contenu du composant:", error);
        // En cas d'erreur, utiliser un objet vide comme fallback
        cleanContent = {};
      }
      
      return {
        type: comp.type,
        order: comp.order,
        title: comp.title || "",
        description: comp.description || "",
        isVisible: comp.isVisible !== undefined ? comp.isVisible : true,
        content: cleanContent
      };
    });
    
    // Construire l'objet complet à envoyer à l'API
    const panelData = {
      title: panelTitle,
      chimeraId,
      editorialId,
      theme,
      customTheme: theme === 'custom' ? customTheme : undefined,
      isPublished,
      components: formattedComponents
    };
    
    console.log("Données du panel prêtes pour l'envoi:", panelData);
    
    // Appeler la fonction de sauvegarde passée en prop
    onSave(panelData);
  };
  
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto py-8">
        {/* Barre supérieure avec boutons d'action */}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">{panelId ? 'Modifier le panel' : 'Nouveau panel'}</h1>
          <div className="space-x-2">
            <button 
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Annuler
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </div>
        
        {/* Bouton de sauvegarde fixe en bas de l'écran */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50 border-t border-gray-200">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-sm text-gray-600">
              N'oubliez pas d'enregistrer vos modifications !
            </div>
            <button 
              onClick={handleSave}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center font-bold shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Enregistrer les modifications
            </button>
          </div>
        </div>
        
        {/* Paramètres généraux du panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre du panel</label>
            <input
              type="text"
              value={panelTitle}
              onChange={(e) => setPanelTitle(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thème</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'custom')}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                Publier le panel
              </label>
            </div>
          </div>
          
          {/* Thème personnalisé */}
          {theme === 'custom' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Couleur principale</label>
                <div className="flex">
                  <input
                    type="color"
                    value={customTheme.primaryColor}
                    onChange={(e) => setCustomTheme({...customTheme, primaryColor: e.target.value})}
                    className="h-10 w-10 rounded"
                  />
                  <input
                    type="text"
                    value={customTheme.primaryColor}
                    onChange={(e) => setCustomTheme({...customTheme, primaryColor: e.target.value})}
                    className="ml-2 w-full p-2 border rounded"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Couleur de fond</label>
                <div className="flex">
                  <input
                    type="color"
                    value={customTheme.backgroundColor}
                    onChange={(e) => setCustomTheme({...customTheme, backgroundColor: e.target.value})}
                    className="h-10 w-10 rounded"
                  />
                  <input
                    type="text"
                    value={customTheme.backgroundColor}
                    onChange={(e) => setCustomTheme({...customTheme, backgroundColor: e.target.value})}
                    className="ml-2 w-full p-2 border rounded"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Couleur du texte</label>
                <div className="flex">
                  <input
                    type="color"
                    value={customTheme.textColor}
                    onChange={(e) => setCustomTheme({...customTheme, textColor: e.target.value})}
                    className="h-10 w-10 rounded"
                  />
                  <input
                    type="text"
                    value={customTheme.textColor}
                    onChange={(e) => setCustomTheme({...customTheme, textColor: e.target.value})}
                    className="ml-2 w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Interface principale du constructeur */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sélecteur de composants */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <h2 className="text-xl font-semibold mb-4">Ajouter des composants</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => handleAddComponent(PanelComponentType.TEXT)}
                  className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded flex items-center"
                >
                  <span className="material-icons mr-2">text_fields</span>
                  <span>Texte</span>
                </button>
                
                <button 
                  onClick={() => handleAddComponent(PanelComponentType.IMAGE)}
                  className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded flex items-center"
                >
                  <span className="material-icons mr-2">image</span>
                  <span>Image</span>
                </button>
                
                <button 
                  onClick={() => handleAddComponent(PanelComponentType.DIVIDER)}
                  className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded flex items-center"
                >
                  <span className="material-icons mr-2">horizontal_rule</span>
                  <span>Séparateur</span>
                </button>
                
                <button 
                  onClick={() => handleAddComponent(PanelComponentType.BUTTON)}
                  className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded flex items-center"
                >
                  <span className="material-icons mr-2">smart_button</span>
                  <span>Bouton</span>
                </button>
                
                {/* Séparateur */}
                <div className="border-t border-gray-200 my-2"></div>
                
                {/* Composants avancés */}
                <button 
                  onClick={() => handleAddComponent(PanelComponentType.WALLET)}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded flex items-center"
                >
                  <span className="material-icons mr-2">account_balance_wallet</span>
                  <span>Wallet</span>
                </button>
                
                <button 
                  onClick={() => handleAddComponent(PanelComponentType.MAP)}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded flex items-center"
                >
                  <span className="material-icons mr-2">map</span>
                  <span>Carte</span>
                </button>
                
                <button 
                  onClick={() => handleAddComponent(PanelComponentType.PODCAST)}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded flex items-center"
                >
                  <span className="material-icons mr-2">podcasts</span>
                  <span>Podcast</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Zone d'édition / prévisualisation */}
          <div className="lg:col-span-9">
            {selectedComponent ? (
              /* Afficher l'éditeur de composant approprié */
              console.log("🔍 selectedComponent:", selectedComponent.type, "IMAGE:", PanelComponentType.IMAGE),
              selectedComponent.type === PanelComponentType.IMAGE ? (
                <SimpleImageUploader
                  component={selectedComponent}
                  onUpdate={handleUpdateComponent}
                  onCancel={() => setSelectedComponent(null)}
                />
              ) : (
                <ComponentEditor
                  component={selectedComponent}
                  onUpdate={handleUpdateComponent}
                  onCancel={() => setSelectedComponent(null)}
                />
              )
            ) : (
              /* Afficher la liste des composants et la prévisualisation */
              <div className="space-y-6">
                {/* Liste des composants ajoutés */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Composants du panel</h2>
                  
                  {components.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <p className="text-gray-500">
                        Aucun composant ajouté. Utilisez le menu à gauche pour ajouter des composants à votre panel.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {components.map((component, index) => (
                        <div 
                          key={component.id}
                          className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <span className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full mr-3 text-gray-700">
                                {index + 1}
                              </span>
                              <div>
                                <h3 className="font-medium">
                                  {component.title || `Composant ${component.type}`}
                                  {!component.isVisible && (
                                    <span className="ml-2 text-xs text-gray-500">(masqué)</span>
                                  )}
                                </h3>
                                <span className="text-xs text-gray-500 capitalize">{component.type}</span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => setSelectedComponent(component)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="Éditer"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              
                              <button 
                                onClick={() => handleDeleteComponent(component.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Supprimer"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              
                              {index > 0 && (
                                <button 
                                  onClick={() => handleReorderComponents(index, index - 1)}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                  title="Déplacer vers le haut"
                                >
                                  <span className="material-icons text-sm">arrow_upward</span>
                                </button>
                              )}
                              
                              {index < components.length - 1 && (
                                <button 
                                  onClick={() => handleReorderComponents(index, index + 1)}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                  title="Déplacer vers le bas"
                                >
                                  <span className="material-icons text-sm">arrow_downward</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Aperçu du panel */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Aperçu du panel</h2>
                  
                  <div className={`border rounded-lg p-6 ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-white' 
                      : theme === 'custom' 
                        ? '' 
                        : 'bg-white'
                  }`}
                  style={theme === 'custom' ? {
                    backgroundColor: customTheme.backgroundColor,
                    color: customTheme.textColor
                  } : {}}
                  >
                    <h2 className="text-2xl font-bold mb-4">{panelTitle}</h2>
                    
                    {components.length === 0 ? (
                      <p className="text-gray-500">
                        Ajoutez des composants pour voir l'aperçu du panel.
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {components.filter(c => c.isVisible).map((component) => (
                          <div key={component.id} className="border-b pb-4 last:border-b-0">
                            {component.title && (
                              <h3 className="font-semibold mb-2">{component.title}</h3>
                            )}
                            
                            {component.type === PanelComponentType.TEXT && (
                              <div 
                                className="prose max-w-none" 
                                dangerouslySetInnerHTML={{ __html: component.config.content || '<p>Contenu du texte</p>' }}
                              />
                            )}
                            
                            {component.type === PanelComponentType.IMAGE && (
                              <div 
                                className="relative image-zoom-container"
                                onMouseEnter={() => console.log('🔍 ZOOM: Image survolée - activation zoom')}
                                onMouseLeave={() => console.log('🔍 ZOOM: Image quittée - désactivation zoom')}
                              >
                                {(() => {
                                  // Support des deux structures de données
                                  const imageUrl = component.content?.imageUrl || component.config?.imageUrl;
                                  const altText = component.content?.altText || component.config?.altText || 'Image';
                                  const caption = component.content?.caption || component.config?.caption;
                                  
                                  return imageUrl ? (
                                    <figure className="relative overflow-hidden">
                                      <img 
                                        src={formatImagePathForDisplay(imageUrl)} 
                                        alt={altText} 
                                        className="max-w-full rounded transition-transform duration-300 ease-out hover:scale-150"
                                        data-cursor-type="scale"
                                      />
                                      {caption && (
                                        <figcaption className="text-sm text-center mt-2">
                                          {caption}
                                        </figcaption>
                                      )}
                                    </figure>
                                  ) : (
                                    <div className="bg-gray-200 rounded p-8 text-center text-gray-500">
                                      Aucune image définie
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                            
                            {component.type === PanelComponentType.DIVIDER && (
                              <hr className="my-4" />
                            )}
                            
                            {component.type === PanelComponentType.BUTTON && (
                              <button 
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                style={theme === 'custom' ? { backgroundColor: customTheme.primaryColor } : {}}
                              >
                                {component.config.text || 'Bouton'}
                              </button>
                            )}
                            
                            {component.type === PanelComponentType.WALLET && (
                              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex justify-between mb-2">
                                  <span>Réseau:</span>
                                  <span className="font-medium capitalize">{component.config.network || 'ethereum'}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                  <span>Adresse:</span>
                                  <span className="font-mono text-sm">
                                    {component.config.address && component.config.address.length > 10
                                      ? `${component.config.address.substring(0, 6)}...${component.config.address.substring(component.config.address.length - 4)}`
                                      : (component.config.address || '0x...')}
                                  </span>
                                </div>
                                {component.config.displayBalance && (
                                  <div className="flex justify-between">
                                    <span>Balance:</span>
                                    <span>-- ETH</span>
                                  </div>
                                )}
                                
                                {component.config.actions && component.config.actions.some((a: any) => a.enabled) && (
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {component.config.actions
                                      .filter((a: any) => a.enabled)
                                      .map((action: any, i: number) => (
                                        <button 
                                          key={i}
                                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded"
                                          style={theme === 'custom' ? { backgroundColor: customTheme.primaryColor } : {}}
                                        >
                                          {action.type}
                                        </button>
                                      ))
                                    }
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Aperçus pour d'autres types de composants */}
                            {component.type === PanelComponentType.MAP && (
                              <div className="bg-gray-200 rounded p-8 text-center text-gray-500">
                                Aperçu de carte
                              </div>
                            )}
                            
                            {component.type === PanelComponentType.PODCAST && (
                              <div className="bg-gray-200 rounded p-8 text-center text-gray-500">
                                Aperçu de podcast
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}