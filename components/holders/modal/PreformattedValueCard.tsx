import { Modal } from '@/components/Modal';
import { usePreformattedValueModal } from '@/states/modal';
import { PreformattedValueCard } from '@/components/pre_formatted/PreformattedValueCard';

export const PreformattedValueCardHolder = () => {
  const { modalState, closeModal } = usePreformattedValueModal();
  if (!modalState.isOpen) {
    return null; // モーダルが開いていない場合は何も表示しない
  }

  return (
    <Modal closeModal={closeModal} isOpen={modalState.isOpen}>
      <PreformattedValueCard
        value={modalState.value}
      />
    </Modal>
  );
};
