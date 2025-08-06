import React from 'react';
import { Database, Code, Globe, Zap } from 'lucide-react';

export function DynamicCSSIndicators() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h3 className="admin-section-title mb-4">Indicateurs Visuels des Classes CSS Dynamiques</h3>
      <p className="admin-body-text text-sm text-gray-600 mb-6">
        Ces classes permettent d'identifier visuellement le type de données affichées dans l'interface.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Database className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-medium text-gray-900">Données Aspirées (admin-dynamic-data)</h4>
              <div className="admin-dynamic-data mt-2 p-3 rounded">
                Exemple : {3} containers • Status: Active • Total: {42}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Données provenant de la base de données, APIs, ou calculs en temps réel
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Code className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">Éléments Générés (admin-programmatic)</h4>
              <div className="admin-programmatic mt-2 p-3 rounded">
                Container Test - Audio Container • État: FERMÉ • Type: AUDIO
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Contenu généré par du code, templates, ou logique de l'application
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Globe className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-gray-900">Sources Externes (admin-external-source)</h4>
              <div className="admin-external-source mt-2 p-3 rounded">
                2025-06-16 • API Response • External Service
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Données provenant de services externes, APIs tierces, ou timestamps
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Zap className="w-5 h-5 text-red-600" />
            <div>
              <h4 className="font-medium text-gray-900">Temps Réel (admin-real-time)</h4>
              <div className="admin-real-time mt-2 p-3 rounded">
                Live Updates • WebSocket Connected • 5 users online
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Données qui changent en temps réel, notifications live, statuts connectés
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">Comment les appliquer</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p><code className="bg-blue-100 px-2 py-1 rounded">className="admin-dynamic-data"</code> - Sur les éléments qui affichent des données de la base</p>
          <p><code className="bg-blue-100 px-2 py-1 rounded">className="admin-programmatic"</code> - Sur les éléments générés par le code</p>
          <p><code className="bg-blue-100 px-2 py-1 rounded">className="admin-external-source"</code> - Sur les timestamps et données externes</p>
          <p><code className="bg-blue-100 px-2 py-1 rounded">className="admin-real-time"</code> - Sur les éléments qui changent en live</p>
        </div>
      </div>
    </div>
  );
}