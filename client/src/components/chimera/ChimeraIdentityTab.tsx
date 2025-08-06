import React from 'react';
import { containerTypeEnum, rarityEnum } from '@shared/schema';

interface ChimeraIdentityTabProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  attributes: {trait_type: string, value: string}[];
  handleAttributeChange: (index: number, field: 'trait_type' | 'value', value: string) => void;
  addAttribute: () => void;
  removeAttribute: (index: number) => void;
  handleSubmit: (e: React.FormEvent) => void;
  saveMutation: any;
  isNewChimera: boolean;
  chimera: any;
  setLocation: (to: string) => void;
}

export function ChimeraIdentityTab({
  formData,
  handleChange,
  attributes,
  handleAttributeChange,
  addAttribute,
  removeAttribute,
  handleSubmit,
  saveMutation,
  isNewChimera,
  chimera,
  setLocation
}: ChimeraIdentityTabProps) {
  // Obtenir les types énumérés
  const containerTypes = Object.values(containerTypeEnum.enumValues);
  const rarityTypes = Object.values(rarityEnum.enumValues);

  return (
    <>
      {/* Formulaire de modification */}
      <form onSubmit={handleSubmit} className="bg-white shadow mb-6 overflow-hidden">
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

      {/* Affichage des informations d'identité de la chimère (en mode lecture seule) */}
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
                    src={chimera.imageUrl || "https://via.placeholder.com/300"} 
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
  );
}