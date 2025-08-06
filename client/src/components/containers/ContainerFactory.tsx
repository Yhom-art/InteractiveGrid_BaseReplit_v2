import React from 'react';
import { ContainerType, ContainerState } from '@/types/common';
import { ContainerBase, ContainerBaseProps } from './ContainerBase';
import { ContainerOne } from './ContainerOne';
import { ContainerOneoneUp } from './ContainerOneoneUp';
import { ContainerOneoneDown } from './ContainerOneoneDown';
import { ContainerOnehalfDown } from './ContainerOnehalfDown';

/**
 * ContainerFactory - Composant qui sélectionne le bon type de container à afficher
 * en fonction du type et de l'état du container.
 */
export function ContainerFactory(props: ContainerBaseProps) {
  const { type, state } = props;

  // Si le container est fermé, ContainerBase gère ce cas
  if (state === ContainerState.CLOSED) {
    return <ContainerBase {...props} />;
  }

  // Sinon, sélectionner le bon composant selon le type et l'état
  if (state === ContainerState.FREE && type === ContainerType.FREE) {
    // Pour FREE, utiliser le container qui s'étend vers le haut
    return <ContainerOneoneUp {...props} />;
  } 
  else if (state === ContainerState.ADOPTED && type === ContainerType.ADOPTED) {
    // Pour ADOPTED, utiliser le container qui s'étend vers le bas
    return <ContainerOneoneDown {...props} />;
  } 
  else if (state === ContainerState.ADOPT && type === ContainerType.ADOPT) {
    // Pour ADOPT, utiliser le container avec demi-extension vers le bas
    return <ContainerOnehalfDown {...props} />;
  }
  else {
    // Par défaut ou pour EDITORIAL, utiliser le container simple
    return <ContainerOne {...props} />;
  }
}