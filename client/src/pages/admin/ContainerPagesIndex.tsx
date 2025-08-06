import React from 'react';
import { Link } from 'wouter';

import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';

const containerPages = [
  {
    title: 'Container Layers Admin',
    path: '/admin/container-layers-admin',
    description: 'Configurateur granulaire avec modèles pré-définis (ONE, ONEONE_UP, etc.)',
    status: 'Fonctionnel'
  },
  {
    title: 'Container Layers V3',
    path: '/admin/container-layers-v3',
    description: 'Version avec sélecteur de types (à éviter)',
    status: 'Archive'
  },
  {
    title: 'Container Layers New',
    path: '/admin/container-layers-new',
    description: 'Version alternative de développement',
    status: 'Test'
  },
  {
    title: 'Container Types Index',
    path: '/admin/container-types-index',
    description: 'Liste des types depuis BDD avec fonctions CRUD',
    status: 'Fonctionnel'
  },
  {
    title: 'Containers Admin',
    path: '/admin/containers-admin',
    description: 'Modèles containers avec assignement grid',
    status: 'Fonctionnel'
  }
];

export default function ContainerPagesIndex() {
  return (
    <AdminCursorProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <AdminHeaderTemplate title="INDEX DES PAGES CONTAINER" />
          
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 mb-6">
              Voici toutes les pages Container disponibles pour tests et comparaisons :
            </p>
            
            <div className="grid gap-4">
              {containerPages.map((page, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {page.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {page.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <Link 
                          href={page.path}
                          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Voir cette page
                        </Link>
                        <span className="text-xs text-gray-500 font-mono">
                          {page.path}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        page.status === 'Fonctionnel' ? 'bg-green-100 text-green-700' :
                        page.status === 'Test' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {page.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Instructions :</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Cliquez sur "Voir cette page" pour accéder à chaque version</li>
                <li>• Comparez les interfaces et fonctionnalités</li>
                <li>• Identifiez la version que vous préférez</li>
                <li>• Nous pourrons ensuite archiver les autres versions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminCursorProvider>
  );
}