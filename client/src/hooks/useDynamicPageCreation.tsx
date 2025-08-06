import { useState } from 'react';
import { DynamicPageCreator } from '@/components/admin/DynamicPageCreator';

export function useDynamicPageCreation() {
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const openCreator = () => setIsCreatorOpen(true);
  const closeCreator = () => setIsCreatorOpen(false);

  const CreatorModal = () => (
    <DynamicPageCreator
      isOpen={isCreatorOpen}
      onClose={closeCreator}
      onSuccess={() => {
        // Optionnel: callback après création réussie
        closeCreator();
      }}
    />
  );

  return {
    openCreator,
    closeCreator,
    CreatorModal,
    isCreatorOpen,
  };
}