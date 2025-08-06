import React from 'react';
import { Download, Upload, RefreshCw, Grid, Palette, Database, Save, Plus, Settings } from 'lucide-react';

import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AdminLayoutTemplate } from '@/components/admin/AdminLayoutTemplate';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';

function HeaderTemplatePage() {
  
  // Classes debug pour le mode visuel
  const debugClasses = {
  };

  // Gabarit de colonne gauche standardisé
  const configSections = (
    <>
      <div className="bg-white rounded-lg p-3 shadow">
        <h3 className="font-medium text-gray-900 mb-2 flex items-center text-sm admin-h2">
          <Grid className="w-4 h-4 mr-2" />
          Structure
        </h3>
        <div className="space-y-2 text-xs text-gray-600 font-mono">
          <div>Container principal</div>
          <div>AdminHeaderTemplate</div>
          <div>AdminLayoutTemplate</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-3 shadow">
        <h3 className="font-medium text-gray-900 mb-2 flex items-center text-sm admin-h2">
          <Settings className="w-4 h-4 mr-2" />
          Marges
        </h3>
        <div className="space-y-2 text-xs text-gray-600 font-mono">
          <div>max-w-7xl mx-auto</div>
          <div>padding: p-4</div>
          <div>Layout: 1/4 + 3/4</div>
        </div>
      </div>
    </>
  );

  return (
    <AdminCursorProvider>
        <div className="max-w-7xl mx-auto p-4">
        <AdminHeaderTemplate title="TEMPLATES ADMIN" />
        
        <AdminLayoutTemplate leftColumn={configSections}>
          {/* Documentation du gabarit */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Gabarit de page admin standardisé</h2>
            <div className="space-y-4 text-sm text-gray-700">
              <p><strong>Structure :</strong> Container principal + AdminHeaderTemplate + AdminLayoutTemplate</p>
              <p><strong>Marges :</strong> max-w-7xl mx-auto p-4</p>
              <p><strong>Header :</strong> Titre ultra-light, navigation bleue, zone YHOM.APP</p>
              <p><strong>Layout :</strong> Colonne gauche (1/4) configuration + Contenu principal (3/4)</p>
            </div>
          </div>

          {/* Prévisualisation des layouts avec blocs visuels */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Layouts AdminLayoutTemplate</h2>
            <div className="space-y-6">
              
              {/* Layout 1-3 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">Layout 1-3 (défaut)</h3>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="bg-blue-200 p-2 rounded text-center text-xs font-medium">1/4 Config</div>
                  <div className="col-span-3 bg-green-200 p-2 rounded text-center text-xs font-medium">3/4 Contenu Principal</div>
                </div>
                <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                  &lt;AdminLayoutTemplate layout="1-3" leftColumn=&#123;sections&#125;&gt;
                </div>
                <p className="text-xs text-gray-600 mt-2">Pages: Templates Admin, Curseurs Dynamiques</p>
              </div>

              {/* Layout 1-2-1 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">Layout 1-2-1 (Grid Distribution)</h3>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="bg-blue-200 p-2 rounded text-center text-xs font-medium">1/4 Config</div>
                  <div className="col-span-2 bg-green-200 p-2 rounded text-center text-xs font-medium">2/4 Contenu</div>
                  <div className="bg-purple-200 p-2 rounded text-center text-xs font-medium">1/4 Outils</div>
                </div>
                <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                  &lt;AdminLayoutTemplate layout="1-2-1" leftColumn=&#123;left&#125; rightColumn=&#123;right&#125;&gt;
                </div>
                <p className="text-xs text-gray-600 mt-2">Pages: Grid Distribution V3</p>
              </div>

              {/* Layout 4-cols */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">Layout 4-cols (Listes NFT)</h3>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="bg-yellow-200 p-2 rounded text-center text-xs font-medium">Col 1</div>
                  <div className="bg-yellow-200 p-2 rounded text-center text-xs font-medium">Col 2</div>
                  <div className="bg-yellow-200 p-2 rounded text-center text-xs font-medium">Col 3</div>
                  <div className="bg-yellow-200 p-2 rounded text-center text-xs font-medium">Col 4</div>
                </div>
                <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                  &lt;AdminLayoutTemplate layout="4-cols"&gt;
                </div>
                <p className="text-xs text-gray-600 mt-2">Pages: Galeries NFT, Listes de contenus</p>
              </div>
            </div>
          </div>

          {/* Code example */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Structure de code standardisée</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<div className="min-h-screen bg-gray-50">
  <div className="max-w-7xl mx-auto p-4">
    <AdminHeaderTemplate title="TITRE PAGE" />
    
    <AdminLayoutTemplate leftColumn={configSections}>
      {/* Contenu principal */}
    </AdminLayoutTemplate>
  </div>
</div>`}
            </pre>
          </div>
        </AdminLayoutTemplate>
        </div>
    </AdminCursorProvider>
  );
}

export default HeaderTemplatePage;