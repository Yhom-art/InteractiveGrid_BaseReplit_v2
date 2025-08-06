import React, { useState } from 'react';
import { Plus, X, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface PageFormData {
  name: string;
  slug: string;
  category: string;
  layoutId: string;
  description: string;
  headerTitle: string;
  headerBackLink: string;
  headerBackLabel: string;
  enableDebugMode: boolean;
}

const ADMIN_CATEGORIES = [
  { id: 'app-grid', name: 'M.APP GRID', description: 'Pages de grille et distribution' },
  { id: 'components', name: 'COMPONENTS', description: 'Containers, panels, curseurs' },
  { id: 'contents', name: 'CONTENTS', description: 'NFT, audio, video, éditorial' },
  { id: 'interface-admin', name: 'INTERFACE ADMIN', description: 'Templates, styles, système' },
];

const LAYOUT_MODELS = [
  { id: '1-3', name: 'Single + Triple', description: '1 colonne + 3 colonnes' },
  { id: '2-2', name: 'Double + Double', description: '2 colonnes + 2 colonnes' },
  { id: '1-1-1-1', name: 'Quatre colonnes', description: '4 colonnes égales' },
];

interface DynamicPageCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DynamicPageCreator({ isOpen, onClose, onSuccess }: DynamicPageCreatorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PageFormData>({
    name: '',
    slug: '',
    category: 'interface-admin',
    layoutId: '1-3',
    description: '',
    headerTitle: '',
    headerBackLink: '/admin',
    headerBackLabel: 'Retour Admin',
    enableDebugMode: true,
  });

  // Auto-generation du slug depuis le nom
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const updateFormData = (field: keyof PageFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-génération du slug et titre header
      if (field === 'name') {
        updated.slug = generateSlug(value);
        updated.headerTitle = value;
      }
      
      return updated;
    });
  };

  const createPageMutation = useMutation({
    mutationFn: async (data: PageFormData) => {
      const response = await fetch('/api/admin-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Page créée avec succès",
        description: `La page "${formData.name}" a été ajoutée à ${ADMIN_CATEGORIES.find(c => c.id === formData.category)?.name}`,
      });
      
      // Reset form
      setFormData({
        name: '',
        slug: '',
        category: 'interface-admin',
        layoutId: '1-3',
        description: '',
        headerTitle: '',
        headerBackLink: '/admin',
        headerBackLabel: 'Retour Admin',
        enableDebugMode: true,
      });
      setStep(1);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin-pages'] });
      
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de création",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Nom requis",
        description: "Le nom de la page est obligatoire",
        variant: "destructive",
      });
      return;
    }

    createPageMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Créer une nouvelle page admin
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center space-x-2 mb-6">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= num ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > num ? <Check className="h-4 w-4" /> : num}
                </div>
                {num < 3 && <div className={`w-8 h-0.5 ${step > num ? 'bg-blue-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de base</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Nom de la page</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Ex: Gestion des NFT"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-gray-700">URL (généré automatiquement)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => updateFormData('slug', e.target.value)}
                  placeholder="gestion-des-nft"
                  className="border-gray-300 bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-700">Catégorie</Label>
                <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div>
                          <div className="font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-600">{category.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Description de la fonctionnalité de cette page..."
                  className="border-gray-300"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Layout Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Modèle de colonnes</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {LAYOUT_MODELS.map((layout) => (
                  <div
                    key={layout.id}
                    onClick={() => updateFormData('layoutId', layout.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.layoutId === layout.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{layout.name}</h4>
                        <p className="text-sm text-gray-600">{layout.description}</p>
                      </div>
                      {formData.layoutId === layout.id && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Header Configuration */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration du header</h3>
              
              <div className="space-y-2">
                <Label htmlFor="headerTitle" className="text-gray-700">Titre du header</Label>
                <Input
                  id="headerTitle"
                  value={formData.headerTitle}
                  onChange={(e) => updateFormData('headerTitle', e.target.value)}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headerBackLabel" className="text-gray-700">Texte du bouton retour</Label>
                <Input
                  id="headerBackLabel"
                  value={formData.headerBackLabel}
                  onChange={(e) => updateFormData('headerBackLabel', e.target.value)}
                  className="border-gray-300"
                />
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu du header :</h4>
                <div className="bg-white border border-gray-200 rounded p-3">
                  <div className="flex items-center space-x-3">
                    <ArrowLeft className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">{formData.headerBackLabel}</span>
                    <span className="text-gray-300">|</span>
                    <span className="font-medium text-gray-900">{formData.headerTitle}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => step === 1 ? onClose() : setStep(step - 1)}
              className="border-gray-300 text-gray-700"
            >
              {step === 1 ? 'Annuler' : 'Précédent'}
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !formData.name.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Suivant
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createPageMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {createPageMutation.isPending ? 'Création...' : 'Créer la page'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}