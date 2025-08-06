import React, { useState, useEffect } from 'react';
import { PanelComponentType } from '@shared/types/PanelComponents';
import { ComponentEditor } from './components/ComponentEditor';

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
  config: Record<string, any>;
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
 * Constructeur de panel modulaire
 * Permet de créer et éditer un panel avec différents types de composants
 */
export function PanelBuilder({ panelId, chimeraId, editorialId, onSave, onCancel }: PanelBuilderProps) {
  // État pour le titre du panel
  const [panelTitle, setPanelTitle] = useState('Nouveau panel');
  
  // État pour la liste des composants
  const [components, setComponents] = useState<EditableComponent[]>([]);
  
  // État pour le composant actuellement sélectionné pour édition
  const [selectedComponent, setSelectedComponent] = useState<EditableComponent | null>(null);
  
  // État pour le mode d'édition (true = mode édition, false = mode prévisualisation)
  const [editMode, setEditMode] = useState<boolean>(false);
  
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
  
  // Chargement des données existantes si modification et récupération des infos de la chimère
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
          actions: []
        };
      // Ajouter d'autres configurations par défaut selon les types
      default:
        return {};
    }
  };
  
  // Mettre à jour un composant
  const handleUpdateComponent = (updatedComponent: EditableComponent) => {
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
      let cleanConfig = {};
      
      try {
        // S'assurer que config est un objet valide
        if (comp.config && typeof comp.config === 'object') {
          cleanConfig = comp.config;
        } else if (typeof comp.config === 'string') {
          // Tenter de parser si c'est une chaîne JSON
          cleanConfig = JSON.parse(comp.config);
        }
      } catch (error) {
        console.error("Erreur lors du traitement du contenu du composant:", error);
        // En cas d'erreur, utiliser un objet vide comme fallback
        cleanConfig = {};
      }
      
      return {
        type: comp.type,
        order: comp.order,
        title: comp.title || "",
        description: comp.description || "",
        isVisible: comp.isVisible !== undefined ? comp.isVisible : true,
        content: cleanConfig
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
  
  // Rendu du constructeur de panel
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
                
                {/* Composants spécialisés */}
                <div className="w-full h-px bg-gray-300 my-4"></div>
                
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
                
                <button 
                  onClick={() => handleAddComponent(PanelComponentType.WALLET)}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded flex items-center"
                >
                  <span className="material-icons mr-2">account_balance_wallet</span>
                  <span>Wallet</span>
                </button>
                
                <button 
                  onClick={() => handleAddComponent(PanelComponentType.GALLERY)}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded flex items-center"
                >
                  <span className="material-icons mr-2">collections</span>
                  <span>Galerie</span>
                </button>
                
                <button 
                  onClick={() => handleAddComponent(PanelComponentType.VIDEO)}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded flex items-center"
                >
                  <span className="material-icons mr-2">videocam</span>
                  <span>Vidéo</span>
                </button>
                
                <button 
                  onClick={() => handleAddComponent(PanelComponentType.AUDIO)}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded flex items-center"
                >
                  <span className="material-icons mr-2">audiotrack</span>
                  <span>Audio</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Éditeur de composants ou liste de prévisualisation */}
          <div className="lg:col-span-5">
            {selectedComponent ? (
              /* Afficher l'éditeur de composant quand un composant est sélectionné */
              <div className="bg-white rounded-lg shadow-md">
                <ComponentEditor
                  component={selectedComponent}
                  onUpdate={handleUpdateComponent}
                  onCancel={() => setSelectedComponent(null)}
                />
              </div>
            ) : (
              /* Afficher la liste des composants quand aucun n'est sélectionné */
              <div className="bg-white rounded-lg shadow-md p-6 h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Composants du panel</h2>
                  {components.length > 0 && (
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center"
                    >
                      <span className="material-icons mr-1 text-sm">
                        {editMode ? 'visibility' : 'edit'}
                      </span>
                      {editMode ? 'Prévisualiser' : 'Éditer'}
                    </button>
                  )}
                </div>
                
                {components.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <p>Aucun composant ajouté</p>
                    <p className="text-sm mt-2">Utilisez le panneau de gauche pour ajouter des composants</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {components.map((component) => (
                      <div 
                        key={component.id} 
                        className={`p-4 border rounded-lg cursor-pointer transition ${
                          selectedComponent?.id === component.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedComponent(component)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium flex items-center">
                            <span className="material-icons mr-2 text-sm">
                              {getIconForComponentType(component.type)}
                            </span>
                            <span>{component.title || `${component.type} sans titre`}</span>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Toggle visibility
                                handleUpdateComponent({
                                  ...component,
                                  isVisible: !component.isVisible
                                });
                              }}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <span className="material-icons text-sm">
                                {component.isVisible ? 'visibility' : 'visibility_off'}
                              </span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteComponent(component.id);
                              }}
                              className="p-1 text-gray-500 hover:text-red-500"
                            >
                              <span className="material-icons text-sm">delete</span>
                            </button>
                        </div>
                      </div>
                      
                      {/* Aperçu du composant */}
                      <div className="text-sm text-gray-500">
                        {getComponentPreview(component)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Éditeur du composant sélectionné */}
          <div className="lg:col-span-4">
            {selectedComponent ? (
              <div className="bg-white rounded-lg shadow-md p-6 h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Éditer le composant</h2>
                  <button 
                    onClick={() => setSelectedComponent(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>
                
                {/* Formulaire d'édition spécifique au type */}
                <div className="space-y-4">
                  {/* Champs communs à tous les types */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                    <input
                      type="text"
                      value={selectedComponent.title || ''}
                      onChange={(e) => handleUpdateComponent({
                        ...selectedComponent,
                        title: e.target.value
                      })}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={selectedComponent.description || ''}
                      onChange={(e) => handleUpdateComponent({
                        ...selectedComponent,
                        description: e.target.value
                      })}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="componentVisibility"
                      checked={selectedComponent.isVisible}
                      onChange={(e) => handleUpdateComponent({
                        ...selectedComponent,
                        isVisible: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="componentVisibility" className="ml-2 block text-sm text-gray-900">
                      Visible
                    </label>
                  </div>
                  
                  {/* Champs spécifiques selon le type */}
                  {renderComponentEditor(selectedComponent, handleUpdateComponent)}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col items-center justify-center text-center text-gray-500">
                <p>Sélectionnez un composant pour l'éditer ou ajoutez-en un nouveau depuis le panneau de gauche.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// La fonction getIconForComponentType est déjà définie plus haut dans le fichier

// Helper function pour obtenir un aperçu du contenu du composant
function getComponentPreview(component: EditableComponent): React.ReactNode {
  switch (component.type) {
    case PanelComponentType.TEXT:
      return <span>Texte: {truncate(component.config.content?.replace(/<[^>]*>/g, '') || 'Aucun contenu')}</span>;
    case PanelComponentType.IMAGE:
      return <span>Image: {component.config.imageUrl ? 'Chargée' : 'Non définie'}</span>;
    case PanelComponentType.MAP:
      return <span>Carte: {component.config.coordinates?.lat}, {component.config.coordinates?.lng} (zoom: {component.config.zoom})</span>;
    case PanelComponentType.PODCAST:
      return <span>Podcast: {component.config.audioUrl ? truncate(component.config.audioUrl) : 'Non défini'}</span>;
    case PanelComponentType.WALLET:
      return <span>Wallet: {truncate(component.config.address || 'Non défini')}</span>;
    case PanelComponentType.GALLERY:
      return <span>Galerie: {component.config.images?.length || 0} images</span>;
    case PanelComponentType.VIDEO:
      return <span>Vidéo: {component.config.videoUrl ? truncate(component.config.videoUrl) : 'Non définie'}</span>;
    case PanelComponentType.AUDIO:
      return <span>Audio: {component.config.audioUrl ? truncate(component.config.audioUrl) : 'Non défini'}</span>;
    case PanelComponentType.BUTTON:
      return <span>Bouton: {component.config.text || 'Sans texte'}</span>;
    default:
      return <span>{component.type}</span>;
  }
}

// Helper function pour tronquer un texte
function truncate(text: string, length = 50): string {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

// Fonction pour rendre l'éditeur spécifique au type de composant
function renderComponentEditor(component: EditableComponent, onUpdate: (component: EditableComponent) => void): React.ReactNode {
  switch (component.type) {
    case PanelComponentType.TEXT:
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
          <textarea
            value={component.config.content || ''}
            onChange={(e) => onUpdate({
              ...component,
              config: { ...component.config, content: e.target.value }
            })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            rows={5}
          />
        </div>
      );
      
    case PanelComponentType.IMAGE:
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
            <input
              type="text"
              value={component.config.imageUrl || ''}
              onChange={(e) => onUpdate({
                ...component,
                config: { ...component.config, imageUrl: e.target.value }
              })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Aperçu de l'image direct */}
          {component.config.imageUrl && (
            <div className="mt-2 border rounded-lg overflow-hidden">
              <img 
                src={component.config.imageUrl}
                alt={component.config.altText || 'Image du panel'}
                className="w-full max-h-48 object-contain"
              />
              {component.config.caption && (
                <div className="p-2 bg-gray-100 text-sm text-center">
                  {component.config.caption}
                </div>
              )}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texte alternatif</label>
            <input
              type="text"
              value={component.config.altText || ''}
              onChange={(e) => onUpdate({
                ...component,
                config: { ...component.config, altText: e.target.value }
              })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Légende</label>
            <input
              type="text"
              value={component.config.caption || ''}
              onChange={(e) => onUpdate({
                ...component,
                config: { ...component.config, caption: e.target.value }
              })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      );
      
    case PanelComponentType.MAP:
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={component.config.coordinates?.lat || 0}
                onChange={(e) => onUpdate({
                  ...component,
                  config: { 
                    ...component.config, 
                    coordinates: { 
                      ...component.config.coordinates,
                      lat: parseFloat(e.target.value) 
                    } 
                  }
                })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={component.config.coordinates?.lng || 0}
                onChange={(e) => onUpdate({
                  ...component,
                  config: { 
                    ...component.config, 
                    coordinates: { 
                      ...component.config.coordinates,
                      lng: parseFloat(e.target.value) 
                    } 
                  }
                })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niveau de zoom</label>
            <input
              type="range"
              min="1"
              max="20"
              value={component.config.zoom || 10}
              onChange={(e) => onUpdate({
                ...component,
                config: { ...component.config, zoom: parseInt(e.target.value) }
              })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>{component.config.zoom || 10}</span>
              <span>20</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Style de carte</label>
            <select
              value={component.config.mapStyle || 'standard'}
              onChange={(e) => onUpdate({
                ...component,
                config: { ...component.config, mapStyle: e.target.value }
              })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="standard">Standard</option>
              <option value="satellite">Satellite</option>
              <option value="terrain">Terrain</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="mapInteractive"
              checked={component.config.interactive !== false}
              onChange={(e) => onUpdate({
                ...component,
                config: { ...component.config, interactive: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="mapInteractive" className="ml-2 block text-sm text-gray-900">
              Carte interactive
            </label>
          </div>
        </div>
      );
      
    case PanelComponentType.PODCAST:
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'audio</label>
            <input
              type="text"
              value={component.config.audioUrl || ''}
              onChange={(e) => onUpdate({
                ...component,
                config: { ...component.config, audioUrl: e.target.value }
              })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image de couverture</label>
            <input
              type="text"
              value={component.config.coverImageUrl || ''}
              onChange={(e) => onUpdate({
                ...component,
                config: { ...component.config, coverImageUrl: e.target.value }
              })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
            <input
              type="text"
              value={component.config.author || ''}
              onChange={(e) => onUpdate({
                ...component,
                config: { ...component.config, author: e.target.value }
              })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durée (secondes)</label>
            <input
              type="number"
              value={component.config.duration || 0}
              onChange={(e) => onUpdate({
                ...component,
                config: { ...component.config, duration: parseInt(e.target.value) }
              })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      );
      
    case PanelComponentType.WALLET:
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse du wallet</label>
            <input
              type="text"
              value={component.config.address || ''}
              onChange={(e) => onUpdate({
                ...component,
                config: { ...component.config, address: e.target.value }
              })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Réseau</label>
            <select
              value={component.config.network || 'ethereum'}
              onChange={(e) => onUpdate({
                ...component,
                config: { ...component.config, network: e.target.value }
              })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="solana">Solana</option>
              <option value="bitcoin">Bitcoin</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="displayBalance"
              checked={component.config.displayBalance !== false}
              onChange={(e) => onUpdate({
                ...component,
                config: { ...component.config, displayBalance: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="displayBalance" className="ml-2 block text-sm text-gray-900">
              Afficher le solde
            </label>
          </div>
        </div>
      );
      
    // Ajouter d'autres éditeurs spécifiques aux types ici
    
    default:
      return (
        <div className="py-4 text-center text-gray-500">
          <p>L'éditeur pour ce type de composant n'est pas encore implémenté.</p>
        </div>
      );
  }
}