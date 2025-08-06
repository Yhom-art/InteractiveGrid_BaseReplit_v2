import React from 'react';
import { ChimereData } from '@/types/chimereTypes';

interface InfoPanelProps {
  chimereData: ChimereData;
}

export function InfoPanel({ chimereData }: InfoPanelProps) {
  return (
    <div className="p-4">
      <div className="flex mb-4">
        <div className="w-1/3">
          <img 
            src={chimereData.imageUrl} 
            alt={chimereData.name} 
            className="w-full h-auto rounded-lg shadow-md"
            onError={(e) => {
              console.error("Erreur de chargement d'image:", chimereData.imageUrl);
              // Ne pas remplacer par une image par défaut
              e.currentTarget.onerror = null;
            }}
          />
        </div>
        <div className="w-2/3 pl-4">
          <h4 className="text-lg font-semibold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
            {chimereData.name}
          </h4>
          <p className="text-xs text-gray-500 mb-2">Ref: {chimereData.reference}</p>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              chimereData.type === 'adopt' ? 'bg-green-100 text-green-800' :
              chimereData.type === 'adopted' ? 'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {chimereData.type.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h5 className="font-medium mb-2">Description</h5>
        <p className="text-sm text-gray-700 mb-4">
          {chimereData.description}
        </p>
        
        {chimereData.administratedContent?.body && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h6 className="text-sm font-medium mb-1">{chimereData.administratedContent.title || 'Note'}</h6>
            <p className="text-xs text-gray-600">{chimereData.administratedContent.body}</p>
            {chimereData.administratedContent.lastUpdate && (
              <p className="text-xs text-gray-400 mt-2">
                Mis à jour le {chimereData.administratedContent.lastUpdate}
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <h5 className="font-medium mb-2">Indicateurs</h5>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${chimereData.indicators.rarity}%` }}></div>
            </div>
            <span className="text-xs">Rareté</span>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full" 
                style={{ width: `${chimereData.indicators.popularity}%` }}></div>
            </div>
            <span className="text-xs">Popularité</span>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-600 h-2.5 rounded-full" 
                style={{ width: `${chimereData.indicators.activity}%` }}></div>
            </div>
            <span className="text-xs">Activité</span>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
              <div className="bg-gradient-to-r from-pink-500 to-rose-600 h-2.5 rounded-full" 
                style={{ width: `${chimereData.indicators.energy}%` }}></div>
            </div>
            <span className="text-xs">Énergie</span>
          </div>
        </div>
      </div>
      
      {chimereData.administratedContent?.tags && chimereData.administratedContent.tags.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-1">
            {chimereData.administratedContent.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}