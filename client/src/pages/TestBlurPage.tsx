import React, { useState } from 'react';
import { WhereIsAnimation } from '../components/GrilleChimerique/WhereIsAnimation';

/**
 * Page de test pour l'animation de flou sur le texte WHERE IS
 */
export function TestBlurPage() {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Animation Blur - WHERE IS ?</h1>
      
      {/* Instructions */}
      <div className="mb-6 p-4 bg-gray-100 rounded-md">
        <h2 className="font-bold mb-2">Instructions:</h2>
        <ul className="list-disc pl-5">
          <li>Survolez la boîte ci-dessous pour voir l'animation complète</li>
          <li>Observez les transitions entre les états et le comportement du flou</li>
          <li>Le texte alterne entre WHERE IS ? et DOUBLURE_008</li>
        </ul>
      </div>
      
      {/* Conteneur de test */}
      <div 
        className="border-2 border-yellow-500 bg-white w-32 h-32 flex items-center justify-center cursor-pointer mb-6"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <WhereIsAnimation name="DOUBLURE_008" isVisible={isHovering} />
      </div>
      
      {/* Statut actuel */}
      <div className="mt-4">
        <p className="text-sm">
          <strong>État actuel:</strong> {isHovering ? 'Survolé' : 'Normal'}
        </p>
      </div>
    </div>
  );
}

export default TestBlurPage;