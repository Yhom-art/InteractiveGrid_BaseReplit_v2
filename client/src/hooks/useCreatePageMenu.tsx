import { useState } from 'react';
import { CreatePageMenu } from '@/components/admin/CreatePageMenu';

export function useCreatePageMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  const Menu = () => (
    <CreatePageMenu
      isOpen={isMenuOpen}
      onClose={closeMenu}
    />
  );

  return {
    openMenu,
    closeMenu,
    Menu,
    isMenuOpen,
  };
}