import React from 'react';
import { GlobalStyle } from '@shared/schema';
import { Upload, Image, Music, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface UploadZonesPreviewComponentProps {
  selectedStyleId?: number;
}

export function UploadZonesPreviewComponent({ selectedStyleId }: UploadZonesPreviewComponentProps) {
  const { data: allStyles } = useQuery<GlobalStyle[]>({
    queryKey: ['/api/styles-global']
  });

  const selectedStyle = selectedStyleId 
    ? allStyles?.find(s => s.id === selectedStyleId)
    : allStyles?.find(s => s.category === 'typography' && s.name.includes('Upload') && s.isActive);

  console.log('UploadZonesPreviewComponent - Selected style:', selectedStyle);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">
            Prévisualisation Upload Zones - Style: {selectedStyle?.name || 'Auto'}
          </h4>
          <span className="text-xs text-gray-500 font-mono">
            {selectedStyle?.cssVariable}: {selectedStyle?.value}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {[
            { name: 'Images NFT', icon: Image, color: '#10b981', bg: '#f0fdf4' },
            { name: 'Audio', icon: Music, color: '#3b82f6', bg: '#eff6ff' },
            { name: 'Documents', icon: FileText, color: '#8b5cf6', bg: '#faf5ff' }
          ].map((zone) => {
            const Icon = zone.icon;
            return (
              <div
                key={zone.name}
                style={{
                  backgroundColor: zone.bg,
                  borderColor: zone.color,
                  color: zone.color,
                  fontSize: selectedStyle?.value ? `${selectedStyle.value}px !important` : '11px !important',
                  fontFamily: 'Roboto Mono, monospace !important',
                  fontWeight: '500 !important',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px dashed ${zone.color}`,
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  minWidth: '100px',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <Icon size={20} />
                <span>{zone.name}</span>
                <span style={{ fontSize: '9px', opacity: 0.7 }}>Glisser-déposer</span>
              </div>
            );
          })}
        </div>
        
        <div className="mt-3 text-xs text-gray-600">
          Debug: fontSize appliqué = {selectedStyle?.value ? `${selectedStyle.value}px` : '11px'}
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">Configuration Upload</h5>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div>Images: <span className="font-mono">JPG, PNG, SVG</span></div>
          <div>Audio: <span className="font-mono">MP3, WAV</span></div>
          <div>Documents: <span className="font-mono">PDF, TXT</span></div>
        </div>
      </div>
    </div>
  );
}