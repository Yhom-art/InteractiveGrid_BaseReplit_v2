import { useState } from "react";
import { CursorType } from "@/types/common";

/**
 * Hook pour gérer les curseurs personnalisés - SYSTÈME V1 DÉSACTIVÉ
 * Remplacé par le système V2 dans useCursorV2.ts
 */
export function useCursorManager() {
  // Retourner seulement GRAB pour éviter les conflits avec le système V2
  return {
    currentCursor: CursorType.GRAB,
    setCurrentCursor: () => {},
    isGrabbing: false,
    setIsGrabbing: () => {}
  };
}