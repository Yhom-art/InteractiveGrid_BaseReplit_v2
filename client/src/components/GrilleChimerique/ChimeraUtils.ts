import { ContainerType } from '@/types/common';
import { Chimera } from '@shared/schema';


/**
 * Détermine le type de container en fonction de la chimère
 * @param chimera Chimère à analyser
 * @returns Type de container approprié
 */
export function getContainerTypeForChimera(chimera: Chimera): ContainerType {
  // Par défaut, utiliser le type de la chimère s'il existe
  if (chimera.type) {
    // Vérifier et convertir le type si nécessaire
    const typeStr = chimera.type.toUpperCase();
    
    if (typeStr === 'FREE') return ContainerType.FREE;
    if (typeStr === 'ADOPT') return ContainerType.ADOPT;
    if (typeStr === 'ADOPTED') return ContainerType.ADOPTED;
    if (typeStr === 'EDITORIAL') return ContainerType.EDITORIAL;
  }
  
  // Logique de détermination basée sur d'autres critères
  // Par exemple, les doublures avec un nom spécifique
  if (chimera.name.includes('DOUBLURE')) {
    if (chimera.name.endsWith('001') || chimera.name.endsWith('004')) {
      return ContainerType.FREE;
    } else if (chimera.name.endsWith('002') || chimera.name.endsWith('005')) {
      return ContainerType.ADOPT;
    } else if (chimera.name.endsWith('003') || chimera.name.endsWith('006')) {
      return ContainerType.ADOPTED;
    }
  }
  
  // Pour DALLIA, on sait qu'elle est de type FREE
  if (chimera.name === 'DALLIA') {
    return ContainerType.FREE;
  }
  
  // Pour Editorial spécifique (Yhom et Rencontres)
  if (chimera.name.includes('Yhom')) {
    return ContainerType.INACTIVE;
  }
  
  if (chimera.name.includes('Rencontres')) {
    return ContainerType.EDITORIAL;
  }
  
  // Par défaut, on renvoie FREE
  return ContainerType.FREE;
}



/**
 * Traite correctement l'URL d'une image pour l'affichage
 */
export function processImageUrl(url: string): string {
  if (!url) return '';
  
  // Si l'URL est une URL complète, la retourner telle quelle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  let cleanPath = url;
  
  // Nettoyer agressivement tous les préfixes d'admin, même répétés
  while (cleanPath.includes('/admin/')) {
    cleanPath = cleanPath.replace(/\/admin\/[^\/]*\//, '/');
    cleanPath = cleanPath.replace(/\/admin\//, '/');
  }
  
  // Supprimer le premier slash s'il existe
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  // Extraire la partie attached_assets si elle existe
  if (cleanPath.includes('attached_assets')) {
    const attachedIndex = cleanPath.indexOf('attached_assets');
    cleanPath = cleanPath.substring(attachedIndex);
  }
  
  // Si le chemin ne commence toujours pas par attached_assets et contient un fichier
  if (!cleanPath.startsWith('attached_assets') && cleanPath.includes('.')) {
    cleanPath = `attached_assets/Yhom_Doublures/${cleanPath}`;
  }
  
  // Construire une URL absolue pour éviter les intercepteurs de routage
  const origin = window.location.origin;
  return `${origin}/${cleanPath}`;
}

/**
 * Obtient l'URL de l'image à partir de l'objet Chimera
 * Gère à la fois imageUrl et image_url selon ce qui est disponible
 */
export function getChimeraImageUrl(chimera: any): string {
  if (!chimera) return '';
  
  // Tester d'abord image_url (nom de la colonne en base)
  if (chimera.image_url) {
    return processImageUrl(chimera.image_url);
  }
  
  // Ensuite tester imageUrl (nom du champ dans l'interface TypeScript)
  if (chimera.imageUrl) {
    return processImageUrl(chimera.imageUrl);
  }
  
  return '';
}