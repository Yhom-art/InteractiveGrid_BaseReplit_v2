import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { containerTypeEnum, insertEditorialSchema } from '@shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Page de création d'élément éditorial (distincte de la page d'édition)
export function EditorialCreatePage() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  console.log("Mode CRÉATION: Création d'un nouvel élément éditorial");
  
  // États de feedback
  const [formStatus, setFormStatus] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);
  
  // Prévisualisation
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');
  
  // Extension du schéma pour inclure des validations UI spécifiques
  const editorialSchema = insertEditorialSchema.extend({
    // Champs obligatoires avec messages d'erreur
    name: z.string().min(1, { message: "Le nom est requis" }),
    // La référence sera générée automatiquement à partir du nom
    reference: z.string().optional(),
    description: z.string().min(1, { message: "La description est requise" }),
    imageUrl: z.string().min(1, { message: "L'URL de l'image est requise" }),
    creator: z.string().min(1, { message: "Le créateur est requis" }),
  });
  
  // Type dérivé du schéma de validation
  type EditorialFormValues = z.infer<typeof editorialSchema>;
  
  // Configuration du formulaire avec react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<EditorialFormValues>({
    resolver: zodResolver(editorialSchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      type: 'EDITORIAL', // Par défaut pour les éléments éditoriaux
      externalUrl: '',
      videoUrl: '',
      creator: 'Admin', // Valeur par défaut
    }
  });
  
  // Observer les changements d'URL d'image pour la prévisualisation
  const watchImageUrl = watch('imageUrl');
  
  React.useEffect(() => {
    if (watchImageUrl) {
      // Traitement de l'URL pour la prévisualisation
      let processedUrl = watchImageUrl;
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        const cleanPath = processedUrl.startsWith('/') ? processedUrl.substring(1) : processedUrl;
        processedUrl = `/${cleanPath}`;
      }
      setPreviewImageUrl(processedUrl);
    } else {
      setPreviewImageUrl('');
    }
  }, [watchImageUrl]);
  
  // Mutation pour créer un nouvel élément éditorial
  const createMutation = useMutation({
    mutationFn: async (data: EditorialFormValues) => {
      console.log("Données envoyées au serveur:", data);
      
      // Génération automatique de la référence à partir du nom
      const reference = `EDITO_${data.name.replace(/\s+/g, '_').toUpperCase()}_${Date.now().toString().slice(-6)}`;
      
      // On s'assure que le type est bien défini
      const dataToSend = {
        ...data,
        reference,
        type: 'EDITORIAL'
      };
      
      console.log("Données finales envoyées:", dataToSend);
      
      const response = await fetch('/api/editorials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur serveur:", errorData);
        throw new Error(errorData.error || "Erreur lors de la création");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      setFormStatus({
        message: "Élément éditorial créé avec succès!",
        isError: false
      });
      queryClient.invalidateQueries({ queryKey: ['/api/editorials'] });
      setTimeout(() => setLocation('/admin/editorials'), 1500);
    },
    onError: (error: Error) => {
      setFormStatus({
        message: `Erreur: ${error.message}`,
        isError: true
      });
    }
  });
  
  // Fonction de soumission du formulaire (uniquement création)
  const onSubmit = async (data: EditorialFormValues) => {
    console.log("Soumission du formulaire avec les données:", data);
    createMutation.mutate(data);
  };
  
  // Suggestion d'utilisation des images disponibles
  const suggestImage = (imagePath: string) => {
    setValue('imageUrl', imagePath);
  };
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-mono font-normal">
              Nouvel Élément Éditorial
            </h1>
            <p className="text-gray-600 font-mono text-xs">
              Créer un nouvel élément visuel pour la grille
            </p>
          </div>
          <button
            onClick={() => setLocation('/admin/editorials')}
            className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-mono"
          >
            Retour à la liste
          </button>
        </div>
      </div>
      
      {/* Feedback de soumission du formulaire */}
      {formStatus && (
        <div className={`p-4 mb-6 font-mono text-xs ${
          formStatus.isError 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          <p>{formStatus.message}</p>
        </div>
      )}
      
      {/* Formulaire principal */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colonne gauche: informations principales */}
          <div>
            <h2 className="font-mono text-base mb-4">Informations</h2>
            
            {/* Nom */}
            <div className="mb-4">
              <label className="block font-mono text-xs text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 font-mono text-xs"
                placeholder="Nom de l'élément éditorial"
              />
              {errors.name && (
                <p className="text-red-600 text-[10px] mt-1 font-mono">{errors.name.message}</p>
              )}
            </div>
            
            {/* Type (fixé à EDITORIAL) */}
            <div className="mb-4">
              <label className="block font-mono text-xs text-gray-700 mb-1">
                Type
              </label>
              <input
                type="text"
                value="EDITORIAL"
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 font-mono text-xs"
              />
              <input type="hidden" {...register('type')} value="EDITORIAL" />
            </div>
            
            {/* Créateur */}
            <div className="mb-4">
              <label className="block font-mono text-xs text-gray-700 mb-1">
                Créateur *
              </label>
              <input
                type="text"
                {...register('creator')}
                className="w-full px-3 py-2 border border-gray-300 font-mono text-xs"
                placeholder="Nom du créateur"
              />
              {errors.creator && (
                <p className="text-red-600 text-[10px] mt-1 font-mono">{errors.creator.message}</p>
              )}
            </div>
            
            {/* Description */}
            <div className="mb-4">
              <label className="block font-mono text-xs text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                {...register('description')}
                className="w-full px-3 py-2 border border-gray-300 font-mono text-xs"
                rows={4}
                placeholder="Description de l'élément éditorial"
              />
              {errors.description && (
                <p className="text-red-600 text-[10px] mt-1 font-mono">{errors.description.message}</p>
              )}
            </div>
          </div>
          
          {/* Colonne droite: médias et liens */}
          <div>
            <h2 className="font-mono text-base mb-4">Médias et Liens</h2>
            
            {/* URL de l'image */}
            <div className="mb-4">
              <label className="block font-mono text-xs text-gray-700 mb-1">
                URL de l'image *
              </label>
              <input
                type="text"
                {...register('imageUrl')}
                className="w-full px-3 py-2 border border-gray-300 font-mono text-xs"
                placeholder="Chemin ou URL de l'image"
              />
              {errors.imageUrl && (
                <p className="text-red-600 text-[10px] mt-1 font-mono">{errors.imageUrl.message}</p>
              )}
            </div>
            
            {/* Suggestions d'images */}
            <div className="mb-4">
              <p className="block font-mono text-xs text-gray-700 mb-1">
                Images suggérées
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => suggestImage('attached_assets/Yhom_Editorial/Rencontres1-1_128x128@4x-8.png')}
                  className="px-2 py-1 border border-gray-300 text-gray-700 text-[10px] font-mono hover:bg-gray-50"
                >
                  Rencontres
                </button>
                <button
                  type="button"
                  onClick={() => suggestImage('attached_assets/Yhom_Editorial/Yhom_128x128@4x-8.png')}
                  className="px-2 py-1 border border-gray-300 text-gray-700 text-[10px] font-mono hover:bg-gray-50"
                >
                  Yhom
                </button>
              </div>
            </div>
            
            {/* Prévisualisation de l'image */}
            <div className="mb-4">
              <label className="block font-mono text-xs text-gray-700 mb-1">
                Prévisualisation
              </label>
              <div className="border border-gray-200 bg-gray-50 p-2 h-40 flex items-center justify-center">
                {previewImageUrl ? (
                  <img 
                    src={previewImageUrl}
                    alt="Prévisualisation"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      console.error(`Erreur de chargement pour l'image: ${previewImageUrl}`);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-gray-400 font-mono text-xs">
                    Aucune image sélectionnée
                  </div>
                )}
              </div>
            </div>
            
            {/* URL externe */}
            <div className="mb-4">
              <label className="block font-mono text-xs text-gray-700 mb-1">
                URL externe (optionnel)
              </label>
              <input
                type="text"
                {...register('externalUrl')}
                className="w-full px-3 py-2 border border-gray-300 font-mono text-xs"
                placeholder="Lien externe vers lequel rediriger"
              />
            </div>
            
            {/* URL vidéo */}
            <div className="mb-4">
              <label className="block font-mono text-xs text-gray-700 mb-1">
                URL vidéo (optionnel)
              </label>
              <input
                type="text"
                {...register('videoUrl')}
                className="w-full px-3 py-2 border border-gray-300 font-mono text-xs"
                placeholder="Lien vers une vidéo"
              />
            </div>
          </div>
        </div>
        
        {/* Boutons d'action */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setLocation('/admin/editorials')}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-mono text-xs"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white font-mono text-xs disabled:bg-indigo-400"
          >
            {isSubmitting ? 'Enregistrement...' : 'CRÉER'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}