import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { getLayoutConfig } from '@/components/admin/LayoutTemplateRegistry';
import { 
  Plus, 
  Search, 
  Settings, 
  FileText, 
  Palette, 
  Layout, 
  Eye,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';

const CATEGORY_ICONS = {
  creation: FileText,
  configuration: Settings,
  styles: Palette,
  management: Layout,
};

const CATEGORY_LABELS = {
  creation: 'Création',
  configuration: 'Configuration',
  styles: 'Styles',
  management: 'Gestion',
};

interface AdminPage {
  id: number;
  name: string;
  slug: string;
  category: string;
  layoutId: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  headerConfigId?: number;
  createdAt: string;
}

export function AdminPagesManager() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const adminPagesQuery = useQuery({
    queryKey: ['/api/admin-pages'],
    queryFn: () => apiRequest('/api/admin-pages'),
  });

  const initializeLayoutsMutation = useMutation({
    mutationFn: () => fetch('/api/layout-templates/initialize', { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Templates initialisés",
        description: "Les modèles de layout par défaut ont été créés.",
      });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/admin-pages/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({
        title: "Page supprimée",
        description: "La page a été supprimée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-pages'] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la page.",
        variant: "destructive",
      });
    },
  });

  const filteredPages = React.useMemo(() => {
    if (!adminPagesQuery.data) return [];
    
    return adminPagesQuery.data.filter((page: AdminPage) => {
      const matchesSearch = page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           page.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || page.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [adminPagesQuery.data, searchTerm, selectedCategory]);

  const groupedPages = React.useMemo(() => {
    const groups: Record<string, AdminPage[]> = {};
    
    filteredPages.forEach((page: AdminPage) => {
      if (!groups[page.category]) {
        groups[page.category] = [];
      }
      groups[page.category].push(page);
    });
    
    // Trier par sortOrder puis par nom
    Object.keys(groups).forEach(category => {
      groups[category].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        return a.name.localeCompare(b.name);
      });
    });
    
    return groups;
  }, [filteredPages]);

  if (adminPagesQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <AdminHeaderTemplate
          title="Gestion des pages admin"
          backLink="/admin"
          backLabel="Retour Admin"
        />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminHeaderTemplate
        title="Gestion des pages admin"
        backLink="/admin"
        backLabel="Retour Admin"
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher une page..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => initializeLayoutsMutation.mutate()}
              disabled={initializeLayoutsMutation.isPending}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Initialiser Templates
            </Button>
            
            <Button
              onClick={() => navigate('/admin/create-page')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle page
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'bg-blue-600' : 'text-white border-gray-600 hover:bg-gray-700'}
          >
            Toutes ({filteredPages.length})
          </Button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const count = adminPagesQuery.data?.filter((p: AdminPage) => p.category === key).length || 0;
            const Icon = CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS];
            
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className={selectedCategory === key ? 'bg-blue-600' : 'text-white border-gray-600 hover:bg-gray-700'}
              >
                <Icon className="w-3 h-3 mr-1" />
                {label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Pages Grid */}
        {Object.keys(groupedPages).length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Aucune page trouvée</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Aucune page ne correspond aux filtres appliqués.'
                  : 'Commencez par créer votre première page admin.'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <Button
                  onClick={() => navigate('/admin/create-page')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer ma première page
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedPages).map(([category, pages]) => {
              const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
              const label = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS];
              
              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">{label}</h2>
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                      {pages.length}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pages.map((page: AdminPage) => {
                      const layoutConfig = getLayoutConfig(page.layoutId as any);
                      
                      return (
                        <Card key={page.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-white text-lg mb-1">
                                  {page.name}
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <code className="bg-gray-700 px-2 py-1 rounded text-xs">
                                    /admin/{page.slug}
                                  </code>
                                  {!page.isActive && (
                                    <Badge variant="destructive" className="text-xs">
                                      Inactive
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            {page.description && (
                              <p className="text-sm text-gray-300 mb-4">
                                {page.description}
                              </p>
                            )}
                            
                            <div className="space-y-3">
                              {/* Layout Info */}
                              <div className="flex items-center gap-2">
                                <Layout className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-300">
                                  {layoutConfig ? layoutConfig.name : page.layoutId}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {layoutConfig ? `${layoutConfig.columns} col` : 'Unknown'}
                                </Badge>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex justify-between items-center pt-2">
                                <div className="text-xs text-gray-500">
                                  Créé le {new Date(page.createdAt).toLocaleDateString()}
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/admin/${page.slug}`)}
                                    className="text-white border-gray-600 hover:bg-gray-700"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/admin/edit-page/${page.id}`)}
                                    className="text-white border-gray-600 hover:bg-gray-700"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (confirm(`Êtes-vous sûr de vouloir supprimer "${page.name}" ?`)) {
                                        deletePageMutation.mutate(page.id);
                                      }
                                    }}
                                    className="text-red-400 border-red-600 hover:bg-red-600/10"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}