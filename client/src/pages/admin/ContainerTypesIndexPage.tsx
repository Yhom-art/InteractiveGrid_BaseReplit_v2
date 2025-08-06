import React, { useState } from 'react';
import { Plus, Settings, Eye, Trash2, Copy } from 'lucide-react';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AdminLayoutTemplate } from '@/components/admin/AdminLayoutTemplate';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ContainerType {
  id: string;
  name: string;
  description: string;
  layerConfig: {
    visual: Array<{ name: string; active: boolean; effects?: any[] }>;
    actions: Array<{ name: string; active: boolean; zones?: any[] }>;
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export default function ContainerTypesIndexPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupération des types de containers depuis la BDD
  const containerTypesQuery = useQuery({
    queryKey: ['/api/container-layer-configurations'],
    queryFn: async () => {
      const response = await fetch('/api/container-layer-configurations');
      if (!response.ok) throw new Error('Erreur de chargement');
      return response.json();
    }
  });

  // Mutation pour supprimer un type
  const deleteTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/container-layer-configurations/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur de suppression');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Type supprimé",
        description: "Le type de container a été supprimé avec succès"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/container-layer-configurations'] });
    },
    onError: () => {
      toast({
        title: "Erreur de suppression",
        description: "Impossible de supprimer le type de container",
        variant: "destructive"
      });
    }
  });

  // Mutation pour dupliquer un type
  const duplicateTypeMutation = useMutation({
    mutationFn: async (type: ContainerType) => {
      const duplicatedType = {
        ...type,
        name: `${type.name} (Copie)`,
        description: `Copie de ${type.description}`
      };
      delete (duplicatedType as any).id;
      delete (duplicatedType as any).createdAt;
      delete (duplicatedType as any).updatedAt;

      const response = await fetch('/api/container-layer-configurations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatedType)
      });
      if (!response.ok) throw new Error('Erreur de duplication');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Type dupliqué",
        description: "Le type de container a été dupliqué avec succès"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/container-layer-configurations'] });
    }
  });

  const handleDeleteType = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type de container ?')) {
      deleteTypeMutation.mutate(id);
    }
  };

  const handleDuplicateType = (type: ContainerType) => {
    duplicateTypeMutation.mutate(type);
  };

  const containerTypesData = containerTypesQuery.data || [];

  // Section des types de containers existants
  const containerTypesSection = (
    <div className="bg-white rounded-lg p-6 shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="admin-h2">Types de Container Existants</h3>
        <div className="text-sm admin-programmatic text-gray-500">
          {containerTypesData.length} type(s) configuré(s)
        </div>
      </div>

      {containerTypesQuery.isLoading ? (
        <div className="text-center py-8">
          <div className="text-gray-500">Chargement des types...</div>
        </div>
      ) : containerTypesData.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">Aucun type de container configuré</div>
          <div className="text-sm text-gray-400">
            Créez votre premier type de container pour commencer
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {containerTypesData.map((type: ContainerType) => (
            <div 
              key={type.id}
              className={`border rounded-lg p-4 transition-all cursor-pointer ${
                selectedType === type.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-lg">{type.name}</h4>
                    {type.isActive && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        Actif
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{type.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      {type.layerConfig.visual.length} couche(s) visuelle(s)
                    </span>
                    <span>
                      {type.layerConfig.actions.length} zone(s) d'action
                    </span>
                    <span>
                      Modifié le {new Date(type.updatedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/admin/container-layers-v3?configId=${type.id}`, '_blank');
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                    title="Administrer ce type"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateType(type);
                    }}
                    className="p-2 text-green-600 hover:bg-green-100 rounded"
                    title="Dupliquer ce type"
                    disabled={duplicateTypeMutation.isPending}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteType(type.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                    title="Supprimer ce type"
                    disabled={deleteTypeMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selectedType === type.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Couches Visuelles</h5>
                      <div className="space-y-1">
                        {type.layerConfig.visual.map((layer, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded ${layer.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className={layer.active ? 'text-gray-900' : 'text-gray-500'}>
                              {layer.name.toUpperCase()}
                            </span>
                            {layer.effects && layer.effects.length > 0 && (
                              <span className="text-xs text-blue-600">
                                ({layer.effects.length} effet(s))
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Zones d'Action</h5>
                      <div className="space-y-1">
                        {type.layerConfig.actions.map((action, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded ${action.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className={action.active ? 'text-gray-900' : 'text-gray-500'}>
                              {action.name.toUpperCase()}
                            </span>
                            {action.zones && action.zones.length > 0 && (
                              <span className="text-xs text-blue-600">
                                ({action.zones.length} zone(s))
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Section de création d'un nouveau type
  const createNewTypeSection = (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="admin-h2 mb-4">Créer un Nouveau Type</h3>
      <p className="text-gray-600 mb-6">
        Configurez un nouveau type de container avec ses couches visuelles et zones d'interaction personnalisées.
      </p>
      
      <div className="space-y-4">
        <a
          href="/admin/container-layers-v3"
          className="flex items-center gap-3 p-4 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Nouveau Type de Container</h4>
            <p className="text-sm text-gray-500">
              Accéder à l'interface de configuration des couches et zones d'interaction
            </p>
          </div>
        </a>
        
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Processus de création :</strong>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li>Configurer les couches visuelles (TXT, OVERLAY, PIC, AUDIO, VIDEO, CARD)</li>
            <li>Définir les zones d'interaction (COMP, OPEN, CLOSE, HOVER, GRAB)</li>
            <li>Mapper les zones granulaires pour chaque état (FERMÉ, OUVERT, PANEL)</li>
            <li>Sauvegarder en BDD pour créer le nouveau type</li>
          </ol>
        </div>
      </div>
    </div>
  );

  const leftColumn = (
    <div className="space-y-6">
      {createNewTypeSection}
      {containerTypesSection}
    </div>
  );

  const rightColumn = (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="admin-h2 mb-4">Informations</h3>
      
      <div className="space-y-4 text-sm">
        <div>
          <h4 className="font-medium mb-2">Architecture NFT → Container</h4>
          <p className="text-gray-600">
            Chaque NFT sera liée à un type de container pré-paramétré selon ses statuts et tags. 
            Les types configurés ici définissent le comportement des containers dans la grille fluide.
          </p>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Flux de Configuration</h4>
          <div className="text-gray-600 space-y-1">
            <div>1. Création NFT avec métadonnées</div>
            <div>2. Assignation automatique du type container</div>
            <div>3. Application des règles de distribution</div>
            <div>4. Déploiement dans la grille 32x32</div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-blue-800 font-medium mb-1">Types Disponibles</div>
          <div className="text-blue-700 text-xs">
            {containerTypesData.length} type(s) configuré(s) • 
            {containerTypesData.filter((t: ContainerType) => t.isActive).length} actif(s)
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminCursorProvider>
      <AdminLayoutTemplate 
        leftColumn={leftColumn}
        rightColumn={rightColumn}
      >
        <AdminHeaderTemplate 
          title="Types de Container" 
          description="Gestion des modèles de containers pour l'écosystème NFT"
        />
      </AdminLayoutTemplate>
    </AdminCursorProvider>
  );
}