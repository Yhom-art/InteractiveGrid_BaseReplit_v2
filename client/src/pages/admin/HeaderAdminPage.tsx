import React, { useState } from 'react';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { 
  Settings, 
  Image, 
  Type, 
  ArrowLeft, 
  Save, 
  RotateCcw,
  Eye,
  EyeOff,
  Upload
} from 'lucide-react';

export default function HeaderAdminPage() {
  
  // État local pour la configuration du header
  const [headerConfig, setHeaderConfig] = useState({
    logoText: 'YHOM',
    logoSubtext: '.APP',
    logoImageUrl: '',
    backLink: '/admin',
    backLabel: 'Retour Admin',
    showLogo: true,
    showBreadcrumb: true
  });

  const [previewMode, setPreviewMode] = useState(false);

  const handleSave = () => {
    // TODO: Sauvegarder la configuration via API
    alert('Configuration sauvegardée (fonctionnalité à implémenter)');
  };

  const handleReset = () => {
    setHeaderConfig({
      logoText: 'YHOM',
      logoSubtext: '.APP',
      logoImageUrl: '',
      backLink: '/admin',
      backLabel: 'Retour Admin',
      showLogo: true,
      showBreadcrumb: true
    });
  };

  return (
    <AdminCursorProvider>
        <div className="max-w-6xl mx-auto p-6">
          <AdminHeaderTemplate 
            title="Administration du Header"
            filePath="client/src/pages/admin/HeaderAdminPage.tsx"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration */}
            <div className="lg:col-span-2 space-y-6">
              {/* Logo Configuration */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center mb-4">
                  <Type className="w-5 h-5 text-blue-600 mr-3" />
                  <h2 className="admin-section-title">Configuration du Logo</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="showLogo"
                      checked={headerConfig.showLogo}
                      onChange={(e) => setHeaderConfig(prev => ({ ...prev, showLogo: e.target.checked }))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="showLogo" className="text-sm text-gray-700">Afficher le logo</label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texte principal
                      </label>
                      <input
                        type="text"
                        value={headerConfig.logoText}
                        onChange={(e) => setHeaderConfig(prev => ({ ...prev, logoText: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 admin-dynamic-data"
                        placeholder="YHOM"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sous-texte
                      </label>
                      <input
                        type="text"
                        value={headerConfig.logoSubtext}
                        onChange={(e) => setHeaderConfig(prev => ({ ...prev, logoSubtext: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 admin-dynamic-data"
                        placeholder=".APP"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image du logo (URL)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={headerConfig.logoImageUrl}
                        onChange={(e) => setHeaderConfig(prev => ({ ...prev, logoImageUrl: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 admin-external-source"
                        placeholder="https://example.com/logo.png"
                      />
                      <button className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors">
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Configuration */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center mb-4">
                  <ArrowLeft className="w-5 h-5 text-green-600 mr-3" />
                  <h2 className="admin-section-title">Configuration de la Navigation</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="showBreadcrumb"
                      checked={headerConfig.showBreadcrumb}
                      onChange={(e) => setHeaderConfig(prev => ({ ...prev, showBreadcrumb: e.target.checked }))}
                      className="w-4 h-4 text-green-600"
                    />
                    <label htmlFor="showBreadcrumb" className="text-sm text-gray-700">Afficher le fil d'Ariane</label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lien de retour
                      </label>
                      <input
                        type="text"
                        value={headerConfig.backLink}
                        onChange={(e) => setHeaderConfig(prev => ({ ...prev, backLink: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 admin-programmatic"
                        placeholder="/admin"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texte du lien
                      </label>
                      <input
                        type="text"
                        value={headerConfig.backLabel}
                        onChange={(e) => setHeaderConfig(prev => ({ ...prev, backLabel: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 admin-programmatic"
                        placeholder="Retour Admin"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors admin-real-time"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </button>
                    
                    <button
                      onClick={handleReset}
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Réinitialiser
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors admin-real-time"
                  >
                    {previewMode ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Masquer Prévisualisation
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Prévisualisation
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Colonne de droite - Informations */}
            <div className="space-y-6">
              {/* Statut */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center mb-3">
                  <Settings className="w-4 h-4 text-gray-600 mr-2" />
                  <h3 className="admin-section-title text-sm">Statut</h3>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Template:</span>
                    <span className="font-mono text-green-600 admin-programmatic">AdminHeaderTemplate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pages utilisant:</span>
                    <span className="font-mono text-blue-600 admin-dynamic-data">Toutes les pages admin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dernière MAJ:</span>
                    <span className="font-mono text-orange-600 admin-external-source">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Aperçu Logo */}
              {headerConfig.showLogo && (
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex items-center mb-3">
                    <Image className="w-4 h-4 text-gray-600 mr-2" />
                    <h3 className="admin-section-title text-sm">Aperçu</h3>
                  </div>
                  
                  <div className="border border-gray-200 rounded p-3 bg-gray-50">
                    <div className="flex items-center justify-center">
                      {headerConfig.logoImageUrl ? (
                        <img 
                          src={headerConfig.logoImageUrl} 
                          alt="Logo"
                          className="h-8 max-w-20 object-contain admin-external-source"
                        />
                      ) : (
                        <div className="text-center admin-dynamic-data">
                          <div className="text-lg font-bold text-gray-800">
                            {headerConfig.logoText}
                          </div>
                          <div className="text-xs text-gray-600">
                            {headerConfig.logoSubtext}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Guide */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h3 className="admin-section-title text-sm text-blue-800 mb-2">Guide rapide</h3>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• Le logo apparaît en haut à droite du header</p>
                  <p>• Les modifications sont appliquées à toutes les pages admin</p>
                  <p>• Utilisez des images 128x32px pour un rendu optimal</p>
                </div>
              </div>
            </div>
          </div>

          {/* Prévisualisation */}
          {previewMode && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
              <h3 className="admin-section-title mb-4">Prévisualisation du Header</h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-extralight text-gray-800 uppercase tracking-wide">
                      Exemple de Page Admin
                    </h1>
                    {headerConfig.showBreadcrumb && (
                      <div className="mt-1">
                        <span className="text-sm text-blue-600 admin-programmatic">
                          ← {headerConfig.backLabel}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {headerConfig.showLogo && (
                    <div className="admin-dynamic-data">
                      {headerConfig.logoImageUrl ? (
                        <img 
                          src={headerConfig.logoImageUrl} 
                          alt="Logo"
                          className="h-8 max-w-20 object-contain"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-800">
                            {headerConfig.logoText}
                          </div>
                          <div className="text-xs text-gray-600">
                            {headerConfig.logoSubtext}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
    </AdminCursorProvider>
  );
}