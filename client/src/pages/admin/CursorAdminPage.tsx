import React, { useState } from 'react';
import { MousePointer, Settings, Save, RefreshCw } from 'lucide-react';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AdminLayoutTemplate } from '@/components/admin/AdminLayoutTemplate';
// import { AutoTags } from '@/components/admin/AutoTags';

export default function CursorAdminPage() {
  const [selectedCursor, setSelectedCursor] = useState('default');
  const [isEditing, setIsEditing] = useState(false);

  const leftColumn = (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Curseurs disponibles</h3>
        <div className="space-y-2">
          {['default', 'pointer', 'grab', 'zoom-in', 'zoom-out'].map((cursor) => (
            <button
              key={cursor}
              onClick={() => setSelectedCursor(cursor)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedCursor === cursor
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              {cursor}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const rightColumn = (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
        <div className="space-y-2">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            {isEditing ? 'Arrêter' : 'Modifier'}
          </button>
          <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AdminCursorProvider>
      <div className="flex">
        <div className="flex-1">
          <div className="max-w-7xl mx-auto p-4">
            <AdminHeaderTemplate 
              title="CURSEURS DYNAMIQUES" 
              filePath="client/src/pages/admin/CursorAdminPage.tsx" 
            />
            
            <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <MousePointer className="w-6 h-6 text-blue-600 mr-3" />
                  <h1 className="text-xl font-bold text-gray-900">Administration des Curseurs</h1>
                </div>

              </div>
            </div>

            <AdminLayoutTemplate 
              layout="1-2-1" 
              leftColumn={leftColumn} 
              rightColumn={rightColumn}
            >
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Prévisualisation</h2>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className={`cursor-${selectedCursor} p-8 bg-white rounded-lg shadow-sm border`}>
                    <p className="text-gray-600">Zone de test pour le curseur: {selectedCursor}</p>
                  </div>
                </div>
              </div>
            </AdminLayoutTemplate>
          </div>
        </div>
      </div>
    </AdminCursorProvider>
  );
}