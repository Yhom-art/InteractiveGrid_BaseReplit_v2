import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, Settings, Eye } from 'lucide-react';
import { AdminLayoutTemplate } from '@/components/admin/AdminLayoutTemplate';
import { FlexGridV3 } from '@/components/FlexGridV3';

// Interface DeploymentRule (cohérente avec FlexGridV3)
interface DeploymentRule {
  id: string;
  name: string;
  type: 'spiral' | 'random-active' | 'random-inactive';
  contentTypes: string[];
  priority: number;
  enabled: boolean;
  description: string;
  modified?: boolean;
  maxItems?: number;
  spiralConfig?: {
    centerX: number;
    centerY: number;
    direction: 'clockwise' | 'counterclockwise';
    startDirection: 'right' | 'down' | 'left' | 'up';
    skipOccupied: boolean;
  };
  randomActiveConfig?: {
    randomType: 'uniform' | 'weighted' | 'clustered';
    minDistanceFromBorder: number;
    maxDistanceFromBorder: number;
    replacementRatio: number;
    minSpacing: number;
    preferredZone: 'center' | 'all' | 'ring';
  };
  randomInactiveConfig?: {
    minDistanceFromActive: number;
    maxDistanceFromActive: number;
    dispersion: 'low' | 'medium' | 'high';
    avoidanceZones: 'none' | 'corners' | 'borders';
    placementPriority: 'proximity' | 'distance' | 'balanced';
  };
}

// Règles par défaut pour initialisation
const DEFAULT_RULES: DeploymentRule[] = [
  {
    id: 'spiral-main',
    name: 'Distribution Spirale Principale',
    type: 'spiral',
    contentTypes: ['nft', 'image', 'video'],
    priority: 100,
    enabled: true,
    description: 'Distribution principale en spirale depuis le centre',
    maxItems: 50,
    spiralConfig: {
      centerX: 16,
      centerY: 16,
      direction: 'clockwise',
      startDirection: 'right',
      skipOccupied: false
    }
  },
  {
    id: 'random-active-secondary',
    name: 'Éléments Actifs Aléatoires',
    type: 'random-active',
    contentTypes: ['audio', 'interactive'],
    priority: 80,
    enabled: true,
    description: 'Placement aléatoire des éléments interactifs',
    maxItems: 20,
    randomActiveConfig: {
      randomType: 'weighted',
      minDistanceFromBorder: 3,
      maxDistanceFromBorder: 12,
      replacementRatio: 0.4,
      minSpacing: 2,
      preferredZone: 'center'
    }
  },
  {
    id: 'random-inactive-fill',
    name: 'Remplissage Inactif',
    type: 'random-inactive',
    contentTypes: ['placeholder', 'background'],
    priority: 10,
    enabled: false,
    description: 'Remplissage des espaces vides avec éléments décoratifs',
    randomInactiveConfig: {
      minDistanceFromActive: 1,
      maxDistanceFromActive: 5,
      dispersion: 'low',
      avoidanceZones: 'corners',
      placementPriority: 'balanced'
    }
  }
];

