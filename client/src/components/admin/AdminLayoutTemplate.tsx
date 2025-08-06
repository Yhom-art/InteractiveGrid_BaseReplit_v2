import React from 'react';

type LayoutType = '1-3' | '1-2-1' | '4-cols' | '3-1' | '2-2';

interface AdminLayoutTemplateProps {
  leftColumn?: React.ReactNode;
  middleColumn?: React.ReactNode;
  rightColumn?: React.ReactNode;
  children: React.ReactNode;
  layout?: LayoutType;
}

export function AdminLayoutTemplate({ 
  leftColumn, 
  middleColumn, 
  rightColumn, 
  children, 
  layout = '1-3' 
}: AdminLayoutTemplateProps) {
  
  // Layout 1/4 - 3/4 (défaut - Header Template, Curseurs)
  if (layout === '1-3') {
    return (
      <div className="grid grid-cols-4 gap-6 mt-6 mx-6 mb-6">
        <div className="col-span-1 space-y-4">
          {leftColumn}
        </div>
        <div className="col-span-3">
          {children}
        </div>
      </div>
    );
  }
  
  // Layout 1/4 - 2/4 - 1/4 (Grid Distribution)
  if (layout === '1-2-1') {
    return (
      <div className="grid grid-cols-4 gap-6 mt-6 mx-6 mb-6">
        <div className="col-span-1 space-y-4">
          {leftColumn}
        </div>
        <div className="col-span-2">
          {children}
        </div>
        <div className="col-span-1 space-y-4">
          {rightColumn}
        </div>
      </div>
    );
  }
  
  // Layout 3/4 - 1/4 (Curseurs avec colonne droite)
  if (layout === '3-1') {
    return (
      <div className="grid grid-cols-4 gap-6 mt-6 mx-6 mb-6">
        <div className="col-span-3 space-y-6">
          {children}
        </div>
        <div className="col-span-1 space-y-4">
          {rightColumn}
        </div>
      </div>
    );
  }

  // Layout 4 colonnes égales (listes NFT)
  if (layout === '4-cols') {
    return (
      <div className="grid grid-cols-4 gap-6 mt-6 mx-6 mb-6">
        {children}
      </div>
    );
  }

  // Layout 2-2 (50%-50%)
  if (layout === '2-2') {
    return (
      <div className="grid grid-cols-2 gap-6 mt-6 mx-6 mb-6">
        <div className="space-y-4">
          {leftColumn}
        </div>
        <div className="space-y-4">
          {rightColumn}
        </div>
      </div>
    );
  }
  
  return null;
}