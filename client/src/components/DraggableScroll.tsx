import React, { useRef, useEffect } from 'react';

interface DraggableScrollProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const DraggableScroll: React.FC<DraggableScrollProps> = ({ 
  children, 
  className = '', 
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startY.current = e.clientY;
    scrollTop.current = containerRef.current?.scrollTop || 0;
    
    // Changer le curseur pour montrer qu'on est en train de glisser
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
    
    // Empêcher la sélection de texte pendant le glisser
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaY = e.clientY - startY.current;
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollTop.current - deltaY;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    
    // Remettre le curseur normal
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  useEffect(() => {
    // Ajouter les écouteurs d'événements au document pour continuer à suivre
    // même si la souris sort de la zone
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`draggable-scroll ${className}`}
      style={{ 
        overflow: 'auto', 
        cursor: 'grab',
        userSelect: 'none',
        ...style 
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
};