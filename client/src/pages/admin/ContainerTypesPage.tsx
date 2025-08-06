import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AdminLayoutTemplate } from '@/components/admin/AdminLayoutTemplate';
import { useToast } from '@/hooks/use-toast';
import { useAdminCursor } from '@/hooks/useCursorBlocking';

// Composant de prévisualisation réelle avec containers
const ContainerPreviewGrid = ({ containerTypes }: { containerTypes: ContainerType[] }) => {
  const [selectedType, setSelectedType] = useState<ContainerType | null>(null);
  const [hoveredContainer, setHoveredContainer] = useState<number | null>(null);

  // Créer une grille 5x5 pour la démo avec un container de chaque type
  const generatePreviewGrid = () => {
    const grid = Array(25).fill(null).map((_, index) => {
      const row = Math.floor(index / 5);
      const col = index % 5;
      
      // Placer les différents types de containers aux positions centrales
      if (row === 1 && col === 1) return { type: containerTypes[0], id: index }; // OneOne_up
      if (row === 1 && col === 3) return { type: containerTypes[1], id: index }; // OneOne_dwn  
      if (row === 3 && col === 1) return { type: containerTypes[2], id: index }; // OneHalf_dwn
      if (row === 3 && col === 3) return { type: containerTypes[3], id: index }; // One
      
      return { type: null, id: index };
    });
    
    return grid;
  };

  const previewGrid = generatePreviewGrid();

  const getContainerStyle = (gridItem: any, index: number) => {
    const row = Math.floor(index / 5);
    const col = index % 5;
    const isHovered = hoveredContainer === index;
    
    if (!gridItem.type) {
      return {
        backgroundColor: '#F3F4F6',
        border: '1px solid #E5E7EB',
        width: '40px',
        height: '40px',
        position: 'relative' as const
      };
    }

    const type = gridItem.type;
    let expandedCells = [index]; // Cellule de base
    
    // Calculer les cellules d'expansion selon le comportement
    switch (type.expansionBehavior) {
      case 'up':
        if (row > 0) expandedCells.push(index - 5); // Cellule au-dessus
        break;
      case 'down':
        if (row < 4) expandedCells.push(index + 5); // Cellule en-dessous
        break;
      case 'half_down':
        // Extension partielle vers le bas
        break;
      default: // 'none'
        break;
    }

    // Calculer la hauteur réelle selon le type d'expansion
    let containerHeight = '40px';
    switch (type.expansionBehavior) {
      case 'up':
      case 'down':
        containerHeight = '84px'; // 2 cellules (40px + 40px + gap)
        break;
      case 'half_down':
        containerHeight = '60px'; // 1,5 cellules (40px + 20px)
        break;
      default: // 'none'
        containerHeight = '40px'; // 1 cellule
        break;
    }

    return {
      backgroundColor: isHovered ? '#3B82F6' : '#60A5FA',
      border: `2px solid ${isHovered ? '#1D4ED8' : '#3B82F6'}`,
      color: 'white',
      fontWeight: 'bold',
      fontSize: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: containerHeight,
      zIndex: isHovered ? 10 : 1,
      position: 'relative' as const,
      cursor: type.hasGrabZone ? 'grab' : 'pointer'
    };
  };

  return (
    <div className="space-y-4">
      {/* Sélecteur de type */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Type à prévisualiser :</label>
        <select 
          value={selectedType?.id || ''} 
          onChange={(e) => {
            const typeId = parseInt(e.target.value);
            setSelectedType(containerTypes.find(t => t.id === typeId) || null);
          }}
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="">Tous les types</option>
          {containerTypes.map(type => (
            <option key={type.id} value={type.id}>{type.displayName}</option>
          ))}
        </select>
      </div>

      {/* Grille de prévisualisation 5x5 */}
      <div className="bg-gray-50 p-4 rounded">
        <div className="grid grid-cols-5 gap-1 w-fit mx-auto">
          {previewGrid.map((gridItem, index) => (
            <div
              key={index}
              style={getContainerStyle(gridItem, index)}
              onMouseEnter={() => setHoveredContainer(index)}
              onMouseLeave={() => setHoveredContainer(null)}
              title={gridItem.type ? 
                `${gridItem.type.displayName} - ${gridItem.type.expansionBehavior}` : 
                'Cellule vide'
              }
            >
              {gridItem.type && gridItem.type.name.substring(0, 3)}
            </div>
          ))}
        </div>
      </div>

      {/* Informations détaillées */}
      {selectedType && (
        <div className="mt-4 p-3 bg-blue-50 rounded border">
          <h4 className="font-medium text-blue-800">{selectedType.displayName}</h4>
          <p className="text-sm text-blue-700 mt-1">{selectedType.description}</p>
          <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-medium">Expansion:</span> {selectedType.expansionBehavior}
            </div>
            <div>
              <span className="font-medium">Taille base:</span> {selectedType.baseWidth}×{selectedType.baseHeight}
            </div>
            <div>
              <span className="font-medium">Grab Zone:</span> {selectedType.hasGrabZone ? 'Oui' : 'Non'}
            </div>
            <div>
              <span className="font-medium">Click Zone:</span> {selectedType.hasClickZone ? 'Oui' : 'Non'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ContainerType {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  expansionBehavior: string;
  baseWidth: number;
  baseHeight: number;
  expandedWidth?: number;
  expandedHeight?: number;
  hasGrabZone: boolean;
  hasClickZone: boolean;
  defaultCursorType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export default function ContainerTypesPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
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
    },
    onSuccess: () => {
      toast({ title: "Type de container supprimé avec succès" });
      queryClient.invalidateQueries({ queryKey: ['/api/container-types'] });
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  });

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

  const startEdit = (containerType: ContainerType) => {
    setFormData({
      name: containerType.name,
      displayName: containerType.displayName,
      description: containerType.description || '',
      expansionBehavior: containerType.expansionBehavior,
      baseWidth: containerType.baseWidth,
      baseHeight: containerType.baseHeight,
      expandedWidth: containerType.expandedWidth || null,
      expandedHeight: containerType.expandedHeight || null,
      hasGrabZone: containerType.hasGrabZone,
      hasClickZone: containerType.hasClickZone,
      defaultCursorType: containerType.defaultCursorType,
      isActive: containerType.isActive
    });
    setEditingId(containerType.id);
    setIsCreating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminCursorProvider>
      <AdminLayoutTemplate>
        <AdminHeaderTemplate
          title="Types de Containers"
        />
        
        <div className="admin-content-grid">
          {/* Liste des types existants */}
          <div className="admin-left-panel">
            <div className="bg-white rounded-lg border">
              <div className="border-b p-4 flex items-center justify-between">
                <h3 className="font-semibold">Types Configurés</h3>
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau Type
                </button>
              </div>
              
              <div className="p-4">
                {containerTypesQuery.isLoading ? (
                  <div className="text-center py-8 text-gray-500">Chargement...</div>
                ) : containerTypesQuery.data?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Aucun type configuré</div>
                ) : (
                  <div className="grid gap-3">
                    {containerTypesQuery.data?.map((type: ContainerType) => (
                      <div key={type.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{type.displayName}</h4>
                            <p className="text-sm text-gray-500">{type.name}</p>
                            <p className="text-xs text-gray-400">{type.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Expansion: {type.expansionBehavior}</span>
                              <span>Base: {type.baseWidth}x{type.baseHeight}</span>
                              {type.expandedWidth && (
                                <span>Étendu: {type.expandedWidth}x{type.expandedHeight}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(type)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteMutation.mutate(type.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Zone de prévisualisation */}
          <div className="admin-right-panel">
            <div className="bg-white rounded-lg border">
              <div className="border-b p-4">
                <h3 className="font-semibold">Prévisualisation</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Comportements d'expansion des containers
                </p>
              </div>
              <div className="p-4">
                <ContainerPreviewGrid containerTypes={containerTypesQuery.data || []} />
              </div>
            </div>
          </div>

          {/* Formulaire de création/édition */}
          <div className="col-span-1">
            {(isCreating || editingId) && (
              <div className="bg-white rounded-lg border">
                <div className="border-b p-4 flex items-center justify-between">
                  <h3 className="font-semibold">
                    {editingId ? 'Modifier Type' : 'Nouveau Type'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom technique</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm"
                      placeholder="OneOne_up"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Nom d'affichage</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm"
                      placeholder="Extension vers le haut"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Comportement d'expansion</label>
                    <select
                      value={formData.expansionBehavior}
                      onChange={(e) => setFormData({ ...formData, expansionBehavior: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm"
                    >
                      <option value="none">Aucune</option>
                      <option value="up">Vers le haut</option>
                      <option value="down">Vers le bas</option>
                      <option value="half_down">Demi vers le bas</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Largeur base</label>
                      <input
                        type="number"
                        value={formData.baseWidth}
                        onChange={(e) => setFormData({ ...formData, baseWidth: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Hauteur base</label>
                      <input
                        type="number"
                        value={formData.baseHeight}
                        onChange={(e) => setFormData({ ...formData, baseHeight: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded text-sm"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Largeur étendue</label>
                      <input
                        type="number"
                        value={formData.expandedWidth || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          expandedWidth: e.target.value ? parseInt(e.target.value) : null 
                        })}
                        className="w-full px-3 py-2 border rounded text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Hauteur étendue</label>
                      <input
                        type="number"
                        value={formData.expandedHeight || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          expandedHeight: e.target.value ? parseInt(e.target.value) : null 
                        })}
                        className="w-full px-3 py-2 border rounded text-sm"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.hasGrabZone}
                        onChange={(e) => setFormData({ ...formData, hasGrabZone: e.target.checked })}
                      />
                      <span className="text-sm">Zone de grab</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.hasClickZone}
                        onChange={(e) => setFormData({ ...formData, hasClickZone: e.target.checked })}
                      />
                      <span className="text-sm">Zone de clic</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <span className="text-sm">Actif</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {editingId ? 'Mettre à jour' : 'Créer'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </AdminLayoutTemplate>
    </AdminCursorProvider>
  );
}