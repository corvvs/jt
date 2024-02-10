import { atom, useAtom } from 'jotai';

export const modalAtom = {
  edit_json: atom(false),
};

export function useEditJsonModal() {
  const [isOpen, setIsOpen] = useAtom(modalAtom.edit_json)
  const closeModal = () => {
    setIsOpen(false);
  };
  const openModal = () => {
    setIsOpen(true);
  };

  return {
    isOpen,
    closeModal,
    openModal,
  } as const;
};
