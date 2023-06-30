import { Modal } from '@/components/Modal';
import { useEditJson } from '@/states/modal';
import { EditJsonCard } from '@/components/json/EditJsonCard';

export const EditJsonCardHolder = () => {
  const { isOpen, closeModal } = useEditJson()

  return (
    <Modal closeModal={closeModal} isOpen={isOpen}>
      <EditJsonCard closeModal={closeModal} />
    </Modal>
  );
};
