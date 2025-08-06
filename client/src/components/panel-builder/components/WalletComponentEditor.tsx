import React, { useState, useEffect } from 'react';
import { EditableComponent } from '../PanelBuilderV2';

interface WalletComponentEditorProps {
  component: EditableComponent;
  onUpdate: (updatedComponent: EditableComponent) => void;
  onCancel: () => void;
}

/**
 * Éditeur pour le composant Wallet
 * Permet de configurer une interface pour une adresse de portefeuille blockchain
 */
export function WalletComponentEditor({ component, onUpdate, onCancel }: WalletComponentEditorProps) {
  // États locaux pour les propriétés du composant
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [address, setAddress] = useState<string>('');
  const [network, setNetwork] = useState<'ethereum' | 'polygon' | 'solana' | 'bitcoin'>('ethereum');
  const [displayBalance, setDisplayBalance] = useState<boolean>(true);
  const [actions, setActions] = useState<Array<{type: string; enabled: boolean}>>([]);
  
  // Initialisation des états à partir du composant
  useEffect(() => {
    setTitle(component.title || 'Portefeuille');
    setDescription(component.description || 'Intégration avec la blockchain');
    setIsVisible(component.isVisible !== undefined ? component.isVisible : true);
    
    // Configuration spécifique au wallet
    if (component.config) {
      setAddress(component.config.address || '');
      setNetwork(component.config.network || 'ethereum');
      setDisplayBalance(component.config.displayBalance !== undefined ? component.config.displayBalance : true);
      
      // Initialiser les actions, ou utiliser les valeurs par défaut
      if (Array.isArray(component.config.actions) && component.config.actions.length > 0) {
        setActions(component.config.actions);
      } else {
        // Actions par défaut
        setActions([
          { type: 'send', enabled: true },
          { type: 'receive', enabled: true },
          { type: 'swap', enabled: false },
          { type: 'buy', enabled: false }
        ]);
      }
    }
  }, [component]);
  
  // Mise à jour d'une action spécifique
  const updateAction = (actionType: string, enabled: boolean) => {
    setActions(prevActions => 
      prevActions.map(action => 
        action.type === actionType ? { ...action, enabled } : action
      )
    );
  };
  
  // Validation d'adresse blockchain (version simplifiée)
  const validateAddress = (address: string, network: string): boolean => {
    if (!address) return false;
    
    // Vérifications simples selon le réseau
    switch (network) {
      case 'ethereum':
      case 'polygon':
        // Adresses Ethereum/Polygon commencent par 0x et ont 42 caractères
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      case 'solana':
        // Adresses Solana ont généralement 44 caractères
        return /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(address);
      case 'bitcoin':
        // Vérification très simplifiée pour Bitcoin
        return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || 
               /^bc1[ac-hj-np-z02-9]{39,59}$/.test(address);
      default:
        return false;
    }
  };
  
  // Vérification de l'adresse avec feedback visuel
  const getAddressValidationState = (): { isValid: boolean; message: string } => {
    if (!address) {
      return { isValid: false, message: "L'adresse est requise" };
    }
    
    const isValid = validateAddress(address, network);
    return {
      isValid,
      message: isValid ? "Adresse valide" : "Format d'adresse invalide pour ce réseau"
    };
  };
  
  // Validation et feedback
  const addressValidation = getAddressValidationState();
  
  // Gestionnaire pour la sauvegarde des modifications
  const handleSave = () => {
    // Préparation des données du composant
    const updatedComponent: EditableComponent = {
      ...component,
      title,
      description,
      isVisible,
      config: {
        address,
        network,
        displayBalance,
        actions
      }
    };
    
    // Appel à la fonction de mise à jour
    onUpdate(updatedComponent);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Éditer le composant Wallet</h3>
      
      {/* Paramètres de base */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre du composant</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Titre du composant (ex: Mon Portefeuille)"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Description courte"
          />
        </div>
      </div>
      
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="isVisible"
          checked={isVisible}
          onChange={(e) => setIsVisible(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isVisible" className="ml-2 block text-sm text-gray-900">
          Afficher ce composant
        </label>
      </div>
      
      {/* Configuration du wallet */}
      <div className="mb-4 border-t pt-4">
        <h4 className="font-medium text-lg mb-3">Configuration du Wallet</h4>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Réseau blockchain</label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value as any)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
            <option value="solana">Solana</option>
            <option value="bitcoin">Bitcoin</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse du portefeuille</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={`w-full p-2 border rounded focus:ring-2 ${
              address ? (addressValidation.isValid ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
            }`}
            placeholder={`Adresse ${network} (ex: ${
              network === 'ethereum' || network === 'polygon' ? '0x...' : 
              network === 'solana' ? 'SOLANA...' : 
              'bc1...'
            })`}
          />
          {address && (
            <p className={`mt-1 text-sm ${addressValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
              {addressValidation.message}
            </p>
          )}
        </div>
        
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="displayBalance"
            checked={displayBalance}
            onChange={(e) => setDisplayBalance(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="displayBalance" className="ml-2 block text-sm text-gray-900">
            Afficher le solde du portefeuille
          </label>
        </div>
        
        <div className="mb-4">
          <h5 className="font-medium text-sm mb-2">Actions disponibles</h5>
          <div className="space-y-2">
            {actions.map((action) => (
              <div key={action.type} className="flex items-center">
                <input
                  type="checkbox"
                  id={`action-${action.type}`}
                  checked={action.enabled}
                  onChange={(e) => updateAction(action.type, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`action-${action.type}`} className="ml-2 block text-sm text-gray-900 capitalize">
                  {action.type}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Aperçu */}
      <div className="mb-6 border-t pt-4">
        <h4 className="font-medium text-lg mb-3">Aperçu</h4>
        <div className="border p-4 rounded-lg bg-gray-50">
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <h5 className="font-bold text-lg">{title || 'Portefeuille'}</h5>
            {description && <p className="text-gray-600 text-sm mb-3">{description}</p>}
            
            <div className="bg-gray-100 rounded-lg p-3 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Réseau:</span>
                <span className="font-medium capitalize">{network}</span>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-700">Adresse:</span>
                <span className="font-mono text-sm truncate max-w-[200px]">
                  {address || '(non définie)'}
                </span>
              </div>
              
              {displayBalance && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-700">Solde:</span>
                  <span className="font-medium">-- ETH</span>
                </div>
              )}
            </div>
            
            {actions.some(a => a.enabled) && (
              <div className="flex flex-wrap gap-2">
                {actions.filter(a => a.enabled).map(action => (
                  <button 
                    key={action.type}
                    type="button"
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {action.type.charAt(0).toUpperCase() + action.type.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Boutons d'action */}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={address && !addressValidation.isValid}
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}