export function DistributionRulesPage() {
  const [rules, setRules] = useState<DeploymentRule[]>(DEFAULT_RULES);
  const [selectedRule, setSelectedRule] = useState<DeploymentRule | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Gestion des règles
  const addNewRule = () => {
    const newRule: DeploymentRule = {
      id: `rule-${Date.now()}`,
      name: 'Nouvelle Règle',
      type: 'spiral',
      contentTypes: [],
      priority: 50,
      enabled: true,
      description: '',
      modified: true,
      spiralConfig: {
        centerX: 16,
        centerY: 16,
        direction: 'clockwise',
        startDirection: 'right',
        skipOccupied: false
      }
    };
    
    setRules(prev => [...prev, newRule]);
    setSelectedRule(newRule);
  };

  const updateRule = (updatedRule: DeploymentRule) => {
    setRules(prev => prev.map(rule => 
      rule.id === updatedRule.id 
        ? { ...updatedRule, modified: true }
        : rule
    ));
    setSelectedRule(updatedRule);
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    if (selectedRule?.id === ruleId) {
      setSelectedRule(null);
    }
  };

  const toggleRuleEnabled = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, enabled: !rule.enabled, modified: true }
        : rule
    ));
  };

  // Composant configuration par type de règle
  const RuleConfigForm = ({ rule }: { rule: DeploymentRule }) => {
    const updateRuleConfig = (updates: Partial<DeploymentRule>) => {
      updateRule({ ...rule, ...updates });
    };

    return (
      <div className="space-y-6">
        {/* Configuration générale */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="rule-name">Nom de la règle</Label>
            <Input
              id="rule-name"
              value={rule.name}
              onChange={(e) => updateRuleConfig({ name: e.target.value })}
              placeholder="Nom de la règle"
            />
          </div>
          
          <div>
            <Label htmlFor="rule-description">Description</Label>
            <Input
              id="rule-description"
              value={rule.description}
              onChange={(e) => updateRuleConfig({ description: e.target.value })}
              placeholder="Description de la règle"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rule-type">Type de distribution</Label>
              <Select 
                value={rule.type} 
                onValueChange={(value: 'spiral' | 'random-active' | 'random-inactive') => 
                  updateRuleConfig({ type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de distribution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spiral">Spirale</SelectItem>
                  <SelectItem value="random-active">Aléatoire Actif</SelectItem>
                  <SelectItem value="random-inactive">Aléatoire Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rule-priority">Priorité</Label>
              <Input
                id="rule-priority"
                type="number"
                value={rule.priority}
                onChange={(e) => updateRuleConfig({ priority: parseInt(e.target.value) || 0 })}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="rule-maxItems">Nombre maximum d'éléments</Label>
            <Input
              id="rule-maxItems"
              type="number"
              value={rule.maxItems || ''}
              onChange={(e) => updateRuleConfig({ maxItems: parseInt(e.target.value) || undefined })}
              placeholder="Illimité"
            />
          </div>
        </div>

        {/* Configuration spécifique par type */}
        {rule.type === 'spiral' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration Spirale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Centre X</Label>
                  <Input
                    type="number"
                    value={rule.spiralConfig?.centerX || 16}
                    onChange={(e) => updateRuleConfig({
                      spiralConfig: {
                        ...rule.spiralConfig!,
                        centerX: parseInt(e.target.value) || 16
                      }
                    })}
                    min="0"
                    max="31"
                  />
                </div>
                <div>
                  <Label>Centre Y</Label>
                  <Input
                    type="number"
                    value={rule.spiralConfig?.centerY || 16}
                    onChange={(e) => updateRuleConfig({
                      spiralConfig: {
                        ...rule.spiralConfig!,
                        centerY: parseInt(e.target.value) || 16
                      }
                    })}
                    min="0"
                    max="31"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Direction</Label>
                  <Select 
                    value={rule.spiralConfig?.direction || 'clockwise'}
                    onValueChange={(value: 'clockwise' | 'counterclockwise') => updateRuleConfig({
                      spiralConfig: { ...rule.spiralConfig!, direction: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clockwise">Horaire</SelectItem>
                      <SelectItem value="counterclockwise">Anti-horaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Direction de départ</Label>
                  <Select 
                    value={rule.spiralConfig?.startDirection || 'right'}
                    onValueChange={(value: 'right' | 'down' | 'left' | 'up') => updateRuleConfig({
                      spiralConfig: { ...rule.spiralConfig!, startDirection: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="right">Droite</SelectItem>
                      <SelectItem value="down">Bas</SelectItem>
                      <SelectItem value="left">Gauche</SelectItem>
                      <SelectItem value="up">Haut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {rule.type === 'random-active' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration Aléatoire Actif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Type de distribution</Label>
                <Select 
                  value={rule.randomActiveConfig?.randomType || 'uniform'}
                  onValueChange={(value: 'uniform' | 'weighted' | 'clustered') => updateRuleConfig({
                    randomActiveConfig: { ...rule.randomActiveConfig!, randomType: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uniform">Uniforme</SelectItem>
                    <SelectItem value="weighted">Pondéré</SelectItem>
                    <SelectItem value="clustered">Groupé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Distance min des bords</Label>
                  <Input
                    type="number"
                    value={rule.randomActiveConfig?.minDistanceFromBorder || 0}
                    onChange={(e) => updateRuleConfig({
                      randomActiveConfig: {
                        ...rule.randomActiveConfig!,
                        minDistanceFromBorder: parseInt(e.target.value) || 0
                      }
                    })}
                    min="0"
                    max="15"
                  />
                </div>
                <div>
                  <Label>Distance max des bords</Label>
                  <Input
                    type="number"
                    value={rule.randomActiveConfig?.maxDistanceFromBorder || 10}
                    onChange={(e) => updateRuleConfig({
                      randomActiveConfig: {
                        ...rule.randomActiveConfig!,
                        maxDistanceFromBorder: parseInt(e.target.value) || 10
                      }
                    })}
                    min="0"
                    max="15"
                  />
                </div>
              </div>

              <div>
                <Label>Zone préférée</Label>
                <Select 
                  value={rule.randomActiveConfig?.preferredZone || 'center'}
                  onValueChange={(value: 'center' | 'all' | 'ring') => updateRuleConfig({
                    randomActiveConfig: { ...rule.randomActiveConfig!, preferredZone: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Centre</SelectItem>
                    <SelectItem value="all">Partout</SelectItem>
                    <SelectItem value="ring">Anneau</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {rule.type === 'random-inactive' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration Aléatoire Inactif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Distance min des actifs</Label>
                  <Input
                    type="number"
                    value={rule.randomInactiveConfig?.minDistanceFromActive || 1}
                    onChange={(e) => updateRuleConfig({
                      randomInactiveConfig: {
                        ...rule.randomInactiveConfig!,
                        minDistanceFromActive: parseInt(e.target.value) || 1
                      }
                    })}
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <Label>Distance max des actifs</Label>
                  <Input
                    type="number"
                    value={rule.randomInactiveConfig?.maxDistanceFromActive || 5}
                    onChange={(e) => updateRuleConfig({
                      randomInactiveConfig: {
                        ...rule.randomInactiveConfig!,
                        maxDistanceFromActive: parseInt(e.target.value) || 5
                      }
                    })}
                    min="1"
                    max="15"
                  />
                </div>
              </div>

              <div>
                <Label>Zones d'évitement</Label>
                <Select 
                  value={rule.randomInactiveConfig?.avoidanceZones || 'none'}
                  onValueChange={(value: 'none' | 'corners' | 'borders') => updateRuleConfig({
                    randomInactiveConfig: { ...rule.randomInactiveConfig!, avoidanceZones: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    <SelectItem value="corners">Coins</SelectItem>
                    <SelectItem value="borders">Bords</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <AdminLayoutTemplate
      title="Règles de Distribution"
      description="Configuration des règles de distribution pour la grille NFT"
    >
      <div className="space-y-6">
        {/* Actions principales */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button onClick={addNewRule} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Règle
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Masquer' : 'Prévisualiser'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des règles */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Règles Configurées</CardTitle>
                <CardDescription>
                  {rules.filter(r => r.enabled).length} règle(s) activée(s) sur {rules.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rules.map(rule => (
                    <div
                      key={rule.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedRule?.id === rule.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRule(rule)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{rule.name}</span>
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => toggleRuleEnabled(rule.id)}
                            size="sm"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRule(rule.id);
                            }}
                            className="w-6 h-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        <div>Type: {rule.type}</div>
                        <div>Priorité: {rule.priority}</div>
                        <div>Max: {rule.maxItems || 'Illimité'}</div>
                      </div>
                      {rule.modified && (
                        <div className="mt-1">
                          <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded">
                            Modifié
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration de la règle sélectionnée */}
          <div className="lg:col-span-2">
            {selectedRule ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configuration - {selectedRule.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RuleConfigForm rule={selectedRule} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez une règle pour la configurer</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Prévisualisation */}
        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prévisualisation de la Distribution</CardTitle>
              <CardDescription>
                Aperçu en temps réel de la grille avec les règles configurées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FlexGridV3
                distributionRules={rules.filter(rule => rule.enabled)}
                deploymentMode="preview"
                onDistributionChange={(containers) => {
                  console.log('Distribution générée:', containers.length, 'containers');
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayoutTemplate>
  );
}

export default DistributionRulesPage;