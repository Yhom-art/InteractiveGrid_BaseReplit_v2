import React, { useState } from 'react';
import { AudioContent } from '@/types/chimereTypes';

interface AudioPanelProps {
  audioContent: AudioContent[];
}

export function AudioPanel({ audioContent }: AudioPanelProps) {
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!audioContent || audioContent.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full">
        <div className="p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Pas de contenu audio</h3>
          <p className="text-sm text-gray-500">
            Cette Chimère n'a pas de contenu audio associé.
          </p>
        </div>
      </div>
    );
  }

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = (id: string) => {
    if (activeAudio === id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveAudio(id);
      setIsPlaying(true);
    }
  };

  return (
    <div className="p-4">
      <h4 className="text-md font-medium mb-3">Contenu Audio</h4>
      
      <div className="space-y-3">
        {audioContent.map((audio) => (
          <div 
            key={audio.id}
            className={`p-3 rounded-lg border ${
              activeAudio === audio.id 
              ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200' 
              : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-sm font-medium">{audio.title}</h5>
                {audio.artist && (
                  <p className="text-xs text-gray-500">{audio.artist}</p>
                )}
              </div>
              
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-2">{formatTime(audio.duration)}</span>
                <button 
                  onClick={() => handlePlayPause(audio.id)}
                  className={`p-2 rounded-full ${
                    activeAudio === audio.id && isPlaying
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {activeAudio === audio.id && isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {activeAudio === audio.id && (
              <div className="mt-3">
                <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5"
                    style={{ width: isPlaying ? '35%' : '0%' }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {isPlaying ? '01:23' : '00:00'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(audio.duration)}
                  </span>
                </div>
              </div>
            )}
            
            <div className="mt-2 flex items-center">
              <span className={`text-xs rounded-full px-2 py-0.5 ${
                audio.type === 'podcast' ? 'bg-blue-100 text-blue-800' :
                audio.type === 'sample' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {audio.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}