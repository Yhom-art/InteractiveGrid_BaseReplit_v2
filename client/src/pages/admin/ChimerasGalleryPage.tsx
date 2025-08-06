import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from './AdminLayout';
import { Chimera } from '@shared/schema';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Fonction pour traiter correctement les URLs d'images
const processImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Si l'URL est une URL complète, la retourner telle quelle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  let cleanPath = url;
  
  // Nettoyer agressivement tous les préfixes d'admin, même répétés
  while (cleanPath.includes('/admin/')) {
    cleanPath = cleanPath.replace(/\/admin\/[^\/]*\//, '/');
    cleanPath = cleanPath.replace(/\/admin\//, '/');
  }
  
  // Supprimer le premier slash s'il existe
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  // Extraire la partie attached_assets si elle existe
  if (cleanPath.includes('attached_assets')) {
    const attachedIndex = cleanPath.indexOf('attached_assets');
    cleanPath = cleanPath.substring(attachedIndex);
  }
  
  // Si le chemin ne commence toujours pas par attached_assets et contient un fichier
  if (!cleanPath.startsWith('attached_assets') && cleanPath.includes('.')) {
    cleanPath = `attached_assets/Yhom_Doublures/${cleanPath}`;
  }
  
  // Construire une URL absolue pour éviter les intercepteurs de routage
  const origin = window.location.origin;
  return `${origin}/${cleanPath}`;
};

// Constantes pour les options de tri
enum SortOption {
  RECENT = "recent",        // Ordre d'arrivée (plus récent d'abord)
  OLDEST = "oldest",        // Ordre d'arrivée (plus ancien d'abord)
  MODIFIED = "modified",    // Dernières modifications
  NAME_ASC = "name_asc",    // Alphabétique (A-Z)
  NAME_DESC = "name_desc",  // Alphabétique (Z-A)
}

// Interface pour les options de filtrage
interface FilterOptions {
  type: string | null;
  rarity: string | null;
  searchTerm: string;
  tag: string | null;
}

/**
 * Page galerie des NFT chimères 
 * Affiche les chimères dans un mode visuel permettant un accès direct à la gestion de panel
 */
export function ChimerasGalleryPage() {
  // État pour le mode d'affichage
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [location, navigate] = useLocation();
  
  // État pour les options de tri et de filtrage
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.RECENT);
  const [filters, setFilters] = useState<FilterOptions>({
    type: null,
    rarity: null,
    searchTerm: '',
    tag: null
  });

  // Récupération des données des chimères
  const { data: chimeras = [], isLoading: loadingChimeras } = useQuery<Chimera[]>({ 
    queryKey: ['/api/chimeras']
  });

  // Récupération des panels pour les dates de modification
  const { data: panels = [], isLoading: loadingPanels } = useQuery<any[]>({ 
    queryKey: ['/api/panels']
  });

  // État pour les chimères filtrées et triées
  const [displayedChimeras, setDisplayedChimeras] = useState<Chimera[]>([]);
  
  // État pour le formulaire de création
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // État du formulaire de création
  const [createForm, setCreateForm] = useState({
    name: '',
    reference: '',
    description: '',
    imageUrl: '',
    price: '',
    collection: '',
    type: 'FREE',
    creator: '',
    rarity: 'Common'
  });

  // État pour l'onglet actif du modal
  const [activeTab, setActiveTab] = useState<'manual' | 'nft' | 'upload'>('manual');
  
  // État pour l'ID NFT
  const [nftId, setNftId] = useState('');
  
  // État pour l'upload d'image
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Client pour les mutations
  const queryClient = useQueryClient();
  
  // États pour la gestion des actions
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // Mutation pour supprimer une chimère
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/chimeras/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      // Pour les réponses 204 (No Content), on ne peut pas faire response.json()
      return response.status === 204 ? null : response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chimeras'] });
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      console.error('Erreur de suppression:', error);
      setDeleteConfirmId(null);
    }
  });
  
  // Mutation pour cacher/afficher une chimère
  const toggleHiddenMutation = useMutation({
    mutationFn: async ({ id, isHidden }: { id: number, isHidden: boolean }) => {
      const response = await fetch(`/api/chimeras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHidden })
      });
      if (!response.ok) throw new Error('Erreur lors de la modification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chimeras'] });
    }
  });
  
  // Gérer la suppression - plus besoin de logique double clic
  const handleDeleteChimera = (id: number) => {
    setDeleteConfirmId(id);
  };
  
  // Gérer le masquage/affichage
  const handleToggleHidden = (id: number, isHidden: boolean) => {
    toggleHiddenMutation.mutate({ id, isHidden });
  };
  
  // Fonction pour reset le formulaire
  const resetForm = () => {
    setCreateForm({
      name: '',
      reference: '',
      description: '',
      imageUrl: '',
      price: '',
      collection: '',
      type: 'FREE',
      creator: '',
      rarity: 'Common'
    });
    setNftId('');
    setUploadedFile(null);
    setUploadProgress(0);
    setActiveTab('manual');
  };

  // Mutation pour créer une chimère
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Ajouter les champs manquants requis par le schéma
      const completeData = {
        ...data,
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        price: data.price || '0 ETH',
        collection: data.collection || 'Collection par défaut',
        creator: data.creator || 'Anonyme',
        attributes: data.attributes || []
      };
      
      const response = await fetch('/api/chimeras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chimeras'] });
      queryClient.invalidateQueries({ queryKey: ['/api/panels'] });
      setShowCreateForm(false);
      resetForm();
    }
  });

  // Fonction pour gérer l'upload d'image
  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploadProgress(20);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'upload');
      
      const result = await response.json();
      console.log('Résultat upload:', result);
      
      const fileName = file.name.split('.')[0];
      const imageUrl = result.url || result.filePath;
      const timestamp = Date.now();
      
      setCreateForm(prev => ({ 
        ...prev, 
        imageUrl: imageUrl,
        name: fileName || `IMAGE_${timestamp}`,
        reference: `${fileName}_${timestamp}` || `REF_${timestamp}`
      }));
      setUploadProgress(100);
      
      console.log('Formulaire mis à jour avec imageUrl:', imageUrl);
    } catch (error) {
      console.error('Erreur upload:', error);
      setUploadProgress(0);
    }
  };

  // Fonction pour importer depuis un NFT ID
  const handleNftImport = async () => {
    if (!nftId.trim()) return;
    
    try {
      // Ici on pourrait appeler une API pour récupérer les données NFT
      // Pour l'instant, on simule avec des données basiques
      setCreateForm(prev => ({
        ...prev,
        name: `NFT_${nftId}`,
        reference: `NFT_${nftId}`,
        description: `NFT importé avec l'ID ${nftId}`,
        type: 'FREE'
      }));
    } catch (error) {
      console.error('Erreur import NFT:', error);
    }
  };
  
  // Créer un map des dates de dernière modification par chimera_id
  const lastUpdatedMap = useMemo(() => {
    const map = new Map<number, Date>();
    
    panels.forEach(panel => {
      const chimeraId = panel.chimeraId;
      if (!chimeraId) return;
      
      const updatedAt = panel.updatedAt ? new Date(panel.updatedAt) : null;
      if (!updatedAt) return;
      
      const currentDate = map.get(chimeraId);
      if (!currentDate || updatedAt > currentDate) {
        map.set(chimeraId, updatedAt);
      }
    });
    
    return map;
  }, [panels]);

  // Effet pour filtrer et trier les chimères lorsque les données, le tri ou les filtres changent
  useEffect(() => {
    if (!chimeras || chimeras.length === 0) {
      setDisplayedChimeras([]);
      return;
    }

    // Filtrage des chimères
    let filtered = [...chimeras];
    
    // Filtrage par terme de recherche
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(chimera => 
        chimera.name.toLowerCase().includes(searchLower) || 
        chimera.reference.toLowerCase().includes(searchLower) ||
        (chimera.description && chimera.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Filtrage par type de container
    if (filters.type) {
      filtered = filtered.filter(chimera => chimera.type === filters.type);
    }
    
    // Filtrage par rareté
    if (filters.rarity) {
      filtered = filtered.filter(chimera => chimera.rarity === filters.rarity);
    }
    
    // Filtrage par tag (utilisation des attributs)
    if (filters.tag && filters.tag !== 'all') {
      filtered = filtered.filter(chimera => {
        // Vérification si chimera.attributes existe et contient le tag
        if (chimera.attributes && Array.isArray(chimera.attributes)) {
          return chimera.attributes.some(attr => 
            attr.trait_type === 'tag' && attr.value === filters.tag
          );
        }
        return false;
      });
    }

    // Tri des chimères
    switch (sortOption) {
      case SortOption.RECENT:
        // Tri par ID décroissant (supposant que les IDs plus élevés sont plus récents)
        filtered.sort((a, b) => b.id - a.id);
        break;
      case SortOption.OLDEST:
        // Tri par ID croissant
        filtered.sort((a, b) => a.id - b.id);
        break;
      case SortOption.MODIFIED:
        // Tri par date de dernière modification de panel
        // Priorité particulière pour DALLIA (id=1), puis tri par date
        filtered.sort((a, b) => {
          // Si l'un est DALLIA, la priorité est donnée
          if (a.id === 1) return -1;
          if (b.id === 1) return 1;
          
          // Sinon, utiliser les dates de dernière modification
          const dateA = lastUpdatedMap.get(a.id) || new Date(0);
          const dateB = lastUpdatedMap.get(b.id) || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case SortOption.NAME_ASC:
        // Tri alphabétique croissant
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case SortOption.NAME_DESC:
        // Tri alphabétique décroissant
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    setDisplayedChimeras(filtered);
  }, [chimeras, sortOption, filters]);

  // Extraction des tags uniques depuis les attributs
  const uniqueTags = React.useMemo(() => {
    const tags = new Set<string>();
    
    chimeras.forEach(chimera => {
      if (chimera.attributes && Array.isArray(chimera.attributes)) {
        chimera.attributes.forEach(attr => {
          if (attr.trait_type === 'tag') {
            tags.add(attr.value);
          }
        });
      }
    });
    
    return Array.from(tags);
  }, [chimeras]);

  // Fonction pour mettre à jour les filtres
  const updateFilter = (key: keyof FilterOptions, value: string | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setFilters({
      type: null,
      rarity: null,
      searchTerm: '',
      tag: null
    });
    setSortOption(SortOption.RECENT);
  };

  // Fonction pour formater la date
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'Date inconnue';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  // Types de containers disponibles
  const containerTypes = ['FREE', 'ADOPT', 'ADOPTED', 'EDITORIAL'];
  
  // Types de rareté disponibles
  const rarityTypes = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Unique'];

  return (
    <AdminLayout>
      {/* En-tête minimaliste */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-mono font-normal">Galerie des Chimères</h1>
            <p className="text-gray-600 font-mono text-xs">
              Gérez l'ensemble des NFT et leurs composants spécialisés
            </p>
          </div>

        </div>
      </div>

      {/* Filtres et tri */}
      <div className="mb-6 flex flex-wrap gap-4 items-center bg-gray-50 p-4 border border-gray-200">
        {/* Toggle vue GRILLE/LISTE */}
        <div className="flex border border-gray-300 bg-white">
          <button
            className={`px-3 py-1 text-xs font-mono ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setViewMode('grid')}
          >
            GRILLE
          </button>
          <button
            className={`px-3 py-1 text-xs font-mono border-l border-gray-300 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setViewMode('list')}
          >
            LISTE
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Rechercher une chimère..."
            className="w-full px-3 py-1 border border-gray-300 pl-10 font-mono text-xs bg-white"
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filtre par type */}
        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-300 px-3 py-1 pr-8 font-mono text-xs"
            value={filters.type || 'all'}
            onChange={(e) => updateFilter('type', e.target.value === 'all' ? null : e.target.value)}
          >
            <option value="all">Tous les types</option>
            {containerTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {/* Filtre par rareté */}
        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-300 px-3 py-1 pr-8 font-mono text-xs"
            value={filters.rarity || 'all'}
            onChange={(e) => updateFilter('rarity', e.target.value === 'all' ? null : e.target.value)}
          >
            <option value="all">Toutes les raretés</option>
            {rarityTypes.map(rarity => (
              <option key={rarity} value={rarity}>{rarity}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {/* Filtre par tags (si disponibles) */}
        {uniqueTags.length > 0 && (
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-300 px-3 py-1 pr-8 font-mono text-xs"
              value={filters.tag || 'all'}
              onChange={(e) => updateFilter('tag', e.target.value === 'all' ? null : e.target.value)}
            >
              <option value="all">Tous les tags</option>
              {uniqueTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        )}

        {/* Options de tri */}
        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-300 px-3 py-1 pr-8 font-mono text-xs"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
          >
            <option value={SortOption.RECENT}>Plus récents d'abord</option>
            <option value={SortOption.OLDEST}>Plus anciens d'abord</option>
            <option value={SortOption.MODIFIED}>Dernières modifications</option>
            <option value={SortOption.NAME_ASC}>Nom (A-Z)</option>
            <option value={SortOption.NAME_DESC}>Nom (Z-A)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {/* Bouton de réinitialisation des filtres */}
        <button
          onClick={resetFilters}
          className="px-2 py-1 border border-gray-300 hover:bg-gray-50 text-gray-600 text-xs font-mono"
        >
          Réinitialiser
        </button>
      </div>

      {/* Affichage du contenu principal */}
      <div className="border border-gray-200 bg-white">
        {loadingChimeras || loadingPanels ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 p-4 h-80 animate-pulse">
                <div className="bg-gray-200 h-40 mb-3"></div>
                <div className="h-6 bg-gray-200 mb-2"></div>
                <div className="h-4 bg-gray-200 w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {displayedChimeras.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-gray-300 m-6">
                {filters.searchTerm || filters.type || filters.rarity || filters.tag ? (
                  <>
                    <h3 className="text-lg font-mono text-gray-600 mb-2">Aucune chimère ne correspond aux filtres</h3>
                    <p className="text-gray-500 mb-4 font-mono text-sm">
                      Essayez de modifier vos critères de recherche
                    </p>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-indigo-600 text-white font-mono text-sm"
                    >
                      Réinitialiser les filtres
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-mono text-gray-600 mb-2">Aucune chimère trouvée</h3>
                    <p className="text-gray-500 mb-4 font-mono text-sm">
                      Commencez par ajouter votre première chimère à la collection
                    </p>
                    <div className="flex justify-center">
                      <button 
                        onClick={() => window.location.href = '/admin/chimeras/new'}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-mono text-sm hover:bg-indigo-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Créer une Chimère
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="p-6">
                {/* Nombre de résultats */}
                <div className="mb-4 text-sm text-gray-600 font-mono">
                  {displayedChimeras.length} chimère{displayedChimeras.length > 1 ? 's' : ''} affichée{displayedChimeras.length > 1 ? 's' : ''}
                </div>

                {/* Affichage en grille */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto', padding: '0 5px', paddingBottom: '20px' }}>
                  {/* Cellule d'ajout de nouvelle chimère */}
                  <div 
                    onClick={() => window.location.href = '/admin/chimeras/new'}
                    className="block border-2 border-dashed border-gray-300 hover:border-indigo-300 transition-all h-full min-h-[360px] bg-white hover:bg-gray-50/50 cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                      <div className="w-16 h-16 mx-auto mb-3 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="font-mono text-base mb-2 text-gray-700">Nouvelle Chimère</h3>
                      <p className="text-sm font-mono text-gray-500">Cliquez pour créer</p>
                    </div>
                  </div>
                  
                  {displayedChimeras.map((chimera) => (
                    <div key={chimera.id} className="border border-gray-200 bg-white hover:shadow-md transition-all">
                      {/* Image container avec aspect ratio fixe */}
                      <div className="relative pt-[100%] bg-gray-100">
                        {chimera.imageUrl ? (
                          <>
                            <img 
                              src={processImageUrl(chimera.imageUrl)}
                              alt={chimera.name} 
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                console.error(`Erreur de chargement pour l'image: ${chimera.imageUrl}`);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Modale de confirmation de suppression */}
                        {deleteConfirmId === chimera.id && (
                          <div className="absolute inset-0 bg-red-600 flex items-center justify-center z-20">
                            {/* Bouton croix pour annuler */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(null);
                              }}
                              className="absolute top-3 right-3 text-white hover:text-red-200 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            
                            {/* Contenu central */}
                            <div className="text-center">
                              <h3 className="text-white font-mono text-sm mb-6">
                                Confirmer la suppression de cette NFT ?
                              </h3>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMutation.mutate(chimera.id);
                                }}
                                className="px-6 py-3 bg-white text-red-600 font-mono text-sm hover:bg-red-50 transition-colors"
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending ? 'SUPPRESSION...' : 'OUI, SUPPRIMER'}
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Actions sur l'image */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          {/* EXIT - Supprimer */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(chimera.id);
                            }}
                            className="p-1.5 bg-red-600 text-white hover:bg-red-700 transition-colors"
                            title="Supprimer définitivement"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          
                          {/* HIDE - Cacher */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleHidden(chimera.id, !chimera.isHidden);
                            }}
                            className="p-1.5 border-2 border-dashed border-gray-300 bg-white text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
                            title={chimera.isHidden ? "Réafficher" : "Cacher de la grille"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={chimera.isHidden ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L17 17M3 3l18 18"} />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Badges empilés verticalement */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {/* Badge pour le type de container */}
                          <div className={`text-[10px] font-mono px-1.5 py-0.5 w-fit ${
                            chimera.type === 'FREE' ? 'bg-pink-100 text-pink-800' :
                            chimera.type === 'ADOPT' ? 'bg-purple-100 text-purple-800' :
                            chimera.type === 'ADOPTED' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {chimera.type}
                          </div>
                          
                          {/* Badge pour la rareté */}
                          {chimera.rarity && (
                            <div className={`text-[10px] font-mono px-1.5 py-0.5 w-fit ${
                              chimera.rarity === 'Common' ? 'bg-green-100 text-green-800' :
                              chimera.rarity === 'Uncommon' ? 'bg-blue-100 text-blue-800' :
                              chimera.rarity === 'Rare' ? 'bg-yellow-100 text-yellow-800' :
                              chimera.rarity === 'Epic' ? 'bg-purple-100 text-purple-800' :
                              chimera.rarity === 'Legendary' ? 'bg-orange-100 text-orange-800' :
                              chimera.rarity === 'Unique' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {chimera.rarity}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Informations sur la chimère */}
                      <div className="p-4">
                        <h3 className="font-mono font-normal text-sm truncate">{chimera.name}</h3>
                        <p className="text-xs font-mono text-gray-500 truncate mb-2">{chimera.reference}</p>
                        
                        {/* Dates minimalistes avec icônes */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-[10px] font-mono text-gray-500">
                              {chimera.createdAt ? formatDate(chimera.createdAt.toString()) : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            <span className="text-[10px] font-mono text-gray-500">
                              {chimera.updatedAt ? formatDate(chimera.updatedAt.toString()) : 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Liste des panels associés avec composants */}
                        <div className="mb-3">
                          <div className="text-[10px] font-mono text-gray-400 mb-1">Panels:</div>
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              const associatedPanels = panels.filter(panel => panel.chimeraId === chimera.id);
                              return associatedPanels.length > 0 ? (
                                associatedPanels.map(panel => (
                                  <div key={panel.id} className="text-[9px] font-mono bg-gray-100 text-gray-700 px-1 py-0.5 rounded flex items-center gap-1">
                                    <span>#{panel.id}</span>
                                    {panel.components && panel.components.length > 0 && (
                                      <div className="flex items-center gap-0.5">
                                        <span className="text-gray-400">•</span>
                                        {panel.components.map((comp, idx) => (
                                          <span key={idx} className="text-[8px] bg-blue-100 text-blue-700 px-1 rounded">
                                            {comp.type === 'map' ? 'MAP' : 
                                             comp.type === 'podcast' ? 'POD' : 
                                             comp.type === 'wallet' ? 'WAL' :
                                             comp.type?.toUpperCase()}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <span className="text-[9px] font-mono text-gray-400 italic">Aucun panel</span>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Action unifiée - Bouton pour gérer la chimère et son panel */}
                        <div>
                          <a 
                            href={`/admin/chimeras/${chimera.id}`} 
                            className="block w-full px-3 py-1 bg-indigo-600 text-white text-xs text-center font-mono"
                          >
                            Gérer
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                )}

                {/* Affichage en tableau */}
                {viewMode === 'list' && (
                  <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-3 text-xs font-mono text-gray-600">Image</th>
                          <th className="text-left p-3 text-xs font-mono text-gray-600">Nom</th>
                          <th className="text-left p-3 text-xs font-mono text-gray-600">Référence</th>
                          <th className="text-left p-3 text-xs font-mono text-gray-600">Type</th>
                          <th className="text-left p-3 text-xs font-mono text-gray-600">Créé</th>
                          <th className="text-left p-3 text-xs font-mono text-gray-600">Modifié</th>
                          <th className="text-left p-3 text-xs font-mono text-gray-600">Panels</th>
                          <th className="text-left p-3 text-xs font-mono text-gray-600">Actions</th>
                        </tr>
                        {/* Ligne de création */}
                        <tr className="border-b border-gray-300 bg-white border-2 border-dashed hover:bg-gray-50/50">
                          <td className="p-3">
                            <div className="w-8 h-8 border-2 border-dashed border-gray-300 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </td>
                          <td colSpan={6} className="p-3">
                            <span className="text-sm font-mono text-gray-700">Créer une nouvelle chimère</span>
                          </td>
                          <td className="p-3">
                            <button 
                              onClick={() => setShowCreateForm(true)}
                              className="px-3 py-1 bg-indigo-600 text-white text-xs font-mono hover:bg-indigo-700"
                            >
                              Créer
                            </button>
                          </td>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedChimeras.map((chimera, index) => (
                          <tr key={chimera.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                            <td className="p-3">
                              <div className="w-8 h-8 overflow-hidden">
                                <img 
                                  src={processImageUrl(chimera.imageUrl || "")} 
                                  alt={chimera.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="text-sm font-mono truncate max-w-32 block">{chimera.name}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-xs font-mono text-gray-600">{chimera.reference}</span>
                            </td>
                            <td className="p-3">
                              <div className={`text-xs font-mono px-2 py-1 inline-block ${
                                chimera.type === 'FREE' ? 'bg-green-100 text-green-800' :
                                chimera.type === 'ADOPT' ? 'bg-blue-100 text-blue-800' :
                                chimera.type === 'ADOPTED' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {chimera.type}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="text-xs font-mono text-gray-500">
                                {chimera.createdAt ? formatDate(chimera.createdAt.toString()) : 'N/A'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-xs font-mono text-gray-500">
                                {chimera.updatedAt ? formatDate(chimera.updatedAt.toString()) : 'N/A'}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {(() => {
                                  const associatedPanels = panels.filter(panel => panel.chimeraId === chimera.id);
                                  return associatedPanels.length > 0 ? (
                                    associatedPanels.map(panel => (
                                      <div key={panel.id} className="text-[9px] font-mono bg-gray-100 text-gray-700 px-1 py-0.5 rounded flex items-center gap-1">
                                        <span>#{panel.id}</span>
                                        {panel.components && panel.components.length > 0 && (
                                          <div className="flex items-center gap-0.5">
                                            <span className="text-gray-400">•</span>
                                            {panel.components.map((comp: any, idx: number) => (
                                              <span key={idx} className="text-[8px] bg-blue-100 text-blue-700 px-1 rounded">
                                                {comp.type === 'map' ? 'MAP' : 
                                                 comp.type === 'podcast' ? 'POD' : 
                                                 comp.type === 'wallet' ? 'WAL' :
                                                 comp.type?.toUpperCase()}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-[9px] font-mono text-gray-400 italic">Aucun panel</span>
                                  );
                                })()}
                              </div>
                            </td>
                            <td className="p-3">
                              <a 
                                href={`/admin/chimeras/${chimera.id}`} 
                                className="px-3 py-1 bg-indigo-600 text-white text-xs font-mono"
                              >
                                Gérer
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modal de création de chimère */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-mono">Créer une Chimère</h2>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Onglets */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('manual')}
                className={`px-4 py-2 text-sm font-mono ${
                  activeTab === 'manual' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Création Manuelle
              </button>
              <button
                onClick={() => setActiveTab('nft')}
                className={`px-4 py-2 text-sm font-mono ${
                  activeTab === 'nft' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Import NFT
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 text-sm font-mono ${
                  activeTab === 'upload' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upload Image
              </button>
            </div>
            
            {/* Contenu de l'onglet Import NFT */}
            {activeTab === 'nft' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-mono text-gray-700 mb-2">ID NFT</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Entrez l'ID du NFT..."
                      className="flex-1 px-3 py-2 border border-gray-300 font-mono text-sm"
                      value={nftId}
                      onChange={(e) => setNftId(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleNftImport}
                      className="px-4 py-2 bg-indigo-600 text-white font-mono text-sm hover:bg-indigo-700"
                    >
                      Importer
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    L'ID sera utilisé pour récupérer automatiquement les métadonnées du NFT
                  </p>
                </div>
              </div>
            )}

            {/* Contenu de l'onglet Upload */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-mono text-gray-700 mb-2">Image</label>
                  <div className="border-2 border-dashed border-gray-300 p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedFile(file);
                          handleFileUpload(file);
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="font-mono text-sm">Cliquez pour sélectionner une image</p>
                        <p className="font-mono text-xs text-gray-400">PNG, JPG, GIF jusqu'à 10MB</p>
                      </div>
                    </label>
                  </div>
                  {uploadedFile && (
                    <div className="mt-2">
                      <p className="text-sm font-mono text-gray-600">Fichier: {uploadedFile.name}</p>
                      {uploadProgress > 0 && (
                        <div className="w-full bg-gray-200 h-2 mt-1">
                          <div className="bg-indigo-600 h-2" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Prévisualisation et champs auto-remplis */}
                {createForm.imageUrl && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex space-x-4">
                      <div className="w-32 h-32 border border-gray-300 flex-shrink-0">
                        <img 
                          src={createForm.imageUrl} 
                          alt="Prévisualisation" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="block text-sm font-mono text-gray-700 mb-1">Nom *</label>
                          <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 font-mono text-sm"
                            value={createForm.name}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-mono text-gray-700 mb-1">Référence *</label>
                          <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 font-mono text-sm"
                            value={createForm.reference}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, reference: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contenu de l'onglet Manuel */}
            {activeTab === 'manual' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(createForm);
              }} className="space-y-4">
              <div>
                <label className="block text-sm font-mono mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 font-mono text-sm"
                  placeholder="Nom de la chimère"
                />
              </div>
              
              <div>
                <label className="block text-sm font-mono mb-1">Référence *</label>
                <input
                  type="text"
                  required
                  value={createForm.reference}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, reference: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 font-mono text-sm"
                  placeholder="Référence unique"
                />
              </div>
              
              <div>
                <label className="block text-sm font-mono mb-1">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 font-mono text-sm h-20"
                  placeholder="Description de la chimère"
                />
              </div>
              
              <div>
                <label className="block text-sm font-mono mb-1">URL Image</label>
                <input
                  type="text"
                  value={createForm.imageUrl}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 font-mono text-sm"
                  placeholder="URL de l'image"
                />
                {/* Prévisualisation de l'image */}
                {createForm.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={createForm.imageUrl} 
                      alt="Prévisualisation" 
                      className="w-32 h-32 object-cover border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-mono mb-1">Type</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border border-gray-300 px-3 py-2 font-mono text-sm"
                  >
                    <option value="FREE">FREE</option>
                    <option value="ADOPT">ADOPT</option>
                    <option value="ADOPTED">ADOPTED</option>
                    <option value="EDITORIAL">EDITORIAL</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-mono mb-1">Rareté</label>
                  <select
                    value={createForm.rarity}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, rarity: e.target.value }))}
                    className="w-full border border-gray-300 px-3 py-2 font-mono text-sm"
                  >
                    <option value="Common">Common</option>
                    <option value="Uncommon">Uncommon</option>
                    <option value="Rare">Rare</option>
                    <option value="Epic">Epic</option>
                    <option value="Legendary">Legendary</option>
                    <option value="Unique">Unique</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-mono mb-1">Prix</label>
                <input
                  type="text"
                  value={createForm.price}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 font-mono text-sm"
                  placeholder="Prix (ex: 0.1 ETH)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-mono mb-1">Collection</label>
                <input
                  type="text"
                  value={createForm.collection}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, collection: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 font-mono text-sm"
                  placeholder="Nom de la collection"
                />
              </div>
              
              <div>
                <label className="block text-sm font-mono mb-1">Créateur</label>
                <input
                  type="text"
                  value={createForm.creator}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, creator: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 font-mono text-sm"
                  placeholder="Nom du créateur"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-mono text-sm hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!createForm.name || !createForm.reference || createMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white font-mono text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
            )}

            {/* Boutons de validation pour tous les onglets */}
            {(activeTab === 'nft' || activeTab === 'upload') && (
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-mono text-sm hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => createMutation.mutate(createForm)}
                  disabled={!createForm.name || !createForm.reference || !createForm.imageUrl || createMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white font-mono text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? 'Création...' : 'Créer'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}