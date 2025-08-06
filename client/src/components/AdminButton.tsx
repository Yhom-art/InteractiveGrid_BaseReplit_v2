import React, { useState } from 'react';
import { Link } from 'wouter';

/**
 * Bouton discret pour accéder à l'interface d'administration 
 * Accessible depuis les pages principales de la grille
 */
export function AdminButton() {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      className="fixed bottom-4 right-4 z-50"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* Bouton principal */}
      <div className="relative">
        <button
          className={`w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-lg
                    transition-opacity duration-300 ${isVisible ? 'opacity-90' : 'opacity-30'}`}
          aria-label="Administration"
          title="Accéder à l'administration"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        
        {/* Menu contextuel */}
        <div 
          className={`absolute bottom-14 right-0 bg-white rounded-lg shadow-xl transition-all duration-300 
                    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
        >
          <div className="py-2 w-44">
            <Link href="/admin/dashboard">
              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Tableau de bord
              </a>
            </Link>
            <Link href="/admin/chimeras">
              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Fiches Chimères
              </a>
            </Link>
            <Link href="/admin/editorials">
              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Éléments Éditoriaux
              </a>
            </Link>
            <Link href="/admin/grid">
              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Configuration Grille
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}