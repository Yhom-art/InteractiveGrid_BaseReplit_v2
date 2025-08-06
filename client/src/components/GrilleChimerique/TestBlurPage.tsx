import React from 'react';
import { TestBlurContainer } from './TestBlurContainer';

/**
 * Page de test pour l'animation avec effet de flou
 */
export function TestBlurPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-8">Test de l'animation avec effet de flou</h1>
      
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-lg font-medium mb-2">Container standard</h2>
          <TestBlurContainer name="DOUBLURE_008" />
        </div>
        
        <div>
          <h2 className="text-lg font-medium mb-2">Container avec nom plus long</h2>
          <TestBlurContainer name="CHIMERE_LONGUE" />
        </div>
        
        <div>
          <h2 className="text-lg font-medium mb-2">Container avec nom court</h2>
          <TestBlurContainer name="NFT" />
        </div>
      </div>
      
      <div className="mt-8 text-sm">
        <p>Survolez les containers pour voir l'animation</p>
      </div>
    </div>
  );
}

export default TestBlurPage;