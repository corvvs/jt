import Head from "next/head";
import { ReactNode, useState } from "react";
import { VscEdit } from 'react-icons/vsc';
import { InlineIcon } from "./lv1/InlineIcon";
import { Modal } from "./Modal";
import { EditJsonCard } from "./json/EditJsonCard";
import { MenuButton, MenuToggleButton } from "./lv1/MenuButton";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { useToggleState } from "@/states/view";
import { useJSON } from "@/states";
import { usePreference } from "@/states/preference";
import { useManipulation } from "@/states/manipulation";

const MenuBar = () => {
  const { flatJsons } = useJSON();
  const { openAll, closeAll } = useToggleState();
  const { preference, setPreference } = usePreference();
  const { manipulation } = useManipulation();
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };
  return (<div className='shrink-0 grow-0 flex gap-2 flex-row items-center border-b-[1px] px-2'>
    <Modal closeModal={closeModal} isOpen={isOpen}>
      <EditJsonCard closeModal={closeModal} />
    </Modal>

    <h2>J.E.T</h2>

    <div className='flex flex-row items-center gap-2'>
      <MenuButton
        onClick={() => openModal()}
      >
        <InlineIcon i={<VscEdit />} />Edit Text
      </MenuButton>

      <MenuButton
        onClick={() => openAll(manipulation.narrowedRange || undefined)}
      >
        <InlineIcon i={<BsChevronDown />} />Open All
      </MenuButton>

      <MenuButton
        onClick={() => {
          const items = flatJsons?.items;
          if (!items) { return; }
          closeAll(items, manipulation.narrowedRange || undefined)
        }}
      >
        <InlineIcon i={<BsChevronUp />} />Close All
      </MenuButton>

      <MenuToggleButton
        isToggled={preference.visible_subtree_stat}
        onClick={(isToggled) => setPreference((prev) => ({ ...prev, visible_subtree_stat: isToggled }))}
      >
        {preference.visible_subtree_stat ? "Hide" : "Show"} Subtree Stats
      </MenuToggleButton>

    </div>
  </div>
  )
};

export default function Layout(props: {
  children: ReactNode;
}) {
  return (
    <main
      className='
        min-h-screen max-h-screen flex flex-col justify-stretch overflow-hidden
      '
    >
      <Head>
        <title>Jet</title>
      </Head>

      <MenuBar />

      <div
        className='flex flex-row shrink grow overflow-hidden'
      >
        {props.children}
      </div>
    </main>
  )
}
