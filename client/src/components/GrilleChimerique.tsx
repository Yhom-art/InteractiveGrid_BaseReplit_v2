import { useState, useEffect, useRef } from "react";
import { ContainerState, ContainerType, CursorType } from "@/types/common";

// Version simplifiée de la GrilleChimerique pour permettre au POC de fonctionner
export function GrilleChimerique() {
  // Rendu d'un message pour rediriger vers le POC
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Grille Chimérique</h1>
      <p className="mb-8">Cette version est en maintenance.</p>
      <p>
        Veuillez consulter la version POC à{" "}
        <a href="/grid-panel-poc" className="text-blue-500 underline">
          cette adresse
        </a>
      </p>
    </div>
  );
}