import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { containerTypeEnum, rarityEnum } from '@shared/schema';

type TabType = 'identity' | 'panels';

export function ChimeraEditPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const isNewChimera = id === 'new';
  
  // État des onglets
  const [activeTab, setActiveTab] = useState<TabType>('identity');
  
  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    description: '',
    imageUrl: '',
    price: '',
    collection: '',
    type: 'FREE' as const,
    creator: '',
    rarity: 'Common' as const,
    attributes: [{trait_type: '', value: ''}],
    isHidden: false
  });

  // État pour les attributs
  const [attributes, setAttributes] = useState<{trait_type: string, value: string}[]>([
    {trait_type: '', value: ''}
  ]);
  
  // État pour les retours utilisateur
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
      const chimeraData = chimera as any;
      setFormData({
        name: chimeraData.name || '',
        reference: chimeraData.reference || '',
        description: chimeraData.description || '',
        imageUrl: chimeraData.imageUrl || '',
        price: chimeraData.price?.toString() || '',
        collection: chimeraData.collection || '',
        type: chimeraData.type || 'FREE',
        creator: chimeraData.creator || '',
        rarity: chimeraData.rarity || 'Common',
        attributes: chimeraData.attributes || [{trait_type: '', value: ''}],
        isHidden: chimeraData.isHidden || false
      });
      
      if (chimeraData.attributes && Array.isArray(chimeraData.attributes)) {
        setAttributes(chimeraData.attributes);
      }
    }
  }, [chimera, isNewChimera]);

  // Gérer les changements de champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
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

  // Mutation pour création/mise à jour
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

  // Soumettre le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  // Obtenir les types énumérés du schema
  const containerTypes = Object.values(containerTypeEnum.enumValues);
  const rarityTypes = Object.values(rarityEnum.enumValues);

  return (
    <AdminLayout>
      <div className="admin-scrollable-content" style={{ padding: '0 0 80px 0', overflowY: 'auto' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-mono" style={{ fontSize: '1.5rem', lineHeight: '1.1' }}>
            {isNewChimera ? 'Nouvelle chimère' : `Modifier la chimère: ${formData.name}`}
          </h1>
          <p className="text-gray-600 font-mono mb-4" style={{ fontSize: '0.9rem', lineHeight: '0.9' }}>
            {isNewChimera ? 'Créer une nouvelle fiche NFT' : 'Modifier les informations de la fiche NFT'}
          </p>
          
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

        {/* Affichage d'erreur de chargement */}
        {error && !isNewChimera && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6">
            <p className="font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Erreur lors du chargement des données. Veuillez réessayer.</p>
          </div>
        )}

        {/* Feedback de soumission de formulaire */}
        {formStatus && (
          <div className={`${formStatus.isError ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'} border px-4 py-3 mb-6`}>
            <p className="font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>{formStatus.message}</p>
          </div>
        )}

        {/* ONGLET IDENTITÉ */}
        {(isNewChimera || activeTab === 'identity') && (
          <form onSubmit={handleSubmit} className="bg-white shadow overflow-hidden mb-6">
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
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? 'Sauvegarde en cours...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ONGLET PANELS */}
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
            
            {/* Interface d'édition de panel en deux colonnes */}
            <div className="p-6">
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
                        {chimera && (
                          <img 
                            src={(chimera as any)?.imageUrl || "https://via.placeholder.com/300"} 
                            alt="Miniature" 
                            className="h-full w-auto object-contain"
                          />
                        )}
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
                          {chimera && (
                            <>
                              <div><span className="text-gray-500">Ref:</span> {(chimera as any)?.reference}</div>
                              <div><span className="text-gray-500">Nom:</span> {(chimera as any)?.name}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Composants dynamiques - Exemple */}
                    <div className="bg-white border border-gray-200 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Texte</span>
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-gray-500 hover:text-gray-700" title="Monter">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button className="p-1 text-gray-500 hover:text-gray-700" title="Descendre">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button className="p-1 text-blue-500 hover:text-blue-700" title="Éditer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button className="p-1 text-red-500 hover:text-red-700" title="Supprimer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-100 p-2">
                        <p className="font-mono text-sm" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                          Exemple de texte pour ce panel. Ce texte pourra être modifié dans l'interface d'édition.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Image</span>
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-gray-500 hover:text-gray-700" title="Monter">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button className="p-1 text-gray-500 hover:text-gray-700" title="Descendre">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button className="p-1 text-blue-500 hover:text-blue-700" title="Éditer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button className="p-1 text-red-500 hover:text-red-700" title="Supprimer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="h-32 bg-gray-100 flex items-center justify-center">
                        <img src="https://via.placeholder.com/300x150" alt="Exemple d'image" className="max-h-full max-w-full" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Colonne de droite - Édition */}
                <div className="md:w-1/2 border border-gray-200 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-mono" style={{ fontSize: '0.9rem', lineHeight: '0.9' }}>Édition</h4>
                    <div className="relative group">
                      <button className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-mono flex items-center"
                              style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                        <span>Ajouter un composant</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Menu déroulant des composants disponibles */}
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded-md hidden group-hover:block z-10">
                        <ul className="py-1">
                          <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Texte</li>
                          <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Image</li>
                          <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Galerie</li>
                          <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Audio</li>
                          <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Wallet</li>
                          <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Map</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Zone d'édition contextuelle - Exemple pour un composant texte */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-mono mb-1" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Titre</label>
                      <input
                        type="text"
                        defaultValue="Composant texte"
                        className="w-full p-2 border font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-mono mb-1" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Contenu</label>
                      <textarea
                        rows={5}
                        defaultValue="Exemple de texte pour ce panel. Ce texte pourra être modifié dans l'interface d'édition."
                        className="w-full p-2 border font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                      />
                    </div>
                    <div className="flex justify-between">
                      <label className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                        <span className="ml-2 font-mono text-sm" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Défilable</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                        <span className="ml-2 font-mono text-sm" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>Afficher titre</span>
                      </label>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-mono"
                              style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}