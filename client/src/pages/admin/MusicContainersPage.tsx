import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { AudioPlayer } from '@/components/AudioPlayer';


interface MusicContainer {
  id: number;
  title: string;
  artist?: string;
  audioUrl: string;
  loop: boolean;
  isVisible: boolean;
  createdAt: string;
}

export function MusicContainersPage() {
  const [, setLocation] = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    audioUrl: '',
    loop: true,
    isVisible: true
  });
  const [editingContainer, setEditingContainer] = useState<MusicContainer | null>(null);

  const queryClient = useQueryClient();

  // Query pour récupérer les containers musicaux
  const musicContainersQuery = useQuery({
    queryKey: ['/api/music-containers'],
    staleTime: 30000,
  });

  // Mutation pour créer un nouveau container musical
  const createMusicContainerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/music-containers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la création');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/music-containers'] });
      setIsCreating(false);
      setFormData({ 
        title: '', 
        artist: '', 
        audioUrl: '',
        autoplay: false,
        loop: true,
        isVisible: true
      });
    },
  });

  // Mutation pour mettre à jour un container musical
  const updateMusicContainerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/music-containers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/music-containers'] });
      setIsCreating(false);
      setEditingContainer(null);
      setFormData({ 
        title: '', 
        artist: '', 
        audioUrl: '',
        autoplay: false,
        loop: true,
        isVisible: true
      });
    },
  });

  // Mutation pour supprimer un container musical
  const deleteMusicContainerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/music-containers/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/music-containers'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.audioUrl) return;
    
    if (editingContainer) {
      // Mode édition
      updateMusicContainerMutation.mutate({
        id: editingContainer.id,
        data: formData
      });
    } else {
      // Mode création
      createMusicContainerMutation.mutate(formData);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier que c'est un fichier audio
    if (!file.type.startsWith('audio/')) {
      alert('Veuillez sélectionner un fichier audio (MP3, WAV, etc.)');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const result = await response.json();
      
      if (result.success) {
        // Utiliser l'URL retournée par le serveur
        setFormData(prev => ({ ...prev, audioUrl: result.url }));
      } else {
        throw new Error(result.message || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload du fichier audio');
    }
  };

  const startEdit = (container: MusicContainer) => {
    setEditingContainer(container);
    setFormData({
      title: container.title,
      artist: container.artist || '',
      audioUrl: container.audioUrl,
      loop: container.loop,
      isVisible: container.isVisible
    });
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setEditingContainer(null);
    setIsCreating(false);
    setFormData({ 
      title: '', 
      artist: '', 
      audioUrl: '',
      autoplay: false,
      loop: true,
      isVisible: true
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-mono text-3xl font-bold leading-tight">CONTAINERS MUSICAUX</h1>
        <p className="text-gray-600 font-mono text-sm leading-tight">
          Gestion des players audio dans la grille inactive
        </p>
      </div>

      {/* Bouton de création */}
      <div className="mb-6">
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-sm px-4 py-2 transition-colors"
          style={{ cursor: 'url(/src/assets/cursors/cursor-grab.svg) 16 16, pointer' }}
        >
          {isCreating ? 'ANNULER' : '+ NOUVEAU CONTAINER MUSICAL'}
        </button>
      </div>

      {/* Formulaire de création */}
      {isCreating && (
        <div className="bg-white shadow p-6 mb-6">
          <h2 className="font-mono text-xl font-semibold mb-4 leading-tight">
            {editingContainer ? 'MODIFIER CONTAINER MUSICAL' : 'NOUVEAU CONTAINER MUSICAL'}
          </h2>


          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-sm font-medium text-gray-700 leading-tight mb-1">
                Titre du morceau *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 px-3 py-2 font-mono text-sm"
                placeholder="Ex: Ambient Loop 01"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-sm font-medium text-gray-700 leading-tight mb-1">
                Artiste (optionnel)
              </label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                className="w-full border border-gray-300 px-3 py-2 font-mono text-sm"
                placeholder="Ex: Studio Yhom"
              />
            </div>

            <div>
              <label className="block font-mono text-sm font-medium text-gray-700 leading-tight mb-1">
                FICHIER AUDIO *
              </label>
              <div className="space-y-3">
                {/* Upload de fichier */}
                <div>
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.ogg,.m4a"
                    onChange={handleFileUpload}
                    className="w-full border border-gray-300 px-3 py-2 font-mono text-sm file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-mono file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                  />
                </div>
                
                {/* URL manuelle (alternative) */}
                <div>
                  <label className="block font-mono text-xs text-gray-600 mb-1">
                    Ou entrez l'URL directement :
                  </label>
                  <input
                    type="text"
                    value={formData.audioUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, audioUrl: e.target.value }))}
                    className="w-full border border-gray-300 px-3 py-2 font-mono text-sm"
                    placeholder="/attached_assets/Yhom_Audio/example.mp3"
                  />
                </div>
              </div>
            </div>

            {/* Options de lecture */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoplay"
                  checked={formData.autoplay}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoplay: e.target.checked }))}
                  className="h-4 w-4"
                />
                <label htmlFor="autoplay" className="font-mono text-sm text-gray-700">
                  AUTO-PLAY
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="loop"
                  checked={formData.loop}
                  onChange={(e) => setFormData(prev => ({ ...prev, loop: e.target.checked }))}
                  className="h-4 w-4"
                />
                <label htmlFor="loop" className="font-mono text-sm text-gray-700">
                  LOOP
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                  className="h-4 w-4"
                />
                <label htmlFor="isVisible" className="font-mono text-sm text-gray-700">
                  VISIBLE DANS LA GRILLE
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={(editingContainer ? updateMusicContainerMutation.isPending : createMusicContainerMutation.isPending) || !formData.title || !formData.audioUrl}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-mono text-sm px-6 py-2 transition-colors"
              >
                {editingContainer 
                  ? (updateMusicContainerMutation.isPending ? 'SAUVEGARDE...' : 'SAUVEGARDER')
                  : (createMusicContainerMutation.isPending ? 'CRÉATION...' : 'CRÉER LE CONTAINER')
                }
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-500 hover:bg-gray-600 text-white font-mono text-sm px-6 py-2 transition-colors"
              >
                ANNULER
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des containers musicaux */}
      <div className="bg-white shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="font-mono text-lg font-semibold leading-tight">
            CONTAINERS EXISTANTS
          </h3>
        </div>
        
        <div className="p-6">
          {musicContainersQuery.isLoading ? (
            <div className="font-mono text-sm text-gray-500">Chargement...</div>
          ) : musicContainersQuery.error ? (
            <div className="font-mono text-sm text-red-600">
              Erreur: {(musicContainersQuery.error as Error).message}
            </div>
          ) : !musicContainersQuery.data || (Array.isArray(musicContainersQuery.data) && musicContainersQuery.data.length === 0) ? (
            <div className="font-mono text-sm text-gray-500">
              Aucun container musical créé pour le moment.
            </div>
          ) : (
            <div className="grid gap-4">
              {Array.isArray(musicContainersQuery.data) && musicContainersQuery.data.map((container: MusicContainer) => (
                <div key={container.id} className="border border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-mono text-sm font-semibold text-purple-800">
                        ♪ {container.title}
                      </h4>
                      {container.artist && (
                        <p className="font-mono text-xs text-gray-600 mt-1">
                          par {container.artist}
                        </p>
                      )}
                      <p className="font-mono text-xs text-gray-500 mt-1">
                        ID: {container.id} | Créé le {new Date(container.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(container)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-mono text-xs px-3 py-1 transition-colors"
                        style={{ cursor: 'url(/src/assets/cursors/cursor-grab.svg) 16 16, pointer' }}
                      >
                        ÉDITER
                      </button>
                      <button
                        onClick={() => updateMusicContainerMutation.mutate({
                          id: container.id,
                          data: { ...container, isVisible: !container.isVisible }
                        })}
                        className={`${container.isVisible ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'} text-white font-mono text-xs px-3 py-1 transition-colors`}
                        style={{ cursor: 'url(/src/assets/cursors/cursor-grab.svg) 16 16, pointer' }}
                      >
                        {container.isVisible ? 'VISIBLE' : 'MASQUÉ'}
                      </button>
                      <button
                        onClick={() => deleteMusicContainerMutation.mutate(container.id)}
                        disabled={deleteMusicContainerMutation.isPending}
                        className="bg-red-500 hover:bg-red-600 text-white font-mono text-xs px-3 py-1 transition-colors"
                        style={{ cursor: 'url(/src/assets/cursors/cursor-grab.svg) 16 16, pointer' }}
                      >
                        SUPPR
                      </button>
                    </div>
                  </div>
                  
                  {/* Options rapides */}
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => updateMusicContainerMutation.mutate({
                        id: container.id,
                        data: { ...container, autoplay: !container.autoplay }
                      })}
                      className={`${container.autoplay ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-400 hover:bg-gray-500'} text-white font-mono text-xs px-3 py-1 transition-colors`}
                    >
                      AUTO-PLAY {container.autoplay ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => updateMusicContainerMutation.mutate({
                        id: container.id,
                        data: { ...container, loop: !container.loop }
                      })}
                      className={`${container.loop ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'} text-white font-mono text-xs px-3 py-1 transition-colors`}
                    >
                      LOOP {container.loop ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Prévisualisation audio avec votre composant AudioPlayer */}
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-mono text-xs text-gray-600 mb-2">Prévisualisation</div>
                    <AudioPlayer
                      audioUrl={container.audioUrl.startsWith('/attached_assets') ? container.audioUrl : `/attached_assets/${container.audioUrl.replace(/^\/?(admin\/)?attached_assets\//, '')}`}
                      title={container.title}
                      onPlay={() => console.log(`Lecture démarrée: ${container.title}`)}
                      onPause={() => console.log(`Lecture mise en pause: ${container.title}`)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}