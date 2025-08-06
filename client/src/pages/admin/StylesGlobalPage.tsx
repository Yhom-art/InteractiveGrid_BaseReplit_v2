import React, { useState } from 'react';
import { 
  Palette, 
  Type, 
  Layout, 
  Package, 
  Save, 
  Download, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Trash2,
  Copy,
  Check,
  Plus,
  Edit3,
  Zap,
  ZapOff,
  Star,
  ArrowLeft,
  ChevronRight,
  Settings,
  Upload,
  Search,
  Filter,
  ArrowUpDown,
  Grid3X3,
  List
} from 'lucide-react';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { TagsPreviewComponent } from '@/components/admin/TagsPreviewComponent';
import { ButtonsPreviewComponent } from '@/components/admin/ButtonsPreviewComponent';
import { UploadZonesPreviewComponent } from '@/components/admin/UploadZonesPreviewComponent';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlobalStyle, InsertGlobalStyle } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export default function StylesGlobalPage() {
  const [activeTab, setActiveTab] = useState('typography');
  const [newStyle, setNewStyle] = useState<Partial<InsertGlobalStyle>>({
    category: 'typography',
    name: '',
    value: '',
    cssVariable: '',
    description: '',
    isActive: true
  });
  const [editingStyle, setEditingStyle] = useState<GlobalStyle | null>(null);
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries pour récupérer les styles
  const stylesQuery = useQuery({
    queryKey: ['/api/styles-global'],
    queryFn: async () => {
      const response = await fetch('/api/styles-global');
      if (!response.ok) {
        throw new Error('Failed to fetch styles');
      }
      return response.json() as Promise<GlobalStyle[]>;
    }
  });

  // Mutations pour les opérations CRUD
  const createStyleMutation = useMutation({
    mutationFn: async (data: InsertGlobalStyle) => {
      const response = await fetch('/api/styles-global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create style');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/styles-global'] });
      toast({ title: "Style créé avec succès" });
      setNewStyle({
        category: activeTab as any,
        name: '',
        value: '',
        cssVariable: '',
        description: '',
        isActive: true
      });
    },
    onError: () => {
      toast({ title: "Erreur lors de la création", variant: "destructive" });
    }
  });

  const updateStyleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertGlobalStyle }) => {
      const response = await fetch(`/api/styles-global/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update style');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/styles-global'] });
      toast({ title: "Style mis à jour avec succès" });
      setEditingStyle(null);
    },
    onError: () => {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    }
  });

  const deleteStyleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/styles-global/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete style');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/styles-global'] });
      toast({ title: "Style supprimé avec succès" });
      setEditingStyle(null);
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  });

  // Fonction pour appliquer le style directement à l'intitulé
  const getStylePreview = (style: GlobalStyle): React.CSSProperties => {
    const styleObj: React.CSSProperties = {};
    
    // Typographie
    if (style.category === 'typography') {
      // Détection des éléments programmatiques (tags, code, règles, etc.)
      if (style.name.includes('Roboto Mono') || 
          style.cssVariable.includes('mono') ||
          style.name.includes('Programmatic') ||
          style.name.includes('Tag') ||
          style.name.includes('Rule') ||
          style.cssVariable.includes('tag') ||
          style.cssVariable.includes('programmatic')) {
        styleObj.fontFamily = 'Roboto Mono, monospace';
      }
      else if (style.name.includes('Inter')) {
        styleObj.fontFamily = 'Inter, sans-serif';
      }
      else if (style.name.includes('Source Code')) {
        styleObj.fontFamily = 'Source Code Pro, monospace';
      }
      
      // Appliquer la taille de police directement
      if (style.cssVariable.includes('size') || style.name.includes('Size')) {
        styleObj.fontSize = style.value;
        // Assurer une taille minimale lisible pour la prévisualisation
        const fontSize = parseInt(style.value);
        if (fontSize < 10) {
          styleObj.fontSize = '10px';
        }
      }
      if (style.cssVariable.includes('weight') || style.name.includes('Weight')) {
        styleObj.fontWeight = style.value;
      }
    }
    
    // Couleurs
    if (style.category === 'colors') {
      if (style.name.includes('Background') || style.name.includes('Bg')) {
        styleObj.backgroundColor = style.value;
        styleObj.color = '#ffffff';
        styleObj.padding = '2px 6px';
        styleObj.borderRadius = '4px';
      } else {
        styleObj.color = style.value;
      }
    }
    
    // Espacements - montrer la taille via fontSize proportionnel
    if (style.category === 'spacing') {
      if (style.cssVariable.includes('padding')) {
        styleObj.padding = style.value;
        styleObj.backgroundColor = '#f3f4f6';
        styleObj.borderRadius = '4px';
      }
      if (style.cssVariable.includes('font') && style.cssVariable.includes('size')) {
        styleObj.fontSize = style.value;
      }
    }
    
    return styleObj;
  };

  // Fonction pour appliquer les styles actifs au DOM
  const applyActiveStylesToDOM = () => {
    if (!stylesQuery.data) return;
    
    const activeStyles = stylesQuery.data.filter(style => style.isActive);
    const root = document.documentElement;
    
    // Appliquer les variables CSS actives
    activeStyles.forEach(style => {
      root.style.setProperty(style.cssVariable, style.value);
    });
    
    console.log(`${activeStyles.length} styles CSS déployés`);
  };

  // Appliquer les styles au chargement
  React.useEffect(() => {
    if (stylesQuery.data) {
      applyActiveStylesToDOM();
    }
  }, [stylesQuery.data]);

  // Filtrer les styles par catégorie active
  const currentStyles = stylesQuery.data?.filter(style => style.category === activeTab) || [];
  
  // Style unifié pour toutes les prévisualisations de tags
  const unifiedTagStyle = React.useMemo(() => {
    // Priorité 1: style en cours d'édition s'il est de type Tag
    if (editingStyle && editingStyle.category === 'typography' && editingStyle.name.includes('Tag')) {
      return editingStyle;
    }
    // Priorité 2: pour l'onglet Composants, toujours utiliser le style actif "Tag Font Size Small" ou similaire
    if (activeTab === 'components') {
      // Chercher spécifiquement "Tag Font Size Small" en premier
      const tagFontSizeSmall = stylesQuery.data?.find(s => 
        s.category === 'typography' && 
        s.name.includes('Tag Font Size Small') && 
        s.isActive
      );
      if (tagFontSizeSmall) return tagFontSizeSmall;
      
      // Sinon, chercher tout style Tag actif qui n'est pas "Programmatic"
      return stylesQuery.data?.find(s => 
        s.category === 'typography' && 
        s.name.includes('Tag') && 
        !s.name.includes('Programmatic') &&
        s.isActive
      ) || null;
    }
    // Priorité 3: premier style Tag trouvé
    return stylesQuery.data?.find(s => s.category === 'typography' && s.name.includes('Tag')) || null;
  }, [editingStyle, stylesQuery.data, activeTab]);

  // Gestion des onglets
  const tabs = [
    { id: 'typography', label: 'Typographie', icon: Type, color: 'blue' },
    { id: 'colors', label: 'Couleurs', icon: Palette, color: 'green' },
    { id: 'spacing', label: 'Espacements', icon: Layout, color: 'purple' },
    { id: 'components', label: 'Composants', icon: Package, color: 'orange' }
  ];

  // Détection intelligente du type de composant
  const getComponentType = (style: GlobalStyle): 'tags' | 'buttons' | 'upload' | 'none' => {
    const name = style.name.toLowerCase();
    const cssVar = style.cssVariable.toLowerCase();
    
    if (name.includes('tag') || cssVar.includes('tag')) {
      return 'tags';
    }
    if (name.includes('button') || name.includes('action') || cssVar.includes('button') || cssVar.includes('action')) {
      return 'buttons';
    }
    if (name.includes('upload') || name.includes('zone') || cssVar.includes('upload') || cssVar.includes('zone')) {
      return 'upload';
    }
    return 'none';
  };

  // Rendu de la prévisualisation de composant appropriée
  const renderComponentPreview = (style: GlobalStyle) => {
    const componentType = getComponentType(style);
    
    switch (componentType) {
      case 'tags':
        return <TagsPreviewComponent selectedStyleId={style.id} />;
      case 'buttons':
        return <ButtonsPreviewComponent selectedStyleId={style.id} />;
      case 'upload':
        return <UploadZonesPreviewComponent selectedStyleId={style.id} />;
      default:
        return null;
    }
  };

  // Fonctions utilitaires
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedVariable(text);
    setTimeout(() => setCopiedVariable(null), 2000);
    toast({ title: "Variable copiée" });
  };

  const handleCreateStyle = () => {
    if (!newStyle.name || !newStyle.value || !newStyle.cssVariable) {
      toast({ title: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }
    createStyleMutation.mutate(newStyle as InsertGlobalStyle);
  };

  const handleUpdateStyle = () => {
    if (!editingStyle) return;
    updateStyleMutation.mutate({
      id: editingStyle.id,
      data: editingStyle as InsertGlobalStyle
    });
  };

  return (
    <AdminCursorProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <div className="flex-1">
            <div className="max-w-7xl mx-auto p-4">
              <AdminHeaderTemplate 
                title="STYLES GLOBAL V3" 
                filePath="client/src/pages/admin/StylesGlobalPage.tsx" 
              />
              
              {/* Onglets en largeur complète */}
              <div className="bg-white rounded-lg shadow-sm border mb-6">
                <div className="flex border-b">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setNewStyle({ ...newStyle, category: tab.id as any });
                        }}
                        className={`flex-1 flex items-center justify-center px-6 py-4 text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? `border-b-2 border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50`
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <IconComponent className="w-5 h-5 mr-2" />
                        {tab.label}
                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
                          {stylesQuery.data?.filter(s => s.category === tab.id).length || 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Layout 1-2-1 */}
              <div className="grid grid-cols-4 gap-6">
                {/* Colonne gauche (1/4) - Liste des styles */}
                <div className="col-span-1 space-y-4">
                  {/* Configuration des composants Tags/Boutons/Upload dans l'onglet Components */}
                  {activeTab === 'components' && (
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Familles de Composants
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                             onClick={() => setEditingStyle(null)}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">Tags System</h4>
                              <p className="text-xs text-gray-600">NFT, AUDIO, VIDEO, INFO...</p>
                            </div>
                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">8 types</div>
                          </div>
                        </div>
                        
                        <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">Actions Boutons</h4>
                              <p className="text-xs text-gray-600">Save, Create, Edit, Delete...</p>
                            </div>
                            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">8 actions</div>
                          </div>
                        </div>
                        
                        <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">Upload Zones</h4>
                              <p className="text-xs text-gray-600">Images, Audio, Video, Docs...</p>
                            </div>
                            <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">6 zones</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {activeTab === 'components' ? 'Paramètres Composants' : `Styles ${tabs.find(t => t.id === activeTab)?.label}`}
                    </h3>
                    
                    {stylesQuery.isLoading ? (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                        Chargement...
                      </div>
                    ) : currentStyles.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm">Aucun style</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {currentStyles.map((style) => (
                          <div
                            key={style.id}
                            className={`p-3 rounded border cursor-pointer transition-colors ${
                              editingStyle?.id === style.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => setEditingStyle(style)}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 
                                    className="font-medium text-gray-900 truncate"
                                    style={getStylePreview(style)}
                                  >
                                    {style.name}
                                  </h4>
                                  <p className="text-xs text-gray-500 truncate font-mono">
                                    {style.cssVariable}
                                  </p>
                                  <p className="text-xs text-gray-600 truncate mt-1">
                                    {style.value}
                                  </p>
                                  {/* Affichage du nom réel de la police pour la typographie */}
                                  {style.category === 'typography' && (
                                    <p className="text-xs text-blue-600 truncate mt-1 font-medium">
                                      {style.name.includes('Roboto Mono') || 
                                       style.name.includes('Programmatic') ||
                                       style.name.includes('Tag') ||
                                       style.name.includes('Rule') ? 'Roboto Mono' :
                                       style.name.includes('Inter') ? 'Inter' :
                                       style.name.includes('Source Code') ? 'Source Code Pro' :
                                       'Police système'}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className={`flex items-center space-x-1 ${
                                    style.isActive ? 'text-green-600' : 'text-gray-400'
                                  }`}>
                                    {style.isActive ? 
                                      <Zap className="w-3 h-3" /> : 
                                      <ZapOff className="w-3 h-3" />
                                    }
                                    <span className="text-xs font-medium">
                                      {style.isActive ? 'Déployé' : 'Inactif'}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(style.cssVariable);
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded"
                                    title="Copier la variable CSS"
                                  >
                                    {copiedVariable === style.cssVariable ? 
                                      <Check className="w-3 h-3 text-green-500" /> : 
                                      <Copy className="w-3 h-3 text-gray-400" />
                                    }
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Colonnes centrales (2/4) - Modification */}
                <div className="col-span-2">
                  {activeTab === 'components' && !editingStyle ? (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Tags System</h3>
                      
                      <div className="space-y-6">
                        {/* Options de rendu */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Options de Rendu</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked className="rounded" />
                                <span className="text-sm text-gray-700">Adapter taille au texte</span>
                              </label>
                              <p className="text-xs text-gray-500 mt-1">Ajuste le padding selon la taille de police</p>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-700 mb-1">Ratio padding</label>
                              <select className="w-full text-xs border rounded px-2 py-1">
                                <option value="compact">Compact</option>
                                <option value="normal" selected>Normal</option>
                                <option value="comfortable">Confortable</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-700 mb-1">Border radius</label>
                              <input type="text" defaultValue="4px" className="w-full text-xs border rounded px-2 py-1 font-mono" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                          {/* Configuration des couleurs Tags */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 border-b pb-2">Tags Contenu</h4>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">NFT</span>
                                <div className="flex items-center space-x-2">
                                  <input type="color" value="#10b981" className="w-6 h-6 rounded border" />
                                  <span className="text-xs font-mono text-gray-500">#10b981</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">AUDIO</span>
                                <div className="flex items-center space-x-2">
                                  <input type="color" value="#3b82f6" className="w-6 h-6 rounded border" />
                                  <span className="text-xs font-mono text-gray-500">#3b82f6</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">VIDEO</span>
                                <div className="flex items-center space-x-2">
                                  <input type="color" value="#8b5cf6" className="w-6 h-6 rounded border" />
                                  <span className="text-xs font-mono text-gray-500">#8b5cf6</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">INFO</span>
                                <div className="flex items-center space-x-2">
                                  <input type="color" value="#f59e0b" className="w-6 h-6 rounded border" />
                                  <span className="text-xs font-mono text-gray-500">#f59e0b</span>
                                </div>
                              </div>
                            </div>
                            
                            <h4 className="font-medium text-gray-900 border-b pb-2 mt-6">Tags Statuts</h4>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">ACTIVE</span>
                                <div className="flex items-center space-x-2">
                                  <input type="color" value="#06b6d4" className="w-6 h-6 rounded border" />
                                  <span className="text-xs font-mono text-gray-500">#06b6d4</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">SYSTEM</span>
                                <div className="flex items-center space-x-2">
                                  <input type="color" value="#ef4444" className="w-6 h-6 rounded border" />
                                  <span className="text-xs font-mono text-gray-500">#ef4444</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">USER</span>
                                <div className="flex items-center space-x-2">
                                  <input type="color" value="#84cc16" className="w-6 h-6 rounded border" />
                                  <span className="text-xs font-mono text-gray-500">#84cc16</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">PREMIUM</span>
                                <div className="flex items-center space-x-2">
                                  <input type="color" value="#f97316" className="w-6 h-6 rounded border" />
                                  <span className="text-xs font-mono text-gray-500">#f97316</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Tags Versions */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 border-b pb-2">Tags Versions</h4>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">V1</span>
                                <div className="flex items-center space-x-2">
                                  <input type="color" value="#6b7280" className="w-6 h-6 rounded border" />
                                  <span className="text-xs font-mono text-gray-500">#6b7280</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">V2</span>
                                <div className="flex items-center space-x-2">
                                  <input type="color" value="#374151" className="w-6 h-6 rounded border" />
                                  <span className="text-xs font-mono text-gray-500">#374151</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">V3</span>
                                <div className="flex items-center space-x-2">
                                  <input type="color" value="#111827" className="w-6 h-6 rounded border" />
                                  <span className="text-xs font-mono text-gray-500">#111827</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">BETA</span>
                                <div className="flex items-center space-x-2">
                                  <input type="color" value="#f59e0b" className="w-6 h-6 rounded border" />
                                  <span className="text-xs font-mono text-gray-500">#f59e0b</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">DRAFT</span>
                                <div className="flex items-center space-x-2">
                                  <input type="color" value="#9ca3af" className="w-6 h-6 rounded border" />
                                  <span className="text-xs font-mono text-gray-500">#9ca3af</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">LIVE</span>
                                <div className="flex items-center space-x-2">
                                  <input type="color" value="#059669" className="w-6 h-6 rounded border" />
                                  <span className="text-xs font-mono text-gray-500">#059669</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Configuration des dimensions */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 border-b pb-2">Dimensions Unifiées</h4>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Padding</span>
                                <input type="text" value="4px 8px" className="w-20 px-2 py-1 text-xs border rounded font-mono" />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Border Radius</span>
                                <input type="text" value="6px" className="w-20 px-2 py-1 text-xs border rounded font-mono" />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Font Weight</span>
                                <select className="w-20 px-2 py-1 text-xs border rounded">
                                  <option value="400">400</option>
                                  <option value="500">500</option>
                                  <option value="600">600</option>
                                </select>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Letter Spacing</span>
                                <input type="text" value="0.5px" className="w-20 px-2 py-1 text-xs border rounded font-mono" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Modifications appliquées à tous les tags du système
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Appliquer les changements
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : editingStyle ? (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Modifier Style</h3>
                        <button
                          onClick={() => setEditingStyle(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nom du style *
                            </label>
                            <input
                              type="text"
                              value={editingStyle.name}
                              onChange={(e) => setEditingStyle({...editingStyle, name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Variable CSS *
                            </label>
                            <input
                              type="text"
                              value={editingStyle.cssVariable}
                              onChange={(e) => setEditingStyle({...editingStyle, cssVariable: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valeur *
                          </label>
                          <input
                            type="text"
                            value={editingStyle.value}
                            onChange={(e) => setEditingStyle({...editingStyle, value: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={editingStyle.description || ''}
                            onChange={(e) => setEditingStyle({...editingStyle, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="editActive"
                            checked={editingStyle.isActive}
                            onChange={(e) => setEditingStyle({...editingStyle, isActive: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="editActive" className="ml-2 block text-sm text-gray-900">
                            Style actif
                          </label>
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={() => deleteStyleMutation.mutate(editingStyle.id)}
                            disabled={deleteStyleMutation.isPending}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>{deleteStyleMutation.isPending ? 'Suppression...' : 'Supprimer'}</span>
                          </button>
                          <button
                            onClick={handleUpdateStyle}
                            disabled={updateStyleMutation.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>{updateStyleMutation.isPending ? 'Mise à jour...' : 'Mettre à jour'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer un nouveau style</h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nom du style *
                            </label>
                            <input
                              type="text"
                              value={newStyle.name}
                              onChange={(e) => setNewStyle({...newStyle, name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="ex: Admin H3 Size"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Variable CSS *
                            </label>
                            <input
                              type="text"
                              value={newStyle.cssVariable}
                              onChange={(e) => setNewStyle({...newStyle, cssVariable: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="ex: --admin-h3-size"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valeur *
                          </label>
                          <input
                            type="text"
                            value={newStyle.value}
                            onChange={(e) => setNewStyle({...newStyle, value: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="ex: 12px"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={newStyle.description || ''}
                            onChange={(e) => setNewStyle({...newStyle, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Description du style..."
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="newActive"
                            checked={newStyle.isActive}
                            onChange={(e) => setNewStyle({...newStyle, isActive: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="newActive" className="ml-2 block text-sm text-gray-900">
                            Style actif
                          </label>
                        </div>
                        
                        <button
                          onClick={handleCreateStyle}
                          disabled={createStyleMutation.isPending}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{createStyleMutation.isPending ? 'Création...' : 'Créer le style'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Colonne droite (1/4) - Code contextuel et prévisualisation */}
                <div className="col-span-1 space-y-4">


                  {/* Prévisualisation de composant avec couches modulaires */}
                  {((editingStyle && renderComponentPreview(editingStyle)) || activeTab === 'components') && (
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Prévisualisation Composant
                      </h3>
                      
                      {/* Prévisualisation visuelle */}
                      {editingStyle && renderComponentPreview(editingStyle) ? (
                        renderComponentPreview(editingStyle)
                      ) : activeTab === 'components' ? (
                        <TagsPreviewComponent 
                          selectedStyleId={unifiedTagStyle?.id}
                        />
                      ) : null}
                      
                      {/* Couches modulaires intégrées */}
                      {(activeTab === 'components' || (editingStyle && editingStyle.category === 'typography' && editingStyle.name.includes('Tag'))) && (
                        <div className="mt-4 pt-3 border-t">
                          <h4 className="text-xs font-medium text-gray-800 mb-2">Architecture Modulaire</h4>
                          <div className="space-y-2">
                            <div className="bg-blue-50 p-2 rounded text-xs">
                              <span className="font-medium text-blue-900">Typo Layer:</span>
                              <span className="text-blue-700 ml-1">
                                {unifiedTagStyle?.name || 'Tag Font Size Medium'} (Roboto Mono) - {unifiedTagStyle?.value || '10px'}
                              </span>
                            </div>
                            <div className="bg-green-50 p-2 rounded text-xs">
                              <span className="font-medium text-green-900">Color Layer:</span>
                              <span className="text-green-700 ml-1">NFT: #10b981, AUDIO: #3b82f6, VIDEO: #8b5cf6, INFO: #f59e0b</span>
                            </div>
                            <div className="bg-purple-50 p-2 rounded text-xs">
                              <span className="font-medium text-purple-900">Dimensions:</span>
                              <span className="text-purple-700 ml-1">
                                Padding: {unifiedTagStyle?.name?.includes('Small') ? '1px 3px' : 
                                         unifiedTagStyle?.name?.includes('Medium') ? '2px 4px' : 
                                         unifiedTagStyle?.name?.includes('Large') ? '3px 6px' : '2px 4px'}, 
                                Radius: 4px
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-600">
                            ⚡ Mise à jour automatique lors des modifications
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Code CSS</h3>
                    <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono max-h-64 overflow-y-auto">
                      <div className="text-yellow-400">/* Variables CSS - {tabs.find(t => t.id === activeTab)?.label} */</div>
                      <div className="text-gray-500">:root &#123;</div>
                      {currentStyles.filter(s => s.isActive).map((style) => (
                        <div key={style.id} className="ml-2">
                          <span className="text-blue-400">{style.cssVariable}</span>
                          <span className="text-white">: </span>
                          <span className="text-orange-400">{style.value}</span>
                          <span className="text-white">;</span>
                        </div>
                      ))}
                      <div className="text-gray-500">&#125;</div>
                    </div>
                  </div>

                  {/* Légende de l'architecture interdépendante */}
                  <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
                    <h4 className="font-medium text-blue-900 mb-2 text-sm">Architecture Interdépendante</h4>
                    <div className="space-y-1 text-xs text-blue-800">
                      <div>• Tags aspirent → Typo + Couleurs + Espacement</div>
                      <div>• Boutons aspirent → Actions + Styles + Dimensions</div>
                      <div>• Upload aspirent → Interface + Zones + Format</div>
                      <div className="pt-1 font-medium text-green-700">Chaque couche reste modifiable séparément</div>
                      <div className="text-gray-600">Modification typo tags ≠ modification couleurs</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminCursorProvider>
  );
}