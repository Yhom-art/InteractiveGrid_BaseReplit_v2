import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Save, X, Layers } from 'lucide-react';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AdminLayoutTemplate } from '@/components/admin/AdminLayoutTemplate';
import { AutoTags } from '@/components/admin/PageStatusIndicator';
import { useToast } from '@/hooks/use-toast';
import { useAdminCursor } from '@/hooks/useCursorBlocking';


// Constantes V1 exactes trouvées dans le système existant
const CONTAINER_SIZE = 128;  // Taille de base V1
const CONTAINER_GAP = 4;     // Gap V1 entre containers

// Enum des types d'expansion V1
enum ContainerExpansionType {
  NONE = "none",
  ONEONE_UP = "oneone_up",
  ONEHALF_DWN = "onehalf_dwn", 
  ONEONE_DWN = "oneone_dwn"
}

// Configurations exactes des expansions V1
const EXPANSIONS = {
  [ContainerExpansionType.NONE]: { 
    height: CONTAINER_SIZE, 
    offsetTop: 0, 
    pushAmount: 0 
  },
  [ContainerExpansionType.ONEONE_UP]: { 
    height: 260, 
    offsetTop: -(260 - CONTAINER_SIZE), 
    pushAmount: 260 - CONTAINER_SIZE
  },
  [ContainerExpansionType.ONEONE_DWN]: { 
    height: 260, 
    offsetTop: 0, 
    pushAmount: 260 - CONTAINER_SIZE
  },
  [ContainerExpansionType.ONEHALF_DWN]: { 
    height: 192, 
    offsetTop: 0, 
    pushAmount: 192 - CONTAINER_SIZE
  }
};

interface ContainerType {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  expansionBehavior: string;
  baseWidth: number;
  baseHeight: number;
  expandedWidth: number | null;
  expandedHeight: number | null;
  hasGrabZone: boolean;
  hasClickZone: boolean;
  defaultCursorType: string;
  isActive: boolean;
}

interface ContainerTypeForm {
  name: string;
  displayName: string;
  description: string;
  expansionBehavior: string;
  baseWidth: number;
  baseHeight: number;
  expandedWidth: number | null;
  expandedHeight: number | null;
  hasGrabZone: boolean;
  hasClickZone: boolean;
  defaultCursorType: string;
  isActive: boolean;
}

