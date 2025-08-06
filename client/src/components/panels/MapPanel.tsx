import React from 'react';
import { GeoLocation } from '@/types/chimereTypes';

interface MapPanelProps {
  location?: GeoLocation;
}

export function MapPanel({ location }: MapPanelProps) {
  if (!location) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full">
        <div className="p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Pas de localisation</h3>
          <p className="text-sm text-gray-500">
            Cette Chimère n'a pas de localisation associée.
          </p>
        </div>
      </div>
    );
  }

  // Créer une URL Google Maps vers cette localisation
  const googleMapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  
  // Générer une URL pour une image de carte statique
  const mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=14&size=400x200&markers=color:red%7C${location.latitude},${location.longitude}&key=YOUR_API_KEY`;
  
  // En remplacement de l'image de carte, nous utilisons une div stylisée
  // (puisque nous n'avons pas de clé API Google Maps)
  const mapPlaceholderStyle = {
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'20\' height=\'20\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 0 10 L 20 10 M 10 0 L 10 20\' stroke=\'%23E2E8F0\' stroke-width=\'1\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%23F7FAFC\'/%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")',
    backgroundColor: '#EBF4FF',
    position: 'relative' as const,
  };

  return (
    <div className="p-4">
      <h4 className="text-md font-medium mb-3">Localisation</h4>
      
      <div className="rounded-lg overflow-hidden border border-gray-200 mb-4">
        {/* Image de carte placeholder */}
        <div style={mapPlaceholderStyle} className="h-48 flex justify-center items-center">
          <div className="absolute">
            <div className="relative">
              <div className="w-6 h-6 bg-red-500 rounded-full flex justify-center items-center animate-pulse">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              </div>
              <div className="absolute bottom-0 left-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-red-500 transform translate-y-full"></div>
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-white px-2 py-1 text-xs shadow rounded">
            Carte interactive non disponible
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Coordonnées</p>
          <div className="flex items-center bg-gray-50 p-2 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm font-mono">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </p>
          </div>
        </div>
        
        {location.name && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Lieu</p>
            <p className="text-sm font-medium text-gray-800">{location.name}</p>
          </div>
        )}
        
        {location.description && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Description</p>
            <p className="text-sm text-gray-700">{location.description}</p>
          </div>
        )}
        
        <div className="pt-2">
          <a 
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ouvrir dans Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}