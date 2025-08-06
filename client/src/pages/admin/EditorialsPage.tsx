import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Editorial, insertEditorialSchema } from '@shared/schema';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'wouter';

// Fonction pour traiter correctement les URLs d'images
const processImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Si l'URL est une URL complète (commence par http:// ou https://), la retourner telle quelle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Si c'est un chemin relatif, le convertir en URL absolue
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  return `/${cleanPath}`;
};

// Constantes pour les options de tri
enum SortOption {
  RECENT = "recent",        // Plus récents d'abord
  OLDEST = "oldest",        // Plus anciens d'abord
  NAME_ASC = "name_asc",    // Alphabétique (A-Z)
  NAME_DESC = "name_desc",  // Alphabétique (Z-A)
}

// Interface pour les options de filtrage
interface FilterOptions {
  searchTerm: string;
}

/**
 * Page de gestion des éléments éditoriaux
 * Ces éléments servent à remplir les containers de type EDITORIAL dans la grille
 */
export function EditorialsPage() {
  // État pour les options de tri et de filtrage
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.RECENT);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: ''
  });

  // État pour le modal de suppression
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editorialToDelete, setEditorialToDelete] = useState<Editorial | null>(null);
  
  // États pour les actions directes EXIT et HIDE
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Récupération des données des éléments éditoriaux
  const { data: editorials = [], isLoading } = useQuery<Editorial[]>({ 
    queryKey: ['/api/editorials']
  });

  // QueryClient pour les mutations
  const queryClient = useQueryClient();

  // Mutation pour supprimer un élément éditorial
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/editorials/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      return response.status === 204 ? null : response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/editorials'] });
      setDeleteModalOpen(false);
      setEditorialToDelete(null);
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      console.error('Erreur de suppression:', error);
      setDeleteConfirmId(null);
    }
  });
  
  // Mutation pour cacher/afficher un éditorial
  const toggleHiddenMutation = useMutation({
    mutationFn: async ({ id, isHidden }: { id: number, isHidden: boolean }) => {
      const response = await fetch(`/api/editorials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHidden })
      });
      if (!response.ok) throw new Error('Erreur lors de la modification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/editorials'] });
    }
  });
  
  // Gérer la suppression directe
  const handleDeleteEditorial = (id: number) => {
    setDeleteConfirmId(id);
  };
  
  // Gérer le masquage/affichage
  const handleToggleHidden = (id: number, isHidden: boolean) => {
    toggleHiddenMutation.mutate({ id, isHidden });
  };

  // État pour les éléments éditoriaux filtrés et triés
  const displayedEditorials = React.useMemo(() => {
    if (!editorials || editorials.length === 0) {
      return [];
    }

    // Filtrage des éléments éditoriaux
    let filtered = [...editorials];
    
    // Filtrage par terme de recherche
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(editorial => 
        editorial.name.toLowerCase().includes(searchLower) || 
        editorial.reference.toLowerCase().includes(searchLower) ||
        (editorial.description && editorial.description.toLowerCase().includes(searchLower))
      );
    }

    // Tri des éléments éditoriaux
    switch (sortOption) {
      case SortOption.RECENT:
        // Tri par ID décroissant (plus récents d'abord)
        filtered.sort((a, b) => b.id - a.id);
        break;
      case SortOption.OLDEST:
        // Tri par ID croissant (plus anciens d'abord)
        filtered.sort((a, b) => a.id - b.id);
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

    return filtered;
  }, [editorials, sortOption, filters]);

  // Fonction pour mettre à jour les filtres
  const updateFilter = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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

  // Fonction pour ouvrir le modal de suppression
  const openDeleteModal = (editorial: Editorial) => {
    setEditorialToDelete(editorial);
    setDeleteModalOpen(true);
  };

  // Fonction pour confirmer la suppression
  const confirmDelete = () => {
    if (editorialToDelete) {
      deleteMutation.mutate(editorialToDelete.id);
    }
  };

  return (
    <AdminLayout>
      {/* En-tête minimaliste */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-mono font-normal">Éléments Éditoriaux</h1>
            <p className="text-gray-600 font-mono text-xs">
              Gérez les contenus éditoriaux affichés dans la grille
            </p>
          </div>
          <div className="flex space-x-2">
            <Link href="/admin/editorials/new">
              <a className="px-3 py-1 bg-indigo-600 text-white text-xs font-mono flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouvel Élément Éditorial
              </a>
            </Link>
          </div>
        </div>
      </div>

      {/* Filtres et tri */}
      <div className="mb-6 flex flex-wrap gap-4 items-center bg-gray-50 p-4 border border-gray-200">
        {/* Barre de recherche */}
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Rechercher un élément éditorial..."
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

        {/* Options de tri */}
        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-300 px-3 py-1 pr-8 font-mono text-xs"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
          >
            <option value={SortOption.RECENT}>Plus récents d'abord</option>
            <option value={SortOption.OLDEST}>Plus anciens d'abord</option>
            <option value={SortOption.NAME_ASC}>Nom (A-Z)</option>
            <option value={SortOption.NAME_DESC}>Nom (Z-A)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Affichage du contenu principal */}
      <div className="border border-gray-200 bg-white">
        {isLoading ? (
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
            {displayedEditorials.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-gray-300 m-6">
                {filters.searchTerm ? (
                  <>
                    <h3 className="text-lg font-mono text-gray-600 mb-2">Aucun élément éditorial ne correspond à votre recherche</h3>
                    <p className="text-gray-500 mb-4 font-mono text-xs">
                      Essayez de modifier vos critères de recherche
                    </p>
                    <button
                      onClick={() => updateFilter('searchTerm', '')}
                      className="px-4 py-2 bg-indigo-600 text-white font-mono text-xs"
                    >
                      Réinitialiser la recherche
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-mono text-gray-600 mb-2">Aucun élément éditorial trouvé</h3>
                    <p className="text-gray-500 mb-4 font-mono text-xs">
                      Commencez par ajouter votre premier élément éditorial à la collection
                    </p>
                    <Link href="/admin/editorials/new">
                      <a className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-mono text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Nouvel Élément Éditorial
                      </a>
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="p-6">
                {/* Nombre de résultats */}
                <div className="mb-4 text-xs text-gray-600 font-mono">
                  {displayedEditorials.length} élément{displayedEditorials.length > 1 ? 's' : ''} éditorial{displayedEditorials.length > 1 ? 'aux' : ''} affiché{displayedEditorials.length > 1 ? 's' : ''}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto', padding: '0 5px', paddingBottom: '20px' }}>
                  {/* Cellule d'ajout d'un nouvel élément éditorial */}
                  <div className="border-2 border-dashed border-gray-300 hover:border-indigo-300 transition-all flex flex-col items-center justify-center cursor-pointer h-full min-h-[360px] bg-gray-50/30">
                    <Link href="/admin/editorials/new">
                      <a className="w-full h-full p-4 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-indigo-50 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="font-mono text-base mb-2 text-gray-700">Nouvel Élément Éditorial</h3>
                        <p className="text-xs font-mono text-gray-500">
                          Ajouter un nouvel élément visuel à la grille
                        </p>
                      </a>
                    </Link>
                  </div>
                  
                  {displayedEditorials.map((editorial) => (
                    <div key={editorial.id} className="border border-gray-200 bg-white hover:shadow-md transition-all">
                      {/* Image container avec aspect ratio fixe */}
                      <div className="relative pt-[100%] bg-gray-100">
                        {editorial.imageUrl ? (
                          <>
                            <img 
                              src={processImageUrl(editorial.imageUrl)}
                              alt={editorial.name} 
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                console.error(`Erreur de chargement pour l'image: ${editorial.imageUrl}`);
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
                        {deleteConfirmId === editorial.id && (
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
                                Confirmer la suppression de cet éditorial ?
                              </h3>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMutation.mutate(editorial.id);
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
                              handleDeleteEditorial(editorial.id);
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
                              handleToggleHidden(editorial.id, !editorial.isHidden);
                            }}
                            className="p-1.5 border-2 border-dashed border-gray-300 bg-white text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
                            title={editorial.isHidden ? "Réafficher" : "Cacher de la grille"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editorial.isHidden ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L17 17M3 3l18 18"} />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Badge pour le type (toujours EDITORIAL) */}
                        <div className="absolute top-2 left-2">
                          <div className="text-xs font-mono px-2 py-1 bg-indigo-100 text-indigo-800">
                            ÉDITORIAL
                          </div>
                        </div>
                        
                        {/* Badge pour le lien externe s'il existe */}
                        {editorial.externalUrl && (
                          <div className="absolute bottom-2 right-2">
                            <div className="text-xs font-mono px-2 py-1 bg-blue-100 text-blue-800">
                              Lien externe
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Informations sur l'élément éditorial */}
                      <div className="p-4">
                        <h3 className="font-mono font-normal text-sm truncate">{editorial.name}</h3>
                        <p className="text-xs font-mono text-gray-500 truncate mb-1">{editorial.reference}</p>
                        
                        {/* Date de création */}
                        <p className="text-[10px] font-mono text-gray-400 mb-1">
                          Date: {editorial.timestamp ? formatDate(editorial.timestamp.toString()) : 'Date inconnue'}
                        </p>
                        
                        <p className="text-xs font-mono text-gray-600 line-clamp-2 mb-3" style={{minHeight: '30px'}}>
                          {editorial.description || "Aucune description disponible"}
                        </p>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          <Link href={`/admin/editorials/${editorial.id}`}>
                            <a className="px-3 py-1 bg-indigo-600 text-white text-xs text-center font-mono">
                              Éditer
                            </a>
                          </Link>
                          <button 
                            onClick={() => openDeleteModal(editorial)}
                            className="px-3 py-1 bg-red-600 text-white text-xs text-center font-mono"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-mono mb-4">Confirmer la suppression</h3>
            <p className="text-sm font-mono mb-6">
              Êtes-vous sûr de vouloir supprimer l'élément éditorial "{editorialToDelete?.name}" ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-xs font-mono"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded text-xs font-mono"
              >
                {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}