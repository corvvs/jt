import { Modal } from '@/components/Modal';
import { useEditJsonModal } from '@/states/modal';
import { EditJsonCard } from '@/components/json/EditJsonCard';

export const EditJsonCardHolder = () => {
  const { isOpen, closeModal } = useEditJsonModal()

  return (
    <Modal closeModal={closeModal} isOpen={isOpen}>
      <EditJsonCard closeModal={closeModal} />
    </Modal>
  );
};
