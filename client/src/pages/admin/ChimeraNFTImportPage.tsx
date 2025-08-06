import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { containerTypeEnum, rarityEnum } from '@shared/schema';
import { fetchNFTData, NFTData } from '../../services/nftService';

export function ChimeraNFTImportPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nftData, setNftData] = useState<NFTData | null>(null);
  const [nftAddress, setNftAddress] = useState('');
  const [formData, setFormData] = useState({
    type: 'FREE' as (typeof containerTypeEnum.enumValues)[number],
    rarity: 'Rare' as (typeof rarityEnum.enumValues)[number]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Récupérer les informations de la NFT depuis la blockchain
  const fetchNFT = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupération des données NFT depuis la blockchain
      const nftResponse = await fetchNFTData(nftAddress);
      
      // Si nous avons réussi à récupérer les données, les mettre à jour dans l'état
      setNftData(nftResponse);
      
      // Log pour déboggage
      console.log("Données NFT récupérées:", nftResponse);
    } catch (err: any) {
      console.error("Erreur lors de la récupération NFT:", err);
      setError(err.message || "Impossible de récupérer les données de la NFT");
    } finally {
      setIsLoading(false);
    }
  };

  // Mutation pour créer une chimère
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/chimeras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la création de la chimère");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chimeras'] });
      setLocation(`/admin/chimeras/${data.id}`);
    },
    onError: (error: any) => {
      setError(error.message || "Erreur lors de la création de la chimère");
    }
  });

  // Enregistrer la chimère dans la base de données
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nftData) {
      setError("Veuillez d'abord récupérer les informations de la NFT.");
      return;
    }
    
    // Assurons-nous que toutes les données obligatoires sont présentes
    const chimeraData = {
      name: nftData.name || `NFT #${nftData.tokenId}`,
      reference: nftData.reference || nftData.tokenId,
      description: nftData.description || `NFT importée depuis la blockchain ${nftData.network || 'Base'}, contract: ${nftData.contractAddress}`,
      imageUrl: nftData.imageUrl || nftData.image || 'https://via.placeholder.com/500?text=NFT+Image', // Image de secours si aucune image
      type: formData.type,
      rarity: formData.rarity,
      creator: nftData.creator || nftData.owner || nftData.contractAddress,
      // Formats des attributs pour assurer la compatibilité
      attributes: Array.isArray(nftData.attributes) ? nftData.attributes : [
        { trait_type: "Contract", value: nftData.contractAddress },
        { trait_type: "TokenId", value: nftData.tokenId },
        { trait_type: "Network", value: nftData.network || "Base" }
      ],
      // Champs obligatoires selon le schéma
      price: "0", // Convertir en string car le schéma attend un texte
      collection: nftData.collection || "Imported NFT", // Valeur par défaut
      isHidden: false
    };
    
    console.log("Création de chimère avec les données:", chimeraData);
    createMutation.mutate(chimeraData);
  };

  // Types de container et rareté
  const containerTypes = Object.values(containerTypeEnum.enumValues);
  const rarityTypes = Object.values(rarityEnum.enumValues);

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Importer une NFT</h1>
          <p className="text-gray-600 mt-2">
            Connectez une NFT existante en fournissant son adresse
          </p>
        </div>

        {/* Étape 1: Recherche d'une NFT */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Étape 1: Rechercher la NFT</h2>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={nftAddress}
              onChange={e => setNftAddress(e.target.value)}
              placeholder="Adresse ou ID de la NFT (ex: 0x1234...)"
              className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={fetchNFT}
              disabled={isLoading || !nftAddress}
              className={`px-6 py-3 rounded-lg text-white ${
                isLoading || !nftAddress 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isLoading ? 'Chargement...' : 'Rechercher'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Étape 2: Prévisualisation et Configuration */}
        {nftData && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Étape 2: Configurer la chimère</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Prévisualisation */}
              <div className="border rounded-lg overflow-hidden">
                <div className="aspect-square bg-gray-100 relative">
                  <img
                    src={nftData.imageUrl}
                    alt={nftData.name}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{nftData.name}</h3>
                  <p className="text-sm text-gray-500">{nftData.reference}</p>
                  <p className="text-sm mt-2">{nftData.description}</p>
                </div>
              </div>
              
              {/* Configuration */}
              <div>
                <div className="space-y-4">
                  {/* Type de Container */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de container
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                    >
                      {containerTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Définit le comportement d'ouverture du container
                    </p>
                  </div>
                  
                  {/* Rareté */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rareté
                    </label>
                    <select
                      name="rarity"
                      value={formData.rarity}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                    >
                      {rarityTypes.map(rarity => (
                        <option key={rarity} value={rarity}>{rarity}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-sm text-gray-600 mb-3">
                      Les informations suivantes seront importées directement depuis la NFT :
                    </p>
                    <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                      <li>Nom: <span className="font-medium">{nftData.name}</span></li>
                      <li>Référence: <span className="font-medium">{nftData.reference}</span></li>
                      <li>Description: <span className="font-medium">{nftData.description ? 'Présente' : 'Non disponible'}</span></li>
                      <li>Créateur: <span className="font-medium">{nftData.creator}</span></li>
                      <li>Image: <span className="font-medium">URL récupérée</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setNftData(null);
                  setError(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {createMutation.isPending ? 'Création...' : 'Créer la chimère'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <button 
            onClick={() => setLocation('/admin/chimeras/new')}
            className="text-indigo-600 hover:text-indigo-800 mr-4"
          >
            Retour aux options de création
          </button>
          <button 
            onClick={() => setLocation('/admin/chimeras')}
            className="text-gray-600 hover:text-gray-800"
          >
            Retourner à la galerie
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ChimeraNFTImportPage;