import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tags, Settings, Plus, Save, RefreshCw, Edit3 } from 'lucide-react';
import { TAG_CONFIGS, getTagsByCategory, TagConfig, generateTagStyle } from '@shared/tags-system';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { GlobalStyle, TagConfiguration } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export default function TagsAdminPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<TagConfig['category']>('content');
  const [editingTag, setEditingTag] = React.useState<TagConfig | null>(null);
  const [localTagConfigs, setLocalTagConfigs] = React.useState(TAG_CONFIGS);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Récupération des configurations de tags sauvegardées
  const tagConfigsQuery = useQuery({
    queryKey: ['/api/tag-configurations'],
    staleTime: 30000
  });

  // Récupération du style de tag unifié (8px)
  const stylesQuery = useQuery({
    queryKey: ['/api/styles-global'],
    staleTime: 30000
  });

  const tagStyle8px = React.useMemo(() => {
    if (!stylesQuery.data || !Array.isArray(stylesQuery.data)) return null;
    return (stylesQuery.data as GlobalStyle[]).find((s: GlobalStyle) => 
      s.category === 'typography' && 
      s.name === 'Tag Font Size Small' &&
      s.isActive
    );
  }, [stylesQuery.data]);

  // Fusion des configurations par défaut avec les configurations sauvegardées
  const mergedTagConfigs = React.useMemo(() => {
    const base = { ...TAG_CONFIGS };
    
    // Appliquer d'abord les configurations sauvegardées
    if (tagConfigsQuery.data && Array.isArray(tagConfigsQuery.data)) {
      const savedConfigs = tagConfigsQuery.data as TagConfiguration[];
      savedConfigs.forEach(saved => {
        if (base[saved.tagId]) {
          base[saved.tagId] = {
            ...base[saved.tagId],
            name: saved.name,
            color: saved.color,
            category: saved.category as TagConfig['category'],
            usage: saved.usage,
            isActive: saved.isActive
          };
        }
      });
    }
    
    // Ensuite appliquer les modifications locales (priorité maximale)
    Object.entries(localTagConfigs).forEach(([tagId, config]) => {
      base[tagId] = config;
    });

    return base;
  }, [tagConfigsQuery.data, localTagConfigs]);

  const categories = [
    { id: 'content', label: 'Contenu', icon: Tags, description: 'NFT, AUDIO, VIDEO, INFO...' },
    { id: 'status', label: 'Statuts', icon: Settings, description: 'ACTIVE, SYSTEM, USER...' },
    { id: 'version', label: 'Versions', icon: RefreshCw, description: 'V1, V2, V3, BETA, DRAFT...' },
    { id: 'user', label: 'Utilisateurs', icon: Tags, description: 'USER, PREMIUM...' },
    { id: 'system', label: 'Système', icon: Settings, description: 'SYSTEM, ADMIN...' },
    { id: 'priority', label: 'Priorité', icon: Edit3, description: 'GRID NATIV, GRID ACTIV, #1, #2...' }
  ];

  const currentCategoryTags = getTagsByCategory(selectedCategory, mergedTagConfigs);

  // Mutations pour sauvegarder et synchroniser
  const saveTagsMutation = useMutation({
    mutationFn: async (tags: any[]) => {
      const response = await fetch('/api/tag-configurations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags })
      });
      if (!response.ok) throw new Error('Failed to save tags');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tag-configurations'] });
      toast({
        title: "Succès",
        description: "Configurations des tags sauvegardées avec succès"
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les configurations",
        variant: "destructive"
      });
    }
  });



  // Fonction pour mettre à jour un tag (dans les configurations fusionnées)
  const updateTagColor = (tagId: string, newColor: string) => {
    setLocalTagConfigs(prev => ({
      ...prev,
      [tagId]: {
        ...(mergedTagConfigs[tagId] || prev[tagId]),
        color: newColor
      }
    }));
  };

  const toggleTagActive = (tagId: string) => {
    setLocalTagConfigs(prev => ({
      ...prev,
      [tagId]: {
        ...(mergedTagConfigs[tagId] || prev[tagId]),
        isActive: !(mergedTagConfigs[tagId]?.isActive ?? prev[tagId]?.isActive)
      }
    }));
  };

  // Fonction de sauvegarde (qui déclenche automatiquement la synchronisation)
  const handleSaveTags = async () => {
    // Fusionner les configurations locales avec les configurations sauvegardées
    const allTags = { ...TAG_CONFIGS };
    
    // Appliquer les modifications locales
    Object.entries(localTagConfigs).forEach(([tagId, config]) => {
      allTags[tagId] = config;
    });
    
    // Appliquer les modifications sauvegardées (priorité plus haute)
    if (tagConfigsQuery.data && Array.isArray(tagConfigsQuery.data)) {
      tagConfigsQuery.data.forEach((savedTag: any) => {
        allTags[savedTag.tagId] = {
          id: savedTag.tagId,
          name: savedTag.name,
          color: savedTag.color,
          category: savedTag.category,
          usage: savedTag.usage,
          isActive: savedTag.isActive
        };
      });
    }
    
    // Sauvegarder tous les tags
    const tagsToSave = Object.entries(allTags).map(([tagId, config]) => ({
      tagId,
      name: config.name,
      color: config.color,
      category: config.category,
      usage: config.usage,
      isActive: config.isActive
    }));
    
    saveTagsMutation.mutate(tagsToSave);
  };

  // Fonction de rendu des tags avec le style unifié 8px (utilise les configurations fusionnées)
  const renderTagPreview = (tagId: string) => {
    const config = mergedTagConfigs[tagId] || localTagConfigs[tagId];
    const tagStyles = {
      ...generateTagStyle(tagId),
      backgroundColor: config?.color || '#6b7280'
    };
    
    return (
      <span 
        key={tagId}
        style={tagStyles}
        className="transition-all hover:scale-105"
      >
        {config?.name}
      </span>
    );
  };

  return (
    <AdminCursorProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto p-4">
          <AdminHeaderTemplate 
            title="TAGS ADMIN" 
            filePath="client/src/pages/admin/TagsAdminPage.tsx" 
          />
          
          {/* Bouton d'action */}
          <div className="flex justify-end mb-6">
            <Button 
              size="sm" 
              onClick={handleSaveTags}
              disabled={saveTagsMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </div>

          {/* Interface principale en 4 colonnes */}
          <div className="grid grid-cols-4 gap-6 mt-6">
            
            {/* Colonne 1 - Sélection de catégorie */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Catégories Tags</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCategory === category.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCategory(category.id as TagConfig['category'])}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <category.icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{category.label}</span>
                    </div>
                    <p className="text-xs text-gray-600">{category.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne 2 - Liste des tags de la catégorie */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
                Tags {categories.find(c => c.id === selectedCategory)?.label}
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Nouveau
                </Button>
              </h3>
              <div className="space-y-3">
                {currentCategoryTags.map((tag) => {
                  const localTag = localTagConfigs[tag.id];
                  return (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        {renderTagPreview(tag.id)}
                        <div>
                          <div className="font-medium text-sm">{localTag?.name}</div>
                          <div className="text-xs text-gray-600">{localTag?.usage}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={localTag?.color || '#6b7280'}
                          onChange={(e) => updateTagColor(tag.id, e.target.value)}
                          className="w-6 h-6 rounded border cursor-pointer"
                          title="Couleur du tag"
                        />
                        <Switch 
                          checked={localTag?.isActive || false} 
                          onCheckedChange={() => toggleTagActive(tag.id)}
                        />
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setEditingTag(localTag)}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Colonne 3 - Formulaire d'édition */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Propriétés Tag</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <Input placeholder="Nom du tag" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Couleur</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" className="w-10 h-10 rounded border" />
                    <Input placeholder="#000000" className="font-mono text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Catégorie</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Usage</label>
                  <Input placeholder="Description d'usage" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Actif</label>
                  <Switch defaultChecked />
                </div>
                
                {/* Style unifié 8px */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Style Unifié</h4>
                  <div className="bg-gray-50 p-3 rounded text-xs">
                    <div className="text-gray-600">Taille de police : <span className="font-mono">8px</span></div>
                    <div className="text-gray-600">Police : <span className="font-mono">Roboto Mono</span></div>
                    <div className="text-gray-600">Padding : <span className="font-mono">2px 4px</span></div>
                    <div className="text-gray-600">Border radius : <span className="font-mono">4px</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne 4 - Prévisualisation globale */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Prévisualisation Globale</h3>
              <div className="space-y-4">
                {categories.map((category) => {
                  const categoryTags = getTagsByCategory(category.id as TagConfig['category'], mergedTagConfigs);
                  return (
                    <div key={category.id}>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center text-sm">
                        <category.icon className="w-3 h-3 mr-2" />
                        {category.label}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {categoryTags.map((tag) => renderTagPreview(tag.id))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Informations du style connecté */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Style Connecté</h4>
                <div className="text-xs text-gray-600">
                  {tagStyle8px ? (
                    <div className="space-y-1">
                      <div>✓ {tagStyle8px.name}</div>
                      <div>Taille : {tagStyle8px.value}</div>
                      <div>Variable CSS : {tagStyle8px.cssVariable}</div>
                    </div>
                  ) : (
                    <div className="text-amber-600">⚠ Style 8px non trouvé</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminCursorProvider>
  );
}