// Composant de prévisualisation V1 réelle avec comportement de colonne exact
const ContainerV1Preview = ({ selectedType }: { selectedType: ContainerType | null }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!selectedType) {
    return (
      <div className="text-center py-8 text-gray-500">
        Sélectionnez un type dans la liste pour voir la prévisualisation
      </div>
    );
  }

  // Mapping du type vers l'enum V1
  const getExpansionType = (behavior: string): ContainerExpansionType => {
    switch (behavior) {
      case 'up': return ContainerExpansionType.ONEONE_UP;
      case 'down': return ContainerExpansionType.ONEONE_DWN;
      case 'half_down': return ContainerExpansionType.ONEHALF_DWN;
      default: return ContainerExpansionType.NONE;
    }
  };

  const expansionType = getExpansionType(selectedType.expansionBehavior);
  const config = EXPANSIONS[expansionType];
  
  // Dimensions du container selon l'état
  const containerHeight = isExpanded ? config.height : CONTAINER_SIZE;
  const containerWidth = CONTAINER_SIZE;
  const offsetTop = isExpanded ? config.offsetTop : 0;
  
  // Calcul du push cumulatif V1 - uniquement pour les containers en dessous
  const pushAmount = isExpanded ? config.pushAmount : 0;

  return (
    <div className="space-y-6">
      {/* Contrôles */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{selectedType.displayName}</h3>
          <p className="text-sm text-gray-600">{selectedType.name}</p>
        </div>
        
        <div className="flex border border-gray-300 rounded-md">
          <button
            onClick={() => setIsExpanded(false)}
            className={`px-4 py-2 text-sm font-medium ${
              !isExpanded 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Fermé
          </button>
          <button
            onClick={() => setIsExpanded(true)}
            className={`px-4 py-2 text-sm font-medium ${
              isExpanded 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Ouvert
          </button>
        </div>
      </div>

      {/* Simulation V1 réelle - Colonne avec push cumulatif */}
      <div className="bg-gray-100 rounded-lg p-6">
        <div className="mb-4 text-center">
          <h4 className="font-medium text-gray-800">Comportement V1 Réel - Colonne {32/2}</h4>
          <p className="text-sm text-gray-600">
            Push par colonne • Gap 4px immutable • Solidarité verticale
          </p>
        </div>
        
        <div className="flex justify-center">
          {/* Colonne centrale simulant le comportement V1 */}
          <div className="relative">
            
            {/* Container au-dessus (row -1) */}
            <div
              className="bg-gray-300 rounded border border-gray-400 flex items-center justify-center text-gray-700 text-xs font-mono transition-all duration-300"
              style={{
                width: `${CONTAINER_SIZE}px`,
                height: `${CONTAINER_SIZE}px`,
                transform: selectedType.expansionBehavior === 'up' && isExpanded 
                  ? `translateY(${offsetTop}px)` 
                  : 'none',
                marginBottom: `${CONTAINER_GAP}px`
              }}
            >
              Container-1
              <br/>128×128
            </div>
            
            {/* Container sélectionné (row 0) - CENTRE */}
            <div
              className="bg-blue-600 rounded border-2 border-blue-800 flex items-center justify-center text-white font-bold shadow-lg transition-all duration-300"
              style={{
                width: `${containerWidth}px`,
                height: `${containerHeight}px`,
                cursor: selectedType.hasGrabZone ? 'grab' : 'pointer',
                marginBottom: `${CONTAINER_GAP}px`,
                transform: `translateY(${offsetTop}px)`,
                zIndex: 2
              }}
            >
              <div className="text-center">
                <div className="text-sm font-bold">{selectedType.name}</div>
                <div className="text-xs opacity-90">
                  {containerWidth}×{containerHeight}
                </div>
                {isExpanded && selectedType.expansionBehavior !== 'none' && (
                  <div className="text-xs opacity-75 mt-1 bg-blue-800 px-1 rounded">
                    ÉTENDU
                  </div>
                )}
              </div>
            </div>
            
            {/* Container en dessous (row +1) - POUSSÉ PAR LE PUSH */}
            <div
              className="bg-gray-300 rounded border border-gray-400 flex items-center justify-center text-gray-700 text-xs font-mono transition-all duration-300"
              style={{
                width: `${CONTAINER_SIZE}px`,
                height: `${CONTAINER_SIZE}px`,
                transform: (selectedType.expansionBehavior === 'down' || selectedType.expansionBehavior === 'half_down') && isExpanded
                  ? `translateY(${pushAmount}px)`
                  : 'none',
                marginBottom: `${CONTAINER_GAP}px`
              }}
            >
              Container+1
              <br/>128×128
              {pushAmount > 0 && (
                <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-xs text-red-600 font-bold">
                  +{pushAmount}px
                </div>
              )}
            </div>
            
            {/* Container encore en dessous (row +2) - PUSH CUMULATIF */}
            <div
              className="bg-gray-300 rounded border border-gray-400 flex items-center justify-center text-gray-700 text-xs font-mono transition-all duration-300"
              style={{
                width: `${CONTAINER_SIZE}px`,
                height: `${CONTAINER_SIZE}px`,
                transform: (selectedType.expansionBehavior === 'down' || selectedType.expansionBehavior === 'half_down') && isExpanded
                  ? `translateY(${pushAmount}px)`
                  : 'none',
                marginBottom: `${CONTAINER_GAP}px`
              }}
            >
              Container+2
              <br/>128×128
            </div>
            
            {/* Container encore en dessous (row +3) */}
            <div
              className="bg-gray-300 rounded border border-gray-400 flex items-center justify-center text-gray-700 text-xs font-mono transition-all duration-300"
              style={{
                width: `${CONTAINER_SIZE}px`,
                height: `${CONTAINER_SIZE}px`,
                transform: (selectedType.expansionBehavior === 'down' || selectedType.expansionBehavior === 'half_down') && isExpanded
                  ? `translateY(${pushAmount}px)`
                  : 'none'
              }}
            >
              Container+3
              <br/>128×128
            </div>
            
            {/* Indicateur de gap */}
            <div className="absolute -left-8 top-0 text-xs text-gray-500 font-mono">
              Gap: 4px<br/>
              immutable
            </div>
            
          </div>
          
          {/* Colonnes adjacentes - NON AFFECTÉES */}
          <div className="ml-8 opacity-50">
            <div className="text-xs text-center text-gray-500 mb-2">Colonne {32/2 + 1}<br/>(non affectée)</div>
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={`adj-${i}`}
                className="bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-gray-600 text-xs"
                style={{
                  width: `${CONTAINER_SIZE}px`,
                  height: `${CONTAINER_SIZE}px`,
                  marginBottom: `${CONTAINER_GAP}px`
                }}
              >
                C{i}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Informations techniques V1 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-3">Paramètres V1 Exacts</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Base:</strong> {CONTAINER_SIZE}×{CONTAINER_SIZE}px</div>
          <div><strong>État:</strong> {isExpanded ? 'Ouvert' : 'Fermé'}</div>
          <div><strong>Expansion:</strong> {selectedType.expansionBehavior}</div>
          <div><strong>Gap:</strong> {CONTAINER_GAP}px (immutable)</div>
          <div><strong>Hauteur actuelle:</strong> {containerHeight}px</div>
          <div><strong>Offset Y:</strong> {offsetTop}px</div>
          <div><strong>Push amount:</strong> {config.pushAmount}px</div>
          <div><strong>Grab Zone:</strong> {selectedType.hasGrabZone ? 'Oui' : 'Non'}</div>
        </div>
        
        {isExpanded && selectedType.expansionBehavior !== 'none' && (
          <div className="mt-3 p-3 bg-blue-100 rounded text-sm">
            <strong>Comportement V1 actif :</strong><br/>
            {selectedType.expansionBehavior === 'half_down' && 'Extension partielle vers le bas (192px) • Push +64px sur colonne'}
            {selectedType.expansionBehavior === 'up' && 'Extension complète vers le haut (260px, offset -132px) • Push vers le haut'}
            {selectedType.expansionBehavior === 'down' && 'Extension complète vers le bas (260px) • Push +132px sur colonne'}
          </div>
        )}
        
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <strong>🔧 Règle V1 :</strong> Chaque container pousse uniquement sa colonne. 
          Les containers adjacents horizontalement ne sont pas affectés. 
          Le gap de 4px est préservé en toute circonstance.
        </div>
        
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm">
          <strong>📖 Documentation complète :</strong> 
          <a 
            href="/MEMO_TECHNIQUE_V1_GRILLE_CHIMERIQUE.md" 
            target="_blank"
            className="text-green-700 underline hover:text-green-800 ml-1"
          >
            Voir le Mémo Technique V1 complet
          </a>
          <br/>
          <span className="text-green-600">
            Constantes, algorithmes et règles de référence pour tous les développeurs
          </span>
        </div>
      </div>
    </div>
  );
};

export default function ContainerTypesPageV2() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedType, setSelectedType] = useState<ContainerType | null>(null);
  const [formData, setFormData] = useState<ContainerTypeForm>({
    name: '',
    displayName: '',
    description: '',
    expansionBehavior: 'none',
    baseWidth: 1,
    baseHeight: 1,
    expandedWidth: null,
    expandedHeight: null,
    hasGrabZone: true,
    hasClickZone: true,
    defaultCursorType: 'grab',
    isActive: true
  });

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useAdminCursor(true);

  const containerTypesQuery = useQuery({
    queryKey: ['/api/container-types'],
    queryFn: () => fetch('/api/container-types').then(res => res.json())
  });

  const createMutation = useMutation({
    mutationFn: async (data: ContainerTypeForm) => {
      const response = await fetch('/api/container-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erreur de création');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Type de container créé avec succès" });
      queryClient.invalidateQueries({ queryKey: ['/api/container-types'] });
      resetForm();
    },
    onError: () => {
      toast({ title: "Erreur lors de la création", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ContainerTypeForm }) => {
      const response = await fetch(`/api/container-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erreur de mise à jour');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Type de container mis à jour avec succès" });
      queryClient.invalidateQueries({ queryKey: ['/api/container-types'] });
      resetForm();
    },
    onError: () => {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/container-types/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur de suppression');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Type de container supprimé avec succès" });
      queryClient.invalidateQueries({ queryKey: ['/api/container-types'] });
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  });

  const startEdit = (type: ContainerType) => {
    setFormData({
      name: type.name,
      displayName: type.displayName,
      description: type.description || '',
      expansionBehavior: type.expansionBehavior,
      baseWidth: type.baseWidth,
      baseHeight: type.baseHeight,
      expandedWidth: type.expandedWidth,
      expandedHeight: type.expandedHeight,
      hasGrabZone: type.hasGrabZone,
      hasClickZone: type.hasClickZone,
      defaultCursorType: type.defaultCursorType,
      isActive: type.isActive
    });
    setEditingId(type.id);
    setIsCreating(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      expansionBehavior: 'none',
      baseWidth: 1,
      baseHeight: 1,
      expandedWidth: null,
      expandedHeight: null,
      hasGrabZone: true,
      hasClickZone: true,
      defaultCursorType: 'grab',
      isActive: true
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const leftColumn = (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
        <div className="space-y-2">
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Type
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Liste des Types</h3>
        <div className="space-y-2">
          {containerTypesQuery.isLoading && (
            <div className="text-center text-gray-500 text-sm py-4">Chargement...</div>
          )}
          {containerTypesQuery.data?.map((type: ContainerType) => (
            <div 
              key={type.id} 
              className={`p-3 cursor-pointer rounded border text-sm transition-colors ${
                selectedType?.id === type.id 
                  ? 'bg-blue-50 border-blue-300' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedType(type)}
            >
              <div className="font-medium text-gray-900">{type.displayName}</div>
              <div className="text-gray-600 text-xs">{type.name}</div>
              <div className="text-gray-500 text-xs mt-1">
                {type.expansionBehavior} • {type.baseWidth}×{type.baseHeight}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  type.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {type.isActive ? 'Actif' : 'Inactif'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(type);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const rightColumn = (
    <div className="space-y-6">
      {(isCreating || editingId) && (
        <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Modifier Type' : 'Nouveau Type'}
            </h3>
            <button
              onClick={resetForm}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom technique</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="OneOne_up"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'affichage</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Extension vers le haut"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comportement d'expansion</label>
              <select
                value={formData.expansionBehavior}
                onChange={(e) => setFormData({ ...formData, expansionBehavior: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="none">Aucune expansion</option>
                <option value="up">Extension vers le haut</option>
                <option value="down">Extension vers le bas</option>
                <option value="half_down">Extension partielle vers le bas</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Largeur</label>
                <input
                  type="number"
                  value={formData.baseWidth}
                  onChange={(e) => setFormData({ ...formData, baseWidth: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hauteur</label>
                <input
                  type="number"
                  value={formData.baseHeight}
                  onChange={(e) => setFormData({ ...formData, baseHeight: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingId ? 'Mettre à jour' : 'Créer le type'}
            </button>
          </form>
        </div>
      )}
    </div>
  );

  return (
    <AdminCursorProvider>
        <div className="flex">
          <div className="flex-1">
            <div className="max-w-7xl mx-auto p-4">
              <AdminHeaderTemplate 
                title="TYPES DE CONTAINERS" 
                filePath="client/src/pages/admin/ContainerTypesPageV2.tsx" 
              />
              
              <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Layers className="w-6 h-6 text-blue-600 mr-3" />
                    <h1 className="text-xl font-bold text-gray-900">Gestion des Types de Containers</h1>
                  </div>
                  <AutoTags route="/admin/container-types" />
                </div>
                
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  {[
                    { id: 'overview', label: 'Vue d\'ensemble' },
                    { id: 'configuration', label: 'Configuration' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <AdminLayoutTemplate 
                layout="1-2-1" 
                leftColumn={leftColumn} 
                rightColumn={rightColumn}
              >
                {activeTab === 'overview' && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Prévisualisation V1 Réelle</h2>
                    <ContainerV1Preview selectedType={selectedType} />
                  </div>
                )}

                {activeTab === 'configuration' && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration Globale</h2>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">Paramètres par défaut</h3>
                        <p className="text-sm text-gray-600">Configuration des valeurs par défaut pour les nouveaux types.</p>
                      </div>
                    </div>
                  </div>
                )}
              </AdminLayoutTemplate>
            </div>
          </div>
        </div>
    </AdminCursorProvider>
  );
}