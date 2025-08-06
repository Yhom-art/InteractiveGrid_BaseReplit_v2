import React from 'react';
import { GlobalStyle } from '@shared/schema';
import { Save, Download, Plus, Edit3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface ButtonsPreviewComponentProps {
  selectedStyleId?: number;
}

export function ButtonsPreviewComponent({ selectedStyleId }: ButtonsPreviewComponentProps) {
  const { data: allStyles } = useQuery<GlobalStyle[]>({
    queryKey: ['/api/styles-global']
  });

  const selectedStyle = selectedStyleId 
    ? allStyles?.find(s => s.id === selectedStyleId)
    : allStyles?.find(s => s.category === 'typography' && s.name.includes('Button') && s.isActive);

  console.log('ButtonsPreviewComponent - Selected style:', selectedStyle);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">
            Prévisualisation Boutons - Style: {selectedStyle?.name || 'Auto'}
          </h4>
          <span className="text-xs text-gray-500 font-mono">
            {selectedStyle?.cssVariable}: {selectedStyle?.value}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Sauvegarder', icon: Save, color: '#10b981' },
            { name: 'Télécharger', icon: Download, color: '#3b82f6' },
            { name: 'Ajouter', icon: Plus, color: '#8b5cf6' },
            { name: 'Modifier', icon: Edit3, color: '#f59e0b' }
          ].map((button, index) => {
            const Icon = button.icon;
            return (
              <button
                key={button.name}
                style={{
                  backgroundColor: button.color,
                  color: 'white',
                  fontSize: selectedStyle?.value ? `${selectedStyle.value}px !important` : '12px !important',
                  fontFamily: 'Roboto Mono, monospace !important',
                  fontWeight: '500 !important',
                  padding: selectedStyle?.value ? 
                    (parseInt(selectedStyle.value) <= 10 ? '4px 8px' : 
                     parseInt(selectedStyle.value) <= 12 ? '6px 12px' : '8px 16px') : 
                    '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                <Icon size={14} />
                {button.name}
              </button>
            );
          })}
        </div>
        
        <div className="mt-3 text-xs text-gray-600">
          Debug: fontSize appliqué = {selectedStyle?.value ? `${selectedStyle.value}px` : '12px'}
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">Configuration Actions</h5>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Sauvegarder: <span className="font-mono">#10b981</span></div>
          <div>Télécharger: <span className="font-mono">#3b82f6</span></div>
          <div>Ajouter: <span className="font-mono">#8b5cf6</span></div>
          <div>Modifier: <span className="font-mono">#f59e0b</span></div>
        </div>
      </div>
    </div>
  );
}