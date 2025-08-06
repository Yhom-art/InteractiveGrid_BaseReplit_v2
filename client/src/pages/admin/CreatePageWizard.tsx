import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { LayoutSelector, type LayoutType } from '@/components/admin/LayoutTemplateRegistry';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { ArrowLeft, FileText, Settings, Palette, Layout, Bug } from 'lucide-react';

interface PageFormData {
  name: string;
  slug: string;
  category: string;
  layoutId: LayoutType;
  description: string;
  headerTitle: string;
  headerBackLink: string;
  headerBackLabel: string;
  enableDebugMode: boolean;
}

const ADMIN_CATEGORIES = [
  { id: 'app-grid', name: 'M.APP GRID', icon: Layout, description: 'Pages de grille et distribution' },
  { id: 'components', name: 'COMPONENTS', icon: Settings, description: 'Containers, panels, curseurs' },
  { id: 'contents', name: 'CONTENTS', icon: FileText, description: 'NFT, audio, video, éditorial' },
  { id: 'interface-admin', name: 'INTERFACE ADMIN', icon: Palette, description: 'Templates, styles, système' },
];

export function CreatePageWizard() {
  const [, navigate] = useLocation();
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

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
      headerTitle: name || ''
    }));
  };

  const createPageMutation = useMutation({
    mutationFn: async (data: PageFormData) => {
      // Créer d'abord la configuration header
      const headerResponse = await fetch('/api/header-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagePath: `/admin/${data.slug}`,
          title: data.headerTitle,
          backLink: data.headerBackLink,
          backLabel: data.headerBackLabel,
        }),
      });
      const headerConfig = await headerResponse.json();

      // Puis créer la page admin
      const pageResponse = await fetch('/api/admin-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          category: data.category,
          layoutId: data.layoutId,
          headerConfigId: headerConfig.id,
          description: data.description,
          enableDebugMode: data.enableDebugMode,
        }),
      });
      return pageResponse.json();
    },
    onSuccess: () => {
      toast({
        title: "Page créée avec succès",
        description: `La page "${formData.name}" a été créée et configurée.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-pages'] });
      navigate('/admin');
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de création",
        description: error.message || "Impossible de créer la page",
        variant: "destructive",
      });
    },
  });

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceedStep1 = formData.name && formData.category;
  const canProceedStep2 = formData.layoutId;
  const canSubmit = canProceedStep1 && canProceedStep2 && formData.headerTitle;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AdminHeaderTemplate
        title="Créer une nouvelle page admin"
        filePath="client/src/pages/admin/CreatePageWizard.tsx"
        backLink="/admin"
        backLabel="Retour Admin"
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                <div className={`ml-2 text-sm ${
                  step >= stepNum ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {stepNum === 1 && 'Informations de base'}
                  {stepNum === 2 && 'Modèle de colonnes'}
                  {stepNum === 3 && 'Configuration header'}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step > stepNum ? 'bg-blue-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card className="bg-white border-gray-300 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la page</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="ex: Gestion des NFT"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="ex: gestion-nft"
                  className="bg-white border-gray-300 text-gray-900"
                />
                <p className="text-sm text-gray-500">
                  URL finale: /admin/{formData.slug}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Catégorie</Label>
                <div className="grid grid-cols-2 gap-4">
                  {ADMIN_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.category === cat.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-gray-50 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">{cat.name}</div>
                            <div className="text-sm text-gray-600">{cat.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de la page..."
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Bug className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Mode Debug</div>
                    <div className="text-sm text-gray-600">Afficher les informations de développement</div>
                  </div>
                </div>
                <Switch
                  checked={formData.enableDebugMode}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableDebugMode: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Layout Selection */}
        {step === 2 && (
          <Card className="bg-white border-gray-300 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Modèle de colonnes</CardTitle>
            </CardHeader>
            <CardContent>
              <LayoutSelector
                selected={formData.layoutId}
                onSelect={(layout) => setFormData(prev => ({ ...prev, layoutId: layout }))}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 3: Header Configuration */}
        {step === 3 && (
          <div className="space-y-6">
            <Card className="bg-white border-gray-300 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Configuration du header</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="headerTitle">Titre du header</Label>
                  <Input
                    id="headerTitle"
                    value={formData.headerTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, headerTitle: e.target.value }))}
                    placeholder="Titre affiché en haut de la page"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="headerBackLink">Lien de retour</Label>
                    <Input
                      id="headerBackLink"
                      value={formData.headerBackLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, headerBackLink: e.target.value }))}
                      placeholder="/admin"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headerBackLabel">Texte du bouton retour</Label>
                    <Input
                      id="headerBackLabel"
                      value={formData.headerBackLabel}
                      onChange={(e) => setFormData(prev => ({ ...prev, headerBackLabel: e.target.value }))}
                      placeholder="Retour Admin"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Aperçu du header</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-gray-600 rounded-lg overflow-hidden">
                  <AdminHeaderTemplate
                    title={formData.headerTitle || 'Titre de la page'}
                    backLink={formData.headerBackLink}
                    backLabel={formData.headerBackLabel}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={step === 1 ? () => navigate('/admin') : prevStep}
            className="text-white border-gray-600 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 1 ? 'Annuler' : 'Précédent'}
          </Button>

          <div className="space-x-4">
            {step < 3 ? (
              <Button
                onClick={nextStep}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2)
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                Suivant
              </Button>
            ) : (
              <Button
                onClick={() => createPageMutation.mutate(formData)}
                disabled={!canSubmit || createPageMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createPageMutation.isPending ? 'Création...' : 'Créer la page'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}