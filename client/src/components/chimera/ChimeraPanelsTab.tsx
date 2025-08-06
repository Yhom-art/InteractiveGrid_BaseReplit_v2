import React from 'react';

interface ChimeraPanelsTabProps {
  chimeraId: string | number;
  showPanelEditor: boolean;
  currentPanelId: string | number;
  openPanelEditor: (panelId?: string | number) => void;
  closePanelEditor: () => void;
}

export function ChimeraPanelsTab({
  chimeraId,
  showPanelEditor,
  currentPanelId,
  openPanelEditor,
  closePanelEditor
}: ChimeraPanelsTabProps) {
  return (
    <div className="bg-white shadow mb-6 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl text-indigo-900 font-mono" style={{ fontSize: '1.1rem', lineHeight: '0.9' }}>
              Panels et Composants
            </h2>
            <p className="text-blue-700 mt-1 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
              Gestion des panels associés à la chimère
            </p>
          </div>
          <button
            onClick={() => openPanelEditor('new')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-mono"
            style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
          >
            Ajouter un panel
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {showPanelEditor ? (
          // Mode édition d'un panel
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-mono" style={{ fontSize: '1rem', lineHeight: '0.9' }}>
                {currentPanelId === 'new' ? 'Nouveau panel' : `Modifier le panel ${currentPanelId}`}
              </h3>
              <button
                onClick={closePanelEditor}
                className="px-3 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 font-mono"
                style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
              >
                Retour aux panels
              </button>
            </div>
            
            {/* Contenu de l'éditeur de panel - À implémenter avec les composants appropriés */}
            <div className="border border-gray-200 p-4 rounded">
              <p className="text-gray-600 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
                Interface d'édition de panel à implémenter...
              </p>
            </div>
          </div>
        ) : (
          // Liste des panels
          <div className="space-y-6">
            <p className="text-gray-600 font-mono" style={{ fontSize: '0.85rem', lineHeight: '0.9' }}>
              Les panels sont utilisés pour afficher du contenu interactif lorsqu'une chimère est ouverte dans la grille. 
              Chaque panel peut contenir différents types de composants: texte, image, vidéo, etc.
            </p>
            
            {/* Ici viendrait la liste des panels existants - Exemple statique */}
            <div className="border-t border-b border-gray-200 divide-y">
              <div className="py-4 flex justify-between items-center">
                <div>
                  <h4 className="font-mono" style={{ fontSize: '0.9rem', lineHeight: '0.9' }}>Panel principal</h4>
                  <p className="text-gray-500 font-mono" style={{ fontSize: '0.8rem', lineHeight: '0.9' }}>
                    3 composants • Dernière modification: 12/05/2025
                  </p>
                </div>
                <button
                  onClick={() => openPanelEditor(1)}
                  className="px-3 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 font-mono"
                  style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                >
                  Modifier
                </button>
              </div>
              <div className="py-4 flex justify-between items-center">
                <div>
                  <h4 className="font-mono" style={{ fontSize: '0.9rem', lineHeight: '0.9' }}>Panel secondaire</h4>
                  <p className="text-gray-500 font-mono" style={{ fontSize: '0.8rem', lineHeight: '0.9' }}>
                    1 composant • Dernière modification: 10/05/2025
                  </p>
                </div>
                <button
                  onClick={() => openPanelEditor(2)}
                  className="px-3 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 font-mono"
                  style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
                >
                  Modifier
                </button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => openPanelEditor('new')}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-mono"
                style={{ fontSize: '0.85rem', lineHeight: '0.9' }}
              >
                Ajouter un nouveau panel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}