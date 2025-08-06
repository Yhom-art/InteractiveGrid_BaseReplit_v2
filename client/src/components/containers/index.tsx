import React from 'react';
import { ContainerBase, ContainerBaseProps } from './ContainerBase';
import { ContainerOne } from './ContainerOne';
import { ContainerOneoneUp } from './ContainerOneoneUp';
import { ContainerOneoneDown } from './ContainerOneoneDown';
import { ContainerOnehalfDown } from './ContainerOnehalfDown';
import { ContainerType } from '@/types/common';

// Factory pour créer le bon type de container
export function ContainerFactory(props: ContainerBaseProps) {
  // Sélectionner le composant container en fonction du type
  switch (props.type) {
    case ContainerType.FREE:
      return <ContainerOneoneUp {...props} />;
      
    case ContainerType.ADOPTED:
      return <ContainerOneoneDown {...props} />;
      
    case ContainerType.ADOPT:
      return <ContainerOnehalfDown {...props} />;
    
    case ContainerType.EDITORIAL:
      // Pour le moment, on utilise le container de base
      return <ContainerOne {...props} />;
      
    default:
      // Fallback sur le container de base
      return <ContainerOne {...props} />;
  }
}

// Exporter tous les composants containers
export {
  ContainerBase,
  ContainerOne,
  ContainerOneoneUp,
  ContainerOneoneDown,
  ContainerOnehalfDown
};