import React, { useState } from 'react';
import { Download, Upload, RefreshCw, Save, Plus, Settings, Palette, Database, Grid, Trash2, Edit, Eye, Copy } from 'lucide-react';

import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AdminLayoutTemplate } from '@/components/admin/AdminLayoutTemplate';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';

interface AdminButton {
  id: string;
  name: string;
  icon: string;
  color: string;
  action: string;
  description: string;
  category: 'data' | 'action' | 'view' | 'edit';
}

const adminButtons: AdminButton[] = [
  // Boutons Data
  { id: 'export', name: 'Exporter', icon: 'Upload', color: 'green', action: 'handleExport', description: 'Export des données', category: 'data' },
  { id: 'import', name: 'Importer', icon: 'Download', color: 'purple', action: 'handleImport', description: 'Import de données', category: 'data' },
  { id: 'save', name: 'Enregistrer', icon: 'Save', color: 'blue', action: 'handleSave', description: 'Sauvegarde', category: 'data' },
  { id: 'database', name: 'Base de données', icon: 'Database', color: 'indigo', action: 'handleDatabase', description: 'Gestion BDD', category: 'data' },
  
  // Boutons Action
  { id: 'refresh', name: 'Actualiser', icon: 'RefreshCw', color: 'orange', action: 'handleRefresh', description: 'Rafraîchir les données', category: 'action' },
  { id: 'new', name: 'Nouveau', icon: 'Plus', color: 'gray', action: 'handleNew', description: 'Créer un élément', category: 'action' },
  { id: 'delete', name: 'Supprimer', icon: 'Trash2', color: 'red', action: 'handleDelete', description: 'Supprimer', category: 'action' },
  { id: 'copy', name: 'Dupliquer', icon: 'Copy', color: 'teal', action: 'handleCopy', description: 'Dupliquer', category: 'action' },
  
  // Boutons View
  { id: 'preview', name: 'Prévisualiser', icon: 'Eye', color: 'pink', action: 'handlePreview', description: 'Aperçu', category: 'view' },
  { id: 'palette', name: 'Palette', icon: 'Palette', color: 'pink', action: 'handlePalette', description: 'Palette couleurs', category: 'view' },
  { id: 'grid', name: 'Grille', icon: 'Grid', color: 'cyan', action: 'handleGrid', description: 'Affichage grille', category: 'view' },
  
  // Boutons Edit
  { id: 'edit', name: 'Modifier', icon: 'Edit', color: 'amber', action: 'handleEdit', description: 'Éditer', category: 'edit' },
  { id: 'settings', name: 'Paramètres', icon: 'Settings', color: 'slate', action: 'handleSettings', description: 'Configuration', category: 'edit' },
];

function AdminButtonsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedButton, setSelectedButton] = useState<AdminButton | null>(null);

  const filteredButtons = selectedCategory === 'all' 
    ? adminButtons 
    : adminButtons.filter(btn => btn.category === selectedCategory);

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Download, Upload, RefreshCw, Save, Plus, Settings, Palette, Database, Grid, Trash2, Edit, Eye, Copy
    };
    return icons[iconName] || Settings;
  };

  const generateButtonCode = (button: AdminButton) => {
    const IconComponent = getIconComponent(button.icon);
    return `<button 
  onClick={${button.action}}
  className="flex items-center px-5 py-3 bg-${button.color}-600 text-white rounded-xl hover:bg-${button.color}-700 transition-colors text-base font-medium"
>
  <${button.icon} className="w-4 h-4 mr-2" />
  ${button.name}
</button>`;
  };

  const configSections = (
    <>
      <div className="bg-white rounded-lg p-3 shadow">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center text-sm">
          <Settings className="w-4 h-4 mr-2" />
          CATÉGORIES
        </h3>
        <div className="space-y-2">
          {['all', 'data', 'action', 'view', 'edit'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                selectedCategory === category 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {category === 'all' ? 'Tous' : category.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-3 shadow">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center text-sm">
          <Grid className="w-4 h-4 mr-2" />
          Statistiques
        </h3>
        <div className="space-y-2 text-xs text-gray-600 font-mono">
          <div>Total: {adminButtons.length}</div>
          <div>Filtrés: {filteredButtons.length}</div>
          <div>Sélectionné: {selectedButton ? '1' : '0'}</div>
        </div>
      </div>
    </>
  );

  return (
    <AdminCursorProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4">
        <AdminHeaderTemplate title="BOUTONS ADMIN" />
        
        <AdminLayoutTemplate leftColumn={configSections}>
          {/* Grille des boutons */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Boutons disponibles</h2>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {filteredButtons.map(button => {
                const IconComponent = getIconComponent(button.icon);
                return (
                  <button
                    key={button.id}
                    onClick={() => setSelectedButton(button)}
                    className={`flex items-center px-5 py-3 bg-${button.color}-600 text-white rounded-xl hover:bg-${button.color}-700 transition-colors text-base font-medium cursor-pointer ${
                      selectedButton?.id === button.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {button.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Détails du bouton sélectionné */}
          {selectedButton && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Code pour: {selectedButton.name}
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Informations</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div><strong>ID:</strong> {selectedButton.id}</div>
                    <div><strong>Catégorie:</strong> {selectedButton.category}</div>
                    <div><strong>Couleur:</strong> {selectedButton.color}</div>
                    <div><strong>Action:</strong> {selectedButton.action}</div>
                    <div><strong>Description:</strong> {selectedButton.description}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Code JSX</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {generateButtonCode(selectedButton)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </AdminLayoutTemplate>
        </div>
      </div>
    </AdminCursorProvider>
  );
}

// Export de la structure de boutons pour réutilisation
export const adminButtonsConfig = {
  admin: {
    initialize: ({ onClick }: { onClick: () => void }) => ({
      label: "Initialiser",
      icon: <Database className="h-4 w-4" />,
      variant: "outline" as const,
      onClick
    }),
    create: ({ onClick }: { onClick: () => void }) => ({
      label: "Nouveau",
      icon: <Plus className="h-4 w-4" />,
      variant: "default" as const,
      onClick
    }),
    save: ({ onClick }: { onClick: () => void }) => ({
      label: "Enregistrer",
      icon: <Save className="h-4 w-4" />,
      variant: "default" as const,
      onClick
    }),
    cancel: ({ onClick }: { onClick: () => void }) => ({
      label: "Annuler",
      icon: <RefreshCw className="h-4 w-4" />,
      variant: "outline" as const,
      onClick
    }),
    export: ({ onClick }: { onClick: () => void }) => ({
      label: "Exporter",
      icon: <Upload className="h-4 w-4" />,
      variant: "outline" as const,
      onClick
    }),
    import: ({ onClick }: { onClick: () => void }) => ({
      label: "Importer",
      icon: <Download className="h-4 w-4" />,
      variant: "outline" as const,
      onClick
    })
  }
};

export default AdminButtonsPage;