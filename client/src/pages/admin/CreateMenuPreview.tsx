import React from 'react';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { useCreatePageMenu } from '@/hooks/useCreatePageMenu';
import { Button } from '@/components/ui/button';

export function CreateMenuPreview() {
  const { openMenu, Menu } = useCreatePageMenu();

  return (
    <AdminCursorProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <AdminHeaderTemplate 
            title="PREVIEW - MENU CREATE NEW PAGE" 
            filePath="client/src/pages/admin/CreateMenuPreview.tsx" 
          />
          
          <div className="bg-white rounded-lg shadow-sm border p-8 mt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Aperçu du Menu CREATE NEW PAGE
              </h1>
              <p className="text-gray-600 mb-8">
                Ce menu unifie la création de grilles, pages admin, et autres éléments
              </p>
              
              <Button 
                onClick={openMenu}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
              >
                Ouvrir le Menu CREATE NEW PAGE
              </Button>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Fonctionnalités incluses :</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• <strong>Modèles de Grilles</strong> - Accès direct à ta page GridMapModelsPage</li>
                  <li>• <strong>Page Admin</strong> - Assistant 3 étapes pour créer des pages</li>
                  <li>• <strong>Configuration Container Layer</strong> - Nouvelle couche de containers</li>
                  <li>• <strong>Configuration Curseur</strong> - Curseurs personnalisés</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <Menu />
      </div>
    </AdminCursorProvider>
  );
}