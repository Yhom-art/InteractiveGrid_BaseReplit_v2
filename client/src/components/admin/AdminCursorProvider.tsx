import React from 'react';
import { CustomCursorV2 } from '@/components/CustomCursorV2';

interface AdminCursorProviderProps {
  children: React.ReactNode;
}

/**
 * Provider qui applique automatiquement le curseur Admin sur toutes les pages d'administration
 */
export function AdminCursorProvider({ children }: AdminCursorProviderProps) {
  return (
    <div data-cursor-type="navigation" style={{ cursor: 'none', minHeight: '100vh' }}>
      <CustomCursorV2 forceAdminMode={true} />
      {children}
    </div>
  );
}