import React, { useState } from 'react';
import { Link } from 'wouter';
import { ChevronRight, ChevronDown, Folder, File, Plus, Settings, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PageNode {
  id: string;
  name: string;
  route?: string;
  parentId?: string;
  children?: PageNode[];
  type: 'folder' | 'page';
  status: 'active' | 'draft' | 'archived';
  lastModified: string;
  description?: string;
}

interface HierarchicalPageManagerProps {
  pages: PageNode[];
  onCreatePage?: (parentId?: string) => void;
  onDeletePage?: (pageId: string) => void;
  onMovePage?: (pageId: string, newParentId?: string) => void;
}

export function HierarchicalPageManager({ 
  pages, 
  onCreatePage, 
  onDeletePage, 
  onMovePage 
}: HierarchicalPageManagerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderNode = (node: PageNode, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode === node.id;

    return (
      <div key={node.id} className="admin-dynamic-data">
        <div 
          className={`flex items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors ${
            isSelected ? 'bg-blue-50 border border-blue-200' : ''
          }`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => toggleExpanded(node.id)}
            className={`w-4 h-4 flex items-center justify-center mr-2 transition-colors ${
              hasChildren ? 'text-gray-600 hover:text-gray-900' : 'invisible'
            }`}
          >
            {hasChildren && (isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />)}
          </button>

          {/* Icon */}
          <div className="mr-3">
            {node.type === 'folder' ? (
              <Folder className="w-4 h-4 text-blue-600" />
            ) : (
              <File className="w-4 h-4 text-gray-600" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {node.route ? (
              <Link 
                to={node.route}
                className="block hover:text-blue-600 transition-colors admin-programmatic"
                onClick={() => setSelectedNode(node.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm truncate">{node.name}</div>
                    {node.description && (
                      <div className="text-xs text-gray-500 truncate">{node.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}>
                      {node.status}
                    </span>
                    <span className="text-xs text-gray-400 admin-external-source">{node.lastModified}</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div 
                className="cursor-pointer admin-programmatic"
                onClick={() => setSelectedNode(node.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm truncate">{node.name}</div>
                    {node.description && (
                      <div className="text-xs text-gray-500 truncate">{node.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}>
                      {node.status}
                    </span>
                    <span className="text-xs text-gray-400 admin-external-source">{node.lastModified}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onCreatePage?.(node.id)}
              className="p-1 rounded hover:bg-blue-100 text-blue-600"
              title="Créer une sous-page"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => {/* Edit logic */}}
              className="p-1 rounded hover:bg-gray-100 text-gray-600"
              title="Modifier"
            >
              <Settings className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDeletePage?.(node.id)}
              className="p-1 rounded hover:bg-red-100 text-red-600"
              title="Supprimer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="admin-section-title">Gestionnaire de Pages Hiérarchique</h2>
          <p className="admin-body-text text-sm text-gray-600 mt-1">
            Organisation type WordPress avec relations parent/enfant
          </p>
        </div>
        <button
          onClick={() => onCreatePage?.()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Page
        </button>
      </div>

      <div className="space-y-1 admin-real-time">
        {pages.map(page => renderNode(page))}
      </div>

      {pages.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="admin-section-title text-gray-500">Aucune page créée</h3>
          <p className="admin-body-text text-gray-400 mb-4">
            Commencez par créer votre première page administrative
          </p>
          <button
            onClick={() => onCreatePage?.()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Créer la première page
          </button>
        </div>
      )}
    </div>
  );
}

// Hook pour gérer les pages hiérarchiques
export function useHierarchicalPages() {
  const [pages, setPages] = useState<PageNode[]>([]);
  const { toast } = useToast();

  const createPage = (parentId?: string) => {
    const pageName = prompt('Nom de la nouvelle page:');
    if (!pageName) return;

    const newPage: PageNode = {
      id: `page-${Date.now()}`,
      name: pageName,
      route: `/admin/${pageName.toLowerCase().replace(/\s+/g, '-')}`,
      parentId,
      type: 'page',
      status: 'draft',
      lastModified: new Date().toISOString().split('T')[0],
      description: `Page ${pageName} créée automatiquement`
    };

    if (parentId) {
      // Ajouter comme enfant
      setPages(prev => {
        const updateChildren = (items: PageNode[]): PageNode[] => {
          return items.map(item => {
            if (item.id === parentId) {
              return {
                ...item,
                children: [...(item.children || []), newPage]
              };
            }
            if (item.children) {
              return {
                ...item,
                children: updateChildren(item.children)
              };
            }
            return item;
          });
        };
        return updateChildren(prev);
      });
    } else {
      // Ajouter à la racine
      setPages(prev => [...prev, newPage]);
    }

    toast({
      title: 'Page créée',
      description: `${pageName} a été ajoutée avec succès`
    });
  };

  const deletePage = (pageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;

    setPages(prev => {
      const removeFromTree = (items: PageNode[]): PageNode[] => {
        return items.filter(item => item.id !== pageId).map(item => ({
          ...item,
          children: item.children ? removeFromTree(item.children) : undefined
        }));
      };
      return removeFromTree(prev);
    });

    toast({
      title: 'Page supprimée',
      description: 'La page a été supprimée avec succès'
    });
  };

  return {
    pages,
    createPage,
    deletePage,
    setPages
  };
}