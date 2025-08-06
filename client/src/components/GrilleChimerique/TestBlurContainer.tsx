import React, { useState } from 'react';
import { BlurWhereIsAnimation } from './BlurWhereIsAnimation.jsx';

interface TestBlurContainerProps {
  name?: string;
}

/**
 * Container de test pour l'animation avec effet de flou
 */
export function TestBlurContainer({ name = "DOUBLURE_TEST" }: TestBlurContainerProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative w-[128px] h-[128px] border border-gray-300 bg-white cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full h-full">
        <BlurWhereIsAnimation 
          name={name}
          isVisible={isHovered}
        />
      </div>
    </div>
  );
}

export default TestBlurContainer;