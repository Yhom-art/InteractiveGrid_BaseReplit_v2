import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from './AdminLayout';
import { PanelBuilderV2 } from '@/components/panel-builder/PanelBuilderV2';

/**
 * Page d'administration pour créer/éditer un panel avec différents composants
 */
export function PanelEditPage() {
  const { id, itemType, itemId } = useParams<{ id: string; itemType: string; itemId: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const isNewPanel = id === 'new';
  
  // Déterminer de quel type d'élément il s'agit (chimère ou éditorial)
  const chimeraId = itemType === 'chimera' ? parseInt(itemId) : undefined;
  const editorialId = itemType === 'editorial' ? parseInt(itemId) : undefined;
  
  // Charger les données du panel existant si en mode édition
  const panelQuery = useQuery({
    queryKey: [`/api/panels/${id}`],
    enabled: !isNewPanel && id !== 'undefined',
  });
  
  // Charger les données de la chimère ou de l'éditorial associé
  const itemQuery = useQuery({
    queryKey: [`/api/${itemType}s/${itemId}`],
    enabled: !!itemType && !!itemId,
  });
  
  // Mutation pour créer/mettre à jour un panel
  const savePanelMutation = useMutation({
    mutationFn: async (panelData: any) => {
      console.log("Préparation à la sauvegarde du panel:", isNewPanel ? "nouveau panel" : `panel ${id}`);
      console.log("Données à envoyer:", panelData);
      
      const url = isNewPanel ? '/api/panels' : `/api/panels/${id}`;
      const method = isNewPanel ? 'POST' : 'PUT';
      
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(panelData)
        });
        
        // Récupérer le texte brut de la réponse
        const responseText = await response.text();
        
        // Si la réponse n'est pas OK, logger l'erreur et la rejeter
        if (!response.ok) {
          console.error(`Erreur (${response.status}) lors de la sauvegarde:`, responseText);
          
          // Essayer de parser le JSON si possible
          let errorMessage = 'Erreur lors de la sauvegarde du panel';
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // Si le parsing échoue, utiliser le texte brut
            errorMessage = responseText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }
        
        // Essayer de parser la réponse JSON
        let responseData;
        try {
          responseData = JSON.parse(responseText);
          console.log("Panel sauvegardé avec succès:", responseData);
        } catch (e) {
          console.error("Erreur lors du parsing de la réponse:", e);
          throw new Error("Réponse de serveur invalide");
        }
        
        return responseData;
      } catch (error) {
        console.error("Erreur lors de la requête:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Panel sauvegardé avec succès, ID:", data.id);
      
      // Invalider les requêtes pour actualiser les données
      queryClient.invalidateQueries({ queryKey: ['/api/panels'] });
      queryClient.invalidateQueries({ queryKey: [`/api/panels?${itemType}Id=${itemId}`] });
      
      if (!isNewPanel) {
        queryClient.invalidateQueries({ queryKey: [`/api/panels/${id}`] });
      }
      
      // Afficher un toast de succès
      // Si vous avez un système de toast, ajoutez-le ici
      
      // Redirection vers la liste des panels
      setLocation(`/admin/${itemType}s/${itemId}/panels`);
    },
    onError: (error) => {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  });
  
  // Gérer la soumission du formulaire
  const handleSavePanel = (panelData: any) => {
    savePanelMutation.mutate(panelData);
  };
  
  // Gérer l'annulation
  const handleCancel = () => {
    setLocation(`/admin/${itemType}s/${itemId}/panels`);
  };
  
  // Afficher un état de chargement
  if (!isNewPanel && panelQuery.isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Chargement du panel...</p>
        </div>
      </AdminLayout>
    );
  }
  
  // Afficher un message d'erreur si le chargement échoue
  if (!isNewPanel && panelQuery.error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Erreur lors du chargement du panel. Veuillez réessayer.</p>
        </div>
      </AdminLayout>
    );
  }
  
  // Titre de la page selon le contexte
  const getPageTitle = () => {
    if (isNewPanel) {
      if (itemQuery.data) {
        return `Nouveau panel pour ${itemQuery.data.name || itemType}`;
      } else {
        return 'Nouveau panel';
      }
    } else {
      return `Modifier le panel: ${panelQuery.data?.title || ''}`;
    }
  };
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
        {savePanelMutation.isPending && (
          <div className="mt-2 text-blue-600">
            Sauvegarde en cours...
          </div>
        )}
        {savePanelMutation.isError && (
          <div className="mt-2 text-red-600">
            Erreur: {(savePanelMutation.error as Error).message}
          </div>
        )}
      </div>
      
      <PanelBuilderV2
        panelId={isNewPanel ? undefined : parseInt(id)}
        chimeraId={chimeraId}
        editorialId={editorialId}
        onSave={handleSavePanel}
        onCancel={handleCancel}
      />
    </AdminLayout>
  );
}