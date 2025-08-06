import React from 'react';
import { useCursorV2 } from '@/hooks/useCursorV2';

interface CustomCursorV2Props {
  forceAdminMode?: boolean;
}

export function CustomCursorV2({ forceAdminMode = false }: CustomCursorV2Props) {
  const { activeCursor, position, isVisible } = useCursorV2(forceAdminMode);

  if (!isVisible || !activeCursor) {
    return null;
  }

  return (
    <div
      className="fixed cursor-v2-container z-[99999999]"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <img
        src={activeCursor.assetPath}
        alt={activeCursor.name}
        className="cursor-v2-image"
        draggable={false}
      />
    </div>
  );
}