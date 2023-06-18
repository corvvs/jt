import Head from "next/head";
import { ReactNode, useState } from "react";
import { VscEdit, VscJson } from 'react-icons/vsc';
import { InlineIcon } from "./lv1/InlineIcon";
import { JetButton } from "./lv1/JetButton";
import { Modal } from "./Modal";
import { EditJsonCard } from "./json/EditJsonCard";
import { MenuButton } from "./lv1/MenuButton";

export default function Layout(props: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };
  return (
    <main
      className='
        min-h-screen max-h-screen flex flex-col justify-stretch overflow-hidden
      '
    >
      <Head>
        <title>Jet</title>
      </Head>

      <Modal closeModal={closeModal} isOpen={isOpen}>
        <EditJsonCard closeModal={closeModal} />
      </Modal>

      <div className='shrink-0 grow-0 flex gap-2 flex-row items-center border-b-[1px] px-2'>
        <h2>JET.</h2>

        <div className='flex flex-row gap-0'>
        <MenuButton
          onClick={() => openModal()}
        >
          <InlineIcon i={<VscEdit />} />Edit JSON
        </MenuButton>
        </div>
      </div>

      <div
        className='flex flex-row shrink grow overflow-hidden'
      >
        {props.children}
      </div>
    </main>
  )
}
