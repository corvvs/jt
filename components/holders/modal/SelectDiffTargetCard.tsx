import { Modal } from '@/components/Modal';
import { useSelectDiffTargetModal } from '@/states/modal';
import { SelectDiffTargetCard } from '@/components/diff/SelectDiffTargetCard';

export const SelectDiffTargetCardHolder = () => {
  const { isOpen, closeModal } = useSelectDiffTargetModal();

  return (
    <Modal closeModal={closeModal} isOpen={isOpen}>
      <SelectDiffTargetCard closeModal={closeModal} />
    </Modal>
  );
};
