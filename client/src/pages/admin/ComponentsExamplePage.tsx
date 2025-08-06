import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';

/**
 * Page d'exemples des composants spécialisés
 * Montre des démonstrations interactives de chaque type de composant
 */
export function ComponentsExamplePage() {
  const [activeTab, setActiveTab] = useState<'map' | 'podcast' | 'wallet'>('map');
  
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Composants Spécialisés</h1>
        <p className="text-gray-600">
          Exemples interactifs des composants avancés pour les panels
        </p>
      </div>
      
      {/* Navigation entre les exemples */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('map')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'map'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Carte Interactive
          </button>
          <button
            onClick={() => setActiveTab('podcast')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'podcast'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Lecteur Podcast
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'wallet'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Wallet Crypto
          </button>
        </nav>
      </div>
      
      {/* Contenu de l'exemple actif */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {activeTab === 'map' && (
          <div>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium">Composant Carte</h2>
              <p className="mt-1 text-sm text-gray-500">
                Affiche une carte interactive avec des marqueurs personnalisables
              </p>
            </div>
            
            <div className="p-6">
              {/* Aperçu du composant Map */}
              <div className="bg-gray-50 rounded-lg overflow-hidden mb-4" style={{ height: '400px' }}>
                <div className="h-full flex items-center justify-center">
                  <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-medium">Localisation de la chimère</h3>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Interactif</span>
                    </div>
                    <div className="relative" style={{ height: '300px' }}>
                      {/* Simulacre de carte avec effet gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-sm text-gray-500 mb-1">La carte sera chargée ici</div>
                            <div className="text-lg font-semibold text-gray-700">Paris, France</div>
                            <div className="mt-3 grid grid-cols-3 gap-2 max-w-xs mx-auto">
                              <div className="bg-white p-2 rounded shadow text-xs">
                                Coordonnées:<br />48.8566° N, 2.3522° E
                              </div>
                              <div className="bg-white p-2 rounded shadow text-xs">
                                Zoom:<br />10x
                              </div>
                              <div className="bg-white p-2 rounded shadow text-xs">
                                Type:<br />Standard
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Marqueur simulé centré */}
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="text-red-500 animate-bounce">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="2">
                            <path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 text-sm">
                      Les cartes utilisent l'API Google Maps ou MapBox et peuvent être personnalisées avec vos propres styles
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Propriétés du composant */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Propriétés du composant Map</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-xs overflow-auto">
{`{
  "type": "map",
  "title": "Localisation de la chimère",
  "coordinates": {
    "lat": 48.8566,
    "lng": 2.3522
  },
  "zoom": 10,
  "markers": [
    {
      "id": "marker-1",
      "lat": 48.8566,
      "lng": 2.3522,
      "label": "Paris"
    }
  ],
  "mapStyle": "standard",
  "interactive": true
}`}
                  </pre>
                </div>
              </div>
              
              {/* Fonctionnalités avancées */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Fonctionnalités avancées</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Marqueurs personnalisables avec icônes et popups</li>
                  <li>Styles de carte personnalisables (standard, satellite, terrain)</li>
                  <li>Contrôles interactifs (zoom, déplacement)</li>
                  <li>Polygones et tracés pour délimiter des zones</li>
                  <li>Géocodage inversé pour afficher les adresses</li>
                </ul>
              </div>
              
              {/* Cas d'utilisation */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Cas d'utilisation</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-md">
                    <h4 className="font-medium text-blue-800">Origine des NFT</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Montrer l'origine géographique ou culturelle d'une chimère
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-md">
                    <h4 className="font-medium text-purple-800">Événements réels</h4>
                    <p className="text-xs text-purple-700 mt-1">
                      Lier votre NFT à des lieux d'exposition ou d'événements
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md">
                    <h4 className="font-medium text-green-800">Mondes virtuels</h4>
                    <p className="text-xs text-green-700 mt-1">
                      Créer des cartes de mondes imaginaires ou virtuels liés à vos NFT
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'podcast' && (
          <div>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium">Composant Podcast</h2>
              <p className="mt-1 text-sm text-gray-500">
                Intègre un lecteur audio avec chapitres et transcription
              </p>
            </div>
            
            <div className="p-6">
              {/* Aperçu du composant Podcast */}
              <div className="bg-gray-50 rounded-lg overflow-hidden mb-4 p-8">
                <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                  <div className="flex p-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-md flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium">L'histoire de cette Chimère</h3>
                      <p className="text-sm text-gray-500 mt-1">Par Studio Yhom • 24 min</p>
                      
                      <div className="mt-4">
                        <div className="h-1 bg-gray-200 rounded overflow-hidden">
                          <div className="bg-blue-500 h-full w-1/3"></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>8:12</span>
                          <span>24:00</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-center space-x-4">
                        <button className="p-2 rounded-full hover:bg-gray-100">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="19 20 9 12 19 4 19 20"></polygon>
                            <polygon points="9 20 0 12 9 4 9 20"></polygon>
                          </svg>
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polygon points="10 8 16 12 10 16 10 8"></polygon>
                          </svg>
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 4 15 12 5 20 5 4"></polygon>
                            <polygon points="19 5 19 19"></polygon>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium mb-2">Chapitres</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs bg-blue-50 p-2 rounded">
                        <span className="font-medium">Introduction</span>
                        <span className="text-gray-500">0:00</span>
                      </div>
                      <div className="flex justify-between text-xs p-2 rounded">
                        <span className="font-medium">Origines de la chimère</span>
                        <span className="text-gray-500">3:45</span>
                      </div>
                      <div className="flex justify-between text-xs p-2 rounded">
                        <span className="font-medium">Processus de création</span>
                        <span className="text-gray-500">12:20</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'wallet' && (
          <div>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium">Composant Wallet</h2>
              <p className="mt-1 text-sm text-gray-500">
                Affiche les informations d'un portefeuille crypto et ses NFTs
              </p>
            </div>
            
            <div className="p-6">
              {/* Aperçu du composant Wallet */}
              <div className="bg-gray-50 rounded-lg overflow-hidden mb-4 p-8">
                <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                  <div className="p-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Wallet Ethereum</h3>
                      <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                        Mainnet
                      </div>
                    </div>
                    <div className="mt-4 mb-1">
                      <div className="text-xs text-blue-100">Adresse</div>
                      <div className="text-sm font-mono mt-1 flex items-center">
                        <span className="truncate">0x7Cd6A0f87A1e9A401FF69C0618c1C24b979ABc89</span>
                        <button className="ml-2 p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Solde</div>
                        <div className="text-xl font-semibold">1.56 ETH</div>
                        <div className="text-xs text-gray-500">≈ $4,234.12 USD</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm">
                          Envoyer
                        </button>
                        <button className="px-3 py-1 bg-green-50 text-green-600 rounded-md text-sm">
                          Recevoir
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-5">
                      <h4 className="text-sm font-medium mb-2">NFTs possédés</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-100 rounded-md aspect-square flex items-center justify-center">
                          <div className="w-full h-full bg-gradient-to-br from-pink-300 to-purple-600 rounded-md"></div>
                        </div>
                        <div className="bg-gray-100 rounded-md aspect-square flex items-center justify-center">
                          <div className="w-full h-full bg-gradient-to-br from-blue-300 to-indigo-600 rounded-md"></div>
                        </div>
                        <div className="bg-gray-100 rounded-md aspect-square flex items-center justify-center">
                          <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-red-600 rounded-md"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}