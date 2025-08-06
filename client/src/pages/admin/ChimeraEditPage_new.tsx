import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { containerTypeEnum, rarityEnum } from '@shared/schema';

// Page d'édition d'une fiche chimère
export function ChimeraEditPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const isNewChimera = id === 'new';
  
  // État pour gérer les vues des panels
  const [showPanelEditor, setShowPanelEditor] = useState(false);
  const [currentPanelId, setCurrentPanelId] = useState<string | number>('new');
  
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

  // Feedback utilisateur
  const [formStatus, setFormStatus] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  // Récupérer les données de la chimère si mode édition
  const { data: chimera, isLoading, error } = useQuery({
    queryKey: [`/api/chimeras/${id}`],
    enabled: !isNewChimera,
    staleTime: 30000, // 30 secondes
  });

  // Préremplir le formulaire avec les données existantes
  useEffect(() => {
    if (chimera && !isNewChimera) {
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
    }
  }, [chimera, isNewChimera]);

  // Mutation pour créer/mettre à jour une chimère
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isNewChimera ? '/api/chimeras' : `/api/chimeras/${id}`;
      const method = isNewChimera ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
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
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalider les requêtes pour actualiser les données
      queryClient.invalidateQueries({ queryKey: ['/api/chimeras'] });
      if (!isNewChimera) {
        queryClient.invalidateQueries({ queryKey: [`/api/chimeras/${id}`] });
      }
      
      setFormStatus({
        message: `Chimère ${isNewChimera ? 'créée' : 'mise à jour'} avec succès!`,
        isError: false
      });
      
      // Redirection après un délai
      setTimeout(() => {
        setLocation('/admin/chimeras');
      }, 1500);
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
    saveMutation.mutate(formData);
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

  // Obtenir les types énumérés
  const containerTypes = Object.values(containerTypeEnum.enumValues);
  const rarityTypes = Object.values(rarityEnum.enumValues);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {isNewChimera ? 'Nouvelle chimère' : `Modifier la chimère: ${formData.name}`}
        </h1>
        <p className="text-gray-600">
          {isNewChimera ? 'Créer une nouvelle fiche NFT' : 'Modifier les informations de la fiche NFT'}
        </p>
      </div>

      {/* Indicateur de chargement */}
      {isLoading && !isNewChimera && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <p className="text-center">Chargement des données de la chimère...</p>
        </div>
      )}

      {/* Message d'erreur de chargement */}
      {error && !isNewChimera && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>Erreur lors du chargement des données. Veuillez réessayer.</p>
        </div>
      )}

      {/* Feedback de soumission du formulaire */}
      {formStatus && (
        <div className={`${formStatus.isError ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'} border px-4 py-3 rounded mb-6`}>
          <p>{formStatus.message}</p>
        </div>
      )}

      {/* Formulaire avec prévisualisation */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow overflow-hidden mb-6">
        {/* En-tête avec prévisualisation */}
        <div className="flex flex-col md:flex-row border-b border-gray-200">
          {/* Prévisualisation de l'image NFT */}
          <div className="w-full md:w-1/3 bg-gray-100 flex items-center justify-center">
            {formData.imageUrl ? (
              <div className="relative w-full h-full" style={{ minHeight: '300px' }}>
                <img 
                  src={formData.imageUrl} 
                  alt={formData.name} 
                  className="absolute inset-0 w-full h-full object-contain" 
                />
              </div>
            ) : (
              <div className="p-8 text-center" style={{ minHeight: '300px' }}>
                <div className="w-32 h-32 mx-auto bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="mt-4 text-sm text-gray-500">Aucune image disponible</p>
              </div>
            )}
          </div>
          
          {/* Informations principales */}
          <div className="w-full md:w-2/3 p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div className="flex-1">
                <h2 className="text-xl font-bold flex items-center flex-wrap">
                  {formData.name || 'Nouvelle chimère'}
                  {formData.reference && (
                    <span className="ml-2 text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                      Ref: {formData.reference}
                    </span>
                  )}
                </h2>
                
                <div className="mt-1 flex flex-wrap gap-2">
                  {formData.collection && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      {formData.collection}
                    </span>
                  )}
                  {formData.type && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {formData.type}
                    </span>
                  )}
                  {formData.rarity && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      formData.rarity === 'Common' ? 'bg-green-100 text-green-800' :
                      formData.rarity === 'Uncommon' ? 'bg-blue-100 text-blue-800' :
                      formData.rarity === 'Rare' ? 'bg-yellow-100 text-yellow-800' :
                      formData.rarity === 'Epic' ? 'bg-purple-100 text-purple-800' :
                      formData.rarity === 'Legendary' ? 'bg-orange-100 text-orange-800' :
                      formData.rarity === 'Unique' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.rarity}
                    </span>
                  )}
                </div>
                
                <p className="mt-3 text-gray-600">
                  {formData.description || 'Aucune description'}
                </p>
                
                <div className="mt-4 text-sm text-gray-500">
                  <p>Créateur: {formData.creator || 'Non spécifié'}</p>
                  <p>Prix: {formData.price || 'Non spécifié'}</p>
                </div>
              </div>
              
              {formData.isHidden && (
                <div className="mt-3 md:mt-0 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-xs">
                  Chimère masquée dans la grille
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Formulaire détaillé */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informations détaillées</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la chimère</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {/* Référence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: CHM-0001"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de container</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {containerTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Rareté */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rareté</label>
              <select
                name="rarity"
                value={formData.rarity}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {rarityTypes.map(rarity => (
                  <option key={rarity} value={rarity}>{rarity}</option>
                ))}
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Collection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection</label>
              <input
                type="text"
                name="collection"
                value={formData.collection}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Créateur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Créateur</label>
              <input
                type="text"
                name="creator"
                value={formData.creator}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isHidden" className="ml-2 block text-sm text-gray-900">
                Masquer cette chimère dans la grille
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              required
            ></textarea>
          </div>

          {/* Attributs */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Attributs</label>
            
            {attributes.map((attr, index) => (
              <div key={index} className="flex mb-2 space-x-2">
                <input
                  type="text"
                  placeholder="Trait (ex: Couleur)"
                  value={attr.trait_type}
                  onChange={(e) => handleAttributeChange(index, 'trait_type', e.target.value)}
                  className="w-1/2 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Valeur (ex: Rouge)"
                  value={attr.value}
                  onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                  className="w-1/2 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  disabled={attributes.length <= 1}
                  className={`p-2 rounded ${attributes.length <= 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addAttribute}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Ajouter un attribut
            </button>
          </div>

          {/* Boutons */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setLocation('/admin/chimeras')}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${saveMutation.isPending ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {saveMutation.isPending ? 'Enregistrement...' : (isNewChimera ? 'Créer' : 'Enregistrer')}
            </button>
          </div>
        </div>
      </form>

      {/* Section des panels pour les chimères existantes */}
      {!isNewChimera && (
        <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-indigo-900">Panels & Composants spécialisés</h2>
                <p className="text-blue-700 mt-1">
                  Enrichissez cette fiche avec des composants interactifs
                </p>
              </div>
              <div>
                <button 
                  type="button"
                  onClick={() => openPanelEditor('new')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition flex items-center text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Créer un panel
                </button>
              </div>
            </div>
          </div>

          {/* Vue alternée : Liste ou Éditeur */}
          {!showPanelEditor ? (
            <>
              {/* Liste des panels */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Panels associés
                </h3>
                
                {/* Contenu chargé dynamiquement - Exemple de panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 rounded-lg p-4">
                  {/* Affichage statique pour la démo - à remplacer par récupération API */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow transition p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Panel principal</h3>
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Publié</div>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">3 composants</div>
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => openPanelEditor(1)} 
                        className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow transition p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Panel secondaire</h3>
                      <div className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Brouillon</div>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">1 composant</div>
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => openPanelEditor(2)} 
                        className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Éditeur de panel */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <button 
                    type="button"
                    onClick={closePanelEditor}
                    className="p-1 mr-3 rounded-full hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                  <h3 className="text-lg font-medium">
                    {currentPanelId === 'new' ? 'Nouveau panel' : 'Modifier le panel'}
                  </h3>
                </div>
                <div>
                  <button 
                    type="button"
                    onClick={() => {
                      // Logique de sauvegarde (à implémenter)
                      alert('Panel sauvegardé avec succès');
                      closePanelEditor();
                    }}
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>

              {/* Contenu de l'éditeur */}
              <div className="p-4">
                {/* Titre du panel */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre du panel</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Entrez un titre pour ce panel"
                    defaultValue={`Panel de ${formData.name}`}
                  />
                </div>
                
                {/* Interface d'édition des composants */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Liste des types de composants */}
                  <div className="md:col-span-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Ajouter des composants</h4>
                      
                      <div className="space-y-2">
                        <button className="w-full text-left p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                          </svg>
                          Texte
                        </button>
                        
                        <button className="w-full text-left p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Image
                        </button>
                        
                        <div className="border-t border-gray-200 my-3"></div>
                        
                        <button className="w-full text-left p-2 bg-indigo-50 rounded border border-indigo-100 hover:bg-indigo-100 text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          Carte
                        </button>
                        
                        <button className="w-full text-left p-2 bg-indigo-50 rounded border border-indigo-100 hover:bg-indigo-100 text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Wallet
                        </button>
                        
                        <button className="w-full text-left p-2 bg-indigo-50 rounded border border-indigo-100 hover:bg-indigo-100 text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414-5.658m-2.828 9.9a9 9 0 010-12.728" />
                          </svg>
                          Podcast
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Zone d'édition des composants */}
                  <div className="md:col-span-9">
                    <div className="border border-gray-200 rounded-lg p-4 relative min-h-[400px]">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex justify-between items-center">
                        <span>Composants du panel</span>
                        <span className="text-xs text-gray-500">Glissez-déposez pour réorganiser</span>
                      </h4>
                      
                      {/* Composants préremplis pour l'exemple */}
                      <div className="space-y-4">
                        {/* Composant Texte */}
                        <div className="bg-white border border-gray-200 rounded p-4 hover:shadow-md transition">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium">Informations principales</h5>
                              <p className="text-xs text-gray-500">Type: Texte</p>
                            </div>
                            <div className="flex space-x-1">
                              <button className="p-1 text-gray-400 hover:text-gray-700 rounded" title="Monter">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button className="p-1 text-gray-400 hover:text-gray-700 rounded" title="Descendre">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <button className="p-1 text-gray-400 hover:text-gray-700 rounded" title="Éditer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button className="p-1 text-red-400 hover:text-red-700 rounded" title="Supprimer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded text-sm">
                            <h2>{formData.name}</h2>
                            <p><strong>Référence:</strong> {formData.reference}</p>
                            <p><strong>Type:</strong> {formData.type}</p>
                            <p><strong>Collection:</strong> {formData.collection || 'Non spécifiée'}</p>
                            <p><strong>Rareté:</strong> {formData.rarity || 'Non spécifiée'}</p>
                            {formData.description && <p>{formData.description}</p>}
                          </div>
                        </div>
                        
                        {/* Composant Image */}
                        {formData.imageUrl && (
                          <div className="bg-white border border-gray-200 rounded p-4 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-medium">Image de la chimère</h5>
                                <p className="text-xs text-gray-500">Type: Image</p>
                              </div>
                              <div className="flex space-x-1">
                                <button className="p-1 text-gray-400 hover:text-gray-700 rounded" title="Monter">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                                <button className="p-1 text-gray-400 hover:text-gray-700 rounded" title="Descendre">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                <button className="p-1 text-gray-400 hover:text-gray-700 rounded" title="Éditer">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button className="p-1 text-red-400 hover:text-red-700 rounded" title="Supprimer">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <div className="flex justify-center">
                                <img 
                                  src={formData.imageUrl} 
                                  alt={formData.name} 
                                  className="max-h-48 object-contain"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Zone pour ajouter de nouveaux composants */}
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                          <p className="text-gray-500 mb-2">Glissez un composant ici</p>
                          <button className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100">
                            + Ajouter un composant
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Modules disponibles */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Modules spécialisés disponibles</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center text-indigo-700 font-medium mb-1 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Carte interactive
                </div>
                <p className="text-xs text-gray-500">Intégration d'API cartographique</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center text-indigo-700 font-medium mb-1 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Wallet crypto
                </div>
                <p className="text-xs text-gray-500">Connexion avec web3</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center text-indigo-700 font-medium mb-1 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414-5.658m-2.828 9.9a9 9 0 010-12.728" />
                  </svg>
                  Podcasts & médias
                </div>
                <p className="text-xs text-gray-500">Lecteurs audio/vidéo</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center text-indigo-700 font-medium mb-1 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Galerie d'images
                </div>
                <p className="text-xs text-gray-500">Photos et collections</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}