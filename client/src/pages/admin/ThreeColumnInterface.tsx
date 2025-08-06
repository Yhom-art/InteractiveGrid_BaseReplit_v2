import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';

export function ThreeColumnInterface() {
  const [selectedComponentType, setSelectedComponentType] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<any | null>(null);

  // Gestion de la sélection d'un type de composant
  const handleComponentTypeSelect = (type: string) => {
    setSelectedComponentType(type);
    setSelectedComponent(null); // Réinitialiser la sélection de composant
  };

  // Gestion de la sélection d'un composant spécifique
  const handleComponentSelect = (component: any) => {
    setSelectedComponent(component);
  };

  return (
    <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-indigo-900">Composants du panel</h2>
            <p className="text-blue-700 mt-1">
              Enrichissez cette fiche avec des composants interactifs
            </p>
          </div>
        </div>
      </div>

      {/* Interface à 3 colonnes */}
      <div className="flex min-h-[500px]">
        {/* COLONNE GAUCHE: Types de composants */}
        <div className="w-64 p-4 bg-gray-50 border-r">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Types de composants</h3>
          <div className="space-y-2">
            <button 
              onClick={() => handleComponentTypeSelect('text')}
              className={`w-full flex items-center p-3 text-left bg-white border rounded-lg transition-colors ${
                selectedComponentType === 'text' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-blue-200 hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              <div className="bg-blue-500 text-white p-2 rounded mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-blue-800">Texte</div>
                <div className="text-xs text-blue-600">Information et contenu</div>
              </div>
            </button>
            
            <button 
              onClick={() => handleComponentTypeSelect('image')}
              className={`w-full flex items-center p-3 text-left bg-white border rounded-lg transition-colors ${
                selectedComponentType === 'image' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-green-200 hover:bg-green-50 hover:border-green-300'
              }`}
            >
              <div className="bg-green-500 text-white p-2 rounded mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-green-800">Image</div>
                <div className="text-xs text-green-600">Visuel et photo</div>
              </div>
            </button>
            
            <button 
              onClick={() => handleComponentTypeSelect('wallet')}
              className={`w-full flex items-center p-3 text-left bg-white border rounded-lg transition-colors ${
                selectedComponentType === 'wallet' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-purple-200 hover:bg-purple-50 hover:border-purple-300'
              }`}
            >
              <div className="bg-purple-500 text-white p-2 rounded mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-purple-800">Wallet</div>
                <div className="text-xs text-purple-600">Crypto et Web3</div>
              </div>
            </button>

            <button 
              onClick={() => handleComponentTypeSelect('podcast')}
              className={`w-full flex items-center p-3 text-left bg-white border rounded-lg transition-colors ${
                selectedComponentType === 'podcast' 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300'
              }`}
            >
              <div className="bg-indigo-500 text-white p-2 rounded mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414-5.658m-2.828 9.9a9 9 0 010-12.728" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-indigo-800">Podcast</div>
                <div className="text-xs text-indigo-600">Audio et médias</div>
              </div>
            </button>
          </div>
        </div>
        
        {/* COLONNE CENTRE: Liste des composants */}
        <div className="flex-1 p-6" style={{ maxWidth: '400px' }}>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Composants du panel
          </h3>
          
          {/* Message quand aucun composant n'est présent */}
          {!selectedComponent && (
            <div className="text-center py-12 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p>Aucun composant ajouté</p>
              <p className="text-xs mt-1">Cliquez sur un type de composant à gauche pour commencer</p>
            </div>
          )}
          
          {/* Liste des composants (exemple) - à afficher conditionnellement */}
          {selectedComponentType && (
            <div className="space-y-3 mt-4">
              <div 
                className={`border rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer ${selectedComponent ? 'border-blue-400 shadow-sm' : ''}`}
                onClick={() => handleComponentSelect({ id: 1, type: 'text', title: 'Informations DALLIA' })}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                    <span className="font-medium text-sm">Informations DALLIA</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button className="p-1 text-red-400 hover:text-red-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  <div>DALLIA - Doublure lumineuse #0061. Collection Yhom.</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* COLONNE DROITE: Éditeur contextuel */}
        <div className="w-80 bg-gray-50 border-l p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Éditeur de composant</h3>
          </div>
          
          {/* Message "aucun composant sélectionné" */}
          {!selectedComponent && (
            <div className="text-center py-12 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p>Aucun composant sélectionné</p>
              <p className="text-xs mt-1">Cliquez sur un composant dans la liste du centre pour le modifier</p>
            </div>
          )}
          
          {/* Éditeur pour composant texte (exemple) - à montrer conditionnellement */}
          {selectedComponent && selectedComponent.type === 'text' && (
            <div>
              <h4 className="font-medium mb-3 text-blue-800">Éditer le composant texte</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Titre du composant"
                    defaultValue={selectedComponent.title}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                  <textarea
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={5}
                    placeholder="Contenu du texte..."
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedComponent(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}