import { atom, useAtom } from 'jotai';

type PreformattedValueModalState = {
  isOpen: true;
  value: string;
} | {
  isOpen: false;
}

export const modalAtom = {
  edit_json: atom(false),
  preformatted_value: atom<PreformattedValueModalState>({
    isOpen: false,
  }),
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

export function usePreformattedValueModal() {
  const [state, setState] = useAtom(modalAtom.preformatted_value);
  const closeModal = () => {
    setState({
      isOpen: false,
    });
  };
  const openModal = (value: string) => {
    setState({
      isOpen: true,
      value,
    });
  };

  return {
    modalState: state,
    closeModal,
    openModal,
  } as const;
}