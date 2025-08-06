import React from 'react';
import { Link } from 'wouter';

export default function AdminDashboardPage() {
  return (
    <>
      {/* Admin utilise le curseur générique global */}
    
      <div className="min-h-screen bg-[#F0F0F0] p-8" style={{ fontFamily: 'Roboto Mono, monospace' }}>
        <div className="max-w-4xl mx-auto">
          {/* En-tête avec navigation intégrée */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
                <span className="mr-2">←</span>
                Retour à l'accueil
              </button>
            </Link>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Administration</h1>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm">Grille Chimérique</span>
            </div>
            
            {/* Menu navigation admin propre */}
            <div className="flex gap-2">
              <Link href="/v2">
                <button className="px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer text-sm">
                  V2 Live
                </button>
              </Link>
              <Link href="/v1">
                <button className="px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer text-sm">
                  V1 Archive
                </button>
              </Link>
            </div>
          </div>

          {/* Grilles de contrôle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Section Grille V2 */}
            <div className="bg-white border border-gray-300 p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Grille V2 - Administration</h2>
              <div className="space-y-3">
                <Link href="/admin/grid-rules">
                  <div className="p-4 border border-gray-200 hover:border-gray-400 transition-all cursor-pointer">
                    <h4 className="font-medium text-gray-800">Règles & POC 5x5</h4>
                    <p className="text-sm text-gray-600">Distribution spirale, tests</p>
                  </div>
                </Link>
                
                <Link href="/v2">
                  <div className="p-4 border border-gray-200 hover:border-gray-400 transition-all cursor-pointer">
                    <h4 className="font-medium text-gray-800">Grille V2 Live</h4>
                    <p className="text-sm text-gray-600">32x32 Mode Map</p>
                  </div>
                </Link>
                
                <Link href="/admin/cursors">
                  <div className="p-4 border border-gray-200 hover:border-gray-400 transition-all cursor-pointer">
                    <h4 className="font-medium text-gray-800">Admin Curseurs</h4>
                    <p className="text-sm text-gray-600">Gestion curseurs dynamiques</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Section Contenus */}
            <div className="bg-white border border-gray-300 p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Contenus & Données</h2>
              <div className="space-y-3">
                <Link href="/admin/chimeras">
                  <div className="p-4 border border-gray-200 hover:border-gray-400 transition-all cursor-pointer">
                    <h4 className="font-medium text-gray-800">Chimères NFT</h4>
                    <p className="text-sm text-gray-600">Fiches fantômes</p>
                  </div>
                </Link>
                
                <Link href="/admin/music-containers">
                  <div className="p-4 border border-gray-200 hover:border-gray-400 transition-all cursor-pointer">
                    <h4 className="font-medium text-gray-800">Containers Musicaux</h4>
                    <p className="text-sm text-gray-600">Audio et visualisation</p>
                  </div>
                </Link>
                
                <Link href="/admin/editorials">
                  <div className="p-4 border border-gray-200 hover:border-gray-400 transition-all cursor-pointer">
                    <h4 className="font-medium text-gray-800">Éditoriaux</h4>
                    <p className="text-sm text-gray-600">Contenus informatifs</p>
                  </div>
                </Link>
              </div>
            </div>

          </div>

          {/* Informations système */}
          <div className="mt-8 bg-white border border-gray-300 p-6">
            <h3 className="font-semibold mb-3">Informations Techniques :</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Version :</span> V2.0 - Architecture Unifiée
              </div>
              <div>
                <span className="font-medium">Grille :</span> 32x32 (1024 containers)
              </div>
              <div>
                <span className="font-medium">Distribution :</span> Spirale depuis centre (16,16)
              </div>
              <div>
                <span className="font-medium">Expansion :</span> ONE, ONE_ONE_UP, ONE_AND_HALF_DWN, ONE_ONE_DWN
              </div>
              <div>
                <span className="font-medium">Interface :</span> Mode Map pur (sans cadres)
              </div>
              <div>
                <span className="font-medium">Navigation :</span> clickGrab + curseurs système
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}