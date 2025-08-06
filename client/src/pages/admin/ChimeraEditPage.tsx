import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { containerTypeEnum, rarityEnum } from '@shared/schema';
import { formatImagePathForDisplay } from '../../utils/imageUtils';
import { FileUploader } from '../../components/admin/FileUploader';
import { AudioComponentEditor } from '../../components/panel-builder/components/AudioComponentEditor';

// Page d'édition d'une fiche chimère
export function ChimeraEditPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const isNewChimera = id === 'new';
  
  console.log('🔍 ChimeraEditPage - id:', id, 'isNewChimera:', isNewChimera);
  
  // État pour gérer les onglets et les panels
  const [activeTab, setActiveTab] = useState<'identity' | 'panels'>('identity');
  const [showPanelEditor, setShowPanelEditor] = useState(false);
  const [currentPanelId, setCurrentPanelId] = useState<string | number>('new');
  const [loadedPanels, setLoadedPanels] = useState<any[]>([]);
  
  // État pour gérer l'interface d'édition des panels
  const [showComponentMenu, setShowComponentMenu] = useState(false);
  const [selectedComponentType, setSelectedComponentType] = useState<string | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [hasFormChanges, setHasFormChanges] = useState(false);
  // Nous n'avons plus besoin de stocker le titre du panel dans l'état, 
  // car il sera généré au moment de l'enregistrement
  
  const [currentEditValues, setCurrentEditValues] = useState<{
    title?: string;
    content?: string;
    imageUrl?: string;
    showTitle?: boolean;
    scrollable?: boolean;
  }>({});
  const [panelComponents, setPanelComponents] = useState<Array<{
    id: string;
    type: string;
    title: string;
    content?: string;
    imageUrl?: string;
    options?: {
      showTitle?: boolean;
      scrollable?: boolean;
    };
    order: number;
  }>>([]);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    description: '',
    imageUrl: '',
    price: '',
    collection: '',
    type: 'FREE',
    creator: '',
    rarity: 'Common',
    attributes: [{trait_type: '', value: ''}],
    isHidden: false
  });

  // État des attributs
  const [attributes, setAttributes] = useState<{trait_type: string, value: string}[]>([
    {trait_type: '', value: ''}
  ]);

  // État pour suivre les changements des composants du panel
  const [hasPanelChanges, setHasPanelChanges] = useState(false);

  // Feedback utilisateur
  const [formStatus, setFormStatus] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  // Récupérer les données de la chimère si mode édition
  const { data: chimera, isLoading, error } = useQuery({
    queryKey: [`/api/chimeras/${id}`],
    enabled: !isNewChimera && id !== undefined && id !== 'new',
    staleTime: 30000, // 30 secondes
  });

  // Préremplir le formulaire avec les données existantes
  useEffect(() => {
    if (chimera && !isNewChimera) {
      // Logguer les données de la chimère pour le débogage
      console.log("Données de la chimère chargées:", chimera);
      console.log("URL de l'image originale:", chimera.imageUrl);
      
      setFormData({
        name: chimera.name || '',
        reference: chimera.reference || '',
        description: chimera.description || '',
        imageUrl: chimera.imageUrl || '',
        price: chimera.price || '',
        collection: chimera.collection || '',
        type: chimera.type || 'FREE',
        creator: chimera.creator || '',
        rarity: chimera.rarity || 'Common',
        attributes: chimera.attributes || [{trait_type: '', value: ''}],
        isHidden: chimera.isHidden || false
      });
      
      // Initialiser les attributs
      if (chimera.attributes && Array.isArray(chimera.attributes)) {
        setAttributes(chimera.attributes);
      }
      
      // Charger les panels associés à cette chimère
      fetchPanelsForChimera();
    }
  }, [chimera, isNewChimera]);
  
  // Fonction pour charger le panel de la chimère actuelle
  const fetchPanelsForChimera = async () => {
    try {
      if (!id || isNewChimera) return;
      
      const response = await fetch(`/api/panels?chimeraId=${id}`);
      if (response.ok) {
        const panels = await response.json();
        console.log('Panels chargés:', panels);
        setLoadedPanels(panels);
        
        // Si on a trouvé au moins un panel, charger automatiquement le premier
        if (panels && panels.length > 0) {
          // Charger le premier panel (il ne devrait y en avoir qu'un seul par chimère)
          loadPanelForEditing(panels[0].id);
        }
      } else {
        console.error('Erreur lors du chargement des panels');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des panels:', error);
    }
  };
  
  // Fonction pour charger un panel spécifique pour l'édition
  const loadPanelForEditing = async (panelId: number | string) => {
    try {
      setFormStatus(null); // Réinitialiser les messages
      
      console.log(`Chargement du panel #${panelId} pour édition`);
      const response = await fetch(`/api/panels/${panelId}`);
      
      if (!response.ok) {
        setFormStatus({
          message: `Erreur lors du chargement du panel #${panelId}`,
          isError: true
        });
        return;
      }
      
      const panelData = await response.json();
      console.log('Données du panel chargées:', panelData);
      console.log('🔍 Composants détaillés du panel:', JSON.stringify(panelData.components, null, 2));
      panelData.components?.forEach((comp: any, idx: number) => {
        console.log(`🔍 Composant ${idx}:`, comp);
        if (comp.content?.imageUrl) {
          console.log(`🔍 Image URL trouvée dans composant ${idx}:`, comp.content.imageUrl);
        }
      });
      
      // Mettre à jour l'état avec les données du panel
      setCurrentPanelId(panelId);
      
      // Formater les composants du panel pour l'interface
      if (panelData.components && Array.isArray(panelData.components)) {
        const formattedComponents = panelData.components.map((comp: any, index: number) => {
          let imageUrl = '';
          let content = comp.content || '';
          
          // Pour les composants image, extraire l'imageUrl du content JSON
          if (comp.type === 'image' && comp.content) {
            try {
              const contentData = typeof comp.content === 'string' ? JSON.parse(comp.content) : comp.content;
              imageUrl = contentData.imageUrl || '';
              content = contentData.imageUrl || ''; // Pour compatibilité
            } catch (e) {
              console.warn('Erreur lors du parsing du content JSON:', e);
            }
          }
          
          return {
            id: `loaded-${comp.id || index}`,
            type: comp.type || 'text',
            title: comp.title || 'Sans titre',
            content: content,
            imageUrl: imageUrl,
            options: comp.options || {},
            order: comp.order || index + 1
          };
        });
        
        setPanelComponents(formattedComponents);
        
        setFormStatus({
          message: `Panel "${panelData.title}" chargé avec succès`,
          isError: false
        });
      } else {
        // Si pas de composants, réinitialiser
        setPanelComponents([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panel:', error);
      setFormStatus({
        message: 'Erreur lors du chargement du panel',
        isError: true
      });
    }
  };

  // Mutation pour créer une nouvelle chimère
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('💾 Création d\'une nouvelle chimère');
      const response = await fetch('/api/chimeras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          attributes: attributes.filter(attr => attr.trait_type && attr.value)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      console.log('✅ Chimère créée avec succès:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/chimeras'] });
      setFormStatus({
        message: 'Chimère créée avec succès!',
        isError: false
      });
      
      setTimeout(() => {
        if (data.id) {
          setLocation(`/admin/chimeras/${data.id}`);
        } else {
          setLocation('/admin/chimeras');
        }
      }, 1500);
    },
    onError: (error: any) => {
      setFormStatus({
        message: `Erreur: ${error.message}`,
        isError: true
      });
    }
  });

  // Mutation pour mettre à jour une chimère existante
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('💾 Mise à jour chimère, id:', id);
      const response = await fetch(`/api/chimeras/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          attributes: attributes.filter(attr => attr.trait_type && attr.value)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      console.log('✅ Chimère sauvegardée avec succès:', data);
      
      // Invalider les requêtes pour actualiser les données
      queryClient.invalidateQueries({ queryKey: ['/api/chimeras'] });
      if (!isNewChimera) {
        queryClient.invalidateQueries({ queryKey: [`/api/chimeras/${id}`] });
      }
      
      setFormStatus({
        message: `Chimère ${isNewChimera ? 'créée' : 'mise à jour'} avec succès!`,
        isError: false
      });
      
      // Réinitialiser le flag de changements
      setHasFormChanges(false);
      
      // Redirection immédiate après sauvegarde
      setTimeout(() => {
        setLocation('/admin/chimeras-gallery');
      }, 800);
    },
    onError: (error: any) => {
      setFormStatus({
        message: `Erreur: ${error.message}`,
        isError: true
      });
    }
  });

  // Gérer les changements de champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Marquer qu'il y a des changements
    setHasFormChanges(true);
    
    // Gérer les cases à cocher
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Gérer les changements d'attributs
  const handleAttributeChange = (index: number, field: 'trait_type' | 'value', value: string) => {
    // Marquer qu'il y a des changements
    setHasFormChanges(true);
    
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  // Ajouter un attribut
  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };

  // Supprimer un attribut
  const removeAttribute = (index: number) => {
    if (attributes.length > 1) {
      const newAttributes = [...attributes];
      newAttributes.splice(index, 1);
      setAttributes(newAttributes);
    }
  };

  // Soumettre le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔍 Détails du formulaire:");
    console.log("- id:", id);
    console.log("- isNewChimera:", isNewChimera);
    console.log("- formData:", formData);
    
    // Forcer le mode création pour les URL avec "/new"
    const forceCreation = id === 'new' || isNewChimera;
    console.log("- forceCreation:", forceCreation);
    
    console.log("🔍 Analyse de l'ID pour soumission:");
    console.log("- id:", id);
    console.log("- typeof id:", typeof id);
    console.log("- id === 'new':", id === 'new');
    console.log("- isNewChimera:", isNewChimera);
    
    // Toujours forcer la création si l'URL contient "/new" ou si pas d'ID valide
    if (id === 'new' || !id || isNewChimera) {
      console.log("🆕 Mode création forcé - nouvelle chimère");
      createMutation.mutate(formData);
    } else if (id && !isNaN(parseInt(id))) {
      console.log("✏️ Mode édition - mise à jour chimère", id);
      updateMutation.mutate(formData);
    } else {
      console.error("❌ Problème d'ID:", id, "Type:", typeof id);
      setFormStatus({
        message: "Erreur: problème d'identification",
        isError: true
      });
    }
  };

  // Basculer vers l'éditeur de panel
  const openPanelEditor = (panelId: string | number = 'new') => {
    setCurrentPanelId(panelId);
    setShowPanelEditor(true);
  };

  // Revenir à la liste des panels
  const closePanelEditor = () => {
    setShowPanelEditor(false);
  };
  
  // Fonction pour créer un composant image avec l'URL uploadée
  const createImageComponent = (imageUrl: string) => {
    const newId = `component-${Date.now()}`;
    const newComponent = {
      id: newId,
      type: 'image',
      title: 'Nouvelle image',
      content: {
        imageUrl: imageUrl,
        showTitle: false,
        scrollable: false
      },
      options: {},
      order: panelComponents.length + 1
    };
    
    setPanelComponents([...panelComponents, newComponent]);
    setHasPanelChanges(true); // Déclencher l'affichage du bouton de sauvegarde
    setShowImageUploader(false);
  };

  // Gestion de l'ajout d'un nouveau composant
  const handleAddComponent = (type: string) => {
    if (type === 'image') {
      // Pour les images, afficher d'abord l'interface d'upload
      setShowImageUploader(true);
      setShowComponentMenu(false);
      return;
    }
    
    const newId = `component-${Date.now()}`;
    const newComponent = {
      id: newId,
      type: type,
      title: `Nouveau ${type}`,
      content: type === 'text' ? 'Cliquez pour éditer ce contenu...' : undefined,
      imageUrl: type === 'image' ? '' : undefined,
      options: {},
      order: panelComponents.length + 1
    };
    
    setPanelComponents([...panelComponents, newComponent]);
    setSelectedComponentType(type);
    setShowComponentMenu(false);
    
    // Marquer qu'il y a des changements dans les composants du panel
    setHasPanelChanges(true);
  };
  
  // Réordonner les composants vers le haut
  const moveComponentUp = (id: string) => {
    const index = panelComponents.findIndex(comp => comp.id === id);
    if (index <= 0) return; // Déjà en haut ou non trouvé
    
    const newComponents = [...panelComponents];
    const temp = newComponents[index - 1];
    newComponents[index - 1] = newComponents[index];
    newComponents[index] = temp;
    
    // Mettre à jour l'ordre
    newComponents.forEach((comp, idx) => {
      comp.order = idx + 1;
    });
    
    setPanelComponents(newComponents);
  };
  
  // Réordonner les composants vers le bas
  const moveComponentDown = (id: string) => {
    const index = panelComponents.findIndex(comp => comp.id === id);
    if (index === -1 || index >= panelComponents.length - 1) return; // Déjà en bas ou non trouvé
    
    const newComponents = [...panelComponents];
    const temp = newComponents[index + 1];
    newComponents[index + 1] = newComponents[index];
    newComponents[index] = temp;
    
    // Mettre à jour l'ordre
    newComponents.forEach((comp, idx) => {
      comp.order = idx + 1;
    });
    
    setPanelComponents(newComponents);
  };
  
  // Supprimer un composant
  const deleteComponent = (id: string) => {
    const newComponents = panelComponents.filter(comp => comp.id !== id);
    
    // Mettre à jour l'ordre
    newComponents.forEach((comp, idx) => {
      comp.order = idx + 1;
    });
    
    setPanelComponents(newComponents);
    
    // Marquer qu'il y a des changements dans les composants du panel
    setHasPanelChanges(true);
  };
  
  // Éditer un composant
  const editComponent = (id: string) => {
    const component = panelComponents.find(comp => comp.id === id);
    if (component) {
      setSelectedComponentId(id);
      setSelectedComponentType(component.type);
      
      // Initialiser les valeurs d'édition
      setCurrentEditValues({
        title: component.title,
        content: component.content,
        imageUrl: component.imageUrl,
        showTitle: component.options?.showTitle || false,
        scrollable: component.options?.scrollable || false
      });
    }
  };
  
  // Gérer les changements dans l'édition d'un composant
  const handleComponentEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCurrentEditValues(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setCurrentEditValues(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Marquer qu'il y a des changements dans les composants du panel
    setHasPanelChanges(true);
  };
  
  // Sauvegarder les modifications d'un composant
  const saveComponentChanges = () => {
    if (!selectedComponentId) return;
    
    const updatedComponents = panelComponents.map(component => {
      if (component.id === selectedComponentId) {
        return {
          ...component,
          title: currentEditValues.title || component.title,
          content: currentEditValues.content || component.content,
          imageUrl: currentEditValues.imageUrl || component.imageUrl,
          options: {
            ...component.options,
            showTitle: currentEditValues.showTitle,
            scrollable: currentEditValues.scrollable
          }
        };
      }
      return component;
    });
    
    setPanelComponents(updatedComponents);
    setSelectedComponentId(null);
    setSelectedComponentType(null);
    setCurrentEditValues({});
  };
  
  // Sauvegarder le panel complet
  const savePanelToServer = async () => {
    try {
      // Préparer les données du panel avec le bon format pour l'API
      // Générer un titre basé sur les données de la chimère
      let generatedTitle = "Nouveau panel";
      if (chimera) {
        // Construire un titre à partir de la référence et du nom de la chimère
        const titleParts = [];
        if (chimera.reference) titleParts.push(chimera.reference);
        if (chimera.name) titleParts.push(chimera.name);
        
        if (titleParts.length > 0) {
          generatedTitle = `Panel ${titleParts.join(' - ')}`;
        }
      }
      
      // Déterminer s'il existe déjà un panel pour cette chimère
      const existingPanel = loadedPanels && loadedPanels.length > 0 
        ? loadedPanels[0] 
        : null;
        
      // Si un panel existe pour cette chimère, on le met à jour
      // Sinon, on en crée un nouveau
      const isUpdate = existingPanel !== null && currentPanelId !== 'new';
      const method = isUpdate ? 'PUT' : 'POST';
      const url = isUpdate ? `/api/panels/${existingPanel?.id}` : '/api/panels';
      
      console.log('📋 Sauvegarde panel - isUpdate:', isUpdate, 'currentPanelId:', currentPanelId, 'existingPanel:', existingPanel);
      
      const panelData = {
        chimeraId: isNewChimera ? null : parseInt(id!),
        title: generatedTitle, // Utiliser le titre généré automatiquement
        components: panelComponents.map(comp => {
          // Formater correctement le contenu selon le type
          let contentToSave;
          
          // Pour le contenu textuel, on le conserve tel quel
          if (comp.type === 'text') {
            contentToSave = comp.content || "";
          } 
          // Pour les autres types, on s'assure que le contenu est un JSON valide
          else {
            // Si le contenu est déjà un objet, on le convertit en JSON
            if (typeof comp.content === 'object' && comp.content !== null) {
              contentToSave = JSON.stringify(comp.content);
            } 
            // Si c'est une chaîne vide ou undefined, on met un objet vide
            else if (!comp.content) {
              contentToSave = JSON.stringify({});
            }
            // Sinon on garde la chaîne telle quelle
            else {
              contentToSave = comp.content;
            }
          }
          
          // Pour les composants image, stocker l'imageUrl dans le content JSON
          if (comp.type === 'image') {
            // Gérer les deux structures possibles
            const imageUrl = comp.content?.imageUrl || comp.imageUrl || "";
            contentToSave = JSON.stringify({
              imageUrl: imageUrl,
              showTitle: comp.content?.showTitle || false,
              scrollable: comp.content?.scrollable || false,
              ...comp.options
            });
          }
          
          return {
            type: comp.type,
            title: comp.title || "Sans titre",
            content: contentToSave,
            description: "",
            isVisible: true,
            options: comp.options || {},
            order: comp.order
          };
        })
      };
      
      try {
        // Envoi à l'API avec gestion d'erreurs améliorée
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(panelData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la sauvegarde du panel');
        }
        
        // Récupérer et afficher la réponse pour confirmer que l'enregistrement a fonctionné
        const responseData = await response.json();
        console.log("Panel sauvegardé avec succès:", responseData);
        
        // Mettre à jour l'ID du panel en cours d'édition
        if (responseData && responseData.id) {
          setCurrentPanelId(responseData.id);
          
          // Après sauvegarde, mettre à jour le tableau des panels pour ne contenir que celui-ci
          // Cela garantit qu'il n'y a qu'un seul panel par chimère
          setLoadedPanels([responseData]);
        }
        
        // Ne pas recharger tous les panels, nous utilisons celui que nous venons de sauvegarder
        // Cela évite la création de multiples panels pour une même chimère
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        throw error; // Relancer l'erreur pour être capturée par le bloc catch parent
      }
      
      // Réinitialiser les flags de changements
      setHasPanelChanges(false);
      setHasFormChanges(true);
      
      // Message de succès
      setFormStatus({
        message: 'Panel sauvegardé avec succès!',
        isError: false
      });
      
      // Effacer le message après un délai
      setTimeout(() => {
        setFormStatus(null);
      }, 3000);
      
    } catch (error: any) {
      // Message d'erreur
      setFormStatus({
        message: `Erreur: ${error.message}`,
        isError: true
      });
    }
  };

  // Obtenir les types énumérés
  const containerTypes = Object.values(containerTypeEnum.enumValues);
  const rarityTypes = Object.values(rarityEnum.enumValues);

  return (
    <AdminLayout>
      <div className="admin-scrollable-content" style={{ padding: '0 0 80px 0', overflowY: 'auto' }}>
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-mono" style={{ fontSize: '1.5rem', lineHeight: '1.1' }}>
                {isNewChimera ? 'Nouvelle chimère' : `Modifier la chimère: ${formData.name}`}
              </h1>
              <p className="text-gray-600 font-mono mb-4" style={{ fontSize: '0.9rem', lineHeight: '0.9' }}>
                {isNewChimera ? 'Créer une nouvelle fiche NFT' : 'Modifier les informations de la fiche NFT'}
              </p>
            </div>
            
            {/* Boutons d'action remontés */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setLocation('/admin/chimeras-gallery')}
                className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 font-mono"
                style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className={`px-4 py-2 font-mono ${
                  hasFormChanges || isNewChimera 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                disabled={createMutation.isPending || updateMutation.isPending || (!hasFormChanges && !isNewChimera)}
              >
                {(createMutation.isPending || updateMutation.isPending) ? 'Sauvegarde en cours...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
          
          {/* Navigation par onglets */}
          {!isNewChimera && (
            <div className="border-b border-gray-200 mb-5">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('identity')}
                  className={`py-3 px-1 border-b-2 font-mono text-sm ${
                    activeTab === 'identity'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                >
                  Fiche d'identité
                </button>
                <button
                  onClick={() => setActiveTab('panels')}
                  className={`py-3 px-1 border-b-2 font-mono text-sm ${
                    activeTab === 'panels'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                >
                  Panels & Composants
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Indicateur de chargement */}
        {isLoading && !isNewChimera && (
          <div className="bg-white shadow p-4 mb-6">
            <p className="text-center font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Chargement des données de la chimère...</p>
          </div>
        )}

        {/* Message d'erreur de chargement */}
        {error && !isNewChimera && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6">
            <p className="font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Erreur lors du chargement des données. Veuillez réessayer.</p>
          </div>
        )}

        {/* Feedback de soumission du formulaire */}
        {formStatus && (
          <div className={`${formStatus.isError ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'} border px-4 py-3 mb-6`}>
            <p className="font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>{formStatus.message}</p>
          </div>
        )}

        {/* ONGLET IDENTITÉ - Affiché si c'est une nouvelle chimère ou si l'onglet d'identité est actif */}
        {(isNewChimera || activeTab === 'identity') && (
          <>
            {/* Formulaire d'identité avec prévisualisation */}
            <form id="chimera-form" onSubmit={handleSubmit} className="bg-white shadow overflow-hidden mb-6">
              {/* En-tête avec prévisualisation */}
              <div className="flex flex-col md:flex-row border-b border-gray-200">
                {/* Prévisualisation de l'image NFT */}
                <div className="w-full md:w-1/3 bg-gray-100 flex items-center justify-center">
                  {formData.imageUrl ? (
                    <div className="relative w-full h-full" style={{ minHeight: '300px' }}>
                      <img 
                        src={formatImagePathForDisplay(formData.imageUrl)} 
                        alt={formData.name} 
                        className="absolute inset-0 w-full h-full object-contain" 
                      />
                    </div>
                  ) : (
                    <div className="p-8 text-center" style={{ minHeight: '300px' }}>
                      <div className="w-32 h-32 mx-auto bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="mt-4 text-sm text-gray-500 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Aucune image disponible</p>
                    </div>
                  )}
                </div>
                
                {/* Informations principales */}
                <div className="w-full md:w-2/3 p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div className="flex-1">
                      <h2 className="text-xl flex items-center flex-wrap font-mono" style={{ fontSize: '1.1rem', lineHeight: '0.9' }}>
                        {formData.name || 'Nouvelle chimère'}
                        {formData.reference && (
                          <span className="ml-2 text-sm bg-gray-100 px-2 text-gray-600 font-mono" style={{ fontSize: '0.85rem' }}>
                            Ref: {formData.reference}
                          </span>
                        )}
                      </h2>
                      
                      <div className="mt-1 flex flex-wrap gap-2">
                        {formData.collection && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 font-mono" style={{ fontSize: '0.75rem' }}>
                            {formData.collection}
                          </span>
                        )}
                        {formData.type && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 font-mono" style={{ fontSize: '0.75rem' }}>
                            {formData.type}
                          </span>
                        )}
                        {formData.rarity && (
                          <span className={`text-xs px-2 py-1 font-mono ${
                            formData.rarity === 'Common' ? 'bg-green-100 text-green-800' :
                            formData.rarity === 'Uncommon' ? 'bg-blue-100 text-blue-800' :
                            formData.rarity === 'Rare' ? 'bg-yellow-100 text-yellow-800' :
                            formData.rarity === 'Epic' ? 'bg-purple-100 text-purple-800' :
                            formData.rarity === 'Legendary' ? 'bg-orange-100 text-orange-800' :
                            formData.rarity === 'Unique' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`} style={{ fontSize: '0.75rem' }}>
                            {formData.rarity}
                          </span>
                        )}
                      </div>
                      
                      <p className="mt-3 text-gray-600 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                        {formData.description || 'Aucune description'}
                      </p>
                      
                      <div className="mt-4 text-sm text-gray-500 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                        <p>Créateur: {formData.creator || 'Non spécifié'}</p>
                        <p>Prix: {formData.price || 'Non spécifié'}</p>
                      </div>
                    </div>
                    
                    {formData.isHidden && (
                      <div className="mt-3 md:mt-0 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 text-xs font-mono" style={{ fontSize: '0.75rem' }}>
                        Chimère masquée dans la grille
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Formulaire détaillé */}
              <div className="p-6">
                <h3 className="text-lg font-mono mb-4" style={{ fontSize: '1rem', lineHeight: '0.9' }}>Informations détaillées</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Nom de la chimère</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                      required
                    />
                  </div>
                  
                  {/* Référence */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Référence</label>
                    <input
                      type="text"
                      name="reference"
                      value={formData.reference}
                      onChange={handleChange}
                      className="w-full p-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                      placeholder="ex: CHM-0001"
                      required
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Type de container</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full p-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                    >
                      {containerTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Rareté */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Rareté</label>
                    <select
                      name="rarity"
                      value={formData.rarity}
                      onChange={handleChange}
                      className="w-full p-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                    >
                      {rarityTypes.map(rarity => (
                        <option key={rarity} value={rarity}>{rarity}</option>
                      ))}
                    </select>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>URL de l'image</label>
                    <input
                      type="text"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className="w-full p-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                      required
                    />
                    <div className="mt-2">
                      <FileUploader 
                        onFileUploaded={(filePath) => {
                          setFormData(prev => ({...prev, imageUrl: filePath}));
                          // Marquer qu'il y a des changements dans le formulaire
                          setHasFormChanges(true);
                          
                          // Déclencher la validation du formulaire principal
                          setTimeout(() => {
                            const imageInput = document.querySelector('input[name="imageUrl"]') as HTMLInputElement;
                            if (imageInput) {
                              // Mettre à jour la valeur de l'input
                              imageInput.value = filePath;
                              // Déclencher les événements de validation
                              imageInput.dispatchEvent(new Event('input', { bubbles: true }));
                              imageInput.dispatchEvent(new Event('change', { bubbles: true }));
                              imageInput.dispatchEvent(new Event('blur', { bubbles: true }));
                            }
                          }, 200);
                        }}
                        targetFolder="Yhom_Doublures"
                        label="Uploader une image pour cette chimère"
                      />
                    </div>
                  </div>

                  {/* Prix */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Prix</label>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full p-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                    />
                  </div>

                  {/* Collection */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Collection</label>
                    <input
                      type="text"
                      name="collection"
                      value={formData.collection}
                      onChange={handleChange}
                      className="w-full p-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                    />
                  </div>

                  {/* Créateur */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Créateur</label>
                    <input
                      type="text"
                      name="creator"
                      value={formData.creator}
                      onChange={handleChange}
                      className="w-full p-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                    />
                  </div>

                  {/* Visibilité */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isHidden"
                      name="isHidden"
                      checked={formData.isHidden}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="isHidden" className="ml-2 block text-sm text-gray-700 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                      Masquer dans la grille
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <label className="block text-sm text-gray-700 mb-1 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                  />
                </div>

                {/* Attributs */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md text-gray-700 font-mono" style={{ fontSize: '0.9rem', lineHeight: '0.9' }}>Attributs</h3>
                    <button
                      type="button"
                      onClick={addAttribute}
                      className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 font-mono"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Ajouter un attribut
                    </button>
                  </div>
                  
                  {attributes.map((attr, index) => (
                    <div key={index} className="flex space-x-2 items-center mt-2">
                      <input
                        type="text"
                        placeholder="Nom"
                        value={attr.trait_type}
                        onChange={e => handleAttributeChange(index, 'trait_type', e.target.value)}
                        className="flex-1 p-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                        style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                      />
                      <input
                        type="text"
                        placeholder="Valeur"
                        value={attr.value}
                        onChange={e => handleAttributeChange(index, 'value', e.target.value)}
                        className="flex-1 p-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                        style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                      />
                      {attributes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAttribute(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Boutons d'action */}
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setLocation('/admin/chimeras')}
                    className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 font-mono"
                    style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-mono"
                    style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? 'Sauvegarde en cours...' : 'Sauvegarder'}
                  </button>
                </div>
              </div>
            </form>

            {/* Affichage des détails d'identité de la chimère */}
            {!isNewChimera && chimera && (
              <div className="bg-white shadow mb-6 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-xl text-indigo-900 font-mono" style={{ fontSize: '1.1rem', lineHeight: '0.9' }}>
                    Identité de la Chimère
                  </h2>
                  <p className="text-blue-700 mt-1 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                    Informations d'identité et de métadonnées
                  </p>
                </div>
                
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <div className="overflow-hidden border border-gray-200 bg-white">
                        <img 
                          src={chimera.imageUrl ? formatImagePathForDisplay(chimera.imageUrl) : "https://via.placeholder.com/300"} 
                          alt={chimera.name} 
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    </div>
                    <div className="md:w-2/3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-md text-gray-700 font-mono" style={{ fontSize: '0.9rem', lineHeight: '0.9' }}>Identité</h3>
                          <div className="mt-2 space-y-2">
                            <div>
                              <span className="block text-xs text-gray-500 font-mono" style={{ fontSize: '0.75rem', lineHeight: '0.9' }}>Référence</span>
                              <span className="block text-sm font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>{chimera.reference}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-gray-500 font-mono" style={{ fontSize: '0.75rem', lineHeight: '0.9' }}>Nom</span>
                              <span className="block text-sm font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>{chimera.name}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-gray-500 font-mono" style={{ fontSize: '0.75rem', lineHeight: '0.9' }}>Collection</span>
                              <span className="block text-sm font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>{chimera.collection}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-md text-gray-700 font-mono" style={{ fontSize: '0.9rem', lineHeight: '0.9' }}>Caractéristiques</h3>
                          <div className="mt-2 space-y-2">
                            <div>
                              <span className="block text-xs text-gray-500 font-mono" style={{ fontSize: '0.75rem', lineHeight: '0.9' }}>Type</span>
                              <span className="block text-sm font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>{chimera.type}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-gray-500 font-mono" style={{ fontSize: '0.75rem', lineHeight: '0.9' }}>Rareté</span>
                              <span className="block text-sm font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>{chimera.rarity}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-gray-500 font-mono" style={{ fontSize: '0.75rem', lineHeight: '0.9' }}>Créateur</span>
                              <span className="block text-sm font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>{chimera.creator}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {chimera.attributes && chimera.attributes.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-md text-gray-700 mb-2 font-mono" style={{ fontSize: '0.9rem', lineHeight: '0.9' }}>Attributs</h3>
                          <div className="flex flex-wrap gap-2">
                            {chimera.attributes.map((attr: any, index: number) => (
                              attr.trait_type && attr.value ? (
                                <div key={index} className="bg-white px-3 py-1 border border-gray-200 text-xs font-mono" style={{ fontSize: '0.75rem' }}>
                                  <span className="font-medium">{attr.trait_type}:</span> {attr.value}
                                </div>
                              ) : null
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ONGLET PANELS - Affiché seulement si l'onglet des panels est actif et ce n'est pas une nouvelle chimère */}
        {!isNewChimera && activeTab === 'panels' && (
          <div className="bg-white shadow mb-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl text-indigo-900 font-mono" style={{ fontSize: '1.1rem', lineHeight: '0.9' }}>
                    Panels et Composants
                  </h2>
                  <p className="text-blue-700 mt-1 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                    Gestion des panels associés à la chimère
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Interface d'édition de panel en deux colonnes */}
              <div className="space-y-6">
                {/* Interface du panel unique pour cette chimère */}
                
                {/* Interface d'édition du panel actuel */}
                <div className="flex flex-col mb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-mono" style={{ fontSize: '1rem', lineHeight: '0.9' }}>
                      {currentPanelId === 'new' ? 'Nouveau panel' : `Modifier le panel #${currentPanelId}`}
                    </h3>

                  </div>
                  

                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Colonne de gauche - Prévisualisation */}
                  <div className="md:w-1/2 border border-gray-200 p-4 bg-gray-50">
                    <h4 className="font-mono mb-4" style={{ fontSize: '0.9rem', lineHeight: '0.9' }}>Prévisualisation</h4>
                    
                    {/* Liste des composants */}
                    <div className="space-y-4">
                      {/* Composant Photo (fixe) */}
                      <div className="bg-white border border-gray-200 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Photo (fixe)</span>
                          <span className="text-xs text-gray-500 font-mono" style={{ fontSize: '0.75rem', lineHeight: '0.9' }}>Non modifiable</span>
                        </div>
                        <div className="h-20 bg-gray-100 flex items-center justify-center">
                          <img 
                            src={chimera?.imageUrl || "https://via.placeholder.com/300"} 
                            alt="Miniature" 
                            className="h-full w-auto object-contain"
                          />
                        </div>
                      </div>
                      
                      {/* Composant ID (fixe) */}
                      <div className="bg-white border border-gray-200 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>ID (fixe)</span>
                          <span className="text-xs text-gray-500 font-mono" style={{ fontSize: '0.75rem', lineHeight: '0.9' }}>Non modifiable</span>
                        </div>
                        <div className="bg-gray-100 p-2">
                          <div className="font-mono text-sm" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                            <div><span className="text-gray-500">Ref:</span> {chimera?.reference}</div>
                            <div><span className="text-gray-500">Nom:</span> {chimera?.name}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Composants dynamiques générés à partir de l'état */}
                      {panelComponents.map((component) => (
                        <div key={component.id} className="bg-white border border-gray-200 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                              {component.title}
                            </span>
                            <div className="flex items-center space-x-1">
                              <button 
                                className="p-1 text-gray-500 hover:text-gray-700" 
                                title="Monter"
                                onClick={() => moveComponentUp(component.id)}
                                disabled={component.order <= 1}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button 
                                className="p-1 text-gray-500 hover:text-gray-700" 
                                title="Descendre"
                                onClick={() => moveComponentDown(component.id)}
                                disabled={component.order >= panelComponents.length}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <button 
                                className="p-1 text-blue-500 hover:text-blue-700" 
                                title="Éditer"
                                onClick={() => editComponent(component.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button 
                                className="p-1 text-red-500 hover:text-red-700" 
                                title="Supprimer"
                                onClick={() => deleteComponent(component.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Contenu du composant en fonction du type */}
                          {component.type === 'text' && (
                            <div className="bg-gray-100 p-2">
                              <p className="font-mono text-sm" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                                {component.content}
                              </p>
                            </div>
                          )}
                          
                          {component.type === 'image' && (
                            <div className="h-32 bg-gray-100 flex items-center justify-center">

                              {(() => {
                                // Gérer les deux structures possibles de content
                                const imageUrl = typeof component.content === 'string' 
                                  ? component.content 
                                  : component.content?.imageUrl;
                                
                                if (!imageUrl) return null;
                                
                                return (
                                  <img 
                                    src={(() => {
                                      const formattedUrl = formatImagePathForDisplay(imageUrl);
                                      console.log('🔧 Debug URL image - Original:', imageUrl, '| Formatée:', formattedUrl);
                                      return formattedUrl;
                                    })()}
                                  alt={component.title} 
                                  className="max-h-full max-w-full object-contain"
                                    onError={(e) => {
                                      console.warn('Erreur de chargement image:', imageUrl);
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                );
                              })()}
                              {(() => {
                                const imageUrl = typeof component.content === 'string' 
                                  ? component.content 
                                  : component.content?.imageUrl;
                                
                                if (imageUrl) return null;
                                
                                return <p className="text-gray-500 font-mono text-sm">Image non disponible</p>;
                              })()}
                            </div>
                          )}
                          
                          {component.type === 'gallery' && (
                            <div className="h-32 bg-gray-100 flex items-center justify-center">
                              <div className="grid grid-cols-2 gap-1 p-1">
                                <div className="bg-white p-1">
                                  <img src="https://via.placeholder.com/100" alt="Galerie 1" className="w-full h-full object-cover" />
                                </div>
                                <div className="bg-white p-1">
                                  <img src="https://via.placeholder.com/100" alt="Galerie 2" className="w-full h-full object-cover" />
                                </div>
                                <div className="bg-white p-1">
                                  <img src="https://via.placeholder.com/100" alt="Galerie 3" className="w-full h-full object-cover" />
                                </div>
                                <div className="bg-white p-1">
                                  <span className="flex items-center justify-center h-full text-gray-500 font-mono" style={{ fontSize: '0.85rem' }}>+2</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {component.type === 'audio' && (
                            <div className="bg-gray-100 p-2">
                              <div className="flex items-center space-x-2">
                                <button className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                                <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-600 w-1/3 rounded-full"></div>
                                </div>
                                <span className="text-xs text-gray-500 font-mono">1:45</span>
                              </div>
                            </div>
                          )}
                          
                          {component.type === 'wallet' && (
                            <div className="bg-gray-100 p-2">
                              <div className="flex items-center justify-between">
                                <div className="font-mono text-sm" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                                  <div className="text-gray-500">Solde ETH</div>
                                  <div className="font-bold">0.0542 ETH</div>
                                </div>
                                <button className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-mono">
                                  Connecter
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {component.type === 'map' && (
                            <div className="h-32 bg-gray-100 flex items-center justify-center relative">
                              <img src="https://via.placeholder.com/600x300" alt="Map" className="w-full h-full object-cover opacity-50" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="px-2 py-1 bg-white font-mono text-xs">Carte interactive</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Message si aucun composant */}
                      {panelComponents.length === 0 && (
                        <div className="bg-gray-50 border border-gray-200 border-dashed p-4 text-center">
                          <p className="text-gray-500 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                            Aucun composant ajouté. Utilisez le menu à droite pour ajouter des composants.
                          </p>
                        </div>
                      )}
                      
                      {/* Informations sur les composants */}
                      {panelComponents.length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                          <div className="flex justify-between items-center">
                            <p className="text-blue-700 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                              {panelComponents.length} composant(s) ajouté(s)
                            </p>
                            {/* Bouton de sauvegarde seulement si des changements ont été faits */}
                            {hasPanelChanges && (
                              <button
                                onClick={savePanelToServer}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-mono flex items-center"
                                style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Sauvegarder le panel
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Colonne de droite - Édition */}
                  <div className="md:w-1/2 border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-mono" style={{ fontSize: '0.9rem', lineHeight: '0.9' }}>Édition</h4>
                    </div>
                    
                    {/* Zone d'ajout de composant améliorée */}
                    <div className="mb-6">
                      <div 
                        className="border-2 border-dashed border-indigo-300 rounded-lg p-4 bg-indigo-50 text-center cursor-pointer relative hover:bg-indigo-100 transition-colors"
                        onClick={() => setShowComponentMenu(!showComponentMenu)}
                      >
                        <div className="flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="font-mono text-indigo-600" style={{ fontSize: '0.9rem', lineHeight: '0.9' }}>
                            Ajouter un composant
                          </span>
                        </div>
                        
                        {/* Menu déroulant des composants disponibles */}
                        {showComponentMenu && (
                          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 shadow-lg rounded-md z-10">
                            <ul className="py-1 grid grid-cols-2">
                              <li 
                                className="px-3 py-3 hover:bg-indigo-50 cursor-pointer flex items-center font-mono" 
                                style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddComponent('text');
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Texte
                              </li>
                              <li 
                                className="px-3 py-3 hover:bg-indigo-50 cursor-pointer flex items-center font-mono" 
                                style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddComponent('image');
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Image
                              </li>
                              <li 
                                className="px-3 py-3 hover:bg-indigo-50 cursor-pointer flex items-center font-mono" 
                                style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddComponent('gallery');
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Galerie
                              </li>
                              <li 
                                className="px-3 py-3 hover:bg-indigo-50 cursor-pointer flex items-center font-mono" 
                                style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddComponent('audio');
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 010-7.072m12.728 0l-4.243 4.243m-7.07-7.072l4.242 4.242M12 18v.01" />
                                </svg>
                                Audio
                              </li>
                              <li 
                                className="px-3 py-3 hover:bg-indigo-50 cursor-pointer flex items-center font-mono" 
                                style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddComponent('wallet');
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                                Wallet
                              </li>
                              <li 
                                className="px-3 py-3 hover:bg-indigo-50 cursor-pointer flex items-center font-mono" 
                                style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddComponent('map');
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                Map
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Zone d'édition contextuelle qui s'adapte au type de composant sélectionné */}
                    <div className="space-y-4">
                      {!selectedComponentId && !showComponentMenu ? (
                        <div className="bg-gray-50 border border-gray-200 border-dashed p-8 text-center">
                          <p className="text-gray-500 font-mono mb-4" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                            Sélectionnez un composant pour le modifier ou ajoutez-en un nouveau.
                          </p>
                          <button 
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-mono"
                            style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                            onClick={() => setShowComponentMenu(true)}
                          >
                            Ajouter un composant
                          </button>
                        </div>
                      ) : null}
                      
                      {/* Afficher les champs d'édition appropriés selon le type de composant sélectionné */}
                      {selectedComponentId && (
                        <>
                          {/* Champ de titre commun à tous les types */}
                          <div>
                            <label className="block text-sm font-mono mb-1" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Titre</label>
                            <input
                              type="text"
                              name="title"
                              value={currentEditValues.title || ''}
                              onChange={handleComponentEditChange}
                              className="w-full p-2 border font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                            />
                          </div>
                          
                          {/* Champs spécifiques au type texte */}
                          {selectedComponentType === 'text' && (
                            <div>
                              <label className="block text-sm font-mono mb-1" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Contenu</label>
                              <textarea
                                name="content"
                                rows={5}
                                value={currentEditValues.content || ''}
                                onChange={handleComponentEditChange}
                                className="w-full p-2 border font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                              />
                            </div>
                          )}
                          
                          {/* Champs spécifiques au type image */}
                          {selectedComponentType === 'image' && (
                            <div>
                              <label className="block text-sm font-mono mb-1" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>URL de l'image</label>
                              <input
                                type="text"
                                name="imageUrl"
                                value={currentEditValues.imageUrl || ''}
                                onChange={handleComponentEditChange}
                                className="w-full p-2 border font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                              />
                              
                              <div className="mt-2 h-32 bg-gray-100 flex items-center justify-center">
                                {currentEditValues.imageUrl ? (
                                  <img 
                                    src={formatImagePathForDisplay(currentEditValues.imageUrl)} 
                                    alt="Prévisualisation" 
                                    className="max-h-full max-w-full"
                                  />
                                ) : (
                                  <p className="text-gray-500 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                                    Prévisualisation non disponible
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Champs spécifiques au type audio */}
                          {selectedComponentType === 'audio' && (
                            <div className="space-y-3">
                              <AudioComponentEditor
                                component={{
                                  id: selectedComponentId,
                                  type: 'audio',
                                  title: currentEditValues.title || 'Nouveau audio',
                                  content: currentEditValues.content || '',
                                  order: 1
                                }}
                                onUpdate={(updatedComponent) => {
                                  setCurrentEditValues({
                                    title: updatedComponent.title,
                                    content: updatedComponent.content
                                  });
                                  setHasPanelChanges(true);
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Options communes à tous les types */}
                          <div className="flex justify-between">
                            <label className="flex items-center">
                              <input 
                                type="checkbox" 
                                name="scrollable"
                                checked={currentEditValues.scrollable || false}
                                onChange={handleComponentEditChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded" 
                              />
                              <span className="ml-2 font-mono text-sm" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Défilable</span>
                            </label>
                            <label className="flex items-center">
                              <input 
                                type="checkbox" 
                                name="showTitle"
                                checked={currentEditValues.showTitle || false}
                                onChange={handleComponentEditChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded" 
                              />
                              <span className="ml-2 font-mono text-sm" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Afficher titre</span>
                            </label>
                          </div>
                          
                          <div className="flex justify-end space-x-2 pt-4">
                            <button 
                              type="button"
                              onClick={() => {
                                setSelectedComponentId(null);
                                setSelectedComponentType(null);
                                setCurrentEditValues({});
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 font-mono"
                              style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                            >
                              Annuler
                            </button>
                            <button 
                              type="button"
                              onClick={saveComponentChanges}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-mono"
                              style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                            >
                              Sauvegarder
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interface d'upload d'images pour les panels */}
      {showImageUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Upload d'image pour le panel</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">URL de l'image</label>
                  <input
                    type="text"
                    placeholder="URL de l'image..."
                    className="w-full p-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={currentEditValues.imageUrl || ''}
                    onChange={(e) => setCurrentEditValues(prev => ({...prev, imageUrl: e.target.value}))}
                  />
                  
                  <div className="mt-2">
                    <FileUploader 
                      onFileUploaded={(filePath) => {
                        // Traiter l'URL pour l'affichage correct
                        const processedUrl = filePath.startsWith('/') ? filePath : `/${filePath}`;
                        setCurrentEditValues(prev => ({...prev, imageUrl: processedUrl}));
                        // Déclencher la détection des changements pour afficher le bouton de sauvegarde
                        setHasPanelChanges(true);
                      }}
                      targetFolder="Yhom_Doublures"
                      label="Ou uploader une image"
                    />
                  </div>
                  
                  {/* Prévisualisation */}
                  {currentEditValues.imageUrl && (
                    <div className="mt-4">
                      <label className="block text-sm text-gray-700 mb-1">Prévisualisation</label>
                      <div className="border border-gray-200 p-2 bg-gray-50 h-32 flex items-center justify-center">
                        <img 
                          src={formatImagePathForDisplay(currentEditValues.imageUrl)} 
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
                  onClick={() => setShowImageUploader(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (currentEditValues.imageUrl?.trim()) {
                      createImageComponent(currentEditValues.imageUrl.trim());
                      setCurrentEditValues({});
                      setShowImageUploader(false);
                    }
                  }}
                  disabled={!currentEditValues.imageUrl?.trim()}
                  className={`px-4 py-2 rounded ${
                    currentEditValues.imageUrl?.trim() 
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
      )}
    </AdminLayout>
  );